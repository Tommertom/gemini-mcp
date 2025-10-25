# Gemini MCP Server

A TypeScript-based Model Context Protocol (MCP) server for Google Gemini AI media operations, **specifically designed for coding agents and AI development workflows**. Optimized for programmatic consumption with comprehensive prompt engineering best practices.

## ✨ Key Features for Coding Agents

- 🎨 **AI-Guided Content Generation**: Generate detailed image/video specifications for UI mockups, design documentation, and automated content creation
- 🔍 **Intelligent Media Analysis**: Extract structured metadata, accessibility descriptions, OCR data, and technical specifications for content management systems
- ✨ **Smart Manipulation Instructions**: Create programmatic workflows for automated media processing pipelines and batch operations
- 📁 **File System Integration**: Read media from filesystem, write structured outputs to /tmp/gemini_mcp for seamless workflow integration
- 🤖 **Gemini 1.5 Multimodal**: Powered by Google's latest vision and language models with structured output optimization
- 🎯 **AI Agent Optimized**: Extensive prompt engineering guidance built into tool descriptions for maximum effectiveness
- 🔄 **Multiple Media Types**: Support for images, videos, and audio files with format-specific optimizations

## 🤖 Designed for Coding Agents

This MCP server is specifically optimized for coding agents building media-aware applications:

### **Content Generation for Development**
- Generate detailed image specifications for UI/UX mockups and design systems
- Create comprehensive video storyboards for automated video generation tools
- Produce structured media descriptions for database seeding and CMS integration
- Generate prompts for AI image generators (DALL-E, Midjourney, Stable Diffusion)

### **Media Analysis for Applications**  
- Extract actionable insights for automated testing of UI components
- Generate structured metadata for content management and search systems
- Create accessibility descriptions for WCAG compliance automation
- Extract OCR data for document processing and form automation workflows

### **Processing Pipeline Development**
- Generate programmatic workflows for automated media processing
- Create detailed specifications for image manipulation APIs and services
- Develop quality assurance checklists for media processing validation
- Generate configuration files for batch processing operations

Each tool includes extensive documentation on effective prompting strategies, structured output formats, and integration patterns optimized for programmatic consumption.

## 🚀 Quick Start

### Configuration

Create a `.env` file in your project root:

```env
GEMINI_API_KEY=your-api-key-here
GEMINI_MODEL=gemini-2.5-flash
GEMINI_OUTPUT_DIR=/tmp/gemini_mcp
```

