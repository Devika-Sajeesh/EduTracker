import React, { useEffect, useState } from "react";
import { auth, db } from "../../firebase";
import "./Dashboard.css";
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
  query,
  where,
  onSnapshot,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { getDoc, serverTimestamp } from "firebase/firestore";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHome,
  faTasks,
  faChartLine,
  faChartBar,
  faCheck,
  faTrash,
  faPlus,
  faClock,
} from "@fortawesome/free-solid-svg-icons";
import PomodoroTimer from "../PomodoroTimer.jsx";
import AIStudyAssistant from "../AIStudyAssistant/AIStudyAssistant.jsx";

export default function Dashboard() {
  const [userData, setUserData] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [studyTime, setStudyTime] = useState("");
  const [marks, setMarks] = useState([]);
  const [newMark, setNewMark] = useState({ subject: "", score: "" });
  const [activeTab, setActiveTab] = useState("dashboard");
  const currentSubject =
    tasks[0]?.subject || marks[0]?.subject || "General Studies";

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        window.location.href = "/login";
        return;
      }

      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const data = userSnap.data();
        setUserData(data);
        loadStudentData(user.uid);
      }
    });

    return () => unsubscribe();
  }, []);

  const loadStudentData = (userId) => {
    const tasksQuery = query(
      collection(db, "tasks"),
      where("userId", "==", userId),
      where("completed", "==", false)
    );

    const unsubscribeTasks = onSnapshot(tasksQuery, (snapshot) => {
      const taskList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        dueDate: doc.data().dueDate?.toDate(),
      }));
      setTasks(taskList);
    });

    const marksQuery = query(
      collection(db, "marks"),
      where("userId", "==", userId)
    );

    const unsubscribeMarks = onSnapshot(marksQuery, (snapshot) => {
      const markList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date?.toDate(),
      }));
      setMarks(markList);
    });

    return () => {
      unsubscribeTasks();
      unsubscribeMarks();
    };
  };

  const addTask = async (e) => {
    e.preventDefault();
    if (!newTask.trim() || !dueDate) return;

    try {
      await addDoc(collection(db, "tasks"), {
        userId: auth.currentUser.uid,
        title: newTask,
        dueDate: new Date(dueDate),
        completed: false,
        createdAt: serverTimestamp(),
      });
      setNewTask("");
      setDueDate("");
    } catch (error) {
      console.error("Error adding task:", error);
    }
  };

  const completeTask = async (taskId) => {
    try {
      await updateDoc(doc(db, "tasks", taskId), {
        completed: true,
        completedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error completing task:", error);
    }
  };

  const deleteTask = async (taskId) => {
    try {
      await deleteDoc(doc(db, "tasks", taskId));
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  const addMark = async (e) => {
    e.preventDefault();
    if (
      !newMark.subject.trim() ||
      isNaN(newMark.score) ||
      newMark.score < 0 ||
      newMark.score > 100
    )
      return;

    try {
      await addDoc(collection(db, "marks"), {
        userId: auth.currentUser.uid,
        subject: newMark.subject,
        score: Number(newMark.score),
        date: serverTimestamp(),
        createdAt: serverTimestamp(),
      });
      setNewMark({ subject: "", score: "" });
    } catch (error) {
      console.error("Error adding mark:", error);
    }
  };

  const deleteMark = async (markId) => {
    try {
      await deleteDoc(doc(db, "marks", markId));
    } catch (error) {
      console.error("Error deleting mark:", error);
    }
  };

  const logStudyTime = async (e) => {
    e.preventDefault();
    if (!studyTime || isNaN(studyTime) || studyTime <= 0) return;

    try {
      await addDoc(collection(db, "studySessions"), {
        userId: auth.currentUser.uid,
        minutes: Number(studyTime),
        date: serverTimestamp(),
        createdAt: serverTimestamp(),
      });
      setStudyTime("");
    } catch (error) {
      console.error("Error logging study time:", error);
    }
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="dashboard-container">
      <aside className="sidebar">
        <div className="logo">
          <h1>EduTrack</h1>
        </div>
        <nav className="nav-menu">
          <ul>
            <li className={activeTab === "dashboard" ? "active" : ""}>
              <a href="#" onClick={() => setActiveTab("dashboard")}>
                <FontAwesomeIcon icon={faHome} /> Dashboard
              </a>
            </li>
            <li className={activeTab === "tasks" ? "active" : ""}>
              <a href="#tasks" onClick={() => setActiveTab("tasks")}>
                <FontAwesomeIcon icon={faTasks} /> My Tasks
              </a>
            </li>
            <li className={activeTab === "marks" ? "active" : ""}>
              <a href="#marks" onClick={() => setActiveTab("marks")}>
                <FontAwesomeIcon icon={faChartLine} /> My Marks
              </a>
            </li>
            <li className={activeTab === "progress" ? "active" : ""}>
              <a href="#progress" onClick={() => setActiveTab("progress")}>
                <FontAwesomeIcon icon={faChartBar} /> My Progress
              </a>
            </li>
          </ul>
        </nav>
      </aside>

      <main className="main-content">
        <header className="top-bar">
          <div className="user-profile">
            <img
              src={userData?.photoURL || "https://i.pravatar.cc/40"}
              alt="User"
              onError={(e) => {
                e.target.src = "https://i.pravatar.cc/40";
              }}
            />
            <span>{userData?.fullName || "Student"}</span>
          </div>
        </header>

        <div className="content-area">
          <section className="section welcome-section">
            <div className="section-header">
              <h2 className="section-title">
                Welcome, {userData?.fullName || "Student"}!
              </h2>
            </div>
            <p>Track your study tasks, deadlines, and academic progress.</p>
          </section>

          <section className="section">
            <div className="section-header">
              <h3 className="section-title">Add New Task</h3>
            </div>
            <form onSubmit={addTask} className="form-grid">
              <div className="form-group">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Task description"
                  value={newTask}
                  onChange={(e) => setNewTask(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <input
                  type="date"
                  className="form-control"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary">
                <FontAwesomeIcon icon={faPlus} /> Add Task
              </button>
            </form>
          </section>

          <section className="section">
            <div className="section-header">
              <h3 className="section-title">
                My Current Tasks ({tasks.length})
              </h3>
            </div>
            {tasks.length > 0 ? (
              <ul className="task-list">
                {tasks
                  .sort((a, b) => a.dueDate - b.dueDate)
                  .map((task) => (
                    <li key={task.id} className="task-item">
                      <div className="task-info">
                        <span className="task-title">{task.title}</span>
                        <span className="task-due">
                          Due: {formatDate(task.dueDate)}
                        </span>
                      </div>
                      <div className="task-actions">
                        <button
                          onClick={() => completeTask(task.id)}
                          className="btn btn-complete"
                        >
                          <FontAwesomeIcon icon={faCheck} /> Complete
                        </button>
                        <button
                          onClick={() => deleteTask(task.id)}
                          className="btn btn-delete"
                        >
                          <FontAwesomeIcon icon={faTrash} /> Delete
                        </button>
                      </div>
                    </li>
                  ))}
              </ul>
            ) : (
              <div className="empty-state">
                <p>No current tasks. Add one above!</p>
              </div>
            )}
          </section>
          <AIStudyAssistant subject={currentSubject} />

          <section className="section">
            <div className="section-header">
              <h3 className="section-title">Log Study Time</h3>
            </div>
            <form onSubmit={logStudyTime} className="form-grid">
              <div className="form-group">
                <input
                  type="number"
                  className="form-control"
                  min="1"
                  value={studyTime}
                  onChange={(e) => setStudyTime(e.target.value)}
                  placeholder="Minutes studied"
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary">
                <FontAwesomeIcon icon={faClock} /> Log Time
              </button>
            </form>
          </section>

          <section className="section">
            <div className="section-header">
              <h3 className="section-title">My Marks</h3>
            </div>
            <form onSubmit={addMark} className="form-grid">
              <div className="form-group">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Subject"
                  value={newMark.subject}
                  onChange={(e) =>
                    setNewMark({ ...newMark, subject: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <input
                  type="number"
                  className="form-control"
                  min="0"
                  max="100"
                  placeholder="Score (0-100)"
                  value={newMark.score}
                  onChange={(e) =>
                    setNewMark({ ...newMark, score: e.target.value })
                  }
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary">
                <FontAwesomeIcon icon={faPlus} /> Add Mark
              </button>
            </form>

            {marks.length > 0 ? (
              <div className="table-responsive">
                <table className="marks-table">
                  <thead>
                    <tr>
                      <th>Subject</th>
                      <th>Score</th>
                      <th>Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {marks
                      .sort((a, b) => b.date - a.date)
                      .map((mark) => (
                        <tr key={mark.id}>
                          <td>{mark.subject}</td>
                          <td>{mark.score}%</td>
                          <td>{formatDate(mark.date)}</td>
                          <td>
                            <button
                              onClick={() => deleteMark(mark.id)}
                              className="btn btn-delete"
                            >
                              <FontAwesomeIcon icon={faTrash} /> Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty-state">
                <p>No marks recorded yet.</p>
              </div>
            )}
          </section>
          <section className="section">
            <div className="section-header">
              <h3 className="section-title">Pomodoro Timer</h3>
            </div>
            <PomodoroTimer />
          </section>
        </div>
      </main>
    </div>
  );
}
