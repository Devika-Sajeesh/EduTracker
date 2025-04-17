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
import { getDoc } from "firebase/firestore";

/*Dashboard Function*/
export default function Dashboard() {
  const [userData, setUserData] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [studyTime, setStudyTime] = useState(0);
  const [marks, setMarks] = useState([]);
  const [newMark, setNewMark] = useState({ subject: "", score: 0 });

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

        //store student data
        if (data.role === "student") {
          loadStudentData(user.uid);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const loadStudentData = (userId) => {
    //-------------------add tasks---------------
    const tasksQuery = query(
      collection(db, "tasks"),
      where("userId", "==", userId),
      where("completed", "==", false)
    );

    const unsubscribeTasks = onSnapshot(tasksQuery, (snapshot) => {
      const taskList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        dueDate: doc.data().dueDate?.toDate()?.toLocaleDateString(),
      }));
      setTasks(taskList);
    });

    //-----------------add marks------------------------
    const marksQuery = query(
      collection(db, "marks"),
      where("userId", "==", userId)
    );

    const unsubscribeMarks = onSnapshot(marksQuery, (snapshot) => {
      const markList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMarks(markList);
    });

    return () => {
      unsubscribeTasks();
      unsubscribeMarks();
    };
  };

  //----------------tasks-----------------------
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

  //-------------------complete tasks--------------------------
  const completeTask = async (taskId) => {
    try {
      await updateDoc(doc(db, "tasks", taskId), {
        completed: true,
        completedAt: new Date(),
      });
    } catch (error) {
      console.error("Error completing task:", error);
    }
  };

  //------------------delete task-----------------------------
  const deleteTask = async (taskId) => {
    try {
      await deleteDoc(doc(db, "tasks", taskId));
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  //------------------add marks---------------------------
  const addMark = async (e) => {
    e.preventDefault();
    if (!newMark.subject.trim() || newMark.score < 0) return;

    try {
      await addDoc(collection(db, "marks"), {
        userId: auth.currentUser.uid,
        subject: newMark.subject,
        score: Number(newMark.score),
        date: new Date(),
        createdAt: new Date(),
      });
      setNewMark({ subject: "", score: 0 });
    } catch (error) {
      console.error("Error adding mark:", error);
    }
  };

  //---------------------delete marks-----------------------
  const deleteMark = async (markId) => {
    try {
      await deleteDoc(doc(db, "marks", markId));
    } catch (error) {
      console.error("Error deleting mark:", error);
    }
  };

  const logStudyTime = async () => {
    if (studyTime <= 0) return;

    try {
      await addDoc(collection(db, "studySessions"), {
        userId: auth.currentUser.uid,
        minutes: Number(studyTime),
        date: new Date(),
        createdAt: new Date(),
      });
      setStudyTime(0);
    } catch (error) {
      console.error("Error logging study time:", error);
    }
  };

  //---------------------ui--------------------------
  return (
    <div className="dashboard-container">
      {/*------------------------------- Sidebar----------------------------- */}
      {/* -------------------desires to add separate sections for each later---------*/}
      <aside className="sidebar">
        <div className="logo">
          <h1>EduTracker</h1>
        </div>
        <nav className="nav-menu">
          <ul>
            <li className="active">
              <a href="#">
                <i className="fas fa-home"></i> Dashboard
              </a>
            </li>
            <li>
              <a href="#tasks">
                <i className="fas fa-tasks"></i> My Tasks
              </a>
            </li>
            <li>
              <a href="#marks">
                <i className="fas fa-chart-line"></i> My Marks
              </a>
            </li>
            <li>
              <a href="#progress">
                <i className="fas fa-chart-bar"></i> My Progress
              </a>
            </li>
          </ul>
        </nav>
      </aside>

      {/* ---------------------Main content---------------------*/}
      <main className="main-content">
        {/* --------------Top Bar----------------------- */}
        <header className="top-bar">
          <div className="user-info">
            <div className="user-profile">
              <img
                src={userData?.photoURL || "https://placehold.co/40"}
                alt="User"
              />
              <span>{userData?.fullName || "Student"}</span>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="content-area">
          <section className="welcome-section">
            <h2>Welcome, {userData?.fullName || "Student"}!</h2>
            <p>Track your study tasks, deadlines, and progress.</p>
          </section>

          {/* Add New Task */}
          <section className="task-form">
            <h3>Add New Task</h3>
            <form onSubmit={addTask}>
              <input
                type="text"
                placeholder="Task description"
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                required
              />
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                required
              />
              <button type="submit">Add Task</button>
            </form>
          </section>

          {/* Current Tasks */}
          <section className="tasks-section">
            <h3>My Current Tasks ({tasks.length})</h3>
            {tasks.length > 0 ? (
              <ul className="task-list">
                {tasks.map((task) => (
                  <li key={task.id} className="task-item">
                    <div className="task-info">
                      <span className="task-title">{task.title}</span>
                      <span className="task-due">Due: {task.dueDate}</span>
                    </div>
                    <div className="task-actions">
                      <button
                        onClick={() => completeTask(task.id)}
                        className="complete-btn"
                      >
                        Complete
                      </button>
                      <button
                        onClick={() => deleteTask(task.id)}
                        className="delete-btn"
                      >
                        Delete
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="no-tasks">No current tasks. Add one above!</p>
            )}
          </section>

          {/* Study Time Tracking */}
          <section className="study-time">
            <h3>Log Study Time (minutes)</h3>
            <div className="study-form">
              <input
                type="number"
                min="1"
                value={studyTime}
                onChange={(e) => setStudyTime(e.target.value)}
                placeholder="Minutes studied"
              />
              <button onClick={logStudyTime}>Log Time</button>
            </div>
          </section>

          {/* Marks Tracking */}
          <section className="marks-section">
            <h3>My Marks</h3>
            <form onSubmit={addMark} className="mark-form">
              <input
                type="text"
                placeholder="Subject"
                value={newMark.subject}
                onChange={(e) =>
                  setNewMark({ ...newMark, subject: e.target.value })
                }
                required
              />
              <input
                type="number"
                min="0"
                max="100"
                placeholder="Score"
                value={newMark.score}
                onChange={(e) =>
                  setNewMark({ ...newMark, score: e.target.value })
                }
                required
              />
              <button type="submit">Add Mark</button>
            </form>

            {marks.length > 0 ? (
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
                  {marks.map((mark) => (
                    <tr key={mark.id}>
                      <td>{mark.subject}</td>
                      <td>{mark.score}%</td>
                      <td>
                        {mark.date?.toDate()?.toLocaleDateString() || "N/A"}
                      </td>
                      <td>
                        <button
                          onClick={() => deleteMark(mark.id)}
                          className="delete-btn"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="no-marks">No marks recorded yet.</p>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
