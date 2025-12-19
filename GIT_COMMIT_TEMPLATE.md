# Git Commit Template for PocketBase Integration

## Suggested Commit Structure

### Main Integration Commit

```
feat: Integrate PocketBase backend for server-side persistence

BREAKING CHANGE: Storage operations now require authentication and are async

This commit replaces localStorage-based storage with PocketBase backend 
integration, implementing user authentication, AI audit logging, and 
enhanced biometric data collection.

Key Changes:
- Replace localStorage with PocketBase SDK in storage service
- Add user authentication service (email/password + Magic Link ready)
- Implement AI audit logging for cost tracking
- Add biometric data collection (meshData + symmetryScore)
- Create error handling and retry utilities
- Add environment validation on startup

Technical Details:
- All CRUD operations now async (require await)
- User authentication required for all storage operations
- PocketBase collections: facial_geometry, aesthetic_vectors, ai_requests, ai_responses
- Graceful degradation: returns empty arrays on auth failure
- Retry logic with exponential backoff for network errors

Services Added:
- services/pocketbase.ts - PocketBase client singleton
- services/auth.ts - Authentication with Magic Link migration path
- services/aiAuditLogger.ts - AI usage tracking
- utils/environmentValidation.ts - Environment checks
- utils/pocketbaseErrorHandler.ts - Error handling

Services Modified:
- services/storage.ts - Completely rewritten for PocketBase
- services/geminiService.ts - Added biometric data + audit logging

UI Components Updated:
- App.tsx - Handle async storage operations
- views/GalleryView.tsx - Handle async history loading

Configuration:
- Added VITE_PB_URL environment variable
- Created .env.example template
- Added pocketbase npm dependency

Documentation:
- SETUP_README.md - Setup and deployment guide
- DEVELOPER_GUIDE.md - Quick reference for developers
- tasks/todo.md - Task tracking and architecture decisions

Testing Needed:
- Auth flow (login/logout/session)
- Analysis save/load cycle
- History with multiple users
- Error handling scenarios
- AI audit log verification

Migration Notes:
- Images not yet stored in PocketBase (in-memory only)
- Some AnalysisResult fields not persisted (recommendations, etc.)
- Login UI needs to be implemented
- Data migration script needed for existing localStorage data

Related Docs:
- Backend config: BackEndStack_InitialConfiguration.json
- Architecture spec: Architectural_Handoff_Packet
- PocketBase admin: https://api.di3s.cloud/_/

Co-authored-by: Claude Sonnet 4 <claude@anthropic.com>
```

### Alternative: Atomic Commits

If you prefer smaller, atomic commits:

```bash
# Commit 1: Infrastructure
git commit -m "feat: Add PocketBase SDK and client configuration

- Install pocketbase npm package
- Create PocketBase client singleton
- Add VITE_PB_URL environment variable
- Create .env.example template"

# Commit 2: Type System
git commit -m "feat: Add PocketBase collection types and biometric fields

- Add meshData and symmetryScore to AnalysisResult
- Create FacialGeometry interface
- Create AestheticVectors interface  
- Create AIRequest and AIResponse interfaces
- Update AnalysisRecord with PocketBase relation IDs"

# Commit 3: Authentication
git commit -m "feat: Implement PocketBase authentication service

- Add login/logout functions
- Add getCurrentUser and isAuthenticated checks
- Document Magic Link migration path
- Add auth state persistence via PocketBase SDK"

# Commit 4: AI Audit Logging
git commit -m "feat: Add AI usage audit logging

- Create aiAuditLogger service
- Add request/response logging functions
- Add token usage tracking
- Integrate with analyzeFace function"

# Commit 5: Storage Migration
git commit -m "refactor!: Replace localStorage with PocketBase storage

BREAKING CHANGE: All storage operations now async

- Rewrite saveAnalysis for PocketBase
- Rewrite getHistory with user filtering
- Rewrite updateRecord and deleteRecord
- Remove all localStorage dependencies
- Add type mapping helpers"

# Commit 6: Gemini Updates
git commit -m "feat: Add biometric data collection to AI analysis

- Update analysisSchema with meshData and symmetryScore
- Update AI prompt to request facial landmarks
- Integrate audit logging into analyzeFace"

# Commit 7: Error Handling
git commit -m "feat: Add comprehensive error handling and retry logic

- Create PocketBase error parser
- Add retry utility with exponential backoff
- Add graceful degradation helper
- Create environment validation utility"

# Commit 8: UI Updates
git commit -m "fix: Update components for async storage operations

- Add await to storage calls in App.tsx
- Update GalleryView for async history loading
- Make handleUpdateRecord async"

# Commit 9: Documentation
git commit -m "docs: Add setup and developer documentation

- Create SETUP_README.md with configuration guide
- Create DEVELOPER_GUIDE.md quick reference
- Create detailed task tracking in tasks/todo.md
- Document architecture decisions and trade-offs"
```

## Branch Naming

Suggested branch name: `feat/pocketbase-integration`

## Pull Request Template

```markdown
## Description
Integrates FacetStudio with PocketBase backend for server-side data persistence, user authentication, and AI audit logging.

## Type of Change
- [x] New feature
- [x] Breaking change
- [ ] Bug fix
- [ ] Documentation update

## Changes Made
- Replaced localStorage with PocketBase SDK
- Added user authentication (email/password)
- Implemented AI audit logging for cost tracking
- Added biometric data collection (mesh + symmetry)
- Created comprehensive error handling
- Added environment validation

## Breaking Changes
- All storage operations now async (require await)
- User authentication required for data operations
- Environment variables required (VITE_PB_URL, GEMINI_API_KEY)

## Testing Done
- [x] Type compilation verified
- [x] Service imports validated
- [ ] Auth flow tested
- [ ] Analysis save/load tested
- [ ] History retrieval tested

## Dependencies Added
- pocketbase: ^0.x.x

## Documentation
- [x] SETUP_README.md created
- [x] DEVELOPER_GUIDE.md created
- [x] Code comments added
- [x] Architecture decisions documented

## Screenshots
N/A - Backend integration (no UI changes)

## Checklist
- [x] Code follows project style guidelines
- [x] Self-review completed
- [x] Comments added to complex areas
- [x] Documentation updated
- [ ] Tests pass
- [ ] No new warnings
- [ ] Dependent changes merged

## Related Issues
Closes #[issue-number] (if applicable)

## Deployment Notes
1. Ensure PocketBase collections exist on target instance
2. Configure .env with VITE_PB_URL and GEMINI_API_KEY
3. Create test user in PocketBase admin
4. Implement login UI before production deployment
```
