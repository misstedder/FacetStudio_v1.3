import { pb } from './pocketbase';

/**
 * Authentication Service
 * 
 * Current implementation: Email/Password authentication
 * 
 * MIGRATION PATH TO MAGIC LINK:
 * When ready to migrate to passwordless Magic Link authentication:
 * 1. Enable "Email (Magic Link)" auth method in PocketBase admin panel
 * 2. Replace login() implementation with: pb.collection('users').requestVerification(email)
 * 3. User clicks link in email → PocketBase handles verification → auto-login
 * 4. Update UI to show "Check your email" message instead of password field
 * 5. No backend migration needed - both methods can coexist during transition
 */

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  verified: boolean;
}

/**
 * Login with email and password
 * Returns authenticated user and stores token automatically
 */
export const login = async (email: string, password: string): Promise<AuthUser> => {
  try {
    const authData = await pb.collection('users').authWithPassword(email, password);
    
    return {
      id: authData.record.id,
      email: authData.record.email,
      name: authData.record.name,
      avatar: authData.record.avatar,
      verified: authData.record.verified,
    };
  } catch (error: any) {
    console.error('Login failed:', error);
    throw new Error(error?.message || 'Login failed. Please check your credentials.');
  }
};

/**
 * Logout current user and clear auth state
 */
export const logout = (): void => {
  pb.authStore.clear();
};

/**
 * Get currently authenticated user
 * Returns null if not authenticated
 */
export const getCurrentUser = (): AuthUser | null => {
  if (!pb.authStore.isValid || !pb.authStore.model) {
    return null;
  }

  const user = pb.authStore.model;
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    avatar: user.avatar,
    verified: user.verified,
  };
};

/**
 * Check if user is currently authenticated
 */
export const isAuthenticated = (): boolean => {
  return pb.authStore.isValid;
};

/**
 * Get auth token for API requests
 * Returns null if not authenticated
 */
export const getAuthToken = (): string | null => {
  return pb.authStore.token || null;
};

/**
 * Register a new user (if needed for future implementation)
 * Currently not implemented - users should be created via PocketBase admin
 */
export const register = async (email: string, password: string, name?: string): Promise<AuthUser> => {
  try {
    const userData = {
      email,
      password,
      passwordConfirm: password,
      name: name || email.split('@')[0],
    };

    const record = await pb.collection('users').create(userData);
    
    // Auto-login after registration
    return await login(email, password);
  } catch (error: any) {
    console.error('Registration failed:', error);
    throw new Error(error?.message || 'Registration failed. Please try again.');
  }
};
