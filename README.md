# SURUS AI Node

Community node for SURUS AI: translate text, transcribe audio, and extract structured data from text.

- Package: `n8n-nodes-surusai`
- Author: Mauro Ibañez (mauro@surus.lat)
- Website: https://surus.lat/
- GitHub: https://github.com/mauroibz

## Install (Community Nodes)

1. In n8n, go to `Settings` → `Community Nodes` → `Install`.
2. Enter the package name: `n8n-nodes-surusai` and confirm.
3. Restart n8n if prompted.

After install, search for “SURUS AI” in the node picker. The node is also `usableAsTool` so it can be used by n8n AI agents.

## Features

### Translate Operation
- Translates text from one language to another
- Supports multiple target languages
- Simple text input with target language selection

### Transcribe Operation  
- Transcribes audio files to text
- Supports multiple source languages
- Handles binary audio file uploads

### Extract Operation
- Extracts structured data from text using a provided JSON Schema
- Parses LLM output into JSON when possible
- Useful for turning freeform text into typed objects

## Authentication

The node requires a SURUS AI API key for authentication. You can obtain an API key from the SURUS AI platform.

## Usage

### Translate Text
1. Select "Translate" operation
2. Enter the text to translate
3. Specify the target language code (e.g., 'es' for Spanish, 'en' for English)
4. Execute the workflow

### Transcribe Audio
1. Select "Transcribe" operation  
2. Provide the name of the binary property containing the audio file
3. Specify the source language of the audio
4. Execute the workflow

## API Endpoints

- **Translate**: `POST https://api.surus.dev/functions/v1/translate`
- **Transcribe**: `POST https://api.surus.dev/functions/v1/transcribe`
- **Extract**: `POST https://api.surus.dev/functions/v1/extract`

## Options

- `Only Result` (boolean): Whether to return only the extracted content instead of the full API response. Defaults to `true`.

## Support

- Issues: open on GitHub repository
- Contact: mauro@surus.lat

## Language Codes

Common language codes supported:
- `es` - Spanish
- `en` - English  
- `fr` - French
- `de` - German
- `it` - Italian
- `pt` - Portuguese
- `ru` - Russian
- `ja` - Japanese
- `ko` - Korean
- `zh` - Chinese


