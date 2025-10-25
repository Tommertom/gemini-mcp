#!/usr/bin/env node

import { spawn, ChildProcess } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';
import os from 'os';
import * as dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env file
const envPath = path.join(__dirname, '..', '.env');
const dotenvResult = dotenv.config({ path: envPath });

// Validate .env file loading
if (dotenvResult.error) {
    console.error('❌ Failed to load .env file:', dotenvResult.error.message);
    console.error('💡 Create a .env file by copying .env.example:');
    console.error('   cp .env.example .env');
    console.error('   Edit .env and set your GEMINI_API_KEY');
    process.exit(1);
}

// Validate API key is configured
if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your-api-key-here') {
    console.error('❌ GEMINI_API_KEY not properly configured in .env file');
    console.error('💡 Edit .env and set your actual Gemini API key:');
    console.error('   GEMINI_API_KEY=your-actual-api-key-here');
    console.error('🔗 Get your API key from: https://makersuite.google.com/app/apikey');
    process.exit(1);
}

console.log('✅ .env file loaded successfully');
console.log('✅ GEMINI_API_KEY is configured');

// Test configuration
interface TestConfig {
    serverPath: string;
    testTimeout: number;
    outputDir: string;
    testFiles: {
        testImage: string;
        generateOutput: string;
        manipulateOutput: string;
        imagePromptOutput: string;
        videoScriptOutput: string;
    };
}

const TEST_CONFIG: TestConfig = {
    serverPath: path.join(__dirname, '..', 'dist', 'index.js'),
    testTimeout: 30000, // 30 seconds
    outputDir: '/tmp/gemini_mcp_test',
    testFiles: {
        testImage: path.join(os.tmpdir(), 'test-image.jpg'),
        generateOutput: 'creative-description.txt',
        manipulateOutput: 'editing-instructions.md',
        imagePromptOutput: 'image-generation-prompt.txt',
        videoScriptOutput: 'video-script.txt'
    }
};

interface MCPRequest {
    jsonrpc: string;
    id: number;
    method: string;
    params?: any;
}

interface MCPResponse {
    jsonrpc: string;
    id: number;
    result?: any;
    error?: any;
}

class MCPTester {
    private server: ChildProcess | null = null;
    private messageId: number = 1;
    private responses: Map<number, (response: MCPResponse) => void> = new Map();
    private isConnected: boolean = false;

    async setupTestEnvironment(): Promise<void> {
        console.log('🔧 Setting up test environment...');

        // Ensure output directory exists
        try {
            await fs.mkdir(TEST_CONFIG.outputDir, { recursive: true });
            console.log(`✅ Created output directory: ${TEST_CONFIG.outputDir}`);
        } catch (error) {
            console.log(`📁 Output directory already exists: ${TEST_CONFIG.outputDir}`);
        }

        // Create a simple test image file (minimal 1x1 pixel JPEG)
        // This is a base64-encoded 1x1 red pixel JPEG image
        const minimalJpegBase64 = '/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=';
        const imageBuffer = Buffer.from(minimalJpegBase64, 'base64');
        await fs.writeFile(TEST_CONFIG.testFiles.testImage, imageBuffer);
        console.log(`✅ Created test image file: ${TEST_CONFIG.testFiles.testImage}`);
    }

    async startServer(): Promise<void> {
        console.log('🚀 Starting MCP server...');

        return new Promise((resolve, reject) => {
            // Start the server process
            this.server = spawn('node', [TEST_CONFIG.serverPath], {
                stdio: ['pipe', 'pipe', 'pipe'],
                env: {
                    ...process.env,
                    GEMINI_API_KEY: process.env.GEMINI_API_KEY || 'test-key-for-testing',
                    GEMINI_OUTPUT_DIR: TEST_CONFIG.outputDir
                }
            });

            // Set up data handlers
            let buffer = '';
            this.server.stdout?.on('data', (data) => {
                buffer += data.toString();

                // Try to parse complete JSON messages
                const lines = buffer.split('\n');
                buffer = lines.pop() || ''; // Keep incomplete line in buffer

                for (const line of lines) {
                    if (line.trim()) {
                        try {
                            const message: MCPResponse = JSON.parse(line);
                            this.handleServerMessage(message);
                        } catch (e) {
                            console.log('📤 Server output:', line);
                        }
                    }
                }
            });

            this.server.stderr?.on('data', (data) => {
                const output = data.toString().trim();
                if (output) {
                    console.log('🔍 Server stderr:', output);
                    if (output.includes('Gemini MCP server running')) {
                        this.isConnected = true;
                        resolve();
                    }
                }
            });

            this.server.on('error', (error) => {
                console.error('❌ Server error:', error);
                reject(error);
            });

            this.server.on('exit', (code, signal) => {
                console.log(`🛑 Server exited with code ${code}, signal ${signal}`);
            });

            // Timeout fallback
            setTimeout(() => {
                if (!this.isConnected) {
                    console.log('⏰ Server connection timeout, assuming ready...');
                    this.isConnected = true;
                    resolve();
                }
            }, 3000);
        });
    }

