import { GeminiClient } from '../../client/gemini-client.js';

export async function manipulateMediaTool(client: GeminiClient, args: any) {
    const { inputFile, prompt, outputFile } = args;

    if (!inputFile) {
        throw new Error('inputFile is required');
    }

    if (!prompt) {
        throw new Error('prompt is required');
    }

    if (!outputFile) {
        throw new Error('outputFile is required');
    }

    const result = await client.manipulateMedia(inputFile, prompt, outputFile);

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
