# FacetStudio - PocketBase Integration

## Overview
FacetStudio is now integrated with PocketBase backend for server-side data persistence, user authentication, and AI audit logging.

## Setup Instructions

### 1. Environment Configuration

Create a `.env` file in the project root based on `.env.example`:

```bash
cp .env.example .env
```

Then edit `.env` and add your credentials:

```env
# Gemini API Key (required for AI analysis)
GEMINI_API_KEY=your_gemini_api_key_here

# PocketBase Backend URL (already configured for your VPS)
VITE_PB_URL=https://api.di3s.cloud
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Verify PocketBase Collections

Before running the app, ensure these collections exist in your PocketBase instance at `https://api.di3s.cloud/_/`:

**Required Collections:**
- `users` (auth collection)
- `facial_geometry` 
- `aesthetic_vectors`
- `ai_requests`
- `ai_responses`

Refer to `/mnt/user-data/uploads/Architectural_Handoff_Packet` for the exact schema.

### 4. Create a Test User

In PocketBase admin panel (`https://api.di3s.cloud/_/`):
1. Navigate to Collections → users
2. Create a new user record with email and password
3. Mark the user as "verified" if email verification is not set up

### 5. Run the Application

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

## Architecture Changes

### Storage Layer
- **Before:** All data stored in browser localStorage
- **After:** All data persisted in PocketBase collections
  - `facial_geometry` - stores biometric data (mesh coordinates, symmetry scores)
  - `aesthetic_vectors` - stores color/skin analysis

### Authentication
- **Current:** Email/password authentication via PocketBase
- **Future:** Ready for Magic Link migration (see `services/auth.ts` for migration path)

### AI Audit Logging
All Gemini API calls are now logged to PocketBase:
- `ai_requests` collection tracks prompts and models used
- `ai_responses` collection tracks outputs and token usage
- Useful for cost tracking and debugging

### Type Safety
New TypeScript interfaces match PocketBase schema:
- `FacialGeometry`
- `AestheticVectors`
- `AIRequest`
- `AIResponse`

## Key Files Modified

### Services Layer
- `services/pocketbase.ts` - PocketBase client singleton
- `services/auth.ts` - Authentication service
- `services/storage.ts` - Completely rewritten for PocketBase
- `services/aiAuditLogger.ts` - AI usage tracking
- `services/geminiService.ts` - Updated to request biometric data

### Types
- `types.ts` - Added `meshData` and `symmetryScore` to `AnalysisResult`
- Added PocketBase collection type interfaces

### Views
- `views/GalleryView.tsx` - Updated for async storage operations
- `App.tsx` - Updated to await async storage calls

### Utilities
- `utils/environmentValidation.ts` - Environment variable validation
- `utils/pocketbaseErrorHandler.ts` - Error handling and retry logic

## Security Notes

1. **Environment Variables:** Never commit `.env` to version control
2. **API Keys:** GEMINI_API_KEY should be kept secret
3. **PocketBase URL:** Already configured to use your hardened VPS at api.di3s.cloud
4. **Firewall:** Port 8090 is blocked externally; only accessible via Nginx

## Testing Checklist

- [ ] User can log in with email/password
- [ ] Analysis captures photo and saves to PocketBase
- [ ] Analysis includes `meshData` and `symmetryScore`
- [ ] History view loads past analyses from PocketBase
- [ ] AI requests/responses are logged for audit
- [ ] No localStorage usage remains

## Troubleshooting

### "VITE_PB_URL is not set"
- Ensure `.env` file exists and contains `VITE_PB_URL=https://api.di3s.cloud`
- Restart the dev server after creating `.env`

### "User must be authenticated"
- Log in via the app (login UI needs to be implemented separately)
- Or use PocketBase client directly for testing:
  ```javascript
  import { pb } from './services/pocketbase';
  await pb.collection('users').authWithPassword('email', 'password');
  ```

### "Failed to save analysis"
- Check PocketBase collections exist
- Verify user is authenticated
- Check browser console for detailed errors

### Network Errors
- Verify VPS is accessible: `curl https://api.di3s.cloud/api/health`
- Check firewall rules on VPS
- Verify Nginx is proxying correctly

## Next Steps

1. **Implement Login UI** - Create a login screen for user authentication
2. **Test End-to-End** - Run through full flow: login → analyze → view history
3. **Deploy** - Build and deploy to production environment
4. **Monitor AI Usage** - Use audit logs to track API costs

## Support

For PocketBase admin access: https://api.di3s.cloud/_/
For API documentation: https://api.di3s.cloud/api/
