# 🎓 EduTrack — Your Personal Study Management Dashboard

EduTrack is a **React + Firebase** powered web app that helps students manage study tasks, log study time, track academic marks, and stay organized — all in one dashboard with a clean and intuitive UI.

---

## 🚀 Features

- 🔐 Firebase Authentication (Email/Password)  
- ✅ Realtime Task Management (Add, Complete, Delete)  
- ⏱️ Pomodoro Timer for focused study sessions  
- 🧠 AI Study Assistant (GPT-based)  
- 📊 Marks Tracker per Subject with timestamps  
- 🕒 Study Time Logger  
- 🔄 Live Firestore Sync using Listeners  
- 📱 Responsive Layout with Smooth Scrolling Navigation  
- 🎨 Custom Sidebar UI with FontAwesome Icons  

---

## 🛠️ Tech Stack

| Layer    | Tools                            |
| -------- | -------------------------------- |
| Frontend | React + Vite                     |
| Backend  | Firebase (Auth + Firestore)      |
| Styling  | CSS Modules + Custom Theme       |
| Database | Cloud Firestore (NoSQL)          |
| Icons    | FontAwesome                      |

---

## 📁 Project Structure

```

src/
├── components/
│   ├── AIStudyAssistant/
│   │   └── (AIStudyAssistant.jsx, AIStudyAssistant.css)
│   ├── Auth/
│   │   └── (Auth.jsx, Auth.css)
│   ├── Dashboard/
│   │   ├── Dashboard.jsx
│   │   └── Dashboard.css
│   ├── PomodoroTimer/
│   │   ├── PomodoroTimer.jsx
│   │   └── PomodoroTimer.css
│   └── ProtectedRoute.jsx
│
├── contexts/
│   └── (AuthContext.jsx)
│
├── services/
│   └── (aiAssistant.js)
│
├── App.jsx
├── App.css
├── firebase.js
├── index.css
├── main.jsx


````

---

## 📸 Screenshots

> _Add your UI screenshots here once your UI is stable_

---

## ⚙️ Getting Started

### 1️⃣ Clone the Repo

```bash
git clone https://github.com/Devika-Sajeesh/EduTrack.git
cd EduTrack
````

### 2️⃣ Install Dependencies

```bash
npm install
```

### 3️⃣ Firebase Configuration

* Go to [Firebase Console](https://console.firebase.google.com/)
* Create a new project
* Enable:

  * Firestore Database
  * Email/Password Authentication
* Grab your Firebase config and create a `.env` file in the root:

```env
VITE_FIREBASE_API_KEY=YOUR_API_KEY
VITE_FIREBASE_AUTH_DOMAIN=YOUR_PROJECT.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=YOUR_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET=YOUR_PROJECT.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=YOUR_SENDER_ID
VITE_FIREBASE_APP_ID=YOUR_APP_ID
```

Update `firebase.js` to read from `import.meta.env`.

---

### 4️⃣ Run the App Locally

```bash
npm run dev
```

Visit: [http://localhost:5173](http://localhost:5173)

---

## 🌍 Deploying EduTrack

You can deploy with Firebase Hosting:

```bash
npm run build
firebase login
firebase init hosting
firebase deploy
```

Make sure to choose the `dist/` folder as your build directory when prompted.

---

## 🧠 AI Study Assistant

The AI section of the dashboard connects to a GPT-based assistant (implementation assumed through your own backend or 3rd-party API).

> You can later integrate OpenAI's GPT API with a route like `/api/ask` and call it from the `AIStudyAssistant` component.

---

## 🔮 Future Enhancements

* [ ] Weekly/Monthly Charts (Study Time & Marks)
* [ ] Admin/Teacher Panel
* [ ] Progress Goals and Gamification System
* [ ] Push Notifications & Email Reminders
* [ ] Offline Support & Caching
* [ ] Dark Mode Toggle

---

## 🤝 Contributing

Want to make EduTrack better?

1. **Fork** this repo
2. Create a new branch: `git checkout -b feature-xyz`
3. Make your changes
4. Commit: `git commit -m "Add feature"`
5. Push: `git push origin feature-xyz`
6. **Open a Pull Request**

---

## 📄 License

MIT License © 2025 [Devika Sajeesh](https://github.com/devika-sajeesh)

---

**Built with ❤️ using React & Firebase**

```
