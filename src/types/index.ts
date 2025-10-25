export interface GeminiConfig {
    apiKey: string;
    model?: string;
    outputDir?: string;
}

export interface MediaGenerationParams {
    prompt: string;
    outputFile: string;
}

export interface MediaAnalysisParams {
    filePath: string;
    prompt: string;
}

export interface MediaManipulationParams {
    inputFile: string;
    prompt: string;
    outputFile: string;
}

export interface GeminiResponse {
    success: boolean;
    message: string;
    outputPath?: string;
    data?: any;
}
