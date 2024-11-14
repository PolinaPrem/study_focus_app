import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Clock,Home, Calendar, BarChart2 } from 'lucide-react';
import "../pages_css/StatsPage.css";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function FocusPage() {
  const navigate = useNavigate();
  
  const [stats, setStats] = useState({
    daily: { duration: 0, sessions: 0 },
    allTime: { duration: 0, sessions: 0 },
  });
  const [error, setError] = useState("");

  // to run fetch request automaticly
  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch("http://127.0.0.1:5000/stats", {
        mode: "cors",
        credentials: "include",
      });
      if (!response.ok) {
        setError("Failed to fetch tasks");
        console.log(error);
      }
      const data = await response.json();
      console.log(data)
      setStats(data);
    } catch (err) {
      setError("Failed to connect the server");
      console.log(error);
    }
  };

  const StatCard = ({ icon: Icon, title, value, subtitle }) => (
    <div className="stat-card">
      <div className="stat-card-header">
        <h3 className="stat-title">{title}</h3>
        <Icon className="stat-icon" />
      </div>
      <div className="stat-card-content">
        <div className="stat-value">{value}</div>
        <p className="stat-subtitle">{subtitle}</p>
      </div>
    </div>
  );

  return (
    <>
      <div className="stats-dashboard">
        <div className="dashboard-header">
          <h1 className="dashboard-title">Statistics</h1>
          <button 
    className="home-button"
    onClick={() => navigate('/')}
  >
    <Home size={24} />
  </button>
        </div>
        <section className="stats-section">
        <h3 className="section-title">Today</h3>
        <div className="stats-grid">
          <StatCard
            icon={Clock}
            title="Focus Duration"
            value={stats.daily.duration}
            subtitle="Today's total focus time"
          />
          <StatCard
            icon={BarChart2}
            title="Sessions Completed"
            value={stats.daily.sessions}
            subtitle="Sessions completed today"
          />
        </div>
        <h3 className="section-title">All Time</h3>
        <div className="stats-grid">
          <StatCard
            icon={Clock}
            title="Total Focus Time"
            value={stats.allTime.duration}
            subtitle="Lifetime focus duration"
          />
          <StatCard
            icon={Calendar}
            title="Total Sessions"
            value={stats.allTime.sessions}
            subtitle="Total sessions completed"
          />
        </div>
        </section>
      </div>
    </>
  );
}
