import type {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class SurusAiApi implements ICredentialType {
	name = 'surusAiApi';

	displayName = 'SURUS AI API';

	documentationUrl = 'https://api.surus.dev';

	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: { password: true },
			default: '',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				Authorization: '=Bearer {{$credentials.apiKey}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: 'https://api.surus.dev',
			url: '/functions/v1/translate',
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: {
				text: 'Hello, world!',
				target_lang: 'es',
			},
		},
	};
}
