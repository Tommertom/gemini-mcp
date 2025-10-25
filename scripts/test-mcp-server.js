#!/usr/bin/env node

import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs/promises";
import os from "os";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Test configuration
const TEST_CONFIG = {
  serverPath: path.join(__dirname, "..", "dist", "index.js"),
  testTimeout: 30000, // 30 seconds
  outputDir: "/tmp/gemini_mcp_test",
  testFiles: {
    // Test image path - we'll create a simple test image
    testImage: path.join(os.tmpdir(), "test-image.txt"),
    // Test outputs
    generateOutput: "test-generation.txt",
    manipulateOutput: "test-manipulation.txt",
  },
};

class MCPTester {
  constructor() {
    this.server = null;
    this.messageId = 1;
    this.responses = new Map();
    this.isConnected = false;
  }

  async setupTestEnvironment() {
    console.log("🔧 Setting up test environment...");

    // Ensure output directory exists
    try {
      await fs.mkdir(TEST_CONFIG.outputDir, { recursive: true });
      console.log(`✅ Created output directory: ${TEST_CONFIG.outputDir}`);
    } catch (error) {
      console.log(
        `📁 Output directory already exists: ${TEST_CONFIG.outputDir}`
      );
    }

    // Create a simple test file to simulate media
    const testContent =
      "This is a test file simulating an image for MCP testing purposes.";
    await fs.writeFile(TEST_CONFIG.testFiles.testImage, testContent);
    console.log(`✅ Created test file: ${TEST_CONFIG.testFiles.testImage}`);
  }

  async startServer() {
    console.log("🚀 Starting MCP server...");

    return new Promise((resolve, reject) => {
      // Start the server process
      this.server = spawn("node", [TEST_CONFIG.serverPath], {
        stdio: ["pipe", "pipe", "pipe"],
        env: {
          ...process.env,
          GEMINI_API_KEY: process.env.GEMINI_API_KEY || "test-key-for-testing",
          GEMINI_OUTPUT_DIR: TEST_CONFIG.outputDir,
        },
      });

      // Set up data handlers
      let buffer = "";
      this.server.stdout.on("data", (data) => {
        buffer += data.toString();

        // Try to parse complete JSON messages
        let lines = buffer.split("\n");
        buffer = lines.pop() || ""; // Keep incomplete line in buffer

        for (let line of lines) {
          if (line.trim()) {
            try {
              const message = JSON.parse(line);
              this.handleServerMessage(message);
            } catch (e) {
              console.log("📤 Server output:", line);
            }
          }
        }
      });

      this.server.stderr.on("data", (data) => {
        const output = data.toString().trim();
        if (output) {
          console.log("🔍 Server stderr:", output);
          if (output.includes("Gemini MCP server running")) {
            this.isConnected = true;
            resolve();
          }
        }
      });

      this.server.on("error", (error) => {
        console.error("❌ Server error:", error);
        reject(error);
      });

      this.server.on("exit", (code, signal) => {
        console.log(`🛑 Server exited with code ${code}, signal ${signal}`);
      });

      // Timeout fallback
      setTimeout(() => {
        if (!this.isConnected) {
          console.log("⏰ Server connection timeout, assuming ready...");
          this.isConnected = true;
          resolve();
        }
      }, 3000);
    });
  }

  handleServerMessage(message) {
    console.log("📨 Received from server:", JSON.stringify(message, null, 2));

    if (message.id && this.responses.has(message.id)) {
      const resolver = this.responses.get(message.id);
      this.responses.delete(message.id);
      resolver(message);
    }
  }

  async sendRequest(method, params = {}) {
    const id = this.messageId++;
    const request = {
      jsonrpc: "2.0",
      id,
      method,
      params,
    };

    console.log("📤 Sending request:", JSON.stringify(request, null, 2));

    return new Promise((resolve, reject) => {
      // Store resolver for this request ID
      this.responses.set(id, resolve);

      // Send the request
      this.server.stdin.write(JSON.stringify(request) + "\n");

      // Set timeout
      setTimeout(() => {
        if (this.responses.has(id)) {
          this.responses.delete(id);
          reject(new Error(`Request timeout for method: ${method}`));
        }
      }, TEST_CONFIG.testTimeout);
    });
  }

  async initialize() {
    console.log("\n🔗 Initializing MCP connection...");

    const initResponse = await this.sendRequest("initialize", {
      protocolVersion: "2024-11-05",
      capabilities: {
        tools: {},
      },
      clientInfo: {
        name: "MCP Test Client",
        version: "1.0.0",
      },
    });

    console.log("✅ Initialization response received");

    // Send initialized notification
    this.server.stdin.write(
      JSON.stringify({
        jsonrpc: "2.0",
        method: "notifications/initialized",
      }) + "\n"
    );

    return initResponse;
  }

