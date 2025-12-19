/**
 * Environment Validation Utility
 * Validates required environment variables on app startup
 */

interface EnvironmentConfig {
  GEMINI_API_KEY: string;
  VITE_PB_URL: string;
}

export class EnvironmentError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'EnvironmentError';
  }
}

/**
 * Validate all required environment variables
 * Throws EnvironmentError if any are missing
 */
export const validateEnvironment = (): EnvironmentConfig => {
  const errors: string[] = [];

  // Check Gemini API Key
  const geminiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
  if (!geminiKey) {
    errors.push('GEMINI_API_KEY is not set');
  }

  // Check PocketBase URL
  const pbUrl = import.meta.env.VITE_PB_URL;
  if (!pbUrl) {
    errors.push('VITE_PB_URL is not set');
  }

  if (errors.length > 0) {
    throw new EnvironmentError(
      `Environment configuration errors:\n${errors.map(e => `  - ${e}`).join('\n')}\n\n` +
      `Please create a .env file based on .env.example and add the required values.`
    );
  }

  return {
    GEMINI_API_KEY: geminiKey!,
    VITE_PB_URL: pbUrl!,
  };
};

/**
 * Check if PocketBase backend is accessible
 * Returns true if healthy, false otherwise
 */
export const checkPocketBaseHealth = async (): Promise<boolean> => {
  try {
    const pbUrl = import.meta.env.VITE_PB_URL;
    if (!pbUrl) return false;

    const response = await fetch(`${pbUrl}/api/health`, {
      method: 'GET',
      signal: AbortSignal.timeout(5000), // 5 second timeout
    });

    return response.ok;
  } catch (error) {
    console.error('PocketBase health check failed:', error);
    return false;
  }
};

/**
 * Validate environment and log results
 * Returns true if all checks pass, false otherwise
 */
export const runStartupChecks = async (): Promise<boolean> => {
  console.log('🔍 Running startup checks...');

  try {
    // Check environment variables
    const env = validateEnvironment();
    console.log('✅ Environment variables validated');
    console.log(`  - PocketBase URL: ${env.VITE_PB_URL}`);
    console.log(`  - Gemini API Key: ${env.GEMINI_API_KEY.substring(0, 10)}...`);

    // Check PocketBase connectivity
    const pbHealthy = await checkPocketBaseHealth();
    if (pbHealthy) {
      console.log('✅ PocketBase backend is healthy');
    } else {
      console.warn('⚠️  PocketBase backend health check failed - app may not function correctly');
      return false;
    }

    console.log('✅ All startup checks passed');
    return true;
  } catch (error) {
    if (error instanceof EnvironmentError) {
      console.error('❌ Environment validation failed:');
      console.error(error.message);
    } else {
      console.error('❌ Startup check failed:', error);
    }
    return false;
  }
};
