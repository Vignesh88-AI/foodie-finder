# 🍽️ Dishcovery

> **Find, explore, and cook meals you love — powered by AI, real recipe data, and your taste.**

A full-stack recipe discovery app built as an internship project. Search thousands of dishes from 37 world cuisines, get AI-powered cooking help from Chef Dish, track calories, find restaurants nearby, and save your favourite meals — all in one place.

**Live demo:** `https://foodie-finder-ten-eta.vercel.app`

---

## Features

### 🔍 Recipe Discovery
- Search **thousands of recipes** by name — finds chole bhature, hyderabadi biryani, pad thai, anything
- Filter by **37 world cuisines** with searchable dropdown (Indian, Italian, Korean, Moroccan, Filipino...)
- Filter by **diet/type** — Vegetarian, Vegan, Chicken, Seafood, Dessert, Pasta
- **Meal of the Day** banner — fresh daily featured meal, cached in localStorage
- **Search history** — last 5 searches saved, click to re-run instantly
- **Load More** pagination — powered by Spoonacular (750,000+ recipes)
- **AI fallback** — when search returns 0 results, Chef Dish describes the dish and links to YouTube
- Powered by **Spoonacular API** (primary) → **MealDB** (fallback)

### 🃏 Meal Cards
- **Veg / Non-Veg** detection using ingredient analysis + category matching
- Calorie count badge on every Spoonacular result
- Smooth hover animations with image zoom
- Heart button to save/unsave with real-time Firestore sync

### 📖 Meal Details
- Full **ingredients list with thumbnail photos** for each ingredient
- **Interactive checkboxes** — tick off ingredients as you gather them
- **Numbered step-by-step instructions** with orange step numbers
- **YouTube video embedded** directly in the page — no external redirect
- **🔥 Calorie & Nutrition Facts** — powered by USDA FoodData Central (free, no signup)
  - Calories, Protein, Carbs, Fat in coloured pills with progress bars
  - Adjustable servings — tap +/− to rescale all numbers instantly
  - Per-ingredient calorie breakdown (collapsible)
  - Fiber and Sodium secondary stats
- **Similar meals** grid at the bottom (same category)
- Save to favourites with Firestore sync

### 👨‍🍳 Chef Dish — AI Cooking Assistant
- Powered by **Groq AI** (llama3-8b-8192 — fast and free)
- **Knows your saved meals** — fetched from Firestore, injected into system prompt
- Full chef personality — warm, opinionated, uses cooking metaphors
- Ask: recipes, substitutions, "my food is too spicy", "what can I cook with chicken and rice?"
- **Chat history saved** — last 50 messages restored on next visit
- **5 session history** — save and restore past conversations
- Safe markdown rendering — no XSS risk
- **Groq API key secured on backend** — never exposed to browser

### ❤️ Favourites
- All saved meals sorted newest first
- Skeleton loading cards while fetching
- Category and cuisine info per card

### 👤 Profile
- Cartoon food avatars (Ramen, Pizza, Sushi, Burger, Biryani, Taco...)
- Edit display name inline
- Change password with re-authentication
- **Achievement badges** — 🌍 Explorer (joined), ❤️ Food Lover (5+ saved), 🍳 Chef (20+ saved)
- Stat pills showing saved meal count

### 📍 Nearby Places
- Find restaurants, cafés, bakeries, fast food, ice cream near you
- Powered by **OpenStreetMap + Overpass API** — completely free, no key needed
- Auto-requests location on page load
- Adjustable search radius (500m – 8km)
- Distance, opening hours, directions per result card

