// src/components/Auth/Auth.jsx
import React, { useState } from "react";
import "./Auth.css";
import { auth, db } from "../../firebase";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGraduationCap, faExclamationCircle } from "@fortawesome/free-solid-svg-icons";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

export default function Auth() {
  const [rightPanel, setRightPanel] = useState(false);
  const [error, setError] = useState(null);

  const handleSignUp = async (e) => {
    e.preventDefault();
    const fullName = e.target.fullName.value;
    const email = e.target.email.value;
    const password = e.target.password.value;
    const confirmPassword = e.target.confirmPassword.value;

    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    try {
      const userCred = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      const userRef = doc(db, "users", userCred.user.uid);
      await setDoc(userRef, {
        fullName,
        email,
        role: "student",
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
      });

      window.location.href = "/dashboard";
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    const email = e.target.email.value;
    const password = e.target.password.value;

    try {
      await signInWithEmailAndPassword(auth, email, password);

      if (auth.currentUser) {
        const userRef = doc(db, "users", auth.currentUser.uid);
        await setDoc(
          userRef,
          { lastLogin: serverTimestamp() },
          { merge: true }
        );
      }

      window.location.href = "/dashboard";
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="auth-page">
      {/* Animated background blob */}
      <div className="auth-bg-blob" />

      {/* Brand badge */}
      <div className="auth-brand">
        <FontAwesomeIcon icon={faGraduationCap} className="auth-brand-icon" />
        EduTrack
      </div>

      {/* Error Message */}
        <div className="error-message">
          <FontAwesomeIcon icon={faExclamationCircle} /> {error}
          <button className="error-dismiss" onClick={() => setError(null)}>×</button>
        </div>

      <div className={`container ${rightPanel ? "right-panel-active" : ""}`}>
        {/* Mobile toggle buttons */}
        <div className="mobile-toggle">
          <button
            className={!rightPanel ? "active" : ""}
            onClick={() => { setError(null); setRightPanel(false); }}
          >
            Sign In
          </button>
          <button
            className={rightPanel ? "active" : ""}
            onClick={() => { setError(null); setRightPanel(true); }}
          >
            Sign Up
          </button>
        </div>

        {/* Sign Up Form */}
        <div className="form-container sign-up-container">
          <form onSubmit={handleSignUp}>
            <h1>Create Account</h1>
            <span>Start your learning journey today</span>
            <input name="fullName" type="text" placeholder="Full Name" required />
            <input name="email" type="email" placeholder="Email Address" required />
            <input
              name="password"
              type="password"
              placeholder="Password (min 6 characters)"
              minLength="6"
              required
            />
            <input
              name="confirmPassword"
              type="password"
              placeholder="Confirm Password"
              required
            />
            <button type="submit">Create Account</button>
          </form>
        </div>

        {/* Sign In Form */}
        <div className="form-container sign-in-container">
          <form onSubmit={handleSignIn}>
            <h1>Welcome Back</h1>
            <span>Continue where you left off</span>
            <input name="email" type="email" placeholder="Email Address" required />
            <input
              name="password"
              type="password"
              placeholder="Password"
              required
            />
            <a href="#">Forgot your password?</a>
            <button type="submit">Sign In</button>
          </form>
        </div>

        {/* Overlay Panels */}
        <div className="overlay-container">
          <div className="overlay">
            <div className="overlay-panel overlay-left">
              <h1>Welcome Back!</h1>
              <p>Already have an account? Sign in to access your study dashboard.</p>
              <ul className="feature-list">
                <li>Track your study progress</li>
                <li>Manage tasks & deadlines</li>
                <li>AI-powered doubt solving</li>
              </ul>
              <button className="ghost" onClick={() => setRightPanel(false)}>
                Sign In
              </button>
            </div>
            <div className="overlay-panel overlay-right">
              <h1>New Here?</h1>
              <p>Join thousands of students supercharging their studies.</p>
              <ul className="feature-list">
                <li>Pomodoro study timer</li>
                <li>Grade tracking & analytics</li>
                <li>Smart AI study assistant</li>
              </ul>
              <button
                className="ghost"
                onClick={() => { setError(null); setRightPanel(true); }}
              >
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
