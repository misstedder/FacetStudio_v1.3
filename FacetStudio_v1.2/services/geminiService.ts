
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, FaceShape, Undertone, SkinType, EyeColor } from "../types";
import { deriveColorHarmony } from "../utils/colorHarmony";
import { logRequest, logResponse } from "./aiAuditLogger";
import { getCurrentUser } from "./auth";

const analysisSchema = {
  type: Type.OBJECT,
  properties: {
    faceShape: { type: Type.STRING, enum: Object.values(FaceShape) },
    undertone: { type: Type.STRING, enum: Object.values(Undertone) },
    skinType: { type: Type.STRING, enum: Object.values(SkinType) },
    eyeColor: { type: Type.STRING, enum: Object.values(EyeColor) },
    structuralAnalysis: { type: Type.STRING, description: "Empathetic, non-judgmental description of face proportions and balance." },
    skinAnalysis: { type: Type.STRING, description: "Neutral, educational observation of skin characteristics like hydration or texture." },
    blushPlacement: { type: Type.STRING, description: "Professional Seint HAC (Highlight and Contour) placement for Lip + Cheek based on face shape." },
    contourPlacement: { type: Type.STRING, description: "Professional Seint HAC (Highlight and Contour) placement for Contour and Main/Brightening Highlights based on face shape." },
    meshData: { type: Type.OBJECT, description: "468-point facial landmark mesh coordinates for biometric analysis" },
    symmetryScore: { type: Type.NUMBER, description: "Facial symmetry score from 0-100, where 100 is perfectly symmetrical" },
    colorPalette: {
      type: Type.OBJECT,
      properties: {
        lips: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of 3 hex color codes suitable for lips." },
        eyes: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of 3 hex color codes suitable for eyeshadow." },
        cheeks: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of 3 hex color codes suitable for cheeks." },
        explanation: { type: Type.STRING, description: "Brief explanation of why these colors work for the user's undertone." }
      },
      required: ["lips", "eyes", "cheeks", "explanation"]
    },
    recommendations: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          category: { type: Type.STRING },
          reasoning: { type: Type.STRING },
          finish: { type: Type.STRING },
          applicationTip: { type: Type.STRING },
          visualFocus: { type: Type.STRING, description: "Short keyword phrase describing the motion of application (e.g., 'Stippling brush cheek', 'Blending sponge under eye')" },
          texture: { type: Type.STRING, description: "Ideal texture e.g. 'Creamy', 'Liquid', 'Fine Powder', 'Gel'" },
          coverage: { type: Type.STRING, description: "Recommended coverage level e.g. 'Sheer', 'Medium', 'Buildable'" }
        },
        required: ["category", "reasoning", "finish", "applicationTip", "visualFocus", "texture", "coverage"]
      }
    }
  },
  required: ["faceShape", "undertone", "skinType", "eyeColor", "structuralAnalysis", "skinAnalysis", "recommendations", "blushPlacement", "contourPlacement", "colorPalette", "meshData", "symmetryScore"]
};

export const analyzeFace = async (base64Image: string): Promise<AnalysisResult> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const model = "gemini-3-flash-preview";
    
    // AI Audit Logging
    const user = getCurrentUser();
    const userId = user?.id || "anonymous";
    
    const prompt = `
      Analyze the facial structure and skin characteristics of the person in this image to provide a personalized, ethical, and educational makeup guide.
      
      ROLE: You are FacetStudio, an empathetic, inclusive makeup coach with advanced biometric analysis capabilities.
      TONE: Celebratory, positive, and educational. Never strictly label features as flaws. 
      
      GOALS:
      1. Identify Face Shape.
      2. Identify Undertone, Skin Type, and Eye Color.
      3. CRITICAL: Analyze facial landmarks to extract 468-point mesh coordinate data for biometric precision. Return this as meshData object.
      4. Calculate facial symmetry score (0-100) where 100 is perfectly symmetrical. Return this as symmetryScore number.
      5. Research the web for professional Seint HAC (Highlight and Contour) patterns for everyday makeup specifically for the detected face shape.
      6. Incorporate Seint HAC terminology (Contour, Main Highlight, Brightening Highlight, Lip + Cheek) into the structural, contour, and blush placement advice for an everyday, natural look.
      7. Generate a Color Palette and Recommendations.
    `;

    const cleanBase64 = base64Image.replace(/^data:image\/(png|jpeg|jpg);base64,/, "");

    // Log AI request
    const requestId = await logRequest(prompt, model, userId);

    const response = await ai.models.generateContent({
      model: model,
      contents: {
        parts: [
          { inlineData: { mimeType: "image/jpeg", data: cleanBase64 } },
          { text: prompt }
        ]
      },
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
        temperature: 0.4,
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    const parsed = JSON.parse(text) as AnalysisResult;
    parsed.colorPalette = deriveColorHarmony(parsed.undertone, parsed.eyeColor, parsed.skinType);
    
    // Log AI response (approximate token count based on response length)
    const estimatedTokens = Math.ceil(text.length / 4);
    await logResponse(requestId, JSON.stringify(parsed).substring(0, 1000), estimatedTokens, userId);
    
    return parsed;
  } catch (error) {
    console.error("Analysis failed:", error);
    throw error;
  }
};

