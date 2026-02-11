import React, { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlay,
  faPause,
  faRedo,
  faCheck,
} from "@fortawesome/free-solid-svg-icons";
import {
  doc,
  updateDoc,
  arrayUnion,
  serverTimestamp,
} from "firebase/firestore";
import { db, auth } from "../firebase";
import "./PomodoroTimer.css";

const PomodoroTimer = () => {
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState("pomodoro");
  const [cycles, setCycles] = useState(0);
  const [completedSessions, setCompletedSessions] = useState(0);

  const timerRef = useRef(null);
  const settings = {
    pomodoro: 25,
    shortBreak: 5,
    longBreak: 15,
  };

  const modeLabels = {
    pomodoro: "Focus Time",
    shortBreak: "Short Break",
    longBreak: "Long Break",
  };

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setSeconds(0);
    setMinutes(settings[mode]);
  };

  const switchMode = (newMode) => {
    setIsActive(false);
    setMode(newMode);
    setSeconds(0);
    setMinutes(settings[newMode]);
  };

  const saveSession = async () => {
    if (!auth.currentUser) return;

    try {
      const userRef = doc(db, "users", auth.currentUser.uid);
      await updateDoc(userRef, {
        studySessions: arrayUnion({
          type: mode,
          duration: settings[mode] * 60,
          completedAt: serverTimestamp(),
        }),
      });
    } catch (error) {
      console.error("Error saving session:", error);
    }
  };

  useEffect(() => {
    if (isActive) {
      timerRef.current = setInterval(() => {
        if (seconds > 0) {
          setSeconds(seconds - 1);
        } else if (minutes > 0) {
          setMinutes(minutes - 1);
          setSeconds(59);
        } else {
          clearInterval(timerRef.current);
          setIsActive(false);
          const audio = new Audio("public/sounds/timer-end.mp3");
          audio.play();

          if (mode === "pomodoro") {
            const newCycles = cycles + 1;
            setCycles(newCycles);
            setCompletedSessions(completedSessions + 1);
            saveSession();

            if (newCycles % 4 === 0) {
              switchMode("longBreak");
            } else {
              switchMode("shortBreak");
            }
          } else {
            switchMode("pomodoro");
          }
        }
      }, 1000);
    }

    return () => clearInterval(timerRef.current);
  }, [isActive, minutes, seconds, mode]);

  const formatTime = () => {
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  // SVG ring calculations
  const radius = 95;
  const circumference = 2 * Math.PI * radius;
  const totalSeconds = settings[mode] * 60;
  const elapsedSeconds = totalSeconds - (minutes * 60 + seconds);
  const progress = elapsedSeconds / totalSeconds;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <div className={`pomodoro-timer ${mode} ${isActive ? "active-timer" : ""}`}>
      <div className="timer-modes">
        <button
          className={mode === "pomodoro" ? "active" : ""}
          onClick={() => switchMode("pomodoro")}
        >
          Pomodoro
        </button>
        <button
          className={mode === "shortBreak" ? "active" : ""}
          onClick={() => switchMode("shortBreak")}
        >
          Short Break
        </button>
        <button
          className={mode === "longBreak" ? "active" : ""}
          onClick={() => switchMode("longBreak")}
        >
          Long Break
        </button>
      </div>

      <div className="timer-ring-container">
        <svg className="timer-ring" viewBox="0 0 220 220">
          <circle
            className="timer-ring-bg"
            cx="110"
            cy="110"
            r={radius}
          />
          <circle
            className="timer-ring-progress"
            cx="110"
            cy="110"
            r={radius}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
          />
        </svg>
        <div className="timer-time-display">
          <h2>{formatTime()}</h2>
          <span className="timer-mode-label">{modeLabels[mode]}</span>
        </div>
      </div>

      <div className="timer-controls">
        <button onClick={toggleTimer}>
          <FontAwesomeIcon icon={isActive ? faPause : faPlay} />
          {isActive ? "Pause" : "Start"}
        </button>
        <button onClick={resetTimer}>
          <FontAwesomeIcon icon={faRedo} />
          Reset
        </button>
      </div>

      <div className="timer-stats">
        <p>
          <FontAwesomeIcon icon={faCheck} />
          Sessions: {completedSessions}
        </p>
        <p>Cycle: {cycles % 4}/4</p>
      </div>
    </div>
  );
};

export default PomodoroTimer;
