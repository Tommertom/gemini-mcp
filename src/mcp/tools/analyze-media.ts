import { GeminiClient } from '../../client/gemini-client.js';

export async function analyzeMediaTool(client: GeminiClient, args: any) {
    const { filePath, prompt } = args;

    if (!filePath) {
        throw new Error('filePath is required');
    }

    if (!prompt) {
        throw new Error('prompt is required');
    }

    const result = await client.analyzeMedia(filePath, prompt);

    if (result.success && result.data) {
        return {
            content: [
                {
                    type: 'text',
                    text: result.data.analysis,
                },
            ],
        };
    } else {
        return {
            content: [
                {
                    type: 'text',
                    text: `Error: ${result.message}`,
                },
            ],
        };
    }
}