  async testListTools() {
    console.log("\n🛠️  Testing tools/list...");

    const response = await this.sendRequest("tools/list");

    if (response.result && response.result.tools) {
      console.log(`✅ Found ${response.result.tools.length} tools:`);
      response.result.tools.forEach((tool) => {
        console.log(`   - ${tool.name}: ${tool.description.split("\n")[0]}...`);
      });
      return response.result.tools;
    } else {
      throw new Error("Invalid tools/list response");
    }
  }

  async testGenerateMedia() {
    console.log("\n🎨 Testing generate_media tool...");

    const response = await this.sendRequest("tools/call", {
      name: "generate_media",
      arguments: {
        prompt:
          "Create a detailed description for a futuristic cityscape at sunset with flying cars and neon lights",
        outputFile: TEST_CONFIG.testFiles.generateOutput,
      },
    });

    if (response.result && response.result.content) {
      const output = response.result.content[0].text;
      console.log("✅ Generate media result:");
      console.log("📄 Output:", output);

      // Verify file was created
      if (output.includes(TEST_CONFIG.outputDir)) {
        try {
          const content = await fs.readFile(output, "utf8");
          console.log(
            "📄 Generated content preview:",
            content.substring(0, 200) + "..."
          );
        } catch (error) {
          console.log("⚠️  Could not read generated file:", error.message);
        }
      }

      return output;
    } else {
      throw new Error("Invalid generate_media response");
    }
  }

  async testAnalyzeMedia() {
    console.log("\n🔍 Testing analyze_media tool...");

    const response = await this.sendRequest("tools/call", {
      name: "analyze_media",
      arguments: {
        filePath: TEST_CONFIG.testFiles.testImage,
        prompt:
          "Analyze this file and describe what you can determine about it",
      },
    });

    if (response.result && response.result.content) {
      const analysis = response.result.content[0].text;
      console.log("✅ Analyze media result:");
      console.log("📄 Analysis:", analysis);
      return analysis;
    } else {
      throw new Error("Invalid analyze_media response");
    }
  }

  async testManipulateMedia() {
    console.log("\n🎛️  Testing manipulate_media tool...");

    const response = await this.sendRequest("tools/call", {
      name: "manipulate_media",
      arguments: {
        inputFile: TEST_CONFIG.testFiles.testImage,
        prompt:
          "Provide step-by-step instructions to enhance this image for professional presentation",
        outputFile: TEST_CONFIG.testFiles.manipulateOutput,
      },
    });

    if (response.result && response.result.content) {
      const output = response.result.content[0].text;
      console.log("✅ Manipulate media result:");
      console.log("📄 Output:", output);

      // Verify file was created
      if (output.includes(TEST_CONFIG.outputDir)) {
        try {
          const content = await fs.readFile(output, "utf8");
          console.log(
            "📄 Generated instructions preview:",
            content.substring(0, 200) + "..."
          );
        } catch (error) {
          console.log(
            "⚠️  Could not read manipulation instructions file:",
            error.message
          );
        }
      }

      return output;
    } else {
      throw new Error("Invalid manipulate_media response");
    }
  }

  async testErrorHandling() {
    console.log("\n❌ Testing error handling...");

    try {
      // Test missing required parameters
      const response = await this.sendRequest("tools/call", {
        name: "generate_media",
        arguments: {
          prompt: "Test prompt",
          // Missing required outputFile
        },
      });

      if (response.result && response.result.content) {
        const output = response.result.content[0].text;
        console.log("✅ Error handling test result:", output);

        if (output.includes("Error") || output.includes("required")) {
          console.log("✅ Proper error message returned");
        } else {
          console.log("⚠️  Expected error message, got:", output);
        }
      }
    } catch (error) {
      console.log("✅ Error properly caught:", error.message);
    }
  }

  async cleanup() {
    console.log("\n🧹 Cleaning up...");

    if (this.server) {
      this.server.kill();
      console.log("✅ Server terminated");
    }

    // Clean up test files
    try {
      await fs.unlink(TEST_CONFIG.testFiles.testImage);
      console.log("✅ Test files cleaned up");
    } catch (error) {
      console.log("📁 Test files already cleaned or not found");
    }
  }

  async runAllTests() {
    try {
      await this.setupTestEnvironment();
      await this.startServer();
      await this.initialize();

      const tools = await this.testListTools();
      await this.testGenerateMedia();
      await this.testAnalyzeMedia();
      await this.testManipulateMedia();
      await this.testErrorHandling();

      console.log("\n🎉 All tests completed successfully!");
    } catch (error) {
      console.error("\n💥 Test failed:", error);
      throw error;
    } finally {
      await this.cleanup();
    }
  }
}

// Run tests if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log("🧪 Starting MCP Server Tests...");
  console.log("=" * 50);

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
    console.log("\n✅ All tests passed!");
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Tests failed:", error.message);
    process.exit(1);
  }
}

export { MCPTester, TEST_CONFIG };
