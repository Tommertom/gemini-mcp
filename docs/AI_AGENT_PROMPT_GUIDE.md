# AI Agent Prompt Engineering Guide for Gemini MCP Server

## Overview

This guide provides best practices for AI agents using the Gemini MCP Server to generate, analyze, and manipulate visual media. Following these guidelines will result in more accurate, actionable, and professional outputs.

---

## 🎨 Content Generation (generate_media)

### Image Generation Prompts

#### Structure Your Prompt
```
[Subject] + [Style] + [Composition] + [Lighting] + [Colors] + [Mood] + [Technical Specs]
```

#### Best Practices

**1. Subject Description (What)**
- Be highly specific about the main subject
- Include physical details, positioning, and actions
- Mention quantity and relationships between subjects

✅ Good: "Three diverse business professionals (Asian woman, Black man, Hispanic woman) sitting around modern conference table, engaged in collaborative discussion, gesturing toward laptop screen"

❌ Bad: "Business people in a meeting"

**2. Style and Artistic Direction**
- Reference specific art styles, movements, or artists
- Specify realism level (photorealistic, stylized, abstract)
- Mention desired aesthetic (modern, vintage, minimalist, etc.)

✅ Good: "Photorealistic style inspired by Annie Leibovitz portraits, editorial fashion photography aesthetic"

❌ Bad: "Nice looking photo"

