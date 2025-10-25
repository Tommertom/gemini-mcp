# MCP Server Test Script

This directory contains test scripts for the Gemini MCP server that communicate via stdio to test all tools and functionality.

## Files

- `test-mcp-server.ts` - Main TypeScript test script with comprehensive testing
- `test-mcp-server.js` - JavaScript version (legacy)
- `quick-test.sh` - Quick test runner for Unix/Linux/macOS
- `quick-test.bat` - Quick test runner for Windows

## Running Tests

### Prerequisites

1. Build the project first:
```bash
npm run build
```

2. (Optional) Set your Gemini API key for full functionality testing:
```bash
export GEMINI_API_KEY="your-api-key-here"
```

### Running Tests

**Quick Test (Unix/Linux/macOS):**
```bash
./scripts/quick-test.sh
```

**Quick Test (Windows):**
```cmd
scripts\quick-test.bat
```

**Manual Testing:**
```bash
# Run all tests
npm test

# Run tests with verbose output
npm run test:verbose

# Run directly with tsx
tsx scripts/test-mcp-server.ts
```

## What the Tests Do

The test script performs comprehensive testing of the MCP server:

### 1. **Server Setup & Connection**
- ✅ Starts the MCP server as a child process
- ✅ Establishes stdio communication
- ✅ Performs MCP protocol initialization handshake

### 2. **Tool Discovery**
- ✅ Tests `tools/list` endpoint
- ✅ Verifies all 3 tools are available:
  - `generate_media` - Content generation
  - `analyze_media` - Media analysis  
  - `manipulate_media` - Editing instructions

### 3. **Functional Testing**
Each tool is tested with realistic parameters:

#### Generate Media Tool
- ✅ Tests content generation with creative prompts
- ✅ Verifies file output path is returned
- ✅ Checks generated content is saved correctly

#### Analyze Media Tool
- ✅ Tests media analysis capabilities
- ✅ Uses test files to simulate media input
- ✅ Verifies analysis text is returned directly

#### Manipulate Media Tool
- ✅ Tests manipulation instruction generation
- ✅ Verifies instruction file creation
- ✅ Checks output file path is returned

### 4. **Error Handling**
- ✅ Tests missing required parameters
- ✅ Tests invalid file paths
- ✅ Verifies proper error messages are returned
- ✅ Confirms graceful failure handling

### 5. **Output Validation**
- ✅ File-generating tools return file paths (not JSON)
- ✅ Analysis tool returns text content directly
- ✅ Error cases return clear error messages
- ✅ All stdio communication follows MCP protocol

## Sample Output

```
🧪 Starting MCP Server Tests...
==================================================
🔧 Setting up test environment...
✅ Created output directory: /tmp/gemini_mcp_test
✅ Created test file: /tmp/test-image.txt
🚀 Starting MCP server...
🔍 Server stderr: Gemini MCP server running on stdio

🔗 Initializing MCP connection...
✅ Initialization response received

🛠️  Testing tools/list...
✅ Found 3 tools:
   - generate_media: Generate creative content...
   - analyze_media: Analyze images, videos...
   - manipulate_media: Provide intelligent instructions...

🎨 Testing generate_media tool...
✅ Generate media result:
📄 Output: /tmp/gemini_mcp_test/test-generation.txt

🔍 Testing analyze_media tool...
✅ Analyze media result:
📄 Analysis: This appears to be a text file containing...

🎛️  Testing manipulate_media tool...
✅ Manipulate media result:
📄 Output: /tmp/gemini_mcp_test/test-manipulation.txt

❌ Testing error handling...
✅ Error handling test result: Error: outputFile is required
✅ Proper error message returned

🎉 All tests completed successfully!
✅ All tests passed!
```

## Notes

- **API Key**: Tests work without a valid Gemini API key, but will show API errors for actual AI operations
- **File System**: Tests create temporary files in `/tmp/gemini_mcp_test` and clean up afterward
- **Protocol**: All communication uses proper MCP (Model Context Protocol) JSON-RPC format
- **Error Simulation**: Tests deliberately trigger error conditions to verify error handling

## Test Coverage

- ✅ **Server Lifecycle**: Start, initialize, communicate, cleanup
- ✅ **Protocol Compliance**: Proper MCP JSON-RPC message format
- ✅ **Tool Registration**: All tools discoverable via `tools/list`
- ✅ **Parameter Validation**: Required parameters enforced
- ✅ **File Operations**: Output file creation and path return
- ✅ **Error Handling**: Graceful error responses
- ✅ **Content Validation**: Proper output format for each tool type

This provides confidence that the MCP server is working correctly and ready for integration with AI agents and other MCP clients.