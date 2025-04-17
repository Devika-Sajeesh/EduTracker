# 📘 StudyTracker

A **personal study management dashboard** built with **React** and **Firebase**.  
StudyTracker helps students log their tasks, track marks, record study time, and visualize progress — all in one clean UI.

---

## 🚀 Features

✅ Firebase Authentication  
✅ Role-based dashboard (currently for Students)  
✅ Realtime task management (add, complete, delete)  
✅ Study time logging with timestamps  
✅ Marks tracking per subject  
✅ Firestore integration with live listeners  
✅ Responsive UI with a fixed sidebar  
✅ Clean component architecture

---

## 🛠️ Tech Stack

| Layer    | Tools                         |
| -------- | ----------------------------- |
| Frontend | React + Vite + CSS Modules    |
| Backend  | Firebase (Auth + Firestore)   |
| Styling  | CSS3 (Custom Dashboard Theme) |
| Database | Cloud Firestore (NoSQL)       |

---

## 📂 Project Structure

```
src/
├── components/
│   └── Dashboard/
│       ├── Dashboard.jsx
│       └── Dashboard.css
|
├── firebase.js
├── App.jsx
├── main.jsx
└── index.css
```

---

## 🧪 Screenshots

## ⚙️ Installation

### 1. Clone the Repo

```bash
git clone https://github.com/Devika-Sajeesh/EduTracker.git
cd edu-tracker
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Firebase

Create a project in [Firebase Console](https://console.firebase.google.com) and enable:

- Firestore Database
- Email/Password Authentication

Then add your config to `.env`:

```env
VITE_FIREBASE_API_KEY=YOUR_API_KEY
VITE_FIREBASE_AUTH_DOMAIN=YOUR_PROJECT.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=YOUR_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET=YOUR_PROJECT.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=SENDER_ID
VITE_FIREBASE_APP_ID=APP_ID
```

> ✅ Also update `firebase.js` to read from `import.meta.env`.

---

### 4. Run the App

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🌐 Deployment

You can deploy this with **Firebase Hosting**:

```bash
npm run build
firebase login
firebase init hosting
firebase deploy
```

---

## 📌 To-Do / Improvements

- [ ] Add charts for weekly study time
- [ ] Add teacher/admin role support
- [ ] Add progress goals and gamification
- [ ] Add reminders and push notifications
- [ ] Add dark mode toggle

---

## 🤝 Contributing

1. Fork the repo
2. Create a new branch (`git checkout -b feature-xyz`)
3. Commit your changes
4. Push and open a Pull Request

---

## 📄 License

MIT License © 2025 [Devika Sajeesh](https://github.com/devika-sajeesh)