### 🔒 Security & Performance
- Groq API key **never in frontend** — all AI calls go through backend
- **ErrorBoundary** — app never goes fully blank on errors
- **sessionStorage cache** — popular meals cached 10 minutes (no repeated API calls)
- **Skeleton loading** on Home and Favourites
- **PWA manifest** — installable on mobile home screen
- **404 page** for unknown routes

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite 5 |
| Styling | Tailwind CSS v3 |
| Animations | Framer Motion v11 |
| Routing | React Router v6 |
| Icons | React Icons v5 |
| Toasts | React Hot Toast |
| Auth + DB | Firebase v10 (Auth + Firestore) |
| Backend | Node.js + Express |
| Recipes | Spoonacular API + TheMealDB |
| AI Chat | Groq AI (llama3-8b-8192) |
| Nutrition | USDA FoodData Central |
| Maps | Leaflet.js + OpenStreetMap + Overpass |
| Hosting | Vercel (frontend) + Render (backend) |

---

## Project Structure

```
dishcovery-v5/
├── backend/
│   ├── server.js           ← Express API proxy + all backend routes
│   ├── .env.example        ← Copy to .env and fill in keys
│   └── package.json
│
├── frontend/
│   ├── public/
│   │   ├── manifest.json   ← PWA manifest (makes app installable)
│   │   └── favicon.svg
│   ├── src/
│   │   ├── components/
│   │   │   ├── ErrorBoundary.jsx   ← Catches React errors gracefully
│   │   │   ├── FoodAvatar.jsx      ← 10 cartoon SVG food avatars
│   │   │   ├── MealCard.jsx        ← Recipe card with veg detection
│   │   │   ├── Navbar.jsx          ← Sticky nav + mobile menu + profile dropdown
│   │   │   └── SkeletonCard.jsx    ← Shimmer placeholder while loading
│   │   ├── pages/
│   │   │   ├── Landing.jsx         ← Public landing page
│   │   │   ├── Login.jsx           ← Firebase email/password login
│   │   │   ├── Signup.jsx          ← Account creation
│   │   │   ├── Home.jsx            ← Search, filter, results grid
│   │   │   ├── MealDetails.jsx     ← Full recipe + nutrition + video
│   │   │   ├── Favorites.jsx       ← Saved meals collection
│   │   │   ├── Chatbot.jsx         ← Chef Dish AI assistant
│   │   │   ├── Nearby.jsx          ← Map + nearby food places
│   │   │   ├── Profile.jsx         ← User profile + settings + badges
│   │   │   └── NotFound.jsx        ← 404 page
│   │   ├── firebase.js             ← Firebase config (fill in your keys)
│   │   ├── App.jsx                 ← Routes + auth guard + ErrorBoundary
│   │   ├── main.jsx
│   │   └── index.css               ← Tailwind base + custom utilities
│   ├── .env.example
│   ├── index.html
│   └── package.json
│
└── firestore.rules         ← Security rules for Firestore
```

---

## Backend API Routes

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/health` | Health check — shows which APIs are configured |
| GET | `/api/popular` | Popular meals mix from 10 cuisines (MealDB) |
| GET | `/api/search?q=` | Search meals by name (MealDB) |
| GET | `/api/meal/:id` | Full meal details by ID (MealDB) |
| GET | `/api/filter?a=&c=` | Filter by area or category (MealDB) |
| GET | `/api/spoon/search?q=` | Search recipes — primary (Spoonacular) |
| GET | `/api/spoon/cuisine?cuisine=` | Browse by cuisine (Spoonacular) |
| GET | `/api/spoon/recipe/:id` | Full recipe details (Spoonacular) |
| POST | `/api/chat` | AI chat — Groq key secured server-side |
| POST | `/api/suggest` | AI dish suggestion when search fails |
| POST | `/api/nutrition` | Calorie lookup — USDA FoodData Central |

---

## Local Setup

### Prerequisites
- Node.js 18+
- A Firebase project
- Free API keys (see below — takes ~5 minutes total)

### 1. Clone the repo
```bash
git clone https://github.com/your-username/dishcovery-v5.git
cd dishcovery-v5
```

### 2. Backend setup
```bash
cd backend
npm install
cp .env.example .env
# Fill in your API keys (see section below)
npm run dev
# ✅ Server running on http://localhost:5000
```

### 3. Frontend setup
```bash
cd frontend
npm install
cp .env.example .env
# Set VITE_API_URL=http://localhost:5000
# Fill in your Firebase config
npm run dev
# ✅ App running on http://localhost:5173
```

### 4. Firebase setup
1. Go to [firebase.google.com](https://firebase.google.com) → create a new project
2. Enable **Authentication** → Email/Password provider
3. Enable **Firestore Database** → Start in test mode
4. Go to **Project Settings** → Add a web app → copy the `firebaseConfig` object
5. Paste it into `frontend/src/firebase.js` replacing the placeholder values
6. Go to **Firestore → Rules** tab → paste contents of `firestore.rules` → click **Publish**

---

## API Keys — All Free

| API | Free Tier | How to get |
|-----|-----------|------------|
| **Spoonacular** | 150 points/day | [spoonacular.com/food-api](https://spoonacular.com/food-api) → Start for Free |
| **Groq AI** | 14,400 requests/day | [console.groq.com](https://console.groq.com) → Create API Key |
| **USDA FoodData** | 1,000 req/hr | No signup needed — `DEMO_KEY` works out of the box |
| **Firebase** | Generous free tier | [firebase.google.com](https://firebase.google.com) |
| **MealDB** | Unlimited | No key needed |
| **OpenStreetMap** | Unlimited | No key needed |

### `backend/.env`
```env
PORT=5000
MEALDB_BASE_URL=https://www.themealdb.com/api/json/v1/1

