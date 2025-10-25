#!/usr/bin/env node

import { GeminiMcpServer } from './mcp/server.js';

const server = new GeminiMcpServer();
server.run().catch((error) => {
    console.error('Failed to start Gemini MCP server:', error);
    process.exit(1);
});
