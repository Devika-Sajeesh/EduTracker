// src/components/Auth/Auth.jsx
import React, { useState } from "react";
import "./Auth.css";
import { auth, db } from "../../firebase";
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

    // Validate password match
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

      // Create user document with student role by default
      const userRef = doc(db, "users", userCred.user.uid);
      await setDoc(userRef, {
        fullName,
        email,
        role: "student", // Force student role
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

      // Update last login time
      if (auth.currentUser) {
        const userRef = doc(db, "users", auth.currentUser.uid);
        await setDoc(
          userRef,
          {
            lastLogin: serverTimestamp(),
          },
          { merge: true }
        );
      }

      window.location.href = "/dashboard";
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className={`container ${rightPanel ? "right-panel-active" : ""}`}>
      {/* Error Message */}
      {error && (
        <div className="error-message">
          {error}
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      {/* Sign Up Form */}
      <div className="form-container sign-up-container">
        <form onSubmit={handleSignUp}>
          <h1>Create Student Account</h1>
          <span>Start tracking your learning progress</span>
          <input name="fullName" type="text" placeholder="Full Name" required />
          <input name="email" type="email" placeholder="Email" required />
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
          <button type="submit">Sign Up</button>
        </form>
      </div>

      {/* Sign In Form */}
      <div className="form-container sign-in-container">
        <form onSubmit={handleSignIn}>
          <h1>Sign In</h1>
          <span>Continue your learning journey</span>
          <input name="email" type="email" placeholder="Email" required />
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
            <p>
              Sign in to track your tasks, study time, and academic progress
            </p>
            <button className="ghost" onClick={() => setRightPanel(false)}>
              Sign In
            </button>
          </div>
          <div className="overlay-panel overlay-right">
            <h1>New Student?</h1>
            <p>
              Create your account to start organizing your studies and tracking
              your grades
            </p>
            <button
              className="ghost"
              onClick={() => setError(null) || setRightPanel(true)}
            >
              Sign Up
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
