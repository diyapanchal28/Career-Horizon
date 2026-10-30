# Career Horizon 🎓🚀

> **Personalized Career Guidance, Interest Assessments, Interactive Learning Roadmaps & AI Career Assistant**

Career Horizon is a full-stack web application designed to empower students and professionals to discover their ideal career pathways through data-driven assessments, structured milestone roadmaps, progress tracking, and real-time personalized AI guidance powered by Google Gemini.

---

## 🌟 Key Features

1. **User Authentication & Profiles**: Secure JWT authentication, password encryption with bcrypt, profile customisation, and notification center.
2. **Career Interest Assessment**: Comprehensive multi-dimensional assessment evaluating user fields, subfields, work styles, and day-to-day activities.
3. **Transparent Recommendation Engine**: Deterministic, rule-based matching engine calculating exact match percentages without black-box bias.
4. **Interactive Career Roadmaps**: Step-by-step learning roadmaps with curated courses (Coursera, edX, Harvard, etc.), practical milestones, and real-time progress saving.
5. **Career Horizon AI Assistant**: Context-aware AI chatbot integrated with Google Gemini that understands the student's authentic assessment scores, provides career comparisons, answers roadmap questions, and guides decision-making.
6. **Chat Conversation History**: Full multi-turn conversation storage in MongoDB with user-scoped privacy and history management.
7. **Admin Dashboard**: Comprehensive administration suite for managing fields, subfields, career factsheets, roadmaps, and platform statistics.

---

## 🛠️ Technology Stack

- **Frontend**: React 19, Vite, React Router 7, Lucide Icons, Custom Design System (CSS variables & glassmorphism)
- **Backend**: Node.js 22, Express.js 5, Mongoose 9, JWT, Nodemailer
- **Database**: MongoDB (Local) / MongoDB Atlas (Cloud Production)
- **AI Integration**: Google Gemini API (`gemini-3-flash-preview` with automatic fallback cascade)
- **Deployment**: Vercel (Frontend SPA) + Render (Backend Web Service)

---

## 📁 Repository Structure

```text
Career-Horizon/
├── backend/
│   ├── controllers/         # Express controllers (auth, career, chatbot, etc.)
│   ├── middleware/          # Auth JWT & rate limiting middleware
│   ├── models/              # Mongoose database models
│   ├── routes/              # Express API routes
│   ├── services/            # AI & chatbot context orchestration services
│   ├── utils/               # Recommendation engine & email service
│   ├── migrateToAtlas.js    # 1-click MongoDB Atlas migration utility
│   ├── testAllScenarios.js  # Automated scenario test suite
│   ├── .env.example         # Environment template for backend
│   ├── server.js            # Main backend entry point
│   └── package.json
├── frontend/
│   ├── public/              # Static assets and icons
│   ├── src/
│   │   ├── components/      # UI components (Navbar, ChatbotWidget, etc.)
│   │   ├── config/          # Centralized dynamic API configuration
│   │   ├── context/         # Auth & Session React context
│   │   ├── pages/           # Application views (Dashboard, Roadmap, etc.)
│   │   ├── services/        # Frontend API service layer
│   │   ├── App.jsx          # Route declarations & global widgets
│   │   └── main.jsx
│   ├── vercel.json          # SPA rewrite rules for Vercel
│   ├── .env.example         # Environment template for frontend
│   └── package.json
└── README.md
```

---

## 💻 Local Development Setup

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher (v22 recommended)
- **MongoDB**: Local MongoDB community edition running on `mongodb://127.0.0.1:27017`
- **Google Gemini API Key**: Free API key from [Google AI Studio](https://aistudio.google.com/)

### 2. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
```

Configure your `.env` in `backend/`:
```env
MONGO_URI=mongodb://127.0.0.1:27017/career_horizon
PORT=5000
JWT_SECRET=your_jwt_secret_here
CLIENT_URL=http://localhost:5173
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-3-flash-preview
```

Run backend server:
```bash
npm run dev
```
*Backend runs on `http://localhost:5000` (Health check at `http://localhost:5000/api/health`).*

### 3. Frontend Setup
```bash
cd ../frontend
npm install
npm run dev
```
*Frontend runs on `http://localhost:5173`.*

---

## 🚀 Free Cloud Production Deployment

### Architecture Overview
```text
Browser (User Device)
       │
       ▼
Vercel (React Frontend) ───[HTTPS / REST]───► Render (Express Backend)
                                                      │
                            ┌─────────────────────────┴────────────────────────┐
                            ▼                                                  ▼
                   MongoDB Atlas (Database)                        Google Gemini API (AI)
```

---

### Step 1: MongoDB Atlas Setup & Data Migration

1. Create a free M0 cluster on [MongoDB Atlas](https://www.mongodb.com/atlas).
2. Under **Network Access**, add `0.0.0.0/0` (Allow access from anywhere).
3. Under **Database Access**, create a database user (e.g., `career_admin`).
4. Click **Connect** → **Drivers** and copy the connection string:
   `mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/career_horizon?retryWrites=true&w=majority`
5. Migrate your local database to Atlas in 1 command:
   ```bash
   cd backend
   node migrateToAtlas.js "your_mongodb_atlas_connection_string"
   ```

---

### Step 2: Render Backend Deployment

1. Sign up on [Render.com](https://render.com) using your GitHub account.
2. Click **New +** → **Web Service**.
3. Select your repository: `diyapanchal28/Career-Horizon`.
4. Configure the settings:
   - **Name**: `career-horizon-backend`
   - **Region**: Closest to you (e.g. Singapore or Frankfurt)
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Instance Type**: **Free**
5. Add Environment Variables:
   - `MONGO_URI`: `your_mongodb_atlas_connection_string`
   - `JWT_SECRET`: `your_secure_jwt_secret`
   - `GEMINI_API_KEY`: `your_gemini_api_key`
   - `GEMINI_MODEL`: `gemini-3-flash-preview`
   - `CLIENT_URL`: `https://your-app-name.vercel.app` (update after Step 3)
6. Click **Deploy Web Service**.
7. Once live, test `https://career-horizon-backend.onrender.com/api/health`.

---

### Step 3: Vercel Frontend Deployment

1. Sign up on [Vercel](https://vercel.com) using your GitHub account.
2. Click **Add New...** → **Project**.
3. Import `diyapanchal28/Career-Horizon`.
4. Configure project settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: Click Edit and select `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Add Environment Variable:
   - `VITE_API_URL`: `https://your-render-backend-url.onrender.com/api`
6. Click **Deploy**.

---

## 🔒 Security & Best Practices

- **Zero Exposed Secrets**: All sensitive keys (`JWT_SECRET`, `MONGO_URI`, `GEMINI_API_KEY`) reside exclusively in backend environment variables.
- **CORS Protection**: Whitelists only the production Vercel domain and local development ports.
- **Rate Limiting**: Throttles chat requests to protect against abuse and API quota exhaustion.
- **Safe Routing**: `frontend/vercel.json` ensures full Single Page Application routing across all refreshes.

---

## 🧪 Testing

Run backend tests and scenario validations:
```bash
cd backend
npm test
```
*Validates all 15 scenarios including career matching, roadmap progress inquiries, career comparisons, multi-turn conversations, authorization, and rate limiting.*

---

## 📜 License
This project is developed for academic and personal learning purposes.
