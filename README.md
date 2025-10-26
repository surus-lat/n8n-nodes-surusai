# n8n-nodes-surusai

This is an n8n community node for SURUS AI. It lets you:

- Translate text
- Transcribe audio files
- Extract structured data from text using a JSON Schema

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/sustainable-use-license/) workflow automation platform.

## Installation

Follow the n8n [community node installation guide](https://docs.n8n.io/integrations/community-nodes/installation/).

## Operations

- Translate: POST /functions/v1/translate
- Transcribe: POST /functions/v1/transcribe
- Extract: POST /functions/v1/extract

Tip: Enable the "Simple Output" option in the node to return only the primary content instead of the full API response.

## Credentials

- SURUS AI API Key (Bearer). Get your key from your SURUS account.

## Compatibility

Compatible with n8n@1.60.0 or later.

## Resources

- SURUS API: https://api.surus.dev
- n8n community nodes docs: https://docs.n8n.io/integrations/#community-nodes

## More from SURUS

- SURUS provides several AI capabilities as native n8n nodes.
- If you don’t find the exact task you need, we maintain a catalog of OpenAI-compatible models suitable for agent and extraction use cases.
- Need something specific? Contact us and we can deploy a custom node tailored to your task.
