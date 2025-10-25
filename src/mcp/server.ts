import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
    CallToolRequestSchema,
    ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { GeminiClient } from '../client/gemini-client.js';
import { generateMediaTool } from './tools/generate-media.js';
import { analyzeMediaTool } from './tools/analyze-media.js';
import { manipulateMediaTool } from './tools/manipulate-media.js';
import * as dotenv from 'dotenv';

dotenv.config();

export class GeminiMcpServer {
    private server: Server;
    private geminiClient: GeminiClient | null = null;

    constructor() {
        this.server = new Server(
            {
                name: 'gemini-mcp-server',
                version: '1.0.0',
                description: 'AI-powered media operations server using Google Gemini multimodal capabilities. Specifically designed for coding agents and AI development workflows. Provides tools for generating creative content descriptions, analyzing images/videos/audio files, and creating detailed manipulation instructions. Enables coding agents to understand media content, generate media-related code, create comprehensive documentation, and provide intelligent media processing guidance. Supports advanced prompt engineering with structured outputs optimized for programmatic consumption.',
            },
            {
                capabilities: {
                    tools: {},
                },
            }
        );

        console.error('Gemini MCP Server initialized - AI-Powered Media Operations for Coding Agents');
        console.error('Supports: Image analysis, video understanding, content generation for AI development');
        console.error('Optimized for: Coding agents, programmatic media processing, structured outputs');

        this.setupHandlers();
    }

    private initializeClient(): void {
        if (!this.geminiClient) {
            const apiKey = process.env.GEMINI_API_KEY;
            if (!apiKey) {
                throw new Error('GEMINI_API_KEY environment variable is required');
            }

            this.geminiClient = new GeminiClient({
                apiKey,
                model: process.env.GEMINI_MODEL,
                outputDir: process.env.GEMINI_OUTPUT_DIR || '/tmp/gemini_mcp',
            });
        }
    }

