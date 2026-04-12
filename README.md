# 🍽 Foodie Finder

A full-stack meal discovery web app built with React, Node.js, Firebase, and the MealDB API.

## Tech Stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| Frontend   | React 18 + Vite                     |
| Styling    | Tailwind CSS                        |
| Animation  | Framer Motion                       |
| Icons      | React Icons                         |
| Toasts     | React Hot Toast                     |
| Routing    | React Router v6                     |
| Auth + DB  | Firebase (Auth + Firestore)         |
| Backend    | Node.js + Express                   |
| Meals API  | TheMealDB (free, no key needed)     |

## Features

- Email/password authentication (Firebase Auth)
- Search meals by name or filter by category
- View full meal details — image, ingredients, instructions
- Save/unsave meals to personal favorites (Firestore)
- Live favorites count in navbar
- Responsive design — works on mobile and desktop
- Page animations and micro-interactions

## Project Structure

```
foodie-finder/
├── backend/
│   ├── server.js        ← Express API proxy for MealDB
│   ├── .env             ← PORT and API base URL
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Signup.jsx
│   │   │   ├── Home.jsx
│   │   │   ├── MealDetails.jsx
│   │   │   └── Favorites.jsx
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   └── MealCard.jsx
│   │   ├── firebase.js  ← Firebase config (fill in your keys)
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── .env             ← VITE_API_URL
│   └── package.json
│
├── firestore.rules      ← Paste this into Firebase Console → Firestore → Rules
└── .gitignore
```

## Setup Instructions

### 1. Clone the repo
```bash
git clone <your-repo-url>
cd foodie-finder
```

### 2. Backend setup
```bash
cd backend
npm install
# .env is already configured. Edit if needed.
npm run dev
# Server starts on http://localhost:5000
```

### 3. Frontend setup
```bash
cd frontend
npm install
npm run dev
# App starts on http://localhost:5173
```

### 4. Firebase setup

1. Go to [firebase.google.com](https://firebase.google.com) → create a project named `foodie-finder`
2. Enable **Authentication** → Email/Password
3. Enable **Firestore Database** → Start in test mode
4. Go to **Project Settings** → Add a web app → copy the `firebaseConfig` object
5. Paste it into `frontend/src/firebase.js` replacing the placeholder values
6. Go to **Firestore → Rules** tab → paste contents of `firestore.rules` → click **Publish**

### 5. Open the app

Visit `http://localhost:5173` — create an account and start exploring!

## Environment Variables

**backend/.env**
```
PORT=5000
MEALDB_BASE_URL=https://www.themealdb.com/api/json/v1/1
```

**frontend/.env**
```
VITE_API_URL=http://localhost:5000
```

---

Built as an internship project demonstrating full-stack development with React, Node.js, and Firebase.
