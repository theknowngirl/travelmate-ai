<div align="center">

# ✈️ TravelMate AI

### AI-Powered Travel Planning, Reimagined

**Plan your perfect trip with personalized itineraries, hotel picks, and budget breakdowns — all generated in seconds by Google Gemini.**

[![Live Demo](https://img.shields.io/badge/Live%20Demo-travelmate--ai--phi.vercel.app-0D9488?style=for-the-badge&logo=vercel)](https://travelmate-ai-phi.vercel.app)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=for-the-badge&logo=vite)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-06B6D4?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com)
[![Gemini](https://img.shields.io/badge/Gemini-2.5%20Flash-4285F4?style=for-the-badge&logo=google)](https://ai.google.dev)

</div>

---

## ✨ Features

| Feature | Description |
|---|---|
| 🤖 **AI Trip Generator** | Fill in your destination, budget, interests, and travel style — Gemini builds a complete trip plan |
| 🗓️ **Day-by-Day Itinerary** | Detailed schedules with places, time estimates, ticket prices, and GPS coordinates |
| 🏨 **Hotel Recommendations** | Curated hotel picks with ratings, prices, and descriptions tailored to your budget |
| 💬 **AI Travel Chat** | Ask anything travel-related in a conversational interface powered by Gemini |
| 💰 **Budget Breakdown** | Estimated costs split by accommodation, food, transport, and activities |
| 📂 **My Trips** | All generated trips saved locally — browse and revisit anytime |
| 🔐 **Google Sign-In** | One-click authentication with Google OAuth 2.0 |
| 📍 **Place Photos** | Real photos fetched via Google Places API (New) |

---

## 🛠️ Tech Stack

- **Frontend** — React 19, React Router 7, Tailwind CSS 3
- **Build Tool** — Vite 5 (pinned; Vite 8 has a Windows DLL issue)
- **AI** — Google Gemini 2.5 Flash (`@google/generative-ai`)
- **Auth** — Google OAuth 2.0 (`@react-oauth/google`)
- **Places** — Google Places API (New)
- **UI** — Radix UI primitives, Lucide React icons, shadcn/ui components
- **Notifications** — Sonner
- **Storage** — Browser `localStorage` (no backend required)
- **Deployment** — Vercel

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Google Cloud project with the following APIs enabled:
  - **Gemini API** (via [Google AI Studio](https://aistudio.google.com/app/apikey))
  - **Places API (New)**
  - **OAuth 2.0** (Web application credentials)

### 1 — Clone & Install

```bash
git clone https://github.com/theknowngirl/travelmate-ai.git
cd travelmate-ai
npm install
```

### 2 — Configure Environment Variables

```bash
cp .env.example .env
```

Open `.env` and fill in your keys:

```env
VITE_GOOGLE_GEMINI_AI_APIKEY=your_gemini_api_key
VITE_GOOGLE_PLACE_APIKEY=your_google_places_api_key
VITE_GOOGLE_OAUTH_CLIENT_ID=your_oauth_client_id.apps.googleusercontent.com
VITE_ADMIN_EMAILS=your_email@example.com
```

> **Important:** All `VITE_` variables are baked into the bundle at build time and are visible in the browser. Never store secrets here — only public API keys.

### 3 — Configure Google OAuth

In [Google Cloud Console → APIs & Services → Credentials](https://console.cloud.google.com/apis/credentials), edit your OAuth 2.0 Client and add:

| Section | Value |
|---|---|
| Authorized JavaScript origins | `http://localhost:5173` |
| Authorized JavaScript origins | `https://your-production-url.vercel.app` |

### 4 — Run Locally

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

---

## 📁 Project Structure

```
src/
├── components/
│   ├── ui/               # Reusable shadcn/ui components
│   ├── ChatMessage.jsx   # Chat bubble component
│   ├── Header.jsx        # Navigation header
│   ├── ItineraryDay.jsx  # Day-by-day itinerary card
│   ├── PlaceCard.jsx     # Place card with photo & details
│   └── TripCard.jsx      # Trip summary card for My Trips
├── context/
│   └── AuthContext.jsx   # Google OAuth user state
├── pages/
│   ├── Home.jsx          # Landing page
│   ├── CreateTrip.jsx    # Trip preference form + AI generation
│   ├── TripView.jsx      # Full trip detail view
│   ├── Chat.jsx          # AI travel chat
│   ├── MyTrips.jsx       # Saved trips list
│   └── Admin.jsx         # API health dashboard
├── service/
│   ├── AIModal.jsx       # Gemini API integration
│   ├── GlobalApi.jsx     # Google Places API calls
│   └── firebaseConfig.jsx# localStorage trip persistence
└── main.jsx
```

---

## ☁️ Deploying to Vercel

### One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/theknowngirl/travelmate-ai)

### Manual Deploy via CLI

```bash
npm install -g vercel
vercel login

# Add environment variables
echo "your_gemini_key" | vercel env add VITE_GOOGLE_GEMINI_AI_APIKEY production
echo "your_places_key" | vercel env add VITE_GOOGLE_PLACE_APIKEY production
echo "your_oauth_id"   | vercel env add VITE_GOOGLE_OAUTH_CLIENT_ID production
echo "your@email.com"  | vercel env add VITE_ADMIN_EMAILS production

# Deploy
vercel --prod
```

> After deploying, add your Vercel URL (`https://your-app.vercel.app`) to the **Authorized JavaScript origins** in Google Cloud Console.

---

## 🔑 Environment Variables Reference

| Variable | Required | Description |
|---|---|---|
| `VITE_GOOGLE_GEMINI_AI_APIKEY` | ✅ | Gemini API key from [AI Studio](https://aistudio.google.com/app/apikey) |
| `VITE_GOOGLE_PLACE_APIKEY` | ✅ | Google Places API (New) key |
| `VITE_GOOGLE_OAUTH_CLIENT_ID` | ✅ | OAuth 2.0 Web Client ID |
| `VITE_ADMIN_EMAILS` | ⚙️ | Comma-separated emails that can access `/admin` |

---

## 📜 License

MIT © [theknowngirl](https://github.com/theknowngirl)
