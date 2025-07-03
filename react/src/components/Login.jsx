import React, { useState, useEffect } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import "./Login.css"; // Import the CSS file

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loggedInRole, setLoggedInRole] = useState(""); // Track the logged-in role
  const location = useLocation();
  const navigate = useNavigate();

  // Get the role from the query parameters in the URL
  const role = new URLSearchParams(location.search).get("role");

  useEffect(() => {
    if (!role) {
      navigate("/home"); // Redirect to home if no role is selected
    }
  }, [role, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(""); // Clear any previous error

    try {
      const response = await axios.post("http://localhost:5002/api/login", {
        email,
        password,
      });

      console.log("Login Response:", response.data);

      // Validate role matches the selected portal
      if (response.data.role === role) {
        localStorage.setItem("token", response.data.token); // Store JWT token
        localStorage.setItem("studentId", response.data.id || ""); // Store Student ID
        setLoggedInRole(role); // Set the logged-in role to display the dashboard
      } else {
        setError(`Login failed! You cannot log in as ${response.data.role} in the ${role} portal.`);
      }
    } catch (err) {
      console.error("Login Error:", err.response?.data || err.message);
      setError("Login failed! Please check your email and password.");
    }
  };

  // Redirect to appropriate dashboard if logged in
  useEffect(() => {
    if (loggedInRole === "student") {
      navigate("/student-dashboard");
    } else if (loggedInRole === "faculty") {
      navigate("/faculty-dashboard");
    }
  }, [loggedInRole, navigate]);

  return (
    <div className="login-container">
      <div className="login-card">
        <img
          src="https://klectie.com/assets/img/KLE-Tech-Logo.png"
          alt="KLE Tech Logo"
          className="login-logo"
        />
        <h1 className="login-title">KLE Technological University</h1>
        <p className="login-subtitle">Creating Value, Leveraging Knowledge</p>
        <form className="login-form" onSubmit={handleLogin}>
          <input
            type="email"
            className="login-input"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            className="login-input"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" className="login-button">
            Log in
          </button>
          {error && <p className="login-error">{error}</p>}
        </form>
      </div>
    </div>
  );
};

export default Login;
