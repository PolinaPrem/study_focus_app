import { useNavigate } from "react-router-dom";
import { useState } from "react";
import '../pages_css/LoginPage.css';

export default function RegisterPage() {
    
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmation: "",
    username: "",
  });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError("");
  };

  const validateForm = () => {
    if (
      !formData.email ||
      !formData.password ||
      !formData.confirmation ||
      !formData.username
    ) {
      setError("All fields are required");
      return false;
    }

    if (formData.password !== formData.confirmation) {
      setError("Passwords do not match");
      return false;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    const url = "http://127.0.0.1:5000/register";
    e.preventDefault(); 
    console.log("submiting");

    setError("");

    if (!validateForm()) {
      console.log("no inputs");
      return;
    }

    try {
      const response = await fetch(url, {
        method: "POST",
        credentials: 'include',
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      console.log("sending");
      const data = await response.json();

      if (response.ok) {
        navigate("/home");
      } else {
        setError(data.message || "Registration failed");
      }
    } catch (err) {
      setError("Server error. Please try again.");
    }
  };

  return (
    <>
      <div className="login">
        <h1>Focus Study Timer</h1>

        <div className="login-container">
          <form  className="form" onSubmit={handleSubmit}>
            <input
              autoComplete="off"
              placeholder="Username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              type="text"
            ></input>
            <input
              autoComplete="off"
              placeholder="Email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              type="email"
            ></input>
            <input
              autoComplete="off"
              placeholder="Password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              type="password"
            ></input>
            <input
              autoComplete="off"
              placeholder="Confirmation"
              name="confirmation"
              value={formData.confirmation}
              onChange={handleChange}
              type="password"
            ></input>
            <button name="submit" type="submit">
              Register
            </button>
          </form>
        </div>
        <img src="/images/studying.jpg" width="100%" />
      </div>
    </>
  );
}
