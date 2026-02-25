# AI Era Academy - Production Setup Guide

## Project Structure
- `frontend/`: Next.js 14 App Router, Tailwind CSS, Framer Motion.
- `backend/`: FastAPI, SQLAlchemy, PostgreSQL, OpenAI.
- `docker-compose.yml`: Full stack orchestration.

## Prerequisites
- Docker & Docker Compose
- OpenAI API Key

## Setup Instructions

### 1. Environment Configuration
Create a `.env` file in the root directory:
```env
OPENAI_API_KEY=your_openai_api_key_here
```

### 2. Local Development

#### Backend:
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

#### Frontend:
```bash
cd frontend
npm install
npm run dev
```

### 3. Docker Deployment (Recommended)
```bash
docker-compose up --build
```

The platform will be available at:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs
