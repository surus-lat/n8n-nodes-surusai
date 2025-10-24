"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SurusAi = void 0;
const n8n_workflow_1 = require("n8n-workflow");
class SurusAi {
    constructor() {
        this.description = {
            displayName: 'SURUS AI',
            name: 'surusAi',
            icon: { light: 'file:surusai.svg', dark: 'file:surusai.svg' },
            group: ['transform'],
            version: 1,
            subtitle: '={{$parameter["operation"]}}',
            description: 'Translate text, transcribe audio, and extract structured data using SURUS AI services',
            defaults: {
                name: 'SURUS AI',
            },
            usableAsTool: true,
            inputs: [n8n_workflow_1.NodeConnectionTypes.Main],
            outputs: [n8n_workflow_1.NodeConnectionTypes.Main],
            credentials: [
                {
                    name: 'surusAiApi',
                    required: true,
                },
            ],
            properties: [
                // ----------------------------------
                //            operations
                // ----------------------------------
                {
                    displayName: 'Operation',
                    name: 'operation',
                    type: 'options',
                    noDataExpression: true,
                    options: [
                        {
                            name: 'Translate',
                            value: 'translate',
                            description: 'Translate text to a target language',
                            action: 'Translate text',
                        },
                        {
                            name: 'Transcribe',
                            value: 'transcribe',
                            description: 'Transcribe audio file to text',
                            action: 'Transcribe audio',
                        },
                        {
                            name: 'Extract',
                            value: 'extract',
                            description: 'Extract structured data from text using JSON schema',
                            action: 'Extract data',
                        },
                    ],
                    default: 'translate',
                },
                // ----------------------------------
                //            translate fields
                // ----------------------------------
                {
                    displayName: 'Text',
                    name: 'text',
                    type: 'string',
                    typeOptions: {
                        rows: 4,
                    },
                    required: true,
                    default: '',
                    description: 'The text to translate',
                    displayOptions: {
                        show: {
                            operation: ['translate'],
                        },
                    },
                },
                {
                    displayName: 'Target Language',
                    name: 'targetLang',
                    type: 'string',
                    required: true,
                    default: 'es',
                    description: 'The target language code (e.g., es, en, fr, de)',
                    displayOptions: {
                        show: {
                            operation: ['translate'],
                        },
                    },
                },
                // ----------------------------------
                //            transcribe fields
                // ----------------------------------
                {
                    displayName: 'Input Binary Field',
                    name: 'audioFile',
                    type: 'string',
                    required: true,
                    default: 'data',
                    displayOptions: {
                        show: {
                            operation: ['transcribe'],
                        },
                    },
                    hint: 'The name of the input binary field containing the audio file to transcribe',
                },
                {
                    displayName: 'Source Language',
                    name: 'sourceLang',
                    type: 'string',
                    required: true,
                    default: 'es',
                    description: 'The source language of the audio (e.g., es, en, fr, de)',
                    displayOptions: {
                        show: {
                            operation: ['transcribe'],
                        },
                    },
                },
                // ----------------------------------
                //            extract fields
                // ----------------------------------
                {
                    displayName: 'Text',
                    name: 'extractText',
                    type: 'string',
                    typeOptions: {
                        rows: 4,
                    },
                    required: true,
                    default: '',
                    description: 'The text to extract structured data from',
                    displayOptions: {
                        show: {
                            operation: ['extract'],
                        },
                    },
                },
                {
                    displayName: 'JSON Schema',
                    name: 'jsonSchema',
                    type: 'json',
                    required: true,
                    default: '{\n  "type": "object",\n  "properties": {\n    "name": {\n      "type": "string",\n      "description": "Person\'s full name"\n    }\n  }\n}',
                    description: 'The JSON schema defining the structure to extract',
                    displayOptions: {
                        show: {
                            operation: ['extract'],
                        },
                    },
                },
                // ----------------------------------
                //            common options
                // ----------------------------------
                {
                    displayName: 'Only Result',
                    name: 'onlyResult',
                    type: 'boolean',
                    default: true,
                    description: 'Whether to return only the extracted content instead of the full API response',
                    displayOptions: {
                        show: {
                            operation: ['translate', 'transcribe', 'extract'],
                        },
                    },
                },
            ],
        };
    }
    async execute() {
        const items = this.getInputData();
        const returnData = [];
        for (let i = 0; i < items.length; i++) {
            try {
                const operation = this.getNodeParameter('operation', i);
                const onlyResult = this.getNodeParameter('onlyResult', i);
                if (operation === 'translate') {
                    const text = this.getNodeParameter('text', i);
                    const targetLang = this.getNodeParameter('targetLang', i);
                    const responseData = await this.helpers.requestWithAuthentication.call(this, 'surusAiApi', {
                        method: 'POST',
                        url: 'https://api.surus.dev/functions/v1/translate',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: {
                            text,
                            target_lang: targetLang,
                        },
                        json: true,
                    });
                    // Parse response if onlyResult is enabled
                    let finalData = responseData;
                    if (onlyResult) {
                        let extractedContent = null;
                        // Handle array response
                        if (Array.isArray(responseData) && responseData.length > 0) {
                            const firstResponse = responseData[0];
                            if (firstResponse.choices && firstResponse.choices.length > 0) {
                                extractedContent = firstResponse.choices[0].message?.content;
                            }
                        }
                        // Handle single object response
                        else if (responseData && typeof responseData === 'object') {
                            if (responseData.choices && responseData.choices.length > 0) {
                                extractedContent = responseData.choices[0].message?.content;
                            }
                        }
                        // Return structured output with surus_output key
                        if (extractedContent) {
                            // Try to parse as JSON if it looks like JSON
                            try {
                                const parsedContent = JSON.parse(extractedContent);
                                finalData = { surus_output: parsedContent };
                            }
                            catch {
                                // If not JSON, return as string
                                finalData = { surus_output: extractedContent };
                            }
                        }
                    }
                    returnData.push({
                        json: finalData,
                        pairedItem: { item: i },
                    });
                }
                else if (operation === 'transcribe') {
                    const audioFile = this.getNodeParameter('audioFile', i);
                    const sourceLang = this.getNodeParameter('sourceLang', i);
                    // Get binary data
                    const binaryData = await this.helpers.getBinaryDataBuffer(i, audioFile);
                    if (!binaryData) {
                        throw new n8n_workflow_1.NodeOperationError(this.getNode(), 'No binary data found for the audio file', {
                            itemIndex: i,
                        });
                    }
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
                    const responseData = await this.helpers.requestWithAuthentication.call(this, 'surusAiApi', {
                        method: 'POST',
                        url: 'https://api.surus.dev/functions/v1/transcribe',
                        formData,
                        json: true,
                    });
                    // Parse response if onlyResult is enabled
                    let finalData = responseData;
                    if (onlyResult) {
                        let extractedContent = null;
                        // Handle array response
                        if (Array.isArray(responseData) && responseData.length > 0) {
                            const firstResponse = responseData[0];
                            if (firstResponse.choices && firstResponse.choices.length > 0) {
                                extractedContent = firstResponse.choices[0].message?.content;
                            }
                        }
                        // Handle single object response
                        else if (responseData && typeof responseData === 'object') {
                            if (responseData.choices && responseData.choices.length > 0) {
                                extractedContent = responseData.choices[0].message?.content;
                            }
                        }
                        // Return structured output with surus_output key
                        if (extractedContent) {
                            // Try to parse as JSON if it looks like JSON
                            try {
                                const parsedContent = JSON.parse(extractedContent);
                                finalData = { surus_output: parsedContent };
                            }
                            catch {
                                // If not JSON, return as string
                                finalData = { surus_output: extractedContent };
                            }
                        }
                    }
                    returnData.push({
                        json: finalData,
                        pairedItem: { item: i },
                    });
                }
                else if (operation === 'extract') {
                    const extractText = this.getNodeParameter('extractText', i);
                    const jsonSchemaRaw = this.getNodeParameter('jsonSchema', i);
                    const jsonSchema = typeof jsonSchemaRaw === 'string' ? JSON.parse(jsonSchemaRaw) : jsonSchemaRaw;
                    const responseData = await this.helpers.requestWithAuthentication.call(this, 'surusAiApi', {
                        method: 'POST',
                        url: 'https://api.surus.dev/functions/v1/extract',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: {
                            text: extractText,
                            json_schema: jsonSchema,
                        },
                        json: true,
                    });
                    // Parse response if onlyResult is enabled
                    let finalData = responseData;
                    if (onlyResult) {
                        let extractedContent = null;
                        // Handle array response
                        if (Array.isArray(responseData) && responseData.length > 0) {
                            const firstResponse = responseData[0];
                            if (firstResponse.choices && firstResponse.choices.length > 0) {
                                extractedContent = firstResponse.choices[0].message?.content;
                            }
                        }
                        // Handle single object response
                        else if (responseData && typeof responseData === 'object') {
                            if (responseData.choices && responseData.choices.length > 0) {
                                extractedContent = responseData.choices[0].message?.content;
                            }
                        }
                        // Return structured output with surus_output key
                        if (extractedContent) {
                            // Try to parse as JSON if it looks like JSON
                            try {
                                const parsedContent = JSON.parse(extractedContent);
                                finalData = { surus_output: parsedContent };
                            }
                            catch {
                                // If not JSON, return as string
                                finalData = { surus_output: extractedContent };
                            }
                        }
                    }
                    returnData.push({
                        json: finalData,
                        pairedItem: { item: i },
                    });
                }
            }
            catch (error) {
                if (this.continueOnFail()) {
                    returnData.push({
                        json: { error: error.message },
                        pairedItem: { item: i },
                    });
                    continue;
                }
                throw error;
            }
        }
        return [returnData];
    }
}
exports.SurusAi = SurusAi;
