# n8n-nodes-surusai

This is an n8n community node for [SURUS AI](/surus.lat/). It lets you access [SURUS AI nodes](https://surus.lat/ainodes) to:

- Translate text
- Transcribe audio files
- Extract structured data from text using a JSON Schema

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/sustainable-use-license/) workflow automation platform.

## Installation

### Quick Install (Recommended)

1. **Install n8n** (if not already installed):
   ```bash
   npm install n8n -g
   ```

2. **Install the SURUS AI node**:
   ```bash
   npm install n8n-nodes-surusai
   ```

3. **Start n8n**:
   ```bash
   n8n start
   ```

4. **Access n8n**: Open your browser and go to `http://localhost:5678`

5. **Find the SURUS AI node**: Look for "SURUS AI" in the nodes panel when creating a workflow

### Alternative Installation Methods

Within your n8n GUI, go to Settings > Community nodes > Install, and enter n8n-nodes-surusai. 

**For Docker users:**
```bash
# Add to your docker-compose.yml or run command
npm install n8n-nodes-surusai
```

**For n8n Cloud users:**
- Community nodes are not supported on n8n Cloud
- Use self-hosted n8n or n8n Enterprise

**For development:**
```bash
# Clone and install locally
git clone https://github.com/surus-lat/n8n-nodes-surusai.git
cd n8n-nodes-surusai
npm install
npm run build
```

### First Time Setup

1. **Get your SURUS AI API Key**:
   - Visit [surus.lat](https://surus.lat)
   - Sign up for an account
   - Generate your API key from the dashboard

2. **Configure credentials in n8n**:
   - Add a SURUS AI node to your workflow
   - Click "Create New Credential"
   - Enter your API key
   - Test the connection

### Troubleshooting

- **Node not appearing?** Restart n8n after installation
- **Connection issues?** Verify your API key is correct
- **Need help?** Check the [n8n community node installation guide](https://docs.n8n.io/integrations/community-nodes/installation/)

---

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

- SURUS API: https://surus.lat/
- n8n community nodes docs: https://docs.n8n.io/integrations/#community-nodes

## More from SURUS

- SURUS provides several AI capabilities as native n8n nodes.
- If you don’t find the exact task you need, we maintain a catalog of OpenAI-compatible models suitable for a wide variety of applications. Just use the agent or extraction nodes with an openAI model node, pointing to our models. You can read more on our website [surus.lat](https://surus.lat).
- Need something specific? Contact us and we can deploy a custom node tailored to your task.
