# Custom Website Chatbot (RAG Architecture)

A custom website chatbot powered by **FastAPI**, **Playwright**, **ChromaDB**, **BM25**, and **Groq (Llama-3.3-70b)** on the backend, paired with a React frontend built with Vite and Lucide icons.

---

## 🚀 Features

- **Automated Web Crawler**: Uses Playwright to extract content dynamically from target URLs.
- **Hybrid Vector & Keyword Search**: Combines ChromaDB vector embeddings with BM25 keyword matching for accurate retrieval.
- **Groq LLM Integration**: Powered by `llama-3.3-70b-versatile`.
- **Modern UI**: Full Dark/Light theme support, live progress console, and RAG diagnostic panel.

---

## 🛠 Local Setup & Running

### 1. Backend Setup

```bash
cd backend
python -m venv venv
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt
playwright install chromium

# Set environment variable in .env or shell
# GROQ_API_KEY=gsk_your_groq_api_key

python main.py
```

Backend will run on `http://127.0.0.1:8000`.

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend will run on `http://localhost:5173`.

---

## ☁️ Deployment on Render

This repository is pre-configured for **Render** using a Render Blueprint (`render.yaml`) or manual service creation.

### Option A: 1-Click Blueprint Deployment (Recommended)

1. Push your repository to **GitHub** or **GitLab**.
2. Log into [Render Dashboard](https://dashboard.render.com/).
3. Click **New +** -> **Blueprint**.
4. Connect your Git repository.
5. Render will automatically detect `render.yaml` and prompt you for the `GROQ_API_KEY` environment variable.
6. Click **Apply**. Render will automatically build and deploy both the Backend Docker Web Service and Frontend Static Site!

---

### Option B: Manual Service Deployment

#### 1. Backend Web Service (Docker)
- **Service Type**: Web Service
- **Environment**: Docker
- **Dockerfile Path**: `./backend/Dockerfile`
- **Docker Context**: `./backend`
- **Environment Variables**:
  - `GROQ_API_KEY`: `your_groq_api_key`

#### 2. Frontend Static Site
- **Service Type**: Static Site
- **Build Command**: `cd frontend && npm install && npm run build`
- **Publish Directory**: `./frontend/dist`
- **Rewrite Rules**: Add Rewrite Rule: `/*` -> `/index.html`
- **Environment Variables**:
  - `VITE_API_BASE_URL`: `https://<your-backend-name>.onrender.com`

---

## 📄 License
MIT
