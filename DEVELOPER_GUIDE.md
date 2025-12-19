# FacetStudio Backend Integration - Quick Reference

## 🚀 Quick Start

```bash
# 1. Setup environment
cp .env.example .env
# Edit .env and add your GEMINI_API_KEY

# 2. Install dependencies
npm install

# 3. Run dev server
npm run dev
```

## 🔐 Authentication

```typescript
import { login, logout, getCurrentUser, isAuthenticated } from './services/auth';

// Login
const user = await login('user@example.com', 'password');

// Check auth status
if (isAuthenticated()) {
  const currentUser = getCurrentUser();
  console.log('Logged in as:', currentUser?.email);
}

// Logout
logout();
```

## 💾 Storage Operations

```typescript
import { saveAnalysis, getHistory, updateRecord, deleteRecord } from './services/storage';

// Save analysis (must be authenticated)
const record = await saveAnalysis(imageBase64, analysisResult);

// Get history
const history = await getHistory(); // Returns AnalysisRecord[]

// Update record
await updateRecord(modifiedRecord);

// Delete record
const updatedHistory = await deleteRecord(recordId);
```

## 🤖 AI Analysis with Audit Logging

```typescript
import { analyzeFace } from './services/geminiService';

// Analysis automatically logs to PocketBase
const result = await analyzeFace(imageBase64);
// result now includes:
// - result.meshData: { ... } // 468-point facial mesh
// - result.symmetryScore: 87 // 0-100 scale
```

## 📊 AI Usage Tracking

```typescript
import { getTokenUsage } from './services/aiAuditLogger';

// Get token usage for current user
const usage = await getTokenUsage(userId);
console.log(`Total tokens: ${usage.totalTokens}`);
console.log(`Request count: ${usage.requestCount}`);

// Get usage for date range
const monthlyUsage = await getTokenUsage(
  userId,
  new Date('2025-01-01'),
  new Date('2025-01-31')
);
```

## 🛠️ Error Handling

```typescript
import { withRetry, gracefulFetch } from './utils/pocketbaseErrorHandler';

// Automatic retry with exponential backoff
const data = await withRetry(() => 
  pb.collection('facial_geometry').getList()
);

// Graceful fallback on error
const history = await gracefulFetch(
  () => getHistory(),
  [] // fallback to empty array
);
```

## ✅ Environment Validation

```typescript
import { validateEnvironment, runStartupChecks } from './utils/environmentValidation';

// In your main App component
useEffect(() => {
  runStartupChecks().then(allChecksPassed => {
    if (!allChecksPassed) {
      console.error('Startup checks failed!');
    }
  });
}, []);
```

## 📝 Type Definitions

```typescript
// New biometric fields in AnalysisResult
interface AnalysisResult {
  // ... existing fields
  meshData?: Record<string, any>; // 468-point mesh coordinates
  symmetryScore?: number; // 0-100 facial symmetry
}

// PocketBase collection types
import { 
  FacialGeometry,
  AestheticVectors,
  AIRequest,
  AIResponse 
} from './types';
```

## 🔗 Direct PocketBase Access

```typescript
import { pb } from './services/pocketbase';

// Access PocketBase client directly if needed
const records = await pb.collection('facial_geometry').getFullList();

// Current auth state
console.log('Auth token:', pb.authStore.token);
console.log('Auth model:', pb.authStore.model);
```

## 🐛 Common Issues & Solutions

### "User must be authenticated"
```typescript
// Solution: Implement login UI or use direct auth for testing
import { pb } from './services/pocketbase';
await pb.collection('users').authWithPassword('email', 'password');
```

### "VITE_PB_URL is not set"
```bash
# Solution: Create .env file with required variables
echo "VITE_PB_URL=https://api.di3s.cloud" >> .env
# Restart dev server
```

### Network errors
```typescript
// Solution: Use error handling utilities
import { withRetry } from './utils/pocketbaseErrorHandler';

const result = await withRetry(() => saveAnalysis(img, data), {
  maxRetries: 5,
  delayMs: 2000
});
```

## 📦 Dependencies Added

```json
{
  "dependencies": {
    "pocketbase": "^0.x.x"
  }
}
```

## 🎯 Architecture Patterns

### Service Layer Pattern
- `services/pocketbase.ts` - Singleton client
- `services/auth.ts` - Authentication logic
- `services/storage.ts` - Data persistence
- `services/aiAuditLogger.ts` - Cross-cutting concern

### Error Handling Strategy
- Parse errors into typed exceptions
- Retry on network/server errors
- Don't retry on auth/client errors
- Graceful degradation for non-critical ops

### Type Safety
- All PocketBase responses typed
- Collection interfaces match backend schema
- Type transformations documented

## 🔄 Migration Notes

### From localStorage to PocketBase
- All CRUD operations now async
- Requires user authentication
- Network dependency introduced
- Better data persistence guarantee

### Breaking Changes
- `saveAnalysis()` now returns Promise
- `getHistory()` now returns Promise
- `updateRecord()` now returns Promise
- `deleteRecord()` now returns Promise

## 📚 Further Reading

- PocketBase API: https://api.di3s.cloud/api/
- PocketBase Admin: https://api.di3s.cloud/_/
- Setup Guide: See SETUP_README.md
- Architecture Doc: See Architectural_Handoff_Packet
