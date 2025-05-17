import { useState, useEffect } from "react";
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  deleteDoc,
  updateDoc,
  doc,
} from "firebase/firestore";
import { db } from "../../firebase";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import "./StudyTimeChart.css";

export default function StudyTimeChart({ userId }) {
  const [sessions, setSessions] = useState([]); // raw Firestore data
  const [chartData, setChartData] = useState([]); // processed chart data
  const [timeRange, setTimeRange] = useState("week");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudyData();
  }, [userId, timeRange]);

  const fetchStudyData = async () => {
    setLoading(true);
    const now = new Date();
    let startDate = new Date();

    if (timeRange === "week") {
      startDate.setDate(now.getDate() - 7);
    } else if (timeRange === "month") {
      startDate.setMonth(now.getMonth() - 1);
    } else {
      startDate.setFullYear(now.getFullYear() - 1);
    }

    const q = query(
      collection(db, "studySessions"),
      where("userId", "==", userId),
      where("date", ">=", startDate),
      orderBy("date", "asc")
    );

    try {
      const querySnapshot = await getDocs(q);
      const fetchedSessions = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date.toDate(),
      }));

      setSessions(fetchedSessions);
      setChartData(processChartData(fetchedSessions, timeRange));
    } catch (err) {
      console.error("Failed to fetch study data:", err);
    }

    setLoading(false);
  };

  const processChartData = (sessions, range) => {
    const groupedData = {};

    sessions.forEach((session) => {
      const date = session.date;
      let key;

      if (range === "week") {
        key = date.toLocaleDateString("en-US", { weekday: "short" });
      } else if (range === "month") {
        key = date.getDate() + "/" + (date.getMonth() + 1);
      } else {
        key = date.toLocaleDateString("en-US", { month: "short" });
      }

      groupedData[key] = (groupedData[key] || 0) + session.minutes;
    });

    return Object.entries(groupedData).map(([name, minutes]) => ({
      name,
      minutes: Math.round((minutes / 60) * 10) / 10,
    }));
  };

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, "studySessions", id));
      const updatedSessions = sessions.filter((s) => s.id !== id);
      setSessions(updatedSessions);
      setChartData(processChartData(updatedSessions, timeRange));
    } catch (error) {
      console.error("Failed to delete study session:", error);
    }
  };

  const handleEdit = async (session) => {
    const newMinutes = prompt(
      "Enter new study time (in minutes):",
      session.minutes
    );

    if (!newMinutes || isNaN(newMinutes) || Number(newMinutes) <= 0) return;

    try {
      await updateDoc(doc(db, "studySessions", session.id), {
        minutes: Number(newMinutes),
      });

      const updatedSessions = sessions.map((s) =>
        s.id === session.id ? { ...s, minutes: Number(newMinutes) } : s
      );

      setSessions(updatedSessions);
      setChartData(processChartData(updatedSessions, timeRange));
    } catch (error) {
      console.error("Failed to update study session:", error);
    }
  };

  if (loading)
    return <div className="chart-loading">Loading chart data...</div>;

  return (
    <div className="chart-container">
      <div className="chart-controls">
        <button
          onClick={() => setTimeRange("week")}
          className={timeRange === "week" ? "active" : ""}
        >
          Weekly
        </button>
        <button
          onClick={() => setTimeRange("month")}
          className={timeRange === "month" ? "active" : ""}
        >
          Monthly
        </button>
        <button
          onClick={() => setTimeRange("year")}
          className={timeRange === "year" ? "active" : ""}
        >
          Yearly
        </button>
      </div>

      <div className="session-list">
        {sessions.map((session) => (
          <div key={session.id} className="session-item">
            <span>
              {session.date.toLocaleDateString("en-IN")}:{" "}
              {Math.round((session.minutes / 60) * 10) / 10} hours
            </span>
            <button onClick={() => handleEdit(session)}>Edit</button>
            <button onClick={() => handleDelete(session.id)}>Delete</button>
          </div>
        ))}
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis
            label={{ value: "Hours", angle: -90, position: "insideLeft" }}
          />
          <Tooltip formatter={(value) => [`${value} hours`, "Study Time"]} />
          <Legend />
          <Bar dataKey="minutes" fill="#8884d8" name="Study Time" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
