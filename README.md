# EduTrack — Smart Study Management Dashboard

EduTrack is a **React + Firebase** powered web app that helps students manage study tasks, log study time, track academic marks, and stay organized — all in one dashboard with a clean and intuitive dark-themed UI.

[**Live Demo**](https://edutrack-dfbe3.web.app/)

---

## Features

- **Authentication**: Secure Email/Password login with Firebase Auth.
- **Task Management**: Realtime Add, Complete, and Delete tasks.
- **Pomodoro Timer**: Circular progress timer with Focus, Short Break, and Long Break modes.
- **AI Study Assistant**: Chat-like interface to clarify doubts using Groq AI (Llama 3).
- **Marks Tracker**: Log and track grades per subject.
- **Study Analytics**: Visualize study time with interactive charts (Weekly/Monthly/Yearly).
- **Responsive Design**: Mobile-friendly layout with glassmorphism UI.

---

## Tech Stack

| Layer    | Tools                            |
| -------- | -------------------------------- |
| Frontend | React + Vite                     |
| Backend  | Firebase (Auth + Firestore)      |
| Styling  | CSS Modules + Custom Dark Theme  |
| Database | Cloud Firestore (NoSQL)          |
| AI       | Groq API (Llama 3)               |
| Icons    | FontAwesome                      |

---

## Project Structure

```
src/
├── components/
│   ├── AIStudyAssistant/    # AI Chat Interface
│   ├── Auth/                # Login/Signup Pages
│   ├── Dashboard/           # Main Dashboard View
│   ├── PomodoroTimer/       # Study Timer
│   └── StudyTimeAnalytics/  # Charts & Graphs
├── services/
│   └── aiAssistant.js       # AI API Service
├── App.jsx                  # Main Router
├── firebase.js              # Firebase Config
└── index.css                # Global Styles & Theme
```

---

## Getting Started

### 1. Clone the Repo

```bash
git clone https://github.com/Devika-Sajeesh/EduTrack.git
cd EduTrack
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Firebase Configuration

* Go to [Firebase Console](https://console.firebase.google.com/)
* Create a new project and enable **Firestore Database** and **Authentication**.
* Create a `.env` file in the root directory:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_GROQ_API_KEY=your_groq_api_key
```

### 4. Run Locally

```bash
npm run dev
```

Visit: [http://localhost:5173](http://localhost:5173)

---

## Deployment

EduTrack is configured for **Firebase Hosting**.

1. **Build the project**:
   ```bash
   npm run build
   ```

2. **Initialize Hosting** (if not done):
   ```bash
   firebase init hosting
   # Select your project
   # Public directory: dist
   # Configure as SPA: Yes
   ```

3. **Deploy**:
   ```bash
   firebase deploy --only hosting
   ```

---

## Contributing

1. Fork the repo
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

**Built with React & Firebase**
