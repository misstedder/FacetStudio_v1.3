
export enum ViewState {
  DASHBOARD = 'DASHBOARD',
  CAMERA = 'CAMERA',
  GUIDE = 'GUIDE',
  CHAT = 'CHAT',
  GALLERY = 'GALLERY'
}

export enum FaceShape {
  OVAL = 'Oval',
  ROUND = 'Round',
  SQUARE = 'Square',
  HEART = 'Heart',
  DIAMOND = 'Diamond',
  OBLONG = 'Oblong',
  UNKNOWN = 'Unknown'
}

export enum Undertone {
  COOL = 'Cool',
  WARM = 'Warm',
  NEUTRAL = 'Neutral',
  OLIVE = 'Olive',
  UNKNOWN = 'Unknown'
}

export enum SkinType {
  DRY = 'Dry',
  OILY = 'Oily',
  COMBINATION = 'Combination',
  BALANCED = 'Balanced',
  UNKNOWN = 'Unknown'
}

export enum EyeColor {
  BROWN = 'Brown',
  BLUE = 'Blue',
  GREEN = 'Green',
  HAZEL = 'Hazel',
  GRAY = 'Gray',
  AMBER = 'Amber',
  UNKNOWN = 'Unknown'
}

export interface ProductRecommendation {
  category: string; // e.g., "Cream Blush", "Setting Powder"
  reasoning: string; // The "Why"
  finish: string; // e.g., "Dewy", "Matte", "Satin"
  applicationTip: string;
  visualFocus: string; // Description for the educational visual (e.g. "Dabbing cream blush on cheekbones")
  texture?: string; // e.g., "Creamy", "Liquid", "Powder"
  coverage?: string; // e.g., "Sheer", "Medium", "Full"
}

export interface ColorPalette {
  lips: string[]; // Hex codes
  eyes: string[]; // Hex codes
  cheeks: string[]; // Hex codes
  explanation: string;
}

export interface AnalysisResult {
  faceShape: FaceShape;
  undertone: Undertone;
  skinType: SkinType;
  eyeColor: EyeColor;
  structuralAnalysis: string; // Narrative about proportions
  skinAnalysis: string; // Narrative about texture/hydration (positive tone)
  recommendations: ProductRecommendation[];
  blushPlacement: string;
  contourPlacement: string;
  colorPalette: ColorPalette;
  meshData?: Record<string, any>; // 468-point facial landmark coordinates from Gemini
  symmetryScore?: number; // Facial symmetry score (0-100)
}

export interface AnalysisRecord {
  id: string;
  timestamp: number;
  imageSrc: string; // Base64
  result: AnalysisResult;
  visualGuideSrc?: string; // Generated face chart Base64
  geometryId?: string; // PocketBase facial_geometry record ID
  aestheticId?: string; // PocketBase aesthetic_vectors record ID
}

// ============================================
// PocketBase Collection Type Interfaces
// ============================================

/**
 * facial_geometry collection
 * Stores biometric facial data including mesh coordinates and symmetry analysis
 */
export interface FacialGeometry {
  id?: string;
  user: string; // Relation to users collection
  mesh_data: Record<string, any>; // 468+ landmark coordinates (JSON)
  proportions?: Record<string, any>; // Calculated facial ratios
  symmetry_score?: number; // Symmetry score (0-100)
  is_active?: boolean; // Whether this is the active geometry record
  created?: string;
  updated?: string;
}

/**
 * aesthetic_vectors collection
 * Stores color theory and skin analysis data
 */
export interface AestheticVectors {
  id?: string;
  geometry_ref: string; // Relation to facial_geometry
  skin_tone_hex?: string;
  undertone?: 'cool' | 'warm' | 'neutral' | 'olive';
  canvas_type?: 'dry' | 'oily' | 'combination' | 'sensitive' | 'mature';
  created?: string;
  updated?: string;
}

/**
 * ai_requests collection
 * Logs AI API requests for audit and cost tracking
 */
export interface AIRequest {
  id?: string;
  Prompt: string;
  Model: string;
  User: string; // Relation to users collection
  created?: string;
}

/**
 * ai_responses collection
 * Logs AI API responses with token usage
 */
export interface AIResponse {
  id?: string;
  Response: string;
  Tokens?: number;
  Request: string; // Relation to ai_requests
  User: string; // Relation to users collection
  created?: string;
}