export interface WebResearchResult {
  lips: string[];
  eyes: string[];
  cheeks: string[];
  summary: string;
  sources: { uri: string; title: string }[];
}

export const researchMakeupTrends = async (undertone: string, eyeColor: string): Promise<WebResearchResult> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const model = "gemini-3-flash-preview";
    
    // AI Audit Logging
    const user = getCurrentUser();
    const userId = user?.id || "anonymous";
    
    const prompt = `
      Search the web for the latest 2024-2025 makeup color trends specifically for someone with ${undertone} undertones and ${eyeColor} eyes.
      Provide lip, eye, and cheek hex codes and a brief summary.
    `;

    // Log AI request
    const requestId = await logRequest(prompt, model, userId);

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources = groundingChunks
      .map((chunk: any) => chunk.web)
      .filter((web: any) => web && web.uri)
      .map((web: any) => ({ uri: web.uri, title: web.title || "Beauty Source" }));

    let result: any = { lips: [], eyes: [], cheeks: [], summary: "" };
    try {
      const text = response.text || "{}";
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      result = JSON.parse(jsonMatch ? jsonMatch[0] : text);
    } catch (e) {
      console.warn("Failed to parse grounding JSON", e);
    }

    // Log AI response
    const responseText = response.text || "";
    const estimatedTokens = Math.ceil(responseText.length / 4);
    await logResponse(requestId, responseText.substring(0, 1000), estimatedTokens, userId);

    return {
      lips: result.lips || [],
      eyes: result.eyes || [],
      cheeks: result.cheeks || [],
      summary: result.summary || response.text || "",
      sources: sources.slice(0, 4)
    };
  } catch (error) {
    console.error("Web research failed:", error);
    throw error;
  }
};

export const generateMakeupFaceChart = async (faceShape: string, contour: string, blush: string): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const model = 'gemini-2.5-flash-image';
    
    // AI Audit Logging
    const user = getCurrentUser();
    const userId = user?.id || "anonymous";
    
    const prompt = `
      Generate EXACTLY ONE front facing professional illustrated face chart image dynamically adjusted for a ${faceShape} face shape following professional Seint HAC (Highlight and Contour) 3D Foundation principles for an everyday look.
      
      Map placement:
      - Contour (dark): ${contour}
      - Highlight (light/bright): Use Brightening Highlight in T-zone and under eyes.
      - Lip + Cheek (rose): ${blush}
      
      The drawing must be strictly front-facing. Clean minimalist line drawing, realistic color-coded shading. No arrows. No text on face.
    `;

    // Log AI request
    const requestId = await logRequest(prompt, model, userId);

    const response = await ai.models.generateContent({
      model: model,
      contents: { parts: [{ text: prompt }] },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        const imageData = `data:image/png;base64,${part.inlineData.data}`;
        
        // Log AI response (image generation)
        await logResponse(requestId, "Image generated successfully", undefined, userId);
        
        return imageData;
      }
    }
    
    throw new Error("No image generated");
  } catch (error) {
    console.error("Face chart generation failed:", error);
    throw error;
  }
};

export const sendChatMessage = async (history: {role: string, parts: {text: string}[]}[], message: string): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const model = "gemini-3-flash-preview";
    
    // AI Audit Logging
    const user = getCurrentUser();
    const userId = user?.id || "anonymous";
    
    const systemInstruction = `You are FacetStudio, a world-class AI makeup coach specializing in Seint HAC (3D Foundation) techniques.`;
    
    // Log AI request (including system instruction and history context)
    const contextPrompt = `System: ${systemInstruction}\nUser: ${message}`;
    const requestId = await logRequest(contextPrompt, model, userId);
    
    const chat = ai.chats.create({
      model: model,
      config: {
        systemInstruction,
      },
      history: history
    });

    const result = await chat.sendMessage({ message });
    const responseText = result.text || "I'm having trouble connecting.";
    
    // Log AI response
    const estimatedTokens = Math.ceil(responseText.length / 4);
    await logResponse(requestId, responseText, estimatedTokens, userId);
    
    return responseText;
  } catch (error) {
    console.error("Chat failed:", error);
    return "Please try asking again.";
  }
};
