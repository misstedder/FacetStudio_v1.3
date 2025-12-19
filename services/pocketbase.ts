import PocketBase from 'pocketbase';

// Initialize PocketBase client
const PB_URL = import.meta.env.VITE_PB_URL || 'https://api.di3s.cloud';

if (!PB_URL) {
  throw new Error('VITE_PB_URL environment variable is not set');
}

// Create singleton instance
export const pb = new PocketBase(PB_URL);

// Enable auto-cancellation for duplicate requests
pb.autoCancellation(false);

// Configure auth store to persist in localStorage (PocketBase handles this automatically)
// When a user logs in, their token is automatically stored and restored on page reload

export default pb;