# Primary recipe search
SPOONACULAR_API_KEY=your_spoonacular_key

# Chef Dish AI chatbot — NEVER put this in frontend/.env
GROQ_API_KEY=your_groq_key

# Nutrition calculator — DEMO_KEY works with no signup
USDA_API_KEY=DEMO_KEY
```

### `frontend/.env`
```env
VITE_API_URL=http://localhost:5000

# Firebase — get from Firebase Console → Project Settings → Your web app
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

---

## Deployment

### Frontend → Vercel
```bash
# 1. Push to GitHub
# 2. Import repo at vercel.com
# 3. Set Root Directory: frontend
# 4. Add all VITE_ environment variables
# 5. Deploy
```

### Backend → Render
```bash
# 1. Create Web Service at render.com
# 2. Connect your GitHub repo
# 3. Root Directory: backend
# 4. Build Command: npm install
# 5. Start Command: node server.js
# 6. Add env vars: SPOONACULAR_API_KEY, GROQ_API_KEY, USDA_API_KEY
# 7. Deploy — copy the URL and set as VITE_API_URL in Vercel
```

---

## Issues Fixed in v5

All 32 issues from the original codebase resolved, plus additional runtime bugs:

**🔴 Critical**
- Groq API key moved to backend — never exposed in browser bundle
- XSS fixed — SafeMarkdown component replaces `dangerouslySetInnerHTML`
- Nearby page crash fixed (`placeType` state variable mismatch)

**🟡 Important**
- Favorites back button navigates to `/home` not landing page
- All MealDB calls routed through backend consistently
- Popular meals cached in sessionStorage (10 min, no repeat calls)
- ErrorBoundary wraps all routes — app never goes fully blank
- Skeleton loading cards on Home and Favorites
- 404 NotFound page for all unknown routes

**🟢 Features & Improvements**
- YouTube video embedded inline, ingredient checkboxes, numbered steps
- Meal of the Day banner, search history, AI fallback for no-results
- PWA manifest (installable), all 37 cuisines, searchable dropdown
- USDA calorie calculator with adjustable servings and breakdown
- Chef Dish knows user's saved meals, chat history persisted
- Achievement badges, profile stat pills, similar meals section
- Navbar dropdown "View →" button, ingredient thumbnail images

**Runtime bugs fixed**
- Search history chips fake-event bug
- Favorites empty-state flash before data loads
- Chef Dish system prompt was sliced off before sending (personality broken)
- Nearby Overpass API 15-second timeout with friendly error

---

*Dishcovery v5 — Built by Vignesh Barik as a full-stack internship project*