Get your API key from [Google AI Studio](https://makersuite.google.com/app/apikey).

## 🔌 Adding the MCP Server to Your Client

The Gemini MCP server works with any MCP client that supports standard I/O (stdio) as the transport medium.

### Claude Desktop

Edit the `claude_desktop_config.json` file:

```json
{
  "mcpServers": {
    "gemini": {
      "command": "npx",
      "args": ["-y", "awesome-gemini-image-mcp@latest"],
      "env": {
        "GEMINI_API_KEY": "your-api-key-here"
      }
    }
  }
}
```

### Cline

Edit the `cline_mcp_settings.json` file:

```json
{
  "mcpServers": {
    "gemini": {
      "command": "npx",
      "args": ["-y", "awesome-gemini-image-mcp@latest"],
      "disabled": false,
      "env": {
        "GEMINI_API_KEY": "your-api-key-here"
      }
    }
  }
}
```

### Visual Studio Code Copilot

Edit `.vscode/mcp.json` in your workspace:

```json
{
  "servers": {
    "gemini": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "awesome-gemini-image-mcp@latest"],
      "env": {
        "GEMINI_API_KEY": "your-api-key-here"
      }
    }
  }
}
```

## 📡 MCP Tools

### generate_media

Generate creative content, descriptions, or scripts for images/videos using AI with professional prompt engineering.

**Best for**: Image generation prompts, video storyboards, character descriptions, scene settings, creative briefs

```javascript
await mcpClient.callTool('generate_media', {
  prompt: 'Create a detailed prompt for a hero image: Professional business team in modern office, natural lighting through large windows, diverse group collaborating around laptop, photorealistic style, 16:9 aspect ratio, corporate yet approachable mood',
  outputFile: 'hero_image_prompt.txt'
});
```

**Prompt Engineering Best Practices**:
- **Images**: Specify style, composition, lighting, colors, mood, subject details
- **Videos**: Include shot types, transitions, pacing, narrative structure, duration
- **Technical**: Mention aspect ratios, resolution, frame rates when relevant
- **Style**: Reference artistic styles, photographers, cinematographers
- **Emotion**: Clearly state desired emotional response or atmosphere

### analyze_media

Analyze images, videos, or audio files using Gemini's multimodal capabilities with intelligent prompting.

**Best for**: Object detection, scene understanding, OCR, quality assessment, composition analysis, video summarization

```javascript
// Image analysis
await mcpClient.callTool('analyze_media', {
  filePath: '/path/to/product-photo.jpg',
  prompt: 'Analyze this product photo: 1) List all visible objects and their positions, 2) Evaluate composition using rule of thirds, 3) Assess lighting quality and suggest improvements, 4) Identify any quality issues (blur, noise, exposure)'
});

// Video analysis
await mcpClient.callTool('analyze_media', {
  filePath: '/path/to/promo-video.mp4',
  prompt: 'Break down this promotional video into scenes with timestamps. For each scene, describe: camera movement, subject actions, lighting conditions, and transition type. Suggest pacing improvements.'
});
```

**Analysis Categories**:

**Images**:
- Object detection and positioning
- Composition and framing analysis
- Color palette and harmony
- Quality assessment (sharpness, exposure, noise)
- Text extraction (OCR)
- Emotion and expression detection
- Accessibility descriptions

**Videos**:
- Content summarization and scene breakdown
- Action recognition and progression
- Cinematography analysis (shots, movements, lighting)
- Audio description (dialogue, music, effects)
- Production quality assessment
- Accessibility caption generation

**Supported formats:**
- Images: JPEG, PNG, GIF, WebP
- Videos: MP4, MPEG, MOV, AVI, WebM
- Audio: MP3, WAV, AAC

### manipulate_media

Generate intelligent instructions for transforming, editing, or enhancing images and videos.

**Note**: This tool creates INSTRUCTIONS for manipulation, not the actual edited media. Output is actionable guidance for editing tools or human editors.

```javascript
await mcpClient.callTool('manipulate_media', {
  inputFile: '/path/to/portrait.jpg',
  prompt: 'Create detailed retouching instructions for this portrait: 1) Professional skin retouching while maintaining texture, 2) Eye enhancement and teeth whitening, 3) Background blur to f/2.8 equivalent, 4) Color grading for warm, natural look, 5) Export settings for web use (1200px width, 85% JPEG quality)',
  outputFile: 'portrait_editing_plan.txt'
});
```

**Manipulation Types**:

**Image Editing**:
- Enhancement instructions (exposure, contrast, color)
- Crop and composition suggestions
- Style transfer guidance
- Object removal strategies
- Color grading plans
- Restoration instructions
- Background replacement guidance

**Video Editing**:
- Shot-by-shot editing blueprints
- Color correction across scenes
- Audio sync instructions
- Special effects guidance
- Title and text overlay placement
- Transition recommendations
- Pacing and rhythm optimization

## 💡 Example Use Cases

### Content Generation for AI Agents

```javascript
// Generate detailed image creation prompt
await mcpClient.callTool('generate_media', {
  prompt: 'Create a comprehensive prompt for generating a SaaS landing page hero image: Modern, minimalist design, gradient background (blue to purple), floating UI elements showing analytics dashboard, subtle glow effects, isometric perspective, high-tech feel, suitable for dark mode website, 1920x1080 resolution'
});

// Video storyboard generation
await mcpClient.callTool('generate_media', {
  prompt: 'Generate a detailed storyboard for 30-second product demo video: Shot 1 (5s): Close-up of product with soft focus background, Shot 2 (8s): Medium shot showing product in use, hands interacting, Shot 3 (7s): Wide shot of lifestyle context, Shot 4 (5s): Feature highlights with animated text overlays, Shot 5 (5s): Call-to-action with logo. Include camera movements, lighting notes, and transition types for each shot.'
});
```

### Advanced Image Analysis

```javascript
// Comprehensive image quality assessment
await mcpClient.callTool('analyze_media', {
  filePath: '/path/to/marketing-photo.jpg',
  prompt: 'Perform a professional quality assessment: 1) Technical quality (sharpness, noise, exposure, white balance), 2) Composition analysis (rule of thirds, leading lines, balance), 3) Color theory evaluation (harmony, contrast, mood), 4) Subject assessment (focus, expression, positioning), 5) Background evaluation (distractions, bokeh, context), 6) Overall rating (1-10) with specific improvement recommendations ranked by impact'
});

// OCR with structure preservation
await mcpClient.callTool('analyze_media', {
  filePath: '/path/to/document-scan.jpg',
  prompt: 'Extract all text from this document maintaining the original layout structure. Format as markdown with headings, bullet points, and tables preserved. Identify the document type (invoice, contract, form, etc.) and highlight any important dates, numbers, or signatures.'
});

// Brand and logo detection
await mcpClient.callTool('analyze_media', {
  filePath: '/path/to/street-photo.jpg',
  prompt: 'Identify all visible brands, logos, and trademarks in this image. For each, provide: brand name, approximate position in frame, visibility level (prominent/subtle), and potential trademark concerns for commercial use.'
});
```

### Video Analysis for Production

```javascript
// Scene-by-scene breakdown
await mcpClient.callTool('analyze_media', {
  filePath: '/path/to/raw-footage.mp4',
  prompt: 'Create a detailed scene breakdown: For each distinct scene provide timestamp, duration, shot type (wide/medium/close-up), camera movement (static/pan/tilt/dolly), subject actions, lighting quality, audio description, and transition recommendation to next scene. Flag any technical issues (focus problems, exposure issues, audio glitches).'
});

// Accessibility caption generation
await mcpClient.callTool('analyze_media', {
  filePath: '/path/to/interview.mp4',
  prompt: 'Generate comprehensive accessibility captions: Include speaker identification, dialogue transcription, sound effect descriptions [door closes], music cues [upbeat jazz playing], and relevant visual descriptions for context. Format as SRT subtitle file structure with timestamps.'
});
```

### Professional Editing Instructions

```javascript
// Portrait retouching workflow
await mcpClient.callTool('manipulate_media', {
  inputFile: '/path/to/headshot.jpg',
  prompt: 'Create a professional retouching workflow for this corporate headshot: Step 1: Skin retouching (frequency separation, opacity 60%, preserve texture), Step 2: Eye enhancement (sharpen iris, brighten catchlights, reduce redness), Step 3: Teeth whitening (hue shift, lightness +15%, saturation -20%), Step 4: Hair refinement (flyaway removal, add definition), Step 5: Background (gaussian blur 25px, vignette subtle), Step 6: Color grade (slight warm tone, +5% saturation), Step 7: Export (JPEG 90% quality, sRGB, 2000px longest edge). Include specific tool names and parameter values.'
});

// Video color grading plan
await mcpClient.callTool('manipulate_media', {
  inputFile: '/path/to/footage.mp4',
  prompt: 'Design a cinematic color grading plan: Analyze current color issues, then provide scene-by-scene color correction instructions including: primary color wheels (lift/gamma/gain values), secondary color isolation (skin tones, sky, foliage), HSL adjustments, film grain settings (amount, size), vignette parameters, LUT recommendations, and final export settings for YouTube (h.264, 4K, 60fps, 40Mbps).'
});

// Batch editing instructions
await mcpClient.callTool('manipulate_media', {
  inputFile: '/path/to/sample-product.jpg',
  prompt: 'Create a batch editing workflow applicable to 50 similar product photos: Develop consistent crop ratio, white balance correction method, exposure adjustment formula, background removal technique, shadow/highlight recovery, color consistency approach, and watermark placement. Provide as step-by-step instructions compatible with Photoshop actions or Lightroom presets.'
});
```

### Project Structure

```
Gemini-mcp/
├── src/
│   ├── index.ts              # Entry point
│   ├── client/
│   │   └── gemini-client.ts  # Gemini API client
│   ├── mcp/
│   │   ├── server.ts         # MCP server
│   │   └── tools/            # Tool implementations
│   │       ├── generate-media.ts
│   │       ├── analyze-media.ts
│   │       └── manipulate-media.ts
│   └── types/
│       └── index.ts          # TypeScript types
├── dist/                     # Compiled JavaScript
├── .github/                  # GitHub configurations
├── package.json
└── tsconfig.json
```

## 🔐 Security

1. **API Key Storage**: Store your API key in `.env` file (never in code)
2. **Git Ignore**: `.env` is in `.gitignore` to prevent committing secrets
3. **Rate Limits**: Be aware of Gemini API rate limits and quotas
4. **File Access**: The server reads files from the filesystem - ensure proper permissions

## 🧪 Testing

The server includes comprehensive tests to verify MCP protocol compliance and tool functionality:

### Quick Testing

**Unix/Linux/macOS:**
```bash
./scripts/quick-test.sh
```

**Windows:**
```cmd
scripts\quick-test.bat
```

### Manual Testing

```bash
# Run all tests (files cleaned up after)
npm test

# Run tests with verbose output
npm run test:verbose

# Run tests and preserve generated files
npm run test:keep-files

# Build and test
npm run build && npm test
```

**Preserve Generated Files:**
Use `npm run test:keep-files` or `./scripts/quick-test.sh --keep-files` to keep the AI-generated content after testing. This is useful for:
- Examining the actual AI outputs
- Testing with real generated content
- Debugging and development
- Showcasing the tool capabilities

The test suite:
- ✅ Validates MCP protocol handshake
- ✅ Tests all tool endpoints with real API calls
- ✅ Verifies error handling and validation
- ✅ Generates sample output files with proper extensions
- ✅ Checks file system integration

Test output files are saved to `/tmp/gemini_mcp_test/` (or `%TEMP%\gemini_mcp_test\` on Windows) and include:
- `creative-description.txt` - AI-generated scene descriptions
- `image-generation-prompt.txt` - Detailed prompts for image generators
- `video-script.txt` - Professional video scripts
- `editing-instructions.md` - Step-by-step editing guidelines

## 📊 Output Directory

All generated and manipulated content is saved to `/tmp/gemini_mcp` by default. You can customize this by setting the `GEMINI_OUTPUT_DIR` environment variable.

```bash
export GEMINI_OUTPUT_DIR=/your/custom/path
```

## 🐛 Troubleshooting

### API Key Errors

1. Verify your API key is correct
2. Check that the key is properly set in `.env` or environment variables
3. Ensure you have API access enabled in Google AI Studio

### File Not Found Errors

1. Check that file paths are absolute
2. Verify file permissions allow reading
3. Ensure the file format is supported

### Output Directory Issues

1. Verify `/tmp/gemini_mcp` exists and is writable
2. Check disk space
3. Set a custom output directory if needed

## 📚 Resources

- [Google Gemini API Documentation](https://ai.google.dev/docs)
- [Model Context Protocol](https://modelcontextprotocol.io)
- [Get API Key](https://makersuite.google.com/app/apikey)

## 📄 License

MIT License - See LICENSE file for details

## 🌟 Version

Current version: **1.0.0**

- ✅ Full MCP protocol support
- ✅ Content generation
- ✅ Media analysis (images, videos, audio)
- ✅ Media manipulation with prompts
- ✅ File system integration
