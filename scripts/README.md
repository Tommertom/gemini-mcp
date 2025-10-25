# MCP Server Test Script

Test the Gemini MCP server with actual Gemini API calls to verify all tools are working correctly.

## How to Run

### Prerequisites

1. Build the project:
```bash
npm run build
```

2. Configure your Gemini API key:
```bash
cp .env.example .env
# Edit .env and set your GEMINI_API_KEY
```

### Run Tests

```bash
# Quick test
./scripts/quick-test.sh

# Or run directly
tsx scripts/test-mcp-server.ts

# Keep generated files after testing
tsx scripts/test-mcp-server.ts --preserve-files
```

## What to Expect

The test will:

1. **Validate your environment** - Check `.env` file and API key
2. **Start the MCP server** - Launch server and establish connection
3. **Test 3 tools:**
   - `generate_media` - Generate an actual image from text description
   - `analyze_media` - Analyze an existing image file
   - `manipulate_media` - Generate image editing instructions
4. **Verify outputs** - Check files are created and contain valid content

### Sample Output

```
✅ .env file loaded successfully
✅ GEMINI_API_KEY is configured
🧪 Starting MCP Server Tests...

🚀 Starting MCP server...
✅ Initialization response received

🛠️  Testing tools/list...
✅ Found 3 tools

🎨 Testing generate_media tool (Generate Actual Image)...
✅ Image file successfully generated: .png format

🔍 Testing analyze_media tool (Analyze Image)...
✅ Image analysis completed

🎛️  Testing manipulate_media tool...
✅ Editing instructions generated

🎉 ALL TESTS COMPLETED SUCCESSFULLY!
✅ All tests passed!
```


Generated files are saved to `/tmp/gemini_mcp_test/` (or kept with `--preserve-files` flag).