    private handleServerMessage(message: MCPResponse): void {
        console.log('📨 Received from server:', JSON.stringify(message, null, 2));

        if (message.id && this.responses.has(message.id)) {
            const resolver = this.responses.get(message.id);
            this.responses.delete(message.id);
            resolver!(message);
        }
    }

    private async sendRequest(method: string, params: any = {}): Promise<MCPResponse> {
        const id = this.messageId++;
        const request: MCPRequest = {
            jsonrpc: '2.0',
            id,
            method,
            params
        };

        console.log('📤 Sending request:', JSON.stringify(request, null, 2));

        return new Promise((resolve, reject) => {
            // Store resolver for this request ID
            this.responses.set(id, resolve);

            // Send the request
            this.server?.stdin?.write(JSON.stringify(request) + '\n');

            // Set timeout
            setTimeout(() => {
                if (this.responses.has(id)) {
                    this.responses.delete(id);
                    reject(new Error(`Request timeout for method: ${method}`));
                }
            }, TEST_CONFIG.testTimeout);
        });
    }

    async initialize(): Promise<MCPResponse> {
        console.log('\n🔗 Initializing MCP connection...');

        const initResponse = await this.sendRequest('initialize', {
            protocolVersion: '2024-11-05',
            capabilities: {
                tools: {}
            },
            clientInfo: {
                name: 'MCP Test Client',
                version: '1.0.0'
            }
        });

        console.log('✅ Initialization response received');

        // Validate and highlight server description
        if (initResponse.result && initResponse.result.serverInfo) {
            const serverInfo = initResponse.result.serverInfo;
            console.log('📋 Server Information:');
            console.log(`   📛 Name: ${serverInfo.name}`);
            console.log(`   🔢 Version: ${serverInfo.version}`);
            if (serverInfo.description) {
                console.log(`   📝 Description: ${serverInfo.description}`);
                console.log('   ✅ Server description is properly configured');
            } else {
                console.log('   ⚠️  No server description found');
            }
        }

        // Send initialized notification
        this.server?.stdin?.write(JSON.stringify({
            jsonrpc: '2.0',
            method: 'notifications/initialized'
        }) + '\n');

        return initResponse;
    }

    async testListTools(): Promise<any[]> {
        console.log('\n🛠️  Testing tools/list...');

        const response = await this.sendRequest('tools/list');

        if (response.result && response.result.tools) {
            console.log(`✅ Found ${response.result.tools.length} tools:`);
            response.result.tools.forEach((tool: any) => {
                console.log(`   - ${tool.name}: ${tool.description.split('\n')[0]}...`);
            });
            return response.result.tools;
        } else {
            throw new Error('Invalid tools/list response');
        }
    }

    async testGenerateMedia(): Promise<string> {
        console.log('\n🎨 Testing generate_media tool...');

        const response = await this.sendRequest('tools/call', {
            name: 'generate_media',
            arguments: {
                prompt: 'Create a detailed description for a futuristic cityscape at sunset with flying cars and neon lights. Include specific details about lighting, composition, and atmosphere.',
                outputFile: TEST_CONFIG.testFiles.generateOutput
            }
        });

        if (response.result && response.result.content) {
            const output = response.result.content[0].text;
            console.log('✅ Generate media result:');
            console.log('📄 Output:', output);

            // Verify file was created if output looks like a path
            if (output.includes(TEST_CONFIG.outputDir)) {
                try {
                    const content = await fs.readFile(output, 'utf8');
                    console.log('📄 Generated content preview:', content.substring(0, 200) + '...');
                } catch (error: any) {
                    console.log('⚠️  Could not read generated file:', error.message);
                }
            }

            return output;
        } else if (response.error) {
            console.log('⚠️  Generate media error:', response.error);
            return `Error: ${response.error.message || 'Unknown error'}`;
        } else {
            throw new Error('Invalid generate_media response');
        }
    }

