# Social Features - Quick Start Guide

## 🎉 What's New

Your Animal Talk app now has a full-featured social community! Users can:
- 📤 **Share** their pet sound interpretations
- 👍👎 **Vote** on whether interpretations are accurate
- 🌐 **Browse** a community feed of all shared sounds
- 🗑️ **Delete** their own posts
- 🔄 **Real-time updates** every 30 seconds

## 🚀 How to Use

### For Users:

1. **Listen to Your Pet** (Listen tab)
   - Click the mascot to record sound
   - See 3 possible interpretations with confidence scores

2. **Share an Interpretation**
   - Click the "Share" button on any result
   - It's instantly posted to the Community feed
   - Get a confirmation toast

3. **Browse Community** (Community tab)
   - Swipe left or click the "Community" tab
   - See what others are sharing
   - Feed filters automatically by selected animal

4. **Vote on Posts**
   - 👍 Thumbs up if the interpretation seems accurate
   - 👎 Thumbs down if it doesn't seem right
   - Click again to remove your vote
   - Switch votes anytime

5. **Switch Animals**
   - Use the dropdown in the top-left
   - Community feed updates to show that animal's posts

## 🎨 Features

### Community Feed
- **Score badges** show net votes (upvotes - downvotes)
- **Time stamps** show "just now", "5m ago", "2h ago", etc.
- **Confidence scores** from the original analysis
- **Auto-refresh** every 30 seconds

### Voting System
- **Visual feedback**: Buttons highlight when you vote
- **Real-time counts**: See vote counts update
- **Toggle voting**: Click same button to remove vote
- **Persistent**: Your votes persist across page reloads

### Post Management
- **Delete button** (trash icon) on every post
- **Permission checking**: Only delete your own posts
- **Instant updates**: Feed refreshes after deletion

## 🔧 Technical Details

### API Endpoints
- `POST /api/posts` - Create a post
- `GET /api/posts?animal={animal}` - Get filtered posts
- `POST /api/posts/:id/vote` - Vote on a post
- `DELETE /api/posts/:id` - Delete your post

### Anonymous Users
Uses cookie-based anonymous IDs (format: `anon_{timestamp}_{random}`)
- No login required
- Votes and posts tied to browser
- Cookie lasts 1 year

### Storage
Currently uses **in-memory storage** for development:
- All posts reset on server restart
- Fast and simple for testing
- Ready to migrate to PostgreSQL (schema already defined)

## 📱 Try It Out

1. **Server is running** on http://localhost:5000
2. **Open multiple browser windows** to simulate different users
3. **Share a post** from one window
4. **See it appear** in the other window (within 30 seconds)
5. **Vote from different browsers** to see real-time updates

## 🌍 Localization

Fully supports English and Chinese:
- Toggle language in top-right
- All social features translate automatically
- Includes time formats and UI text

## 📦 What Was Added

### New Files:
- `client/src/components/CommunityFeed.tsx` - Community feed component
- `SOCIAL_FEATURES.md` - Detailed documentation
- `SOCIAL_FEATURES_QUICKSTART.md` - This file

### Modified Files:
- `shared/schema.ts` - Added posts and votes tables
- `server/storage.ts` - Added social data methods
- `server/routes.ts` - Added social API endpoints
- `server/index.ts` - Added cookie-parser middleware
- `client/src/components/TranslationResult.tsx` - Added share button
- `client/src/pages/Home.tsx` - Added Community tab

### Dependencies Added:
- `cookie-parser` - For anonymous user tracking
- `@types/cookie-parser` - TypeScript definitions

## 🎯 Next Steps

### Ready for Production?
1. Set up PostgreSQL database
2. Run `npm run db:push` to create tables
3. Update `server/storage.ts` to use Drizzle ORM
4. Consider adding user authentication
5. Add rate limiting to prevent spam

### Want More Features?
See [SOCIAL_FEATURES.md](./SOCIAL_FEATURES.md) for ideas:
- Comments on posts
- User profiles
- Audio playback
- Trending interpretations
- Search and filtering
- Notifications

## 🐛 Troubleshooting

**Q: Posts disappear when I restart the server**
A: That's expected! In-memory storage clears on restart. Migrate to PostgreSQL for persistence.

**Q: I can't delete someone else's post**
A: Correct! Users can only delete their own posts for safety.

**Q: Feed not updating**
A: Auto-refresh is every 30 seconds. Manually refresh by switching tabs or clicking away and back.

**Q: My votes don't show after browser restart**
A: Check if cookies are enabled. Anonymous ID is stored in a cookie.

## 🎨 Customization

### Change Refresh Rate
In `CommunityFeed.tsx`, line 116:
```typescript
refetchInterval: 30000, // Change to 10000 for 10 seconds
```

### Change Vote Colors
In `CommunityFeed.tsx`, modify Button variants and Badge colors.

### Add More Animals
1. Update Animal type in `Home.tsx`
2. Add to ANIMALS array
3. Add mascot image
4. Community feed automatically supports it!

---

Enjoy your new social features! 🎊
