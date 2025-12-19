import { pb } from './pocketbase';
import { AIRequest, AIResponse } from '../types';

/**
 * AI Audit Logger Service
 * 
 * Tracks all AI API calls for cost analysis and debugging
 * Logs both requests (prompts) and responses (outputs + token usage)
 */

/**
 * Log an AI request
 * Returns the created request record ID for linking to response
 */
export const logRequest = async (
  prompt: string,
  model: string,
  userId: string
): Promise<string> => {
  try {
    const requestData: Partial<AIRequest> = {
      Prompt: prompt,
      Model: model,
      User: userId,
    };

    const record = await pb.collection('ai_requests').create(requestData);
    return record.id;
  } catch (error) {
    console.error('Failed to log AI request:', error);
    // Don't throw - logging failures shouldn't break the app
    return '';
  }
};

/**
 * Log an AI response with token usage
 * Links to the original request via requestId
 */
export const logResponse = async (
  requestId: string,
  response: string,
  tokens: number | undefined,
  userId: string
): Promise<void> => {
  try {
    if (!requestId) {
      console.warn('Cannot log response without requestId');
      return;
    }

    const responseData: Partial<AIResponse> = {
      Response: response,
      Tokens: tokens,
      Request: requestId,
      User: userId,
    };

    await pb.collection('ai_responses').create(responseData);
  } catch (error) {
    console.error('Failed to log AI response:', error);
    // Don't throw - logging failures shouldn't break the app
  }
};

/**
 * Wrapper for AI calls that automatically logs request and response
 * Usage example:
 * 
 * const result = await withAuditLog(
 *   'gemini-3-flash-preview',
 *   'Analyze this face...',
 *   userId,
 *   async () => await ai.models.generateContent(...)
 * );
 */
export const withAuditLog = async <T>(
  model: string,
  prompt: string,
  userId: string,
  aiCall: () => Promise<{ result: T; tokens?: number; responseText?: string }>
): Promise<T> => {
  // Log request
  const requestId = await logRequest(prompt, model, userId);

  try {
    // Execute AI call
    const { result, tokens, responseText } = await aiCall();

    // Log response
    await logResponse(
      requestId,
      responseText || JSON.stringify(result).substring(0, 1000), // Truncate large responses
      tokens,
      userId
    );

    return result;
  } catch (error) {
    // Log error response
    await logResponse(
      requestId,
      `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      0,
      userId
    );
    throw error;
  }
};

/**
 * Get token usage statistics for a user
 * Useful for cost tracking and quotas
 */
export const getTokenUsage = async (
  userId: string,
  startDate?: Date,
  endDate?: Date
): Promise<{ totalTokens: number; requestCount: number }> => {
  try {
    let filter = `User = "${userId}"`;
    
    if (startDate) {
      filter += ` && created >= "${startDate.toISOString()}"`;
    }
    if (endDate) {
      filter += ` && created <= "${endDate.toISOString()}"`;
    }

    const responses = await pb.collection('ai_responses').getFullList<AIResponse>({
      filter,
    });

    const totalTokens = responses.reduce((sum, r) => sum + (r.Tokens || 0), 0);
    
    return {
      totalTokens,
      requestCount: responses.length,
    };
  } catch (error) {
    console.error('Failed to get token usage:', error);
    return { totalTokens: 0, requestCount: 0 };
  }
};
