import { AnalysisRecord, AnalysisResult, FacialGeometry, AestheticVectors } from "../types";
import { pb } from './pocketbase';
import { getCurrentUser } from './auth';

/**
 * Storage Service - PocketBase Implementation
 * 
 * This service replaces the previous localStorage-based storage with
 * server-side PocketBase persistence. All analysis data is now stored
 * in facial_geometry and aesthetic_vectors collections.
 */

/**
 * Save analysis to PocketBase
 * Creates records in both facial_geometry and aesthetic_vectors collections
 */
export const saveAnalysis = async (
  imageSrc: string,
  result: AnalysisResult
): Promise<AnalysisRecord> => {
  const user = getCurrentUser();
  
  if (!user) {
    throw new Error('User must be authenticated to save analysis');
  }

  try {
    // Step 1: Create facial_geometry record
    const geometryData: Partial<FacialGeometry> = {
      user: user.id,
      mesh_data: result.meshData || {},
      proportions: {
        faceShape: result.faceShape,
        structuralAnalysis: result.structuralAnalysis,
      },
      symmetry_score: result.symmetryScore,
      is_active: true,
    };

    const geometryRecord = await pb.collection('facial_geometry').create<FacialGeometry>(geometryData);

    // Step 2: Create aesthetic_vectors record linked to geometry
    const aestheticData: Partial<AestheticVectors> = {
      geometry_ref: geometryRecord.id,
      undertone: mapUndertoneToBackend(result.undertone),
      canvas_type: mapSkinTypeToBackend(result.skinType),
      skin_tone_hex: result.colorPalette?.lips?.[0] || undefined,
    };

    const aestheticRecord = await pb.collection('aesthetic_vectors').create<AestheticVectors>(aestheticData);

    // Step 3: Construct AnalysisRecord for frontend
    const newRecord: AnalysisRecord = {
      id: geometryRecord.id!, 
      timestamp: new Date(geometryRecord.created!).getTime(),
      imageSrc,
      result,
      geometryId: geometryRecord.id,
      aestheticId: aestheticRecord.id,
    };

    return newRecord;
  } catch (error) {
    console.error('Failed to save analysis to PocketBase:', error);
    throw new Error('Failed to save analysis. Please try again.');
  }
};

/**
 * Update an existing analysis record
 */
export const updateRecord = async (record: AnalysisRecord): Promise<void> => {
  const user = getCurrentUser();
  
  if (!user) {
    throw new Error('User must be authenticated to update records');
  }

  try {
    if (record.geometryId) {
      const geometryData: Partial<FacialGeometry> = {
        mesh_data: record.result.meshData || {},
        proportions: {
          faceShape: record.result.faceShape,
          structuralAnalysis: record.result.structuralAnalysis,
        },
        symmetry_score: record.result.symmetryScore,
      };

      await pb.collection('facial_geometry').update(record.geometryId, geometryData);
    }

    if (record.aestheticId) {
      const aestheticData: Partial<AestheticVectors> = {
        undertone: mapUndertoneToBackend(record.result.undertone),
        canvas_type: mapSkinTypeToBackend(record.result.skinType),
        skin_tone_hex: record.result.colorPalette?.lips?.[0] || undefined,
      };

      await pb.collection('aesthetic_vectors').update(record.aestheticId, aestheticData);
    }
  } catch (error) {
    console.error('Failed to update record in PocketBase:', error);
    throw new Error('Failed to update record. Please try again.');
  }
};

/**
 * Get analysis history for current user
 */
export const getHistory = async (): Promise<AnalysisRecord[]> => {
  const user = getCurrentUser();
  
  if (!user) {
    return [];
  }

  try {
    const geometryRecords = await pb.collection('facial_geometry').getFullList<FacialGeometry>({
      filter: `user = "${user.id}"`,
      sort: '-created',
    });

    const aestheticRecords: Record<string, AestheticVectors> = {};
    
    if (geometryRecords.length > 0) {
      const geometryIds = geometryRecords.map(g => g.id).filter(Boolean) as string[];
      const aesthetics = await pb.collection('aesthetic_vectors').getFullList<AestheticVectors>({
        filter: geometryIds.map(id => `geometry_ref = "${id}"`).join(' || '),
      });

      aesthetics.forEach(aesthetic => {
        if (aesthetic.geometry_ref) {
          aestheticRecords[aesthetic.geometry_ref] = aesthetic;
        }
      });
    }

    const history: AnalysisRecord[] = geometryRecords.map(geometry => {
      const aesthetic = aestheticRecords[geometry.id!];
      
      const result: AnalysisResult = {
        faceShape: (geometry.proportions as any)?.faceShape || 'Unknown',
        undertone: mapUndertoneFromBackend(aesthetic?.undertone),
        skinType: mapSkinTypeFromBackend(aesthetic?.canvas_type),
        eyeColor: 'Unknown',
        structuralAnalysis: (geometry.proportions as any)?.structuralAnalysis || '',
        skinAnalysis: '',
        recommendations: [],
        blushPlacement: '',
        contourPlacement: '',
        colorPalette: {
          lips: aesthetic?.skin_tone_hex ? [aesthetic.skin_tone_hex] : [],
          eyes: [],
          cheeks: [],
          explanation: '',
        },
        meshData: geometry.mesh_data,
        symmetryScore: geometry.symmetry_score,
      };

      return {
        id: geometry.id!,
        timestamp: new Date(geometry.created!).getTime(),
        imageSrc: '',
        result,
        geometryId: geometry.id,
        aestheticId: aesthetic?.id,
      };
    });

    return history;
  } catch (error) {
    console.error('Failed to fetch history from PocketBase:', error);
    return [];
  }
};

/**
 * Delete an analysis record
 */
export const deleteRecord = async (id: string): Promise<AnalysisRecord[]> => {
  const user = getCurrentUser();
  
  if (!user) {
    throw new Error('User must be authenticated to delete records');
  }

  try {
    await pb.collection('facial_geometry').delete(id);
    return await getHistory();
  } catch (error) {
    console.error('Failed to delete record from PocketBase:', error);
    throw new Error('Failed to delete record. Please try again.');
  }
};

// Helper functions
function mapUndertoneToBackend(undertone: string): 'cool' | 'warm' | 'neutral' | 'olive' | undefined {
  const normalized = undertone.toLowerCase();
  if (normalized.includes('cool')) return 'cool';
  if (normalized.includes('warm')) return 'warm';
  if (normalized.includes('neutral')) return 'neutral';
  if (normalized.includes('olive')) return 'olive';
  return undefined;
}

function mapUndertoneFromBackend(undertone?: string): any {
  if (!undertone) return 'Unknown';
  return undertone.charAt(0).toUpperCase() + undertone.slice(1);
}

function mapSkinTypeToBackend(skinType: string): 'dry' | 'oily' | 'combination' | 'sensitive' | 'mature' | undefined {
  const normalized = skinType.toLowerCase();
  if (normalized.includes('dry')) return 'dry';
  if (normalized.includes('oily')) return 'oily';
  if (normalized.includes('combination')) return 'combination';
  if (normalized.includes('sensitive')) return 'sensitive';
  if (normalized.includes('mature')) return 'mature';
  return undefined;
}

function mapSkinTypeFromBackend(canvasType?: string): any {
  if (!canvasType) return 'Unknown';
  return canvasType.charAt(0).toUpperCase() + canvasType.slice(1);
}
