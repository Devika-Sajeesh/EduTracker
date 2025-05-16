import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";
import Auth from "./components/Auth/Auth";
import Dashboard from "./components/Dashboard/Dashboard";

function App() {
  const { currentUser } = useAuth();

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={!currentUser ? <Auth /> : <Navigate to="/dashboard" />}
        />
        <Route
          path="/dashboard"
          element={currentUser ? <Dashboard /> : <Navigate to="/" />}
        />
      </Routes>
    </Router>
  );
}

export default App;