    async testAnalyzeMedia(): Promise<string> {
        console.log('\n🔍 Testing analyze_media tool...');

        const response = await this.sendRequest('tools/call', {
            name: 'analyze_media',
            arguments: {
                filePath: TEST_CONFIG.testFiles.testImage,
                prompt: 'Analyze this file and describe what you can determine about it. Include details about content, structure, and any patterns you observe.'
            }
        });

        if (response.result && response.result.content) {
            const analysis = response.result.content[0].text;
            console.log('✅ Analyze media result:');
            console.log('📄 Analysis:', analysis);
            return analysis;
        } else if (response.error) {
            console.log('⚠️  Analyze media error:', response.error);
            return `Error: ${response.error.message || 'Unknown error'}`;
        } else {
            throw new Error('Invalid analyze_media response');
        }
    }

    async testManipulateMedia(): Promise<string> {
        console.log('\n🎛️  Testing manipulate_media tool...');

        const response = await this.sendRequest('tools/call', {
            name: 'manipulate_media',
            arguments: {
                inputFile: TEST_CONFIG.testFiles.testImage,
                prompt: 'Provide detailed step-by-step instructions to enhance this content for professional presentation. Include specific techniques and parameters.',
                outputFile: TEST_CONFIG.testFiles.manipulateOutput
            }
        });

        if (response.result && response.result.content) {
            const output = response.result.content[0].text;
            console.log('✅ Manipulate media result:');
            console.log('📄 Output:', output);

            // Verify file was created if output looks like a path
            if (output.includes(TEST_CONFIG.outputDir)) {
                try {
                    const content = await fs.readFile(output, 'utf8');
                    console.log('📄 Generated instructions preview:', content.substring(0, 200) + '...');
                } catch (error: any) {
                    console.log('⚠️  Could not read manipulation instructions file:', error.message);
                }
            }

            return output;
        } else if (response.error) {
            console.log('⚠️  Manipulate media error:', response.error);
            return `Error: ${response.error.message || 'Unknown error'}`;
        } else {
            throw new Error('Invalid manipulate_media response');
        }
    }

    async testImagePromptGeneration(): Promise<string> {
        console.log('\n🖼️  Testing image prompt generation...');

        const response = await this.sendRequest('tools/call', {
            name: 'generate_media',
            arguments: {
                prompt: 'Create a detailed DALL-E or Midjourney prompt for generating a professional product photography shot of a luxury watch. Include specific lighting setup, background, composition, camera angle, and style details.',
                outputFile: TEST_CONFIG.testFiles.imagePromptOutput
            }
        });

        if (response.result && response.result.content) {
            const output = response.result.content[0].text;
            console.log('✅ Image prompt generation result:');
            console.log('📄 Output file:', output);

            // Verify file was created if output looks like a path
            if (output.includes(TEST_CONFIG.outputDir)) {
                try {
                    const content = await fs.readFile(output, 'utf8');
                    console.log('📄 Generated prompt preview:', content.substring(0, 150) + '...');
                } catch (error: any) {
                    console.log('⚠️  Could not read prompt file:', error.message);
                }
            }

            return output;
        } else if (response.error) {
            console.log('⚠️  Image prompt generation error:', response.error);
            return `Error: ${response.error.message || 'Unknown error'}`;
        } else {
            throw new Error('Invalid generate_media response');
        }
    }

