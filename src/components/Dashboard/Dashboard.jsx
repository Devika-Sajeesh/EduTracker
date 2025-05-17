import React, { useEffect, useState, useRef, useCallback } from "react";
import { auth, db } from "../../firebase";
import "./Dashboard.css";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
  query,
  where,
  onSnapshot,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";
import { onAuthStateChanged, signOut } from "firebase/auth";
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
  faRobot,
} from "@fortawesome/free-solid-svg-icons";
import PomodoroTimer from "../PomodoroTimer";
import AIStudyAssistant from "../AIStudyAssistant/AIStudyAssistant";
import { useNavigate } from "react-router-dom";
import StudyTimeChart from "../StudyTimeAnalytics/StudyTimeChart";

export default function Dashboard() {
  const [userData, setUserData] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [studyTime, setStudyTime] = useState("");
  const [marks, setMarks] = useState([]);
  const [newMark, setNewMark] = useState({ subject: "", score: "" });
  const [activeTab, setActiveTab] = useState("dashboard");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Refs for smooth scroll
  const dashboardRef = useRef(null);
  const tasksRef = useRef(null);
  const marksRef = useRef(null);
  const progressRef = useRef(null);
  const aiRef = useRef(null);
  const analyticsRef = useRef(null);

  const navigate = useNavigate();

  const formatDate = useCallback((date) => {
    if (!date) return "N/A";
    const dateObj = date instanceof Date ? date : date.toDate();
    return dateObj.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/");
    } catch (error) {
      console.error("Error signing out:", error);
      setError("Failed to logout. Please try again.");
    }
  };

  const scrollToSection = useCallback((ref) => {
    ref?.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const loadStudentData = useCallback((userId) => {
    setLoading(true);
    try {
      const tasksQuery = query(
        collection(db, "tasks"),
        where("userId", "==", userId),
        where("completed", "==", false)
      );

      const unsubscribeTasks = onSnapshot(
        tasksQuery,
        (snapshot) => {
          const taskList = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
            dueDate: doc.data().dueDate,
          }));
          setTasks(taskList);
          setLoading(false);
        },
        (error) => {
          console.error("Error loading tasks:", error);
          setError("Failed to load tasks.");
          setLoading(false);
        }
      );

      const marksQuery = query(
        collection(db, "marks"),
        where("userId", "==", userId)
      );

      const unsubscribeMarks = onSnapshot(
        marksQuery,
        (snapshot) => {
          const markList = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
            date: doc.data().date,
          }));
          setMarks(markList);
        },
        (error) => {
          console.error("Error loading marks:", error);
          setError("Failed to load marks.");
        }
      );

      return () => {
        unsubscribeTasks();
        unsubscribeMarks();
      };
    } catch (error) {
      console.error("Error setting up listeners:", error);
      setError("Failed to load data.");
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        navigate("/");
        return;
      }

      try {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          setUserData(userSnap.data());
          loadStudentData(user.uid);
        } else {
          setError("User data not found");
          setLoading(false);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        setError("Failed to load user data.");
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [navigate, loadStudentData]);

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
      setError("Failed to add task.");
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
      setError("Failed to complete task.");
    }
  };

  const deleteTask = async (taskId) => {
    try {
      await deleteDoc(doc(db, "tasks", taskId));
    } catch (error) {
      console.error("Error deleting task:", error);
      setError("Failed to delete task.");
    }
  };

  const addMark = async (e) => {
    e.preventDefault();
    if (
      !newMark.subject.trim() ||
      isNaN(newMark.score) ||
      newMark.score < 0 ||
      newMark.score > 100
    ) {
      setError("Please enter a valid subject and score (0-100)");
      return;
    }

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
      setError("Failed to add mark.");
    }
  };

  const deleteMark = async (markId) => {
    try {
      await deleteDoc(doc(db, "marks", markId));
    } catch (error) {
      console.error("Error deleting mark:", error);
      setError("Failed to delete mark.");
    }
  };

  const logStudyTime = async (e) => {
    e.preventDefault();
    if (!studyTime || isNaN(studyTime) || studyTime <= 0) {
      setError("Please enter a valid study time (minutes)");
      return;
    }

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
      setError("Failed to log study time.");
    }
  };

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  if (error) {
    return (
      <div className="error">
        {error}
        <button onClick={() => window.location.reload()}>Try Again</button>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <aside className="sidebar">
        <div className="logo">
          <h1>EduTrack</h1>
        </div>
        <nav className="nav-menu">
          <ul>
            <li className={activeTab === "dashboard" ? "active" : ""}>
              <button
                onClick={() => {
                  setActiveTab("dashboard");
                  scrollToSection(dashboardRef);
                }}
                className="nav-link"
              >
                <FontAwesomeIcon icon={faHome} /> Dashboard
              </button>
            </li>
            <li className={activeTab === "tasks" ? "active" : ""}>
              <button
                onClick={() => {
                  setActiveTab("tasks");
                  scrollToSection(tasksRef);
                }}
                className="nav-link"
              >
                <FontAwesomeIcon icon={faTasks} /> My Tasks
              </button>
            </li>
            <li className={activeTab === "marks" ? "active" : ""}>
              <button
                onClick={() => {
                  setActiveTab("marks");
                  scrollToSection(marksRef);
                }}
                className="nav-link"
              >
                <FontAwesomeIcon icon={faChartLine} /> My Marks
              </button>
            </li>
            <li className={activeTab === "analytics" ? "active" : ""}>
              <button
                onClick={() => {
                  setActiveTab("analytics");
                  scrollToSection(analyticsRef);
                }}
                className="nav-link"
              >
                <FontAwesomeIcon icon={faChartBar} /> Analytics
              </button>
            </li>
            <li className={activeTab === "ai" ? "active" : ""}>
              <button
                onClick={() => {
                  setActiveTab("ai");
                  scrollToSection(aiRef);
                }}
                className="nav-link"
              >
                <FontAwesomeIcon icon={faRobot} /> AI Help
              </button>
            </li>

            <li className={activeTab === "progress" ? "active" : ""}>
              <button
                onClick={() => {
                  setActiveTab("progress");
                  scrollToSection(progressRef);
                }}
                className="nav-link"
              >
                <FontAwesomeIcon icon={faClock} /> Pomodoro Timer
              </button>
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
              className="user-avatar"
            />
            <span className="user-name">{userData?.fullName || "Student"}</span>
            <button onClick={handleLogout} className="btn btn-logout">
              Logout
            </button>
          </div>
        </header>

        <div className="content-area">
          {error && <div className="alert alert-error">{error}</div>}

          <section className="section welcome-section" ref={dashboardRef}>
            <div className="section-header">
              <h2 className="section-title">
                Welcome, {userData?.fullName || "Student"}!
              </h2>
            </div>
            <p>Track your study tasks, deadlines, and academic progress.</p>
          </section>

          <section className="section" ref={tasksRef}>
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
                  min={new Date().toISOString().split("T")[0]}
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
                  .sort((a, b) => (a.dueDate || 0) - (b.dueDate || 0))
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
                          aria-label="Complete task"
                        >
                          <FontAwesomeIcon icon={faCheck} /> Complete
                        </button>
                        <button
                          onClick={() => deleteTask(task.id)}
                          className="btn btn-delete"
                          aria-label="Delete task"
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
          <section className="section" ref={analyticsRef}>
            <div className="section-header">
              <h3 className="section-title">Study Analytics</h3>
            </div>
            <StudyTimeChart userId={auth.currentUser?.uid} />
          </section>

          <section className="section" ref={aiRef}>
            <div className="section-header">
              <h3 className="section-title">AI Doubt Clarifier</h3>
            </div>
            <AIStudyAssistant />
          </section>

          <section className="section" ref={marksRef}>
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
                      .sort((a, b) => (b.date || 0) - (a.date || 0))
                      .map((mark) => (
                        <tr key={mark.id}>
                          <td>{mark.subject}</td>
                          <td>{mark.score}%</td>
                          <td>{formatDate(mark.date)}</td>
                          <td>
                            <button
                              onClick={() => deleteMark(mark.id)}
                              className="btn btn-delete"
                              aria-label="Delete mark"
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

          <section className="section" ref={progressRef}>
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
