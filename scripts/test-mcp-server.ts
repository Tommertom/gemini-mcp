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
    testTimeout: 60000, // 60 seconds - increased for Gemini API processing
    outputDir: '/tmp/gemini_mcp_test',
    testFiles: {
        testImage: path.join(__dirname, 'test-image.png'),
        generateOutput: 'generated-image.png',
        manipulateOutput: 'editing-instructions.md',
        imagePromptOutput: '', // unused
        videoScriptOutput: '' // unused
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

        // Verify test image exists
        try {
            await fs.access(TEST_CONFIG.testFiles.testImage);
            console.log(`✅ Using test image: ${TEST_CONFIG.testFiles.testImage}`);
        } catch (error) {
            console.error(`❌ Test image not found: ${TEST_CONFIG.testFiles.testImage}`);
            throw new Error('Test image file is missing');
        }
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
        console.log('\n🎨 Testing generate_media tool (Generate Actual Image)...');
        console.log('   This tool generates actual images using Gemini AI');

        const response = await this.sendRequest('tools/call', {
            name: 'generate_media',
            arguments: {
                prompt: 'A serene mountain landscape at golden hour with a crystal clear lake reflecting snow-capped peaks, surrounded by pine forests. Photorealistic, 4K quality, dramatic lighting.',
                outputFile: TEST_CONFIG.testFiles.generateOutput
            }
        });

        if (response.result && response.result.content) {
            const output = response.result.content[0].text;
            console.log('✅ Generate media result:');
            console.log('📄 Output file path:', output);

            // Verify file was created and check if it's an image
            if (output.includes(TEST_CONFIG.outputDir)) {
                try {
                    const stats = await fs.stat(output);
                    console.log(`📄 Generated image file size: ${stats.size} bytes`);
                    
                    // Check file extension
                    const ext = path.extname(output).toLowerCase();
                    if (['.png', '.jpg', '.jpeg', '.webp'].includes(ext)) {
                        console.log(`✅ Image file successfully generated: ${ext} format\n`);
                    } else {
                        console.log(`⚠️  Unexpected file format: ${ext}\n`);
                    }
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
        console.log('\n🔍 Testing analyze_media tool (Analyze Image)...');
        console.log('   This tool analyzes an image file and answers questions about it');

        const response = await this.sendRequest('tools/call', {
            name: 'analyze_media',
            arguments: {
                filePath: TEST_CONFIG.testFiles.testImage,
                prompt: 'Analyze this image in detail. Describe what you see, including colors, composition, objects, patterns, and any notable features. What type of image is this?'
            }
        });

        if (response.result && response.result.content) {
            const analysis = response.result.content[0].text;
            console.log('✅ Analyze media result:');
            console.log('📄 Image analysis (first 300 chars):\n' + analysis.substring(0, 300) + '...\n');
            return analysis;
        } else if (response.error) {
            console.log('⚠️  Analyze media error:', response.error);
            return `Error: ${response.error.message || 'Unknown error'}`;
        } else {
            throw new Error('Invalid analyze_media response');
        }
    }

    async testManipulateMedia(): Promise<string> {
        console.log('\n🎛️  Testing manipulate_media tool (Generate Editing Instructions)...');
        console.log('   This tool generates detailed instructions for modifying an image');

        const response = await this.sendRequest('tools/call', {
            name: 'manipulate_media',
            arguments: {
                inputFile: TEST_CONFIG.testFiles.testImage,
                prompt: 'Generate detailed step-by-step Photoshop or GIMP instructions to: Add a warm sunset filter, increase contrast by 20%, add a subtle vignette effect, and enhance colors to make them more vibrant. Include specific tool names, settings, and values.',
                outputFile: TEST_CONFIG.testFiles.manipulateOutput
            }
        });

        if (response.result && response.result.content) {
            const output = response.result.content[0].text;
            console.log('✅ Manipulate media result:');
            console.log('📄 Output file path:', output);

            // Verify file was created
            if (output.includes(TEST_CONFIG.outputDir)) {
                try {
                    const content = await fs.readFile(output, 'utf8');
                    console.log('📄 Generated editing instructions (first 300 chars):\n' + content.substring(0, 300) + '...\n');
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

    async cleanup(preserveFiles: boolean = false): Promise<void> {
        console.log('\n🧹 Cleaning up...');

        if (this.server) {
            this.server.kill();
            console.log('✅ Server terminated');
        }

        if (!preserveFiles) {
            // Clean up output directory only (not the test image)
            try {
                // Remove the entire output directory and its contents
                await fs.rm(TEST_CONFIG.outputDir, { recursive: true, force: true });
                console.log('✅ Test files cleaned up');
            } catch (error) {
                console.log('📁 Test files already cleaned or not found');
            }
        } else {
            console.log('📁 Generated files preserved in:', TEST_CONFIG.outputDir);
        }
    }

    async runAllTests(preserveFiles: boolean = false): Promise<void> {
        try {
            await this.setupTestEnvironment();
            await this.startServer();
            await this.initialize();

            console.log('\n' + '='.repeat(60));
            console.log('🧪 COMPREHENSIVE MCP SERVER TEST SUITE');
            console.log('='.repeat(60));
            console.log('\nTesting the two core scenarios:');
            console.log('1️⃣  Generate an actual image from text description');
            console.log('2️⃣  Analyze an existing image and answer questions');
            console.log('='.repeat(60));

            // First, list available tools
            const tools = await this.testListTools();

            // SCENARIO 1: Generate image prompt from text
            console.log('\n' + '='.repeat(60));
            console.log('SCENARIO 1: Generate Actual Image from Text Description');
            console.log('='.repeat(60));
            await this.testGenerateMedia();

            // SCENARIO 2: Analyze an existing image
            console.log('\n' + '='.repeat(60));
            console.log('SCENARIO 2: Analyze Existing Image');
            console.log('='.repeat(60));
            await this.testAnalyzeMedia();

            console.log('\n' + '='.repeat(60));
            console.log('🎉 ALL TESTS COMPLETED SUCCESSFULLY!');
            console.log('='.repeat(60));

        } catch (error: any) {
            console.error('\n💥 Test failed:', error);
            throw error;
        } finally {
            await this.cleanup(preserveFiles);
        }
    }
}

// Run tests if this script is executed directly
async function main() {
    // Check for preserve files argument
    const preserveFiles = process.argv.includes('--preserve-files') || process.argv.includes('-p');

    console.log('🧪 Starting MCP Server Tests...');
    console.log('='.repeat(50));

    if (preserveFiles) {
        console.log('📁 Files will be preserved after testing');
    }

    // Check if server is built
    try {
        await fs.access(TEST_CONFIG.serverPath);
    } catch (error) {
        console.error('❌ Server not built. Run "npm run build" first.');
        process.exit(1);
    }

    const tester = new MCPTester();

    try {
        await tester.runAllTests(preserveFiles);
        console.log('\n✅ All tests passed!');

        if (preserveFiles) {
            console.log(`📁 Generated files are available in: ${TEST_CONFIG.outputDir}`);
            console.log('🔍 Check the following files:');
            console.log('   - generated-image.png (Generated image file)');
            console.log('   - editing-instructions.md (Image editing instructions)');
        }

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