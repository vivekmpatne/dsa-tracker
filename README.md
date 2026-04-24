# ⚡ DSA Grind Tracker

A full-stack personal tracker for Kumar K's Pro Batch — 720 sessions, 582 sheet questions, Phase 1 → Phase 2 → Offer.

---

## 📁 Project Structure

```
dsa-tracker/
├── backend/
│   ├── controllers/
│   │   ├── progressController.js
│   │   ├── weekendController.js
│   │   └── contestController.js
│   ├── models/
│   │   ├── DailyProgress.js
│   │   ├── WeekendWork.js
│   │   └── Contest.js
│   ├── routes/
│   │   ├── progress.js
│   │   ├── weekend.js
│   │   ├── contest.js
│   │   └── stats.js
│   ├── utils/
│   │   └── calculateTarget.js
│   ├── server.js
│   ├── package.json
│   ├── .env.example
│   └── render.yaml
│
└── frontend/
    ├── src/
    │   ├── pages/
    │   │   ├── Dashboard.jsx
    │   │   ├── DailyLog.jsx
    │   │   ├── WeekendLog.jsx
    │   │   ├── ContestLog.jsx
    │   │   └── History.jsx
    │   ├── components/
    │   │   ├── ProgressBar.jsx
    │   │   └── PhaseCard.jsx
    │   ├── utils/
    │   │   ├── api.js
    │   │   └── helpers.js
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── styles.css
    ├── index.html
    ├── vite.config.js
    ├── package.json
    ├── .env.example
    └── vercel.json
```

---

## 🚀 Local Setup (Step by Step)

### Step 1 — MongoDB Atlas (Free)

1. Go to https://cloud.mongodb.com
2. Create a free account → New Project → Free Cluster (M0)
3. Create DB user: username + password (save these)
4. Network Access → Add IP → Allow from anywhere (0.0.0.0/0)
5. Connect → Drivers → Copy connection string

It looks like:
```
mongodb+srv://vivek:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

Replace `<password>` with your actual password.

---

### Step 2 — Backend Setup

```bash
cd dsa-tracker/backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env
```

Edit `.env`:
```
MONGO_URI=mongodb+srv://vivek:yourpassword@cluster0.xxxxx.mongodb.net/dsa-tracker?retryWrites=true&w=majority
PORT=5000
FRONTEND_URL=http://localhost:5173
```

```bash
# Run backend
npm run dev
```

You should see:
```
✅ MongoDB connected
🚀 Server running on port 5000
```

Test it: open http://localhost:5000 → should show `{ "status": "DSA Tracker API running 🚀" }`

---

### Step 3 — Frontend Setup

```bash
cd dsa-tracker/frontend

# Install dependencies
npm install

# Create .env file
cp .env.example .env
```

`.env` should have:
```
VITE_API_URL=http://localhost:5000/api
```

```bash
# Run frontend
npm run dev
```

Open http://localhost:5173 → App is running!

---

## 🌐 Deployment

### Backend → Render (Free)

1. Push backend folder to GitHub
2. Go to https://render.com → New Web Service
3. Connect your GitHub repo
4. Settings:
   - Build command: `npm install`
   - Start command: `npm start`
   - Root directory: `backend`
5. Add Environment Variables:
   - `MONGO_URI` = your Atlas connection string
   - `FRONTEND_URL` = your Vercel URL (add after frontend deploy)
6. Deploy → Copy your Render URL (e.g. `https://dsa-tracker-backend.onrender.com`)

### Frontend → Vercel (Free)

1. Push frontend folder to GitHub
2. Go to https://vercel.com → New Project
3. Import your GitHub repo
4. Settings:
   - Root directory: `frontend`
   - Framework preset: Vite
5. Add Environment Variable:
   - `VITE_API_URL` = `https://your-render-url.onrender.com/api`
6. Deploy!

---

## 🔌 API Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| POST | /api/progress | Log/update daily progress |
| GET | /api/progress | Get all progress entries |
| GET | /api/progress/today | Get today's entry |
| GET | /api/progress/summary | Get aggregate totals |
| GET | /api/stats/dashboard | Full dashboard data |
| POST | /api/weekend | Log weekend work |
| GET | /api/weekend | Get weekend history |
| POST | /api/contest | Log a contest |
| GET | /api/contest | Get contest history |
| GET | /api/contest/stats | Contest aggregate stats |

---

## 🧠 Smart Target Logic

```js
calculateDailyTarget(dayType)

// Returns:
// normal  → { sessionsTarget: 2, questionsTarget: 2 }
// exam    → { sessionsTarget: 1, questionsTarget: 1 }
// holiday → { sessionsTarget: 4, questionsTarget: 4 }
```

ETA is calculated dynamically based on your average sessions per day.

---

## 📊 Features

- ✅ Smart daily targets (normal / exam / holiday)
- ✅ Phase 1 + Phase 2 progress tracking
- ✅ Auto ETA calculation
- ✅ Progress bars with animations
- ✅ Bar chart (target vs actual, last 7 days)
- ✅ Weekend MERN + project tracker
- ✅ Contest tracker (LC / CF / CC) with rating delta
- ✅ Full history view
- ✅ LocalStorage fallback (works offline)
- ✅ Dark theme, mobile-friendly

---

## 🎯 Your Goal

```
Phase 1 (348 sessions + 283 Qs) → Nov 2026
Phase 2 (372 sessions + 299 Qs) → May 2027
Projects + Resume              → Jun 2027
Referrals + Offers             → Jul 2027 🏆
```

---