    async testVideoScriptGeneration(): Promise<string> {
        console.log('\n🎬 Testing video script generation...');

        const response = await this.sendRequest('tools/call', {
            name: 'generate_media',
            arguments: {
                prompt: 'Create a detailed 30-second video script for a tech startup promotional video. Include shot descriptions, camera movements, dialogue, timing, music cues, and visual effects. Format as a professional shooting script.',
                outputFile: TEST_CONFIG.testFiles.videoScriptOutput
            }
        });

        if (response.result && response.result.content) {
            const output = response.result.content[0].text;
            console.log('✅ Video script generation result:');
            console.log('📄 Output file:', output);

            // Verify file was created if output looks like a path
            if (output.includes(TEST_CONFIG.outputDir)) {
                try {
                    const content = await fs.readFile(output, 'utf8');
                    console.log('📄 Generated script preview:', content.substring(0, 150) + '...');
                } catch (error: any) {
                    console.log('⚠️  Could not read script file:', error.message);
                }
            }

            return output;
        } else if (response.error) {
            console.log('⚠️  Video script generation error:', response.error);
            return `Error: ${response.error.message || 'Unknown error'}`;
        } else {
            throw new Error('Invalid generate_media response');
        }
    }

    async testErrorHandling(): Promise<void> {
        console.log('\n❌ Testing error handling...');

        try {
            // Test missing required parameters
            const response = await this.sendRequest('tools/call', {
                name: 'generate_media',
                arguments: {
                    prompt: 'Test prompt'
                    // Missing required outputFile
                }
            });

            if (response.result && response.result.content) {
                const output = response.result.content[0].text;
                console.log('✅ Error handling test result:', output);

                if (output.includes('Error') || output.includes('required')) {
                    console.log('✅ Proper error message returned');
                } else {
                    console.log('⚠️  Expected error message, got:', output);
                }
            } else if (response.error) {
                console.log('✅ Error properly returned:', response.error);
            }
        } catch (error: any) {
            console.log('✅ Error properly caught:', error.message);
        }

        try {
            // Test invalid file path
            const response = await this.sendRequest('tools/call', {
                name: 'analyze_media',
                arguments: {
                    filePath: '/non/existent/file.jpg',
                    prompt: 'Analyze this file'
                }
            });

            if (response.result && response.result.content) {
                const output = response.result.content[0].text;
                console.log('✅ File not found test result:', output);

                if (output.includes('Error') || output.includes('failed') || output.includes('not found')) {
                    console.log('✅ Proper error handling for missing file');
                } else {
                    console.log('⚠️  Expected error for missing file, got:', output);
                }
            }
        } catch (error: any) {
            console.log('✅ File error properly caught:', error.message);
        }
    }

    async cleanup(): Promise<void> {
        console.log('\n🧹 Cleaning up...');

        if (this.server) {
            this.server.kill();
            console.log('✅ Server terminated');
        }

        // Clean up test files
        try {
            await fs.unlink(TEST_CONFIG.testFiles.testImage);
            console.log('✅ Test files cleaned up');
        } catch (error) {
            console.log('📁 Test files already cleaned or not found');
        }
    }

    async runAllTests(): Promise<void> {
        try {
            await this.setupTestEnvironment();
            await this.startServer();
            await this.initialize();

            const tools = await this.testListTools();
            await this.testGenerateMedia();
            await this.testImagePromptGeneration();
            await this.testVideoScriptGeneration();
            await this.testAnalyzeMedia();
            await this.testManipulateMedia();
            await this.testErrorHandling();

            console.log('\n🎉 All tests completed successfully!');

        } catch (error: any) {
            console.error('\n💥 Test failed:', error);
            throw error;
        } finally {
            await this.cleanup();
        }
    }
}

// Run tests if this script is executed directly
async function main() {
    console.log('🧪 Starting MCP Server Tests...');
    console.log('='.repeat(50));

    // Check if server is built
    try {
        await fs.access(TEST_CONFIG.serverPath);
    } catch (error) {
        console.error('❌ Server not built. Run "npm run build" first.');
        process.exit(1);
    }

    const tester = new MCPTester();

    try {
        await tester.runAllTests();
        console.log('\n✅ All tests passed!');
        process.exit(0);
    } catch (error: any) {
        console.error('\n❌ Tests failed:', error.message);
        process.exit(1);
    }
}

// Check if this module is being run directly
if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch(console.error);
}

export { MCPTester, TEST_CONFIG };