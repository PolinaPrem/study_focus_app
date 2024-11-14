import { useState } from "react";
import "./App.css";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import TasksPage from "./pages/TasksPage";
import FocusPage from "./pages/FocusPage";
import StatsPage from "./pages/StatsPage";

function App() {

  const location = useLocation();

  useEffect(() => {
    // update body class based on current route
    if (location.pathname === '/tasks') {
      document.body.classList.add('tasks-page-background');
    } else {
      document.body.classList.remove('tasks-page-background');
    }
    if (location.pathname === '/stats') {
      document.body.classList.add('stats-page-background');
    } else {
      document.body.classList.remove('stats-page-background');
    }
    if (location.pathname === '/focus') {
      document.body.classList.add('focus-page-background');
    } else {
      document.body.classList.remove('focus-page-background');
    }
  }, [location]);

  return (
    <>
      
        <div className="app">
          <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<LoginPage />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/register" element={<RegisterPage/>}/>
          <Route path="/tasks" element={<TasksPage/>}/>
            <Route path="/focus" element={<FocusPage />} />
            
            <Route path="/stats" element={<StatsPage />} /> 
            
          </Routes>
        </div>
    
    </>
  );
}

export default App;
