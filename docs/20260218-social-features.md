# Social Features Documentation

## Overview
The Animal Talk app now includes comprehensive social features that allow users to share their pet sound interpretations, vote on accuracy, and engage with a community feed.

## Features

### 1. Community Feed
A real-time feed showing sound interpretations shared by all users.

#### Features:
- **Animal Filtering**: Feed automatically filters by selected animal (guinea pig, cat, or dog)
- **Real-time Updates**: Refreshes every 30 seconds to show new posts
- **Score Display**: Shows upvotes minus downvotes for each post
- **Time Display**: Shows relative time (just now, 5m ago, 2h ago, etc.)
- **Empty State**: Friendly message when no posts exist yet

#### Components:
- Located in `client/src/components/CommunityFeed.tsx`
- Integrated as the third tab in the Home page
- Uses React Query for efficient data fetching and caching

### 2. Share Functionality
Users can share their sound recognition results to the community.

#### How it Works:
1. After listening to a sound, users see multiple interpretation results
2. Each result has a "Share" button alongside "Confirm"
3. Clicking Share posts the interpretation to the community feed
4. Includes:
   - Animal type
   - Detected sound type
   - Interpretation/translation
   - Confidence score
   - Metadata (context, features)

#### Implementation:
- Share button in `client/src/components/TranslationResult.tsx`
- Sends POST request to `/api/posts`
- Shows toast notification on success/failure
- Automatically refreshes community feed

### 3. Voting System
Users can vote on whether interpretations are helpful.

#### Vote Types:
- **Upvote (👍)**: This interpretation seems accurate/helpful
- **Downvote (👎)**: This interpretation doesn't seem right

#### Behavior:
- Clicking same vote again removes the vote
- Clicking opposite vote switches the vote
- Vote counts update immediately
- User's vote status persists across sessions

#### UI Features:
- Vote buttons show current count
- Active votes are highlighted (green for up, red for down)
- Score badge shows net votes (upvotes - downvotes)
- Color-coded based on score (positive = primary, zero/negative = secondary)

### 4. Audio Playback (Optional)
If audio data is included in posts, users can replay sounds.

#### Notes:
- Currently posts don't include audio data (optional field)
- Play button appears only if audioData exists
- Uses Web Audio API for playback

### 5. Post Management
Users can delete their own posts.

#### Features:
- Delete button (trash icon) on each post
- Only works for posts created by the current user
- Confirmation via toast notification
- Immediate feed refresh after deletion

## Technical Architecture

### Database Schema

#### Posts Table
```typescript
{
  id: string (UUID)
  userId: string
  username: string
  animal: string ('guinea_pig' | 'cat' | 'dog')
  soundType: string
  interpretation: string
  audioData?: string (base64)
  duration?: number
  confidence?: number (0-100)
  metadata?: object
  upvotes: number (default 0)
  downvotes: number (default 0)
  createdAt: timestamp
}
```

#### Votes Table
```typescript
{
  id: string (UUID)
  postId: string
  userId: string
  voteType: string ('up' | 'down')
  createdAt: timestamp
}
```

### API Endpoints

#### POST `/api/posts`
Create a new post
- Body: `{ animal, soundType, interpretation, confidence, metadata }`
- Returns: Created post object
- Sets anonymous user cookie

#### GET `/api/posts?animal={animal}&limit={limit}&offset={offset}`
Get posts with optional filtering
- Query params: `animal`, `limit`, `offset`
- Returns: Array of posts with user vote status
- Sets anonymous user cookie

#### GET `/api/posts/:id`
Get a single post
- Returns: Post object or 404

#### DELETE `/api/posts/:id`
Delete a post (creator only)
- Returns: `{ success: true }` or 403

#### POST `/api/posts/:id/vote`
Vote on a post
- Body: `{ voteType: 'up' | 'down' }`
- Returns: Updated post with vote counts and user vote status
- Clicking same vote removes it

