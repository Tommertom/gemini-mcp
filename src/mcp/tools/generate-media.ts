import { GeminiClient } from '../../client/gemini-client.js';

export async function generateMediaTool(client: GeminiClient, args: any) {
    const { prompt, outputFile } = args;

    if (!prompt) {
        throw new Error('prompt is required');
    }

    if (!outputFile) {
        throw new Error('outputFile is required');
    }

    const result = await client.generateImage(prompt, outputFile);

    if (result.success && result.outputPath) {
        return {
            content: [
                {
                    type: 'text',
                    text: result.outputPath,
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
