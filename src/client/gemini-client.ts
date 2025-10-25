import { GoogleGenerativeAI } from '@google/generative-ai';
import { GeminiConfig, GeminiResponse } from '../types/index.js';
import { promises as fs } from 'fs';
import path from 'path';

export class GeminiClient {
    private genAI: GoogleGenerativeAI;
    private model: any;
    private outputDir: string;

    constructor(config: GeminiConfig) {
        if (!config.apiKey) {
            throw new Error('Gemini API key is required');
        }

        this.genAI = new GoogleGenerativeAI(config.apiKey);
        this.model = this.genAI.getGenerativeModel({
            model: config.model || 'gemini-2.5-flash'
        });
        this.outputDir = config.outputDir || '/tmp/gemini_mcp';
    }

    async ensureOutputDir(): Promise<void> {
        try {
            await fs.mkdir(this.outputDir, { recursive: true });
        } catch (error) {
            console.error('Failed to create output directory:', error);
        }
    }

    async generateImage(prompt: string, outputFile: string): Promise<GeminiResponse> {
        try {
            await this.ensureOutputDir();

            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            const outputPath = path.join(this.outputDir, outputFile);

            await fs.writeFile(outputPath, text);

            return {
                success: true,
                message: 'Content generated successfully',
                outputPath,
                data: { text }
            };
        } catch (error: any) {
            return {
                success: false,
                message: `Generation failed: ${error.message}`
            };
        }
    }

    async analyzeMedia(filePath: string, prompt: string): Promise<GeminiResponse> {
        try {
            const fileBuffer = await fs.readFile(filePath);
            const base64Data = fileBuffer.toString('base64');

            const mimeType = this.getMimeType(filePath);

            const imageParts = [
                {
                    inlineData: {
                        data: base64Data,
                        mimeType
                    }
                }
            ];

            const result = await this.model.generateContent([prompt, ...imageParts]);
            const response = await result.response;
            const text = response.text();

            return {
                success: true,
                message: 'Media analyzed successfully',
                data: { analysis: text }
            };
        } catch (error: any) {
            return {
                success: false,
                message: `Analysis failed: ${error.message}`
            };
        }
    }

    async manipulateMedia(inputFile: string, prompt: string, outputFile: string): Promise<GeminiResponse> {
        try {
            await this.ensureOutputDir();

            const fileBuffer = await fs.readFile(inputFile);
            const base64Data = fileBuffer.toString('base64');

            const mimeType = this.getMimeType(inputFile);

            const imageParts = [
                {
                    inlineData: {
                        data: base64Data,
                        mimeType
                    }
                }
            ];

            const result = await this.model.generateContent([prompt, ...imageParts]);
            const response = await result.response;
            const text = response.text();

            const outputPath = path.join(this.outputDir, outputFile);

            await fs.writeFile(outputPath, text);

            return {
                success: true,
                message: 'Media manipulation completed',
                outputPath,
                data: { result: text }
            };
        } catch (error: any) {
            return {
                success: false,
                message: `Manipulation failed: ${error.message}`
            };
        }
    }

    private getMimeType(filePath: string): string {
        const ext = path.extname(filePath).toLowerCase();
        const mimeTypes: Record<string, string> = {
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.png': 'image/png',
            '.gif': 'image/gif',
            '.webp': 'image/webp',
            '.mp4': 'video/mp4',
            '.mpeg': 'video/mpeg',
            '.mov': 'video/mov',
            '.avi': 'video/avi',
            '.webm': 'video/webm',
            '.mp3': 'audio/mp3',
            '.wav': 'audio/wav',
            '.aac': 'audio/aac'
        };
        return mimeTypes[ext] || 'application/octet-stream';
    }
}
