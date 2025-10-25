#!/bin/bash

# Quick test script for MCP server
# Usage: ./scripts/quick-test.sh
# Windows: scripts\quick-test.bat

set -e

echo "🧪 Quick MCP Server Test"
echo "======================="

# Check if server is built
if [ ! -f "dist/index.js" ]; then
    echo "❌ Server not built. Building now..."
    npm run build
fi

echo "✅ Server build found"

# Check for API key configuration
if [ -f ".env" ]; then
    echo "✅ .env file found"
    # Source the .env file to check if API key is set
    source .env 2>/dev/null || true
    if [ -n "$GEMINI_API_KEY" ] && [ "$GEMINI_API_KEY" != "your-api-key-here" ]; then
        echo "✅ GEMINI_API_KEY is configured in .env file"
    else
        echo "❌ GEMINI_API_KEY not properly set in .env file"
        echo "   Edit .env and set: GEMINI_API_KEY=your-actual-key-here"
        echo "🔗 Get your API key from: https://makersuite.google.com/app/apikey"
        exit 1
    fi
else
    echo "❌ .env file not found. Tests require proper configuration."
    echo "   Copy .env.example to .env and set your API key:"
    echo "   cp .env.example .env"
    echo "   Edit .env and set: GEMINI_API_KEY=your-actual-key-here"
    echo "🔗 Get your API key from: https://makersuite.google.com/app/apikey"
    exit 1
fi

echo ""
echo "🚀 Running comprehensive tests..."
if [ "$1" = "--keep-files" ] || [ "$1" = "-k" ]; then
    echo "📁 Generated files will be preserved..."
    npm run test:keep-files
else
    npm test
fi


echo ""
echo "✅ Tests completed successfully!"
echo ""
echo "💡 Tips:"
echo "   - Tests verify two core scenarios:"
echo "     1. Generate image prompts from text"
echo "     2. Analyze existing images"
echo "   - Use './scripts/quick-test.sh --keep-files' to preserve generated files"
echo "   - Check /tmp/gemini_mcp_test/ for generated files when using --keep-files"
echo "   - Use 'npm run test:verbose' for detailed output"
