# 🍽️ Dishcovery

> **Discover meals from every cuisine. Powered by AI. Completely free.**

Dishcovery is a full-stack recipe discovery web application built as an internship evaluation project. It goes far beyond the basic requirements — featuring AI-powered search fallback, calorie calculation, a real-time chatbot with personality, nearby restaurant finder, and a polished, animated UI.

---

## 🌐 Live Demo

**Frontend:** Deployed on Vercel  
**Backend:** Deployed on Render

---

## ✨ Features

### Core (Task Requirements)
- 🔐 **Authentication** — Email/password signup & login via Firebase Auth. Protected routes redirect unauthenticated users.
- 🔍 **Meal Search** — Search across 600+ meals from TheMealDB. Falls back to Spoonacular for broader coverage including Indian dishes.
- 🃏 **Meal Cards** — Responsive grid (2–4 per row). Each card shows image, name, cuisine, Veg/Non-Veg tag, and heart button.
- 📄 **Meal Details Page** — Full recipe with hero image, numbered instructions, ingredient checklist with thumbnails, YouTube embed, similar meals, and calorie info.
- ❤️ **Favourites** — Save/unsave meals. Stored in Firestore per user. Real-time sync across tabs.

### Beyond Requirements
- 🤖 **Chef Dish AI Chatbot** — Powered by Groq AI (Llama 3). Knows the user's saved meals. Has a real chef personality. Falls back gracefully when API key is not set. Saves last 5 chat sessions.
- 🔥 **Calorie Calculator** — Uses USDA FoodData Central (100% free, no signup needed). Shows total kcal, per-serving breakdown, protein, carbs, fat, and fiber per meal.
- 🌍 **All 37 Cuisines** — Full MealDB country list with flag emojis and searchable dropdown.
- 🧠 **AI No-Results Fallback** — When a dish isn't in the database (e.g. "chole bhature"), Groq AI generates a description, ingredients, and YouTube link instead of a dead-end error.
- 📍 **Nearby Places** — Find restaurants, cafés, bakeries near you using OpenStreetMap Overpass API and Leaflet maps. Completely free, no API key required.
- 👤 **Profile Page** — Editable display name, 10 cartoon food avatars, achievement badges (Explorer, Food Lover, Chef) that unlock based on activity.
- 💀 **Skeleton Loading** — Cards shimmer while loading instead of plain spinners.
- ⚠️ **Error Boundary** — App never crashes completely. Friendly fallback UI on errors.
- 🚫 **404 Page** — Custom "dish not found" page.
- 📱 **PWA Ready** — `manifest.json` included. Installable on mobile.

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | React 18 + Vite | UI framework and build tool |
| Styling | Tailwind CSS | Utility-first CSS |
| Animation | Framer Motion | Page transitions, card animations, micro-interactions |
| Icons | React Icons | UI icons throughout |
| Toasts | React Hot Toast | Success/error notifications |
| Routing | React Router v6 | Client-side navigation + protected routes |
| Auth | Firebase Authentication | Email/password login and signup |
| Database | Firebase Firestore | Real-time favourites storage per user |
| Backend | Node.js + Express | API proxy, keeps secret keys server-side |
| Meals | TheMealDB API | Primary meal database (free, no key) |
| Extended Search | Spoonacular API | Broader recipe search (optional) |
| AI Chatbot | Groq API (Llama 3) | Chef Dish AI assistant (server-side, free tier) |
| Calories | USDA FoodData Central | Nutrition data (free, government database) |
| Nearby | OpenStreetMap Overpass | Restaurant finder (free, no key) |
| Maps | Leaflet.js | Interactive map rendering |
| Geocoding | Nominatim | Reverse geocode user location (free) |

---

## 📁 Project Structure

