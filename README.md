# ZenFocus - AI-Powered Focus & Productivity Tracker

![ZenFocus](https://img.shields.io/badge/ZenFocus-v1.0.0-green)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![License](https://img.shields.io/badge/License-MIT-yellow)

A privacy-first, AI-powered focus tracking web application that helps you understand and improve your productivity through computer vision and LLM-assisted insights.

## ✨ Features

### 🎯 Core Functionality
- **Real-time Focus Detection** - Uses MediaPipe for local face/pose analysis
- **Privacy-First Architecture** - All video processing happens in your browser
- **Smart State Classification** - Detects Focused, Distracted, Idle, Sleeping, and Away states
- **Session Tracking** - Comprehensive session data with timeline visualization

### 📊 Analytics & Insights
- **Focus Timeline** - Visual representation of your focus patterns
- **Weekly/Monthly Trends** - Track your productivity over time
- **Peak Hours Heatmap** - Discover when you focus best
- **Distraction Analysis** - Understand what breaks your focus
- **AI-Generated Insights** - Personalized tips and observations

### 🎨 Premium UI/UX
- **Calming Design** - Soft gradients, glassmorphism, sage/cream palette
- **Smooth Animations** - Framer Motion powered micro-interactions
- **Dark Mode** - Easy on the eyes for late-night sessions
- **Mobile Responsive** - Works seamlessly on all devices

### 🔒 Privacy & Security
- **No Video Upload** - Camera feed never leaves your device
- **Local Processing** - MediaPipe runs entirely in browser
- **Explicit Consent** - Camera permission requested each session
- **Data Control** - Export or delete your data anytime

## 🚀 Getting Started

### Prerequisites
- Node.js 18.x or higher
- npm or yarn
- Modern browser with webcam access

### Installation

1. Clone or navigate to the project:
```bash
cd zenfocus
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
# Edit .env.local with your Firebase credentials
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🛠️ Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Custom Design System
- **State**: Zustand
- **Animations**: Framer Motion
- **AI/CV**: MediaPipe (Face Landmarker)
- **Backend**: Firebase (Auth, Firestore)
- **Icons**: Lucide React

## 📁 Project Structure

```
zenfocus/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── page.tsx           # Dashboard
│   │   ├── focus/             # Focus session page
│   │   ├── analytics/         # Analytics page
│   │   └── settings/          # Settings page
│   ├── components/            # React components
│   │   ├── Dashboard.tsx      # Main dashboard
│   │   ├── FocusSession.tsx   # Active session UI
│   │   ├── Analytics.tsx      # Analytics & charts
│   │   ├── Settings.tsx       # User settings
│   │   ├── Navigation.tsx     # Nav bar
│   │   └── ...               # Other components
│   ├── lib/                   # Utilities & config
│   │   ├── firebase.ts        # Firebase config
│   │   ├── visionProcessor.ts # MediaPipe integration
│   │   └── types.ts           # TypeScript types
│   └── store/                 # Zustand stores
│       ├── sessionStore.ts    # Session state
│       └── userStore.ts       # User state
├── public/                    # Static assets
└── ...
```

## 🔥 Firebase Setup

1. Create a new Firebase project at [Firebase Console](https://console.firebase.google.com)
2. Enable Authentication (Email/Password and Google)
3. Create a Firestore database
4. Copy your web app config to `.env.local`

### Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /sessions/{sessionId} {
      allow read, write: if request.auth != null && 
        resource.data.userId == request.auth.uid;
    }
  }
}
```

## 🤖 AI/CV Pipeline

1. **Input**: Webcam stream @ ~10 FPS
2. **Face Detection**: MediaPipe Face Landmarker
3. **Feature Extraction**: Eye blink, gaze direction, head pose
4. **State Classification**: Heuristic-based with confidence scoring
5. **Smoothing**: State buffer for stable predictions
6. **Output**: Focus state updates to UI

## 🎯 Roadmap

- [ ] Multi-device sync
- [ ] Team/Study group mode
- [ ] Calendar integration
- [ ] Ambient sounds
- [ ] Mobile app
- [ ] Browser extension

## 📄 License

MIT License - feel free to use this for personal or commercial projects.

## 💚 Credits

Built with love for mindful productivity.

---

**Start focusing. Stay present. Achieve more.**
