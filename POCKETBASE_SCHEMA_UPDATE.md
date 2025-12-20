# PocketBase Schema Update - Style Board Feature

## New Collection: `saved_looks`

This collection stores user's saved makeup looks, daily styles, and inspiration photos.

### Schema Fields:

```javascript
{
  // Auto-generated
  id: string (auto),
  created: datetime (auto),
  updated: datetime (auto),

  // Required Fields
  user: relation(users) - Link to users collection
  title: text (required, max: 50) - Name of the look (e.g., "Date Night Glam")

  // Optional Fields
  description: text (optional, max: 200) - Notes about the look
  image_src: text (optional) - Base64 encoded image or URL
  tags: json (optional) - Array of tags ["glam", "evening", "red-lips"]
  occasion: text (optional) - Category: "work", "date", "party", "everyday", "glam", "natural"
  products_used: text (optional, max: 300) - List of products used
  is_favorite: bool (default: false) - Quick access to favorite looks
}
```

### PocketBase Admin Setup:

1. **Go to your PocketBase admin panel**: `https://api.di3s.cloud/_/`

2. **Create new collection**:
   - Name: `saved_looks`
   - Type: Base collection

3. **Add fields** (click "+ New field" for each):

   **user** (Relation field):
   - Type: Relation
   - Collection: users
   - Single: Yes (one user per look)
   - Required: Yes

   **title** (Text field):
   - Type: Text
   - Max length: 50
   - Required: Yes

   **description** (Text field):
   - Type: Text
   - Max length: 200
   - Required: No

   **image_src** (Text field):
   - Type: Text
   - Max length: (leave blank for unlimited - stores base64)
   - Required: No

   **tags** (JSON field):
   - Type: JSON
   - Required: No

   **occasion** (Select field):
   - Type: Select
   - Options: everyday, work, date, party, glam, natural
   - Max select: 1
   - Required: No

   **products_used** (Text field):
   - Type: Text
   - Max length: 300
   - Required: No

   **is_favorite** (Bool field):
   - Type: Bool
   - Required: No
   - Default: false

4. **Set API Rules**:

   **List/Search rule**:
   ```
   @request.auth.id = user.id
   ```
   (Users can only see their own looks)

   **View rule**:
   ```
   @request.auth.id = user.id
   ```

   **Create rule**:
   ```
   @request.auth.id != "" && @request.auth.id = @request.data.user
   ```
   (Authenticated users can create looks for themselves)

   **Update rule**:
   ```
   @request.auth.id = user.id
   ```
   (Users can only update their own looks)

   **Delete rule**:
   ```
   @request.auth.id = user.id
   ```
   (Users can only delete their own looks)

## Usage in App:

The Style Board feature is now accessible via:
- **Navigation**: Bottom nav bar → "Looks" (Heart icon)
- **Add Look**: Large pink gradient button at top of Style Board
- **Options**: Take photo with camera OR upload from library
- **Features**:
  - Save makeup looks with photos
  - Add titles, descriptions, occasion tags
  - Mark favorites for quick access
  - Track products used
  - Beautiful grid view of all saved looks
  - Delete unwanted looks

## User Flow:

1. User taps "Looks" in bottom nav
2. Sees Style Board with all saved looks (or empty state)
3. Taps "Save New Look" button
4. Chooses: Take Photo or Upload Photo
5. Fills out form: title (required), description, occasion, products, favorite
6. Saves → Look appears in Style Board grid
7. Can tap heart to toggle favorite status
8. Can delete looks with confirmation modal

## Benefits:

- **Makeup Journal**: Track what works for different occasions
- **Inspiration Board**: Save looks from anywhere (not just facial analysis)
- **Product Tracking**: Remember which products created which looks
- **Quick Reference**: Find your go-to looks easily via favorites
- **Visual History**: See your makeup evolution over time