```
dishcovery/
├── backend/
│   ├── server.js          ← Express API: MealDB proxy, Groq chat, USDA nutrition, Spoonacular
│   ├── .env.example       ← Copy to .env and fill in your keys
│   └── package.json
│
├── frontend/
│   ├── public/
│   │   ├── manifest.json  ← PWA manifest
│   │   └── favicon.svg
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Landing.jsx      ← Public home with animated hero + cuisine grid
│   │   │   ├── Login.jsx        ← Firebase email/password login
│   │   │   ├── Signup.jsx       ← Firebase registration
│   │   │   ├── Home.jsx         ← Search, filters (37 cuisines), meal grid, AI fallback
│   │   │   ├── MealDetails.jsx  ← Full recipe, ingredients, calories, YouTube, similar meals
│   │   │   ├── Favorites.jsx    ← Saved meals grid with real-time Firestore sync
│   │   │   ├── Chatbot.jsx      ← Chef Dish AI with history, favourites awareness, fallback
│   │   │   ├── Nearby.jsx       ← OpenStreetMap restaurant/café finder with Leaflet map
│   │   │   ├── Profile.jsx      ← Avatar picker, name edit, badges, password change
│   │   │   └── NotFound.jsx     ← Custom 404 page
│   │   ├── components/
│   │   │   ├── Navbar.jsx       ← Sticky nav with profile dropdown and favourites count
│   │   │   ├── MealCard.jsx     ← Reusable card with Veg/Non-Veg detection
│   │   │   ├── SkeletonCard.jsx ← Shimmer loading placeholder
│   │   │   ├── FoodAvatar.jsx   ← 10 cartoon food SVG avatars
│   │   │   └── ErrorBoundary.jsx← App-level error catch
│   │   ├── firebase.js    ← Firebase config (fill in your project keys)
│   │   ├── App.jsx        ← Routes, auth state, protected route wrapper
│   │   └── index.css      ← Tailwind + custom CSS variables
│   ├── .env.example
│   └── package.json
│
├── firestore.rules        ← Paste into Firebase Console → Firestore → Rules
└── .gitignore
```

---

## 🚀 Setup & Installation

### Prerequisites
- Node.js 18+ installed
- A Firebase project (free Spark plan)
- Optional: Groq API key (free at console.groq.com)
- Optional: Spoonacular API key (free tier at spoonacular.com)

### 1. Clone
```bash
git clone <your-repo-url>
cd dishcovery
```

### 2. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env and add your keys (see Environment Variables below)
npm run dev
# ✅ Server running on http://localhost:5000
```

### 3. Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env
# Set VITE_API_URL=http://localhost:5000
npm run dev
# ✅ App running on http://localhost:5173
```

### 4. Firebase Setup
1. Go to [firebase.google.com](https://firebase.google.com) → create a new project
2. Enable **Authentication** → Sign-in method → **Email/Password**
3. Enable **Firestore Database** → Start in **test mode**
4. Go to **Project Settings** → Add a **Web App** → copy the `firebaseConfig` object
5. Paste it into `frontend/src/firebase.js` replacing the placeholder values
6. Go to **Firestore → Rules** → paste the contents of `firestore.rules` → click **Publish**

### 5. Open the App
Visit `http://localhost:5173` → Sign up → Start exploring!

---

## 🔑 Environment Variables

### `backend/.env`
```env
PORT=5000
MEALDB_BASE_URL=https://www.themealdb.com/api/json/v1/1

# Optional — enables AI chatbot and no-results fallback
# Get free key at: console.groq.com
GROQ_API_KEY=your_groq_key_here

# Optional — enables broader recipe search
# Get free key at: spoonacular.com/food-api
SPOONACULAR_API_KEY=your_spoonacular_key_here

# Optional — enables detailed calorie breakdown (DEMO_KEY works with rate limits)
# Get free key at: fdc.nal.usda.gov/api-guide
USDA_API_KEY=DEMO_KEY
```

### `frontend/.env`
```env
VITE_API_URL=http://localhost:5000
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

---

## 🔒 Security Notes

- Groq API key is **never exposed to the browser** — all AI calls go through the Node.js backend
- Firebase API keys are safe to expose in frontend (they are restricted by Firebase security rules)
- Firestore rules ensure users can only read/write their own favourites

---

## 📦 Key Dependencies

**Frontend**
```
react 18, react-router-dom v6, firebase, framer-motion, tailwindcss, react-hot-toast, react-icons
```

**Backend**
```
express, cors, dotenv, nodemon (dev)
```

---

Built with ❤️ as an internship evaluation project — Dishcovery, 2026.