    private setupHandlers(): void {
        this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
            tools: [
                {
                    name: 'generate_media',
                    description: `Generate actual images using Gemini's multimodal AI image generation capabilities. Optimized for coding agents building media-rich applications.
                    
CODING AGENT BENEFITS:
- Generate actual images for UI/UX mockups and design prototyping
- Create visual assets for automated content generation workflows
- Produce product photography and marketing materials programmatically
- Generate illustrations and graphics for documentation and presentations
- Create visual training data for machine learning pipelines
- Generate placeholder images and assets for development and testing

BEST PRACTICES FOR AI AGENTS:
- Image Generation: Be highly specific about style, composition, lighting, colors, mood, and subject details
  Example: "A photorealistic sunset over a mountain lake, golden hour lighting, reflection on calm water, 4K quality, dramatic sky"
- Photorealistic Images: Use photography terms like camera angles, lens types (35mm, macro), lighting setups
- Artistic Styles: Specify artistic styles (watercolor, sketch, digital art, impressionism) for non-photorealistic results
- Product Photography: Describe studio setup, lighting, background, angle for product shots
- Illustrations: Be specific about line style, color palette, shading technique
- Technical Details: Mention desired quality level, level of detail, rendering style
- Composition: Specify framing, rule of thirds, focal points, depth of field
- Mood & Atmosphere: Describe the emotional tone and atmosphere you want to convey

IMAGE OUTPUT:
- Returns the absolute file path to the generated PNG/JPEG image
- Images are saved to /tmp/gemini_mcp by default
- File includes mime type information (image/png, image/jpeg, etc.)
- Supports various aspect ratios and sizes`,
                    inputSchema: {
                        type: 'object',
                        properties: {
                            prompt: {
                                type: 'string',
                                description: 'Detailed image generation prompt. Be specific about composition, style, lighting, colors, mood, subject details, and desired artistic style for best results.',
                            },
                            outputFile: {
                                type: 'string',
                                description: 'Output filename (will be saved to /tmp/gemini_mcp). Extension (.png, .jpg) will be added automatically based on the generated image format. Use descriptive names like "mountain-landscape" or "product-shot"',
                            },
                        },
                        required: ['prompt', 'outputFile'],
                    },
                },
                {
                    name: 'analyze_media',
                    description: `Analyze images, videos, or audio files using Gemini's multimodal AI capabilities. Essential for coding agents building media-aware applications.

CODING AGENT BENEFITS:
- Generate structured metadata for content management systems and databases
- Extract actionable insights for automated testing of UI/UX components
- Create comprehensive image descriptions for accessibility compliance (WCAG)
- Generate OCR data for document processing workflows and form automation
- Analyze user-uploaded content for moderation and categorization systems
- Extract technical specifications for media processing pipelines
- Generate training data descriptions for machine learning model development
- Create detailed API responses for media analysis services

BEST PRACTICES FOR AI AGENTS - IMAGE ANALYSIS:
- Object Detection: "List all objects visible in this image with their approximate positions (top-left, center, etc.)"
- Scene Understanding: "Describe the setting, lighting conditions, time of day, and overall atmosphere of this image"
- Composition Analysis: "Analyze the composition using rule of thirds, leading lines, symmetry, and focal points"
- Color Analysis: "Describe the color palette, dominant colors, color harmony, and mood created by colors"
- Quality Assessment: "Evaluate image quality: sharpness, exposure, white balance, noise, and areas for improvement"
- Text Extraction (OCR): "Extract all visible text from this image, maintaining layout and formatting"
- Face & Emotion Detection: "Describe visible people, their expressions, emotions, body language, and interactions"
- Brand/Logo Recognition: "Identify any brands, logos, or trademarks visible in this image"
- Accessibility Description: "Create a detailed alt-text description for visually impaired users"

BEST PRACTICES FOR AI AGENTS - VIDEO ANALYSIS:
- Content Summary: "Summarize the video content, key scenes, and narrative progression"
- Scene Detection: "Break down the video into distinct scenes with timestamps and descriptions"
- Action Recognition: "Describe all actions, movements, and activities occurring in the video"
- Audio Description: "Describe what you hear: dialogue, music, sound effects, ambient sounds"
- Production Analysis: "Analyze cinematography: camera movements, shot types, transitions, lighting, editing pace"
- Accessibility Captions: "Generate detailed captions including speaker identification and audio cues"
- Quality Check: "Identify technical issues: blur, shaky footage, poor lighting, audio problems"

SUPPORTED FORMATS:
- Images: JPEG, PNG, GIF, WebP (photos, screenshots, diagrams, artwork)
- Videos: MP4, MPEG, MOV, AVI, WebM (up to ~10MB recommended)
- Audio: MP3, WAV, AAC (speech, music, ambient sounds)

PROMPT ENGINEERING TIPS:
- Ask specific questions rather than "what's in this image?"
- Request structured output: "List in bullet points" or "Create a table"
- Specify detail level: "Brief overview" vs "Detailed frame-by-frame analysis"
- Combine multiple aspects: "Analyze composition AND suggest improvements"
- Request actionable insights: "What changes would improve this image?"`,
                    inputSchema: {
                        type: 'object',
                        properties: {
                            filePath: {
                                type: 'string',
                                description: 'Absolute path to the media file to analyze. Supports images (JPEG/PNG/GIF/WebP), videos (MP4/MOV/AVI/WebM), and audio (MP3/WAV/AAC). Use full filesystem paths.',
                            },
                            prompt: {
                                type: 'string',
                                description: 'Specific, detailed question or analysis request. Be explicit about what aspects to analyze (composition, objects, text, emotions, quality, etc.). Use structured output formats when needed (bullet points, tables, JSON). Examples: "Extract all text" or "Analyze color palette and mood" or "List improvement suggestions"',
                            },
                        },
                        required: ['filePath', 'prompt'],
                    },
                },
                {
                    name: 'manipulate_media',
                    description: `Provide intelligent instructions for transforming, editing, or enhancing images and videos using AI analysis. Perfect for coding agents building media processing workflows.

NOTE: This tool generates INSTRUCTIONS for manipulation, not the actual edited media. Output is actionable guidance for image/video editing tools or human editors.

CODING AGENT BENEFITS:
- Generate programmatic workflows for automated media processing pipelines
- Create detailed specifications for image manipulation APIs and services
- Generate step-by-step instructions for batch processing operations
- Produce structured editing guidelines for content management systems
- Create quality assurance checklists for media processing validation
- Generate configuration files and parameter sets for image/video processing tools
- Develop automated testing scenarios for media manipulation software
- Create comprehensive documentation for media processing workflows

BEST PRACTICES FOR AI AGENTS - IMAGE MANIPULATION:
- Enhancement Instructions: "Analyze this image and provide specific steps to improve exposure, contrast, and color balance"
- Crop/Composition Suggestions: "Suggest optimal crop ratios and framing to improve composition following rule of thirds"
- Style Transfer Guidance: "Describe how to transform this image into [watercolor/sketch/cinematic] style with specific color adjustments"
- Object Removal: "Identify background distractions and describe how to remove them while maintaining natural appearance"
- Color Grading: "Create a color grading plan to achieve [moody/bright/vintage] aesthetic with specific HSL adjustments"
- Restoration Instructions: "Analyze damage/artifacts and provide step-by-step restoration guidance"
- Resolution Enhancement: "Suggest upscaling strategy and detail enhancement techniques for this image"
- Background Replacement: "Describe ideal background for this subject and how to blend it naturally"

BEST PRACTICES FOR AI AGENTS - VIDEO MANIPULATION:
- Editing Blueprint: "Create a shot-by-shot editing plan with suggested cuts, transitions, and pacing"
- Color Correction: "Analyze color inconsistencies across shots and provide correction instructions for each scene"
- Audio Sync Instructions: "Identify audio-video sync issues and provide frame-accurate correction guidance"
- Special Effects Guidance: "Describe specific effects needed with timing, intensity, and blending instructions"
- Title/Text Overlay: "Suggest optimal placement, timing, and styling for titles and lower-thirds"
- Transition Planning: "Recommend specific transitions between scenes with duration and style guidance"
- Pace & Rhythm: "Analyze pacing and suggest edit points to improve rhythm and audience engagement"
- B-Roll Integration: "Identify where to insert B-roll footage and describe desired content"

ADVANCED MANIPULATION STRATEGIES:
- Multi-step Workflows: "Break down complex edits into sequential, actionable steps"
- Conditional Logic: "If [condition], then [action], else [alternative]"
- Quality Preservation: "Ensure suggestions maintain or improve technical quality (resolution, bitrate, etc.)"
- Tool-Specific Guidance: "Provide instructions compatible with [Photoshop/Premiere/GIMP/FFmpeg]"
- Batch Processing: "Create consistent manipulation rules applicable to multiple similar files"
- Reversibility: "Suggest non-destructive editing workflows when possible"

OUTPUT FORMAT TIPS:
- Request structured instructions: "Provide as numbered steps"
- Specify detail level: "High-level overview" vs "Frame-by-frame instructions"
- Include technical parameters: "Specify exact values for blur radius, opacity percentages, etc."
- Request verification steps: "Include quality check instructions after each major change"
- Get fallback options: "Suggest alternative approaches if primary method fails"

EXAMPLE PROMPTS:
- "Create detailed retouching instructions to make this portrait more professional while keeping it natural"
- "Generate a shot list and editing blueprint to transform this raw footage into a 60-second promotional video"
- "Analyze lighting issues and provide step-by-step color correction and exposure adjustment instructions"
- "Describe how to remove the background, add motion blur, and composite this subject onto a new scene"`,
                    inputSchema: {
                        type: 'object',
                        properties: {
                            inputFile: {
                                type: 'string',
                                description: 'Absolute path to the input media file (image or video). This file will be analyzed to generate manipulation instructions. Supports JPEG, PNG, GIF, WebP, MP4, MOV, AVI, WebM formats.',
                            },
                            prompt: {
                                type: 'string',
                                description: 'Detailed instructions for desired transformation. Be specific about the end goal, style, technical requirements, and quality expectations. Include target use case (web, print, social media, broadcast) if relevant. Example: "Create step-by-step instructions to transform this photo into a professional headshot with neutral background, improved lighting, and subtle retouching"',
                            },
                            outputFile: {
                                type: 'string',
                                description: 'Output filename for the manipulation instructions (saved to /tmp/gemini_mcp). Use descriptive names like "editing_instructions.txt", "color_grading_plan.md", or "retouching_steps.json"',
                            },
                        },
                        required: ['inputFile', 'prompt', 'outputFile'],
                    },
                },
            ],
        }));

        this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
            this.initializeClient();

            const { name, arguments: args } = request.params;

            try {
                switch (name) {
                    case 'generate_media':
                        return await generateMediaTool(this.geminiClient!, args);
                    case 'analyze_media':
                        return await analyzeMediaTool(this.geminiClient!, args);
                    case 'manipulate_media':
                        return await manipulateMediaTool(this.geminiClient!, args);
                    default:
                        throw new Error(`Unknown tool: ${name}`);
                }
            } catch (error: any) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Error: ${error.message}`,
                        },
                    ],
                };
            }
        });
    }

    async run(): Promise<void> {
        const transport = new StdioServerTransport();
        await this.server.connect(transport);
        console.error('Gemini MCP server running on stdio');
    }
}
