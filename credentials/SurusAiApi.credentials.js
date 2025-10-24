"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SurusAiApi = void 0;
class SurusAiApi {
    constructor() {
        this.name = 'surusAiApi';
        this.displayName = 'SURUS AI API';
        this.documentationUrl = 'https://api.surus.dev';
        this.properties = [
            {
                displayName: 'API Key',
                name: 'apiKey',
                type: 'string',
                typeOptions: { password: true },
                default: '',
            },
        ];
        this.authenticate = {
            type: 'generic',
            properties: {
                headers: {
                    Authorization: '=Bearer {{$credentials.apiKey}}',
                },
            },
        };
        this.test = {
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
}
exports.SurusAiApi = SurusAiApi;
