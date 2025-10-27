import type { IExecuteFunctions, INodeExecutionData, INodeType, INodeTypeDescription, IDataObject } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

export class SurusAi implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'SURUS AI',
    name: 'surusAi',
    icon: { light: 'file:../../icons/surusai.svg', dark: 'file:../../icons/surusai.dark.svg' },
    group: ['transform'],
    version: 1,
    subtitle: '={{$parameter["operation"]}}',
    description: 'Translate text, transcribe audio, and extract structured data using SURUS AI services',
    defaults: {
      name: 'SURUS AI',
    },
    usableAsTool: true,
    inputs: ['main'],
    outputs: ['main'],
    credentials: [
      {
        name: 'surusAiApi',
        required: true,
      },
    ],
    properties: [
      // operations
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        options: [
          { name: 'Translate', value: 'translate', description: 'Translate text to a target language', action: 'Translate text' },
          { name: 'Transcribe', value: 'transcribe', description: 'Transcribe audio file to text', action: 'Transcribe audio' },
          { name: 'Extract', value: 'extract', description: 'Extract structured data from text using JSON schema', action: 'Extract data' },
        ],
        default: 'translate',
      },

      // translate fields
      {
        displayName: 'Text',
        name: 'text',
        type: 'string',
        typeOptions: { rows: 4 },
        required: true,
        default: '',
        description: 'The text to translate',
        displayOptions: { show: { operation: ['translate'] } },
      },
      {
        displayName: 'Target Language',
        name: 'targetLang',
        type: 'string',
        required: true,
        default: 'es',
        description: 'The target language code (e.g., es, en, fr, de)',
        displayOptions: { show: { operation: ['translate'] } },
      },

      // transcribe fields
      {
        displayName: 'Binary Property',
        name: 'audioFile',
        type: 'string',
        required: true,
        default: 'data',
        description: 'Name of the binary property containing the audio file',
        displayOptions: { show: { operation: ['transcribe'] } },
      },
      {
        displayName: 'Source Language',
        name: 'sourceLang',
        type: 'string',
        required: true,
        default: 'es',
        description: 'The source language of the audio (e.g., es, en, fr, de)',
        displayOptions: { show: { operation: ['transcribe'] } },
      },

      // extract fields
      {
        displayName: 'Text',
        name: 'extractText',
        type: 'string',
        typeOptions: { rows: 4 },
        required: true,
        default: '',
        description: 'The text to extract structured data from',
        displayOptions: { show: { operation: ['extract'] } },
      },
      {
        displayName: 'JSON Schema',
        name: 'jsonSchema',
        type: 'json',
        required: true,
        default: `{
  "type": "object",
  "properties": {
    "name": {
      "type": "string",
      "description": "Person's full name"
    }
  }
}`,
        description: 'The JSON schema defining the structure to extract',
        displayOptions: { show: { operation: ['extract'] } },
      },

      // common options
      {
        displayName: 'Simple Output',
        name: 'onlyResult',
        type: 'boolean',
        default: true,
        description: 'Whether to return a simplified output with only the main content (instead of the full API response)',
        displayOptions: { show: { operation: ['translate', 'transcribe', 'extract'] } },
      },
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];

    for (let i = 0; i < items.length; i++) {
      try {
        const operation = this.getNodeParameter('operation', i) as string;
        const onlyResult = this.getNodeParameter('onlyResult', i) as boolean;

        if (operation === 'translate') {
          const text = this.getNodeParameter('text', i) as string;
          const targetLang = this.getNodeParameter('targetLang', i) as string;

          const responseData = await this.helpers.httpRequestWithAuthentication.call(this, 'surusAiApi', {
            method: 'POST',
            url: 'https://api.surus.dev/functions/v1/translate',
            headers: { 'Content-Type': 'application/json' },
            body: { text, target_lang: targetLang },
            json: true,
          });

          let finalData: unknown = responseData;
          if (onlyResult) {
            const extractedContent: string | undefined = getExtractedContent(responseData);

            if (extractedContent) {
              try {
                const parsedContent = JSON.parse(extractedContent);
                finalData = { surus_output: parsedContent };
              } catch {
                finalData = { surus_output: extractedContent };
              }
            }
          }

          returnData.push({ json: finalData as unknown as IDataObject, pairedItem: { item: i } });
        } else if (operation === 'transcribe') {
          const audioFile = this.getNodeParameter('audioFile', i) as string;
          const sourceLang = this.getNodeParameter('sourceLang', i) as string;

          const binaryData = await this.helpers.getBinaryDataBuffer(i, audioFile);
          if (!binaryData) {
            throw new NodeOperationError(this.getNode(), 'No binary data found for the audio file', { itemIndex: i });
          }

          // Use the correct n8n approach for multipart requests
          const formData = {
            file: {
              value: binaryData,
              options: {
                filename: 'audio.wav',
                contentType: 'audio/wav',
              },
            },
            source_lang: sourceLang,
          };

          const responseData = await this.helpers.request.call(this, {
            method: 'POST',
            url: 'https://api.surus.dev/functions/v1/transcribe',
            headers: {
              'Authorization': `Bearer ${(await this.getCredentials('surusAiApi'))?.apiKey}`,
            },
            formData: formData,
          });

          let finalData: unknown = responseData;
          if (onlyResult) {
            const extractedContent = getExtractedContent(responseData);

            if (extractedContent) {
              try {
                const parsedContent = JSON.parse(extractedContent);
                finalData = { surus_output: parsedContent };
              } catch {
                finalData = { surus_output: extractedContent };
              }
            }
          }

          returnData.push({ json: finalData as unknown as IDataObject, pairedItem: { item: i } });
        } else if (operation === 'extract') {
          const extractText = this.getNodeParameter('extractText', i) as string;
          const jsonSchemaRaw = this.getNodeParameter('jsonSchema', i) as unknown;
          const jsonSchema = typeof jsonSchemaRaw === 'string' ? JSON.parse(jsonSchemaRaw) : jsonSchemaRaw;

          const responseData = await this.helpers.httpRequestWithAuthentication.call(this, 'surusAiApi', {
            method: 'POST',
            url: 'https://api.surus.dev/functions/v1/extract',
            headers: { 'Content-Type': 'application/json' },
            body: { text: extractText, json_schema: jsonSchema },
            json: true,
          });

          let finalData: unknown = responseData;
          if (onlyResult) {
            const extractedContent = getExtractedContent(responseData);

            if (extractedContent) {
              try {
                const parsedContent = JSON.parse(extractedContent);
                finalData = { surus_output: parsedContent };
              } catch {
                finalData = { surus_output: extractedContent };
              }
            }
          }

          returnData.push({ json: finalData as unknown as IDataObject, pairedItem: { item: i } });
        }
      } catch (error: unknown) {
        if (this.continueOnFail()) {
          returnData.push({ json: { error: (error as Error).message }, pairedItem: { item: i } });
          continue;
        }
        throw error;
      }
    }

    return [returnData];
  }
}

function getExtractedContent(response: unknown): string | undefined {
  // Look for OpenAI-like shape: { choices: [{ message: { content: string } }] }
  if (Array.isArray(response) && response.length > 0) {
    const first = response[0] as unknown;
    if (isChoiceResponse(first)) return first.choices[0].message?.content;
  }
  if (isChoiceResponse(response)) return response.choices[0].message?.content;
  return undefined;
}

function isChoiceResponse(obj: unknown): obj is { choices: Array<{ message?: { content?: string } }> } {
  if (!obj || typeof obj !== 'object') return false;
  const choices = (obj as { choices?: unknown }).choices;
  if (!Array.isArray(choices) || choices.length === 0) return false;
  return true;
}
