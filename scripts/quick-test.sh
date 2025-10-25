#!/bin/bash

# Quick test script for MCP server
# Usage: ./scripts/quick-test.sh

set -e

echo "🧪 Quick MCP Server Test"
echo "======================="

# Check if server is built
if [ ! -f "dist/index.js" ]; then
    echo "❌ Server not built. Building now..."
    npm run build
fi

echo "✅ Server build found"

# Check for API key
if [ -z "$GEMINI_API_KEY" ]; then
    echo "⚠️  GEMINI_API_KEY not set. Some operations may fail."
    echo "   Set it with: export GEMINI_API_KEY='your-key-here'"
else
    echo "✅ GEMINI_API_KEY is set"
fi

echo ""
echo "🚀 Running comprehensive tests..."
npm test

echo ""
echo "✅ Test completed successfully!"
echo ""
echo "💡 Tips:"
echo "   - Set GEMINI_API_KEY for full AI functionality"
echo "   - Use 'npm run test:verbose' for detailed output"
echo "   - Check /tmp/gemini_mcp_test/ for generated files"