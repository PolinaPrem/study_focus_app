import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Home, Hourglass, Clock, X } from "lucide-react";
import "../pages_css/TasksPage.css";
import { useEffect } from "react";

export default function TasksPage() {
  
    const [tasks, setTasks] = useState([]);
    const [newTask, setNewTask] = useState("");
    const [duration, setDuration] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

  // to run useEffect automaticly
  useEffect(() => {
    fetchTasks();
  }, []);

  //runs automaticly when openning the page to show all the previous tasks
  const fetchTasks = async () => {
    try {
      const response = await fetch("https://study-focus-app.onrender.com/tasks",{
        credentials: 'include',
        method:"GET",
      });
      if (!response.ok) {
        throw new Error("Failed to fetch tasks");
      }
      const data = await response.json();
      setTasks(data);
    } catch (err) {
      setError("Failed to load tasks");
      console.log(error);
    }
  };

  //saves new task
  const addTask = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("https://study-focus-app.onrender.com/tasks", {
        
        credentials: 'include',
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: newTask,
          duration: duration,
          completed: false,
        }),
      });
      if (!response.ok) {
        throw new Error("Failed to add task");
      }
      //updating state from the response
      const newTaskData = await response.json();
      setTasks([...tasks, newTaskData]);
      setNewTask("");
      setDuration("");
    } catch (err) {
      setError("Failed to add task");
      console.log(error);
    }
  };

  // updating the task with put request
  // const toggleTask = async (taskId) => {
  //   console.log(taskId)
  //   try {
  //     const task = tasks.find((t) => t.id === taskId);
  //     const response = await fetch(`http://127.0.0.1:5000/tasks/${taskId}`, {
  //       method: "PUT",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //      body: JSON.stringify({
  //         completed: !task.completed,
  //       }),
  //     });
  //     if (!response.ok) {
  //       throw new Error("Failed to update task");
  //     }
  //     const updatedTask = await response.json();
  //     setTasks(tasks.map((task) => (task.id === taskId ? updatedTask : task)));
  //   } catch (err) {
  //     setError("Failed to update task");
  //     console.log(error);
  //   }
  // };

  const startFocusSession=(taskId)=>{
    // console.log(taskId)
    navigate("/focus", { state: { taskId } });
  }

  //deleting tasks with delete request
  const deleteTask = async (taskId) => {
    try {
      const response = await fetch(`https://study-focus-app.onrender.com/tasks/${taskId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Failed to delete task");
      }
      setTasks(tasks.filter((task) => task.id !== taskId));
    } catch (err) {
      setError("Failed to delete task");
      console.log(error);
    }
  };

  return (
    <>
      <div className="task-page">
        <div className="card">
          <div className="card-header">
            <h1>My Tasks</h1>
            <button 
    className="home-button"
    onClick={() => navigate('/home')}
  >
    <Home size={24} />
  </button>
          </div>
          <div className="card-content">
            <h3>Add task name and duration</h3>
            <form onSubmit={addTask} className="task-form">
              <div className='inputs'>
              <input
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                placeholder="Enter new task..."
                className="task-input"
                type="text"
                
              />
              <input
                min="1"
                className="duration-input"
                type="number"
                placeholder="Duration (minutes)"
                value={duration}
                
                onChange={(e) => setDuration(parseInt(e.target.value))}
              />
              </div>
              <button type="submit" className="add_button">
                Add
              </button>
            </form>
            <div className="task-list">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className={`task-item${task.completed ? "-completed" : " "}`}
                >
                  <div className="task-item-leftpart">
                    <button
                      onClick={() => startFocusSession(task.id)}
                      className={`toggle-button ${
                        task.completed ? "completed" : ""
                      }`}
                    >
                      
                      <Hourglass size={20}/>
                    </button>
                    <span className="task-title">{task.title}</span>
                  </div>
                  <div className="task-item-rightpart">
                  <span className="duration">
                    <Clock size={16} />
                    {task.duration}m
                  </span>
                  <button
                    onClick={() => deleteTask(task.id)}
                    className="delete-button"
                  >
                    <X size={20} />
                  </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