### Anonymous User System

Since there's no authentication system, the app uses cookie-based anonymous user tracking:

```typescript
// Format: anon_{timestamp}_{random}
anonymousId: "anon_1708128000_xyz123"
```

#### Behavior:
- Cookie is set on first API interaction
- Lasts 1 year
- Allows voting and post ownership
- Not visible to users (transparent)

### State Management

#### React Query
- Posts cached by animal type: `['posts', animal]`
- 30-second refetch interval
- Automatic background updates
- Optimistic updates for votes

#### Local State
- Active tab tracking
- Vote mutation loading states
- Toast notifications

## User Experience Flow

### Sharing a Sound
1. User clicks Listen and records pet sound
2. App analyzes and shows 3 possible interpretations
3. User reviews results and clicks "Share" on preferred interpretation
4. Toast confirms "Shared to Community!"
5. Post immediately appears in Community tab

### Browsing Community
1. User switches to Community tab
2. Feed loads posts filtered by current animal
3. User sees posts with scores and timestamps
4. User can upvote helpful interpretations
5. Feed updates every 30 seconds

### Voting Flow
1. User sees post in feed
2. Clicks thumbs up if interpretation seems accurate
3. Button turns green, count increases
4. Clicking again removes vote
5. All users see updated vote count

## Localization

All UI text supports English and Chinese:

### English
- "Community Feed"
- "Share to Community"
- "Helpful" / "Not Helpful"
- "Just now" / "5m ago"
- "No posts yet. Share your pet's sounds to get started!"

### Chinese
- "社区动态"
- "分享到社区"
- "有用" / "无用"
- "刚刚" / "5分钟前"
- "还没有帖子。分享您宠物的声音开始吧！"

## Future Enhancements

### Potential Features:
1. **Audio Recording Sharing**: Save and include actual audio in posts
2. **Comments**: Add discussion threads under posts
3. **User Profiles**: Named accounts with avatars and history
4. **Following**: Follow specific users or pets
5. **Trending**: Highlight most-voted interpretations
6. **Search/Filter**: Search by sound type, date range, confidence
7. **Notifications**: Alert when someone votes on your post
8. **Leaderboard**: Top contributors and most accurate interpreters
9. **Pet Profiles**: Create named profiles for individual pets
10. **Expert Mode**: Verified interpreters with badges

### Database Considerations:
- Current implementation uses in-memory storage (`MemStorage`)
- For production, migrate to PostgreSQL using existing Drizzle schema
- Add indexes on `createdAt`, `animal`, and `userId` for performance
- Consider pagination for large datasets

## Development Notes

### Testing the Social Features:
1. Start the dev server: `npm run dev`
2. Open multiple browser tabs/windows
3. Share posts from one tab
4. See them appear in other tabs within 30 seconds
5. Vote from different browsers (cookies are per-browser)

### Storage Reset:
Since using in-memory storage, all posts are lost on server restart. This is intentional for development.

### Adding Real Database:
1. Ensure PostgreSQL is configured (see `drizzle.config.ts`)
2. Run migrations: `npm run db:push`
3. Update `server/storage.ts` to use Drizzle queries instead of Map
4. Implement proper user authentication

## Code Structure

```
client/src/
  components/
    CommunityFeed.tsx       # Main feed component
    TranslationResult.tsx   # Results with share button
  pages/
    Home.tsx                # Integrates all three tabs

server/
  routes.ts                 # API endpoints
  storage.ts                # Data access layer

shared/
  schema.ts                 # Database schema and types
```

## Accessibility

- Keyboard navigation supported
- Semantic HTML structure
- ARIA labels on interactive elements
- Color contrast meets WCAG standards
- Loading skeletons for better perceived performance

## Performance

- React Query caching reduces API calls
- Debounced voting prevents spam
- Lazy loading for large feeds
- Optimistic UI updates for instant feedback
- Background refetching doesn't block UI
