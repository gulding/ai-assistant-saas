# AI Secretary SaaS

An intelligent, persistent AI Secretary that lives in your browser as a Chrome Extension. It monitors your communications in the background, uses OpenAI to automatically draft responses to meeting requests, and notifies you for review before sending.

## 🏗️ Architecture

This project is built using a decoupled **Frontend (Chrome Extension)** and **Backend (FastAPI)** architecture to keep your AI keys secure and maintain a scalable database.

- **Frontend Client**: Manifest V3 Chrome Extension featuring a glassmorphic Side Panel UI.
- **Backend API**: Python FastAPI server utilizing SQLAlchemy (SQLite) and Pydantic.
- **AI Engine**: OpenAI API (`gpt-4o-mini`) for precise NLP extraction and email drafting.

## ✨ Features

- **Background Monitoring**: Service workers periodically check for incoming meetings/emails.
- **Automated Drafting**: Unstructured text is securely passed to the local backend, where OpenAI drafts a contextual, professional reply.
- **Native Notifications**: The extension triggers Chrome notifications when a new draft is ready, preventing automated, unreviewed sends.
- **Side Panel Interface**: A sleek UI for reviewing, approving, or dismissing pending AI-generated drafts.

## 🚀 Installation & Setup

### 1. Start the Backend API

The backend requires Python 3.9+ and your OpenAI API key.

```bash
# Clone the repository
git clone https://github.com/gulding/ai-assistant-saas.git
cd ai-assistant-saas/backend

# Set up a virtual environment
python -m venv venv

# Activate the virtual environment
# Windows:
.\venv\Scripts\Activate.ps1
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
pip install sqlalchemy
```

**Configure Environment Variables:**
Rename `.env.example` to `.env` and insert your OpenAI API key:
```env
OPENAI_API_KEY=your_actual_key_here
```

**Start the local server:**
```bash
uvicorn app.main:app --reload
```
*The backend will run on `http://localhost:8000`.*

### 2. Load the Chrome Extension

Since the extension interacts directly with your local backend, load it into Chrome via Developer Mode:

1. Open Google Chrome and navigate to `chrome://extensions/`.
2. Enable **Developer mode** in the top right corner.
3. Click **Load unpacked** in the top left corner.
4. Select the `extension/` folder located inside this repository.
5. **Pin** the AI Secretary extension icon to your browser toolbar for quick access.

## 🧪 Testing the Extension

1. Ensure the FastAPI backend is running.
2. Click the AI Secretary extension icon in your toolbar to open the Side Panel.
3. Click the **"Simulate Incoming Email"** button to trigger a mock meeting request.
4. Watch as the backend processes the request and triggers a native Chrome notification!
5. Review the generated draft inside the Side Panel and click **Approve & Send**.

---
*Built with modern web standards and AI workflows.*