**3. Composition Guidelines**
- Specify camera angle (eye-level, low-angle, bird's eye, etc.)
- Mention framing (close-up, medium shot, wide shot)
- Reference composition rules (rule of thirds, golden ratio, centered)
- Include foreground/background elements

✅ Good: "Medium shot from slightly above eye level, subject positioned on right third, blurred office background following rule of thirds, shallow depth of field (f/2.8)"

❌ Bad: "Good angle"

**4. Lighting Specifications**
- Describe light source (natural, studio, golden hour, etc.)
- Specify direction (front, side, back, rim lighting)
- Mention quality (soft, hard, diffused)
- Include shadows and highlights

✅ Good: "Natural window light from camera left creating soft shadows, golden hour warmth (5500K), subtle rim light separating subject from background"

❌ Bad: "Good lighting"

**5. Color Direction**
- Specify color palette (warm, cool, monochrome, vibrant)
- Mention dominant colors and accents
- Reference color harmonies (complementary, analogous, triadic)
- Describe color grading style

✅ Good: "Warm color palette dominated by earth tones (browns, oranges, beiges), teal accent in background for complementary contrast, slightly desaturated for corporate aesthetic"

❌ Bad: "Nice colors"

**6. Mood and Atmosphere**
- Define emotional tone (professional, casual, energetic, calm)
- Specify atmosphere (inviting, serious, playful, dramatic)
- Mention target audience feeling

✅ Good: "Professional yet approachable atmosphere, conveying trust and competence while remaining human and relatable, suitable for B2B technology brand"

❌ Bad: "Professional looking"

**7. Technical Specifications**
- Resolution and dimensions (4K, 1920x1080, etc.)
- Aspect ratio (16:9, 4:3, 1:1, 9:16)
- Quality indicators (high detail, sharp focus, 8K quality)
- File format considerations if relevant

✅ Good: "4K resolution (3840x2160), 16:9 aspect ratio, razor-sharp focus on subject's eyes, suitable for large format printing"

❌ Bad: "High quality"


---

## 🔍 Media Analysis (analyze_media)

### Image Analysis Prompts

#### Structured Analysis Request Format
```
[Analysis Type] + [Specific Elements] + [Output Format] + [Detail Level]
```

#### Analysis Categories

**1. Object Detection and Positioning**
```javascript
prompt: `Identify and catalog all objects in this image:
1. List each object with descriptive category
2. Specify position using grid system (top-left, center, bottom-right, etc.)
3. Estimate size relative to frame (percentage of image)
4. Note occlusion or partial visibility
5. Identify relationships between objects
Output as structured JSON`
```

**2. Composition Analysis**
```javascript
prompt: `Analyze photographic composition:
- Rule of Thirds: Identify alignment of key elements with grid intersections
- Leading Lines: Describe any lines drawing eye through frame
- Balance: Assess visual weight distribution (symmetrical/asymmetrical)
- Framing: Note natural frames within image (windows, doorways, etc.)
- Negative Space: Evaluate use of empty areas
- Focal Point: Identify primary and secondary areas of interest
- Depth: Describe foreground, middle ground, background layers
Provide ratings (1-10) for each element with improvement suggestions`
```

**3. Color Analysis**
```javascript
prompt: `Perform detailed color analysis:
1. Dominant Colors: List 5 most prominent colors with hex codes
2. Color Harmony: Identify color scheme (monochromatic, complementary, analogous, triadic)
3. Temperature: Overall warm/cool balance and emotional impact
4. Saturation: Assess vibrancy levels across image
5. Contrast: Evaluate tonal range and dynamic range
6. Color Grading: Describe any apparent color grading or filters
7. Mood Impact: How colors contribute to emotional tone
Suggest color adjustments for specific use cases (print, web, social media)`
```

**4. Quality Assessment**
```javascript
prompt: `Technical quality evaluation:
SHARPNESS:
- Overall sharpness rating (1-10)
- Focus areas (what's in focus, what's blurred)
- Motion blur presence
- Lens aberrations (chromatic, distortion)

EXPOSURE:
- Histogram analysis (shadows, midtones, highlights)
- Clipping (blown highlights, crushed blacks)
- Dynamic range utilization
- HDR opportunities

NOISE:
- ISO noise visibility
- Noise pattern (luminance/color)
- Areas most affected
- Acceptable for intended use?

WHITE BALANCE:
- Current color temperature (estimate Kelvin)
- Accuracy for scene type
- Color casts present

OVERALL:
- Intended use suitability (web, print, billboard)
- Post-processing needs
- Ranked improvement priorities`
```

**5. Text Extraction (OCR)**
```javascript
prompt: `Extract all visible text with maximum accuracy:
1. Transcribe all text maintaining original layout
2. Identify text hierarchy (headings, subheadings, body, captions)
3. Note font styles (bold, italic, underlined)
4. Preserve formatting (line breaks, indentation, alignment)
5. Identify special elements (logos, signatures, stamps, handwriting)
6. Flag any unclear or partially visible text with [UNCLEAR] markers
7. Provide confidence level for extraction accuracy
8. Identify document type and purpose
Output as markdown preserving structure`
```

**6. Accessibility Description**
```javascript
prompt: `Create comprehensive alt-text for visually impaired users:
1. Brief overview (1 sentence): Scene context and primary subject
2. Detailed description:
   - Who: People present (number, appearance, actions, expressions)
   - What: Objects and their significance
   - Where: Setting and environment details
   - When: Time indicators (time of day, season, era)
   - Why: Purpose or context clues
3. Text content: All visible text transcribed
4. Important details: Colors, branding, emotions conveyed
5. Avoid: Subjective interpretations, keep factual
Length: 125-150 words, prioritize most important information first`
```

### Video Analysis Prompts

#### Scene Breakdown Structure
```javascript
prompt: `Comprehensive video analysis with timestamps:

For each distinct scene, provide:

SCENE [NUMBER]: [Start Time] - [End Time]
Duration: [seconds]

VISUAL:
- Shot Type: [ECU/CU/MS/WS]
- Camera Movement: [static/pan/tilt/dolly/etc.]
- Composition: [rule of thirds/centered/etc.]
- Lighting: [quality/direction/temperature]
- Subject Actions: [detailed description]
- Background Elements: [important details]

AUDIO:
- Dialogue: [transcription with speaker ID]
- Music: [genre/mood/tempo]
- Sound Effects: [specific sounds]
- Ambient: [environmental audio]

PRODUCTION:
- Editing Pace: [slow/medium/fast]
- Transition In: [type of transition]
- Color Grading: [look/feel]
- Visual Effects: [any VFX present]

NOTES:
- Technical Issues: [problems identified]
- Suggestions: [improvements]
- Timestamps: [HH:MM:SS format]

Provide this analysis for entire video duration.`
```

---

## ✨ Manipulation Instructions (manipulate_media)

### Image Editing Instruction Prompts

#### Portrait Retouching Workflow
```javascript
prompt: `Create professional portrait retouching workflow for business headshot:

PHASE 1: SKIN RETOUCHING
1. Frequency Separation
   - Low frequency layer: Gaussian blur 8-12px
   - High frequency layer: Apply High Pass filter
   - Blend mode: Linear Light
   - Retouch on low frequency: Clone Stamp Tool, Opacity 40%
   - Preserve skin texture on high frequency layer
   
2. Blemish Removal
   - Tool: Healing Brush with Content-Aware
   - Sample nearby skin areas
   - Work in small sections
   - Zoom to 200% for precision

3. Even Skin Tone
   - Create luminosity mask for highlights
   - Gentle Curves adjustment: Slight S-curve
   - Reduce redness: Hue/Saturation layer, target reds, -10 saturation
   - Opacity: 60% for natural look

PHASE 2: FACIAL FEATURES
4. Eye Enhancement
   - Iris sharpening: Unsharp Mask (Amount: 80%, Radius: 0.5px)
   - Brighten whites: Curves adjustment on targeted selection
   - Enhance catchlights: Dodge Tool, Highlights, Exposure 20%
   - Reduce under-eye shadows: Targeted dodging, Opacity 30%

5. Teeth Whitening
   - Selection: Quick Mask with soft brush
   - Hue/Saturation: Yellows, -30 saturation, +10 lightness
   - Maintain natural color, avoid pure white
   - Opacity: 50-70%

PHASE 3: OVERALL ENHANCEMENT
6. Hair Refinement
   - Remove flyaways: Clone Stamp or Spot Healing
   - Add definition: Dodge/Burn on edges
   - Enhance shine: Targeted highlights

7. Background Treatment
   - Gaussian Blur: 15-25px depending on separation needed
   - Vignette: Subtle darkening, Feather 50%
   - Clean distractions: Clone Stamp

8. Color Grading
   - Overall tone: Slight warm shift (+5 to yellows)
   - Increase vibrance: +10 (not saturation)
   - Final contrast: Gentle S-curve

PHASE 4: EXPORT
9. Sharpening
   - Smart Sharpen: Amount 120%, Radius 0.8px, Reduce Noise 10%
   - Apply to 8-bit copy

10. Export Settings
   - Format: JPEG
   - Quality: 85-90%
   - Color Space: sRGB
   - Resolution: 72 DPI for web, 300 DPI for print
   - Dimensions: 2000px longest edge for web

QUALITY CHECKS:
- View at 100% zoom for artifacts
- Check histogram for clipping
- Preview on different backgrounds
- Test at intended display size

Estimated Time: 20-30 minutes
Skill Level Required: Intermediate
Software: Adobe Photoshop (CC 2020 or later)`
```

#### Video Color Grading Blueprint
```javascript
prompt: `Design cinematic color grading workflow for this footage:

STEP 1: TECHNICAL CORRECTION (Primary Grading)
Scene-by-scene analysis and correction:

Scene 1 [00:00-00:15]:
- Issue: Overexposed highlights, cool color cast
- Correction:
  * Lift: -5 (darken shadows slightly)
  * Gamma: 0.95 (reduce midtones)
  * Gain: 0.85 (recover highlights)
  * Temperature: +300K (warm correction)
  * Tint: +2 (slight magenta to counter green cast)

Scene 2 [00:15-00:30]:
- Issue: Underexposed, flat contrast
- Correction:
  * Lift: +8 (lift shadows)
  * Gamma: 1.1 (brighten midtones)
  * Gain: 1.05 (slight highlight boost)
  * Contrast: +15 (add punch)
  * Saturation: +10 (restore color)

[Continue for all scenes...]

STEP 2: SECONDARY COLOR CORRECTION
Targeted adjustments:

A. Skin Tones:
   - Isolate using HSL qualifier (Hue: 0-40°, Sat: 15-50%)
   - Soften qualifier edges (Blur: 15px)
   - Adjustments:
     * Reduce redness: -5 saturation
     * Add warmth: +2 to orange channel
     * Maintain consistency across shots

B. Sky/Background:
   - Isolate blue channel (Hue: 200-240°)
   - Adjustments:
     * Increase saturation: +15
     * Deepen blue: -5 luminance
     * Add cyan shift for clean look

C. Foliage (if applicable):
   - Isolate greens (Hue: 80-140°)
   - Natural enhancement:
     * Saturation: +8
     * Shift toward teal: -5° hue
     * Add depth: -3 luminance

STEP 3: CREATIVE GRADING (Look Development)
Apply consistent cinematic look:

A. Film Emulation:
   - Add subtle film grain:
     * Size: 2.5
     * Amount: 8-12%
     * Highlights/Shadows balance: 60/40
   
B. Vignette:
   - Subtle edge darkening
   - Feather: 60%
   - Amount: -0.3 (subtle)
   - Midpoint: 0.6

C. Color Palette:
   - Shadows: Slight blue tint (Lift toward blue, Amount: 5%)
   - Highlights: Warm orange tint (Gain toward orange, Amount: 3%)
   - Creates orange/teal cinematic look

D. Contrast Curve:
   - Gentle S-curve for depth
   - Protect shadows from crushing
   - Soft highlight roll-off

STEP 4: MATCHING & CONSISTENCY
Shot-by-shot matching:

- Create reference still from "hero" shot
- Match each shot:
  * Check skin tones (use vectorscope)
  * Verify highlight levels (waveform)
  * Ensure consistent saturation (parade)
- Use comparison wipe to verify matches
- Save grade as preset for similar shots

STEP 5: FINAL POLISH

A. Sharpening:
   - Luma sharpen: Amount 15%, Radius 1.0
   - Apply to final graded image
   - Avoid over-sharpening faces

B. Noise Reduction:
   - Temporal NR: Medium (preserves detail)
   - Spatial NR: Low (only if necessary)
   - Check at 100% zoom

C. Output Settings:
   - Codec: H.264 (web) / ProRes 422 HQ (archive)
   - Resolution: 4K (3840x2160) maintain source
   - Frame Rate: Match source (23.976, 24, 30, 60)
   - Bitrate: 40 Mbps (4K), 20 Mbps (1080p)
   - Color Space: Rec.709 for web delivery

QUALITY CONTROL CHECKLIST:
□ Consistent skin tones across all shots
□ No clipped highlights or crushed blacks
□ Smooth gradients (no banding)
□ Match scene-to-scene exposure
□ Color consistency in continuous scenes
□ Appropriate contrast for delivery platform
□ Test on reference monitor (calibrated)
□ View in intended playback environment

Software: DaVinci Resolve 18+ (recommended)
Alternative: Adobe Premiere Pro, Final Cut Pro X
Estimated Time: 2-4 hours for 5-minute video
Skill Level: Intermediate to Advanced

NOTES:
- Always work in log color space if footage was shot in log
- Create version backups before major changes
- Use scopes (waveform, vectorscope, histogram) constantly
- Reference professional work in similar style
- Less is often more - avoid over-grading`
```

---

## 🎯 Output Format Optimization

### Requesting Structured Outputs

**JSON Format**
```javascript
prompt: `Analyze this image and provide results as valid JSON:
{
  "objects": [
    {"name": "string", "position": "string", "confidence": "percentage"}
  ],
  "composition": {
    "ruleOfThirds": "boolean",
    "leadingLines": "boolean",
    "balance": "symmetrical|asymmetrical"
  },
  "colors": {
    "dominant": ["hex", "hex", "hex"],
    "palette": "warm|cool|neutral"
  },
  "quality": {
    "sharpness": 1-10,
    "exposure": "underexposed|correct|overexposed",
    "overall": 1-10
  }
}`
```

**Markdown Tables**
```javascript
prompt: `Provide shot breakdown as markdown table:

| Timecode | Duration | Shot Type | Camera Move | Subject | Action | Notes |
|----------|----------|-----------|-------------|---------|--------|-------|
| 00:00:00 | 5s       | WS        | Static      | Office  | Estab. | ...   |`
```

**Numbered Steps**
```javascript
prompt: `Provide editing instructions as numbered sequential steps:

1. PREPARATION
   1.1. Open image in editing software
   1.2. Create backup layer
   1.3. Convert to 16-bit depth
   
2. BASIC ADJUSTMENTS
   2.1. Correct exposure using Levels
   2.2. Adjust white balance
   ...`
```

---

## 📊 Common Pitfalls to Avoid

### ❌ Vague Prompts
**Bad**: "Make this image better"
**Good**: "Analyze image quality focusing on sharpness, exposure, and white balance. Provide specific adjustment values to correct any issues."

### ❌ Ambiguous Requests
**Bad**: "What's wrong with this video?"
**Good**: "Identify technical issues in this video including exposure inconsistencies, audio sync problems, color grading variations between scenes, and shaky footage. Provide timestamps for each issue."

### ❌ Missing Context
**Bad**: "Create editing instructions"
**Good**: "Create portrait retouching instructions for LinkedIn profile photo. Target audience: corporate executives. Style: professional but approachable. Output: suitable for 400x400px display."

### ❌ Unrealistic Expectations
**Bad**: "Transform this low-quality phone photo into magazine cover quality"
**Good**: "Analyze this photo and suggest realistic improvements within quality constraints. Identify which issues can be corrected (color, contrast) vs. which cannot (resolution, fundamental sharpness)."

---

## 🚀 Advanced Techniques

### Conditional Instructions
```javascript
prompt: `Analyze this product photo and provide editing instructions:

IF background is cluttered THEN provide background removal/replacement steps
ELSE IF background is acceptable THEN suggest subtle background blur

IF lighting is harsh THEN provide shadow/highlight recovery steps  
ELSE IF lighting is flat THEN suggest contrast enhancement

IF colors appear washed THEN provide saturation recovery steps
ELSE IF colors are oversaturated THEN suggest desaturation method

Always conclude with export settings appropriate for e-commerce platform (white background, 2000x2000px, sRGB)`
```

### Multi-Stage Workflows
```javascript
prompt: `Create multi-stage video editing blueprint:

STAGE 1: ASSEMBLY (30 min)
- Import all footage clips
- Create sequence timeline
- Rough cut assembly in narrative order
- Mark best takes

STAGE 2: FINE CUT (60 min)
- Precise trimming to target duration
- Remove errors, pauses, unwanted content
- Add transitions
- Lock picture

STAGE 3: COLOR (45 min)
- Scene-by-scene color correction
- Creative grading
- Match shots
- Final polish

STAGE 4: AUDIO (45 min)
- Dialogue cleanup
- Music integration
- Sound effects
- Mix and master

STAGE 5: EXPORT (15 min)
- Final review
- Export settings
- Quality check
- Deliver

Provide specific instructions for each stage.`
```

---

## 📚 Quick Reference

### Image Generation Template
```
[Number/Identity of subjects] [doing what action] in [setting/environment],
[shot type/camera angle], [lighting description], [color palette],
[style reference], [mood/atmosphere], [technical specs]
```

### Image Analysis Template
```
Analyze [image type] focusing on:
1. [Aspect 1] - provide [specific detail level]
2. [Aspect 2] - provide [specific detail level]
3. [Aspect 3] - provide [specific detail level]
Output as [format type]
```

### Video Analysis Template
```
Break down [video type] into scenes with:
- Timecodes (HH:MM:SS)
- Visual description (shot types, camera work, subject actions)
- Audio description (dialogue, music, effects)
- Production notes (lighting, color, editing)
- Issues/improvements
```

### Editing Instructions Template
```
Create [workflow type] for [media type] targeting [end use]:

PHASE 1: [Category]
Step 1. [Action] - [specific parameters]
Step 2. [Action] - [specific parameters]

PHASE 2: [Category]
[... continue ...]

QUALITY CHECKS: [verification steps]
EXPORT: [specific settings]
TIME: [estimate]
TOOLS: [required software]
```

---

## 🎓 Learning Resources

For AI agents to improve prompting over time:
- Study professional photography and cinematography terminology
- Understand color theory and grading workflows
- Learn video editing vocabulary and techniques
- Familiarize with common editing software capabilities
- Practice iterative prompting: start broad, refine based on results
- Save successful prompts as templates for similar tasks

---

**Remember**: Specificity, structure, and context are key to effective prompts. The more detailed and well-organized your prompt, the more useful and actionable the output will be.
