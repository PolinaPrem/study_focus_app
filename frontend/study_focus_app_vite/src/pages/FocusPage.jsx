import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Home, Pause, RotateCcw } from "lucide-react";
import "../pages_css/FocusPage.css";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function FocusPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { taskId } = location.state || {};

  const [focusSession, setFocusSession] = useState("");
  const [timeLeft, setTimeLeft] = useState(0);
  const [duration, setDuration]=useState(0);
  const[title,setTitle]=useState("");
  const [isPomodoro, setIsPomodoro] = useState(!taskId);
  const [isOnBreak, setIsOnBreak] = useState(false);
  const [isRunning, setIsRunning] = useState(false);

  const [error, setError] = useState("");

  const [intervalId, setIntervalId] = useState(null);

  useEffect(() => {
    console.log(isRunning, timeLeft);
    
    if (isRunning && timeLeft > 0) {
      console.log("is counring");

      const newIntervalId = setInterval(() => {
        setTimeLeft((timeLeft) => {
          if (timeLeft < 1) {
            setIsRunning(false);
            stopFocus();
            return 0;
          } else {
            return timeLeft - 1;
          }
        });
      }, 1000);
      setIntervalId(newIntervalId)

      return () => {
        if (newIntervalId) {
          clearInterval(newIntervalId);
        }
      };
    }
    else if(!isRunning && intervalId){
        console.log('stopping')
        clearInterval(intervalId);
        setIntervalId(null);
    }
  },[isRunning]);




  const startFocus = async () => {
    console.log(taskId);
   
    try {
      console.log("trying");
      const response = await fetch("http://127.0.0.1:5000/focus/start", {
        mode: "cors",
        credentials: "include",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          task_id: taskId,
          is_on_break: isOnBreak,
          is_pomodoro: isPomodoro,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setTitle(data.title);
        setFocusSession(data.session_id);
        console.log(isOnBreak)
        setTimeLeft(isPomodoro ? (isOnBreak ? 600 : 3000) : data.time_left);
        if (!duration){setDuration(data.duration)}
        
        setIsRunning(true);
        secondCounter(timeLeft);
      } else {
        setError("failed to start timer");
        console.log(error);
      }
    } catch (err) {
      setError("Failed to connect to the server");
      console.log(error);
    }
  };

  const stopFocus = async (e) => {
    console.log(focusSession);
    try {
      const response = await fetch("http://127.0.0.1:5000/focus/stop", {
        mode: "cors",
        credentials: "include",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          task_id: taskId,
          focus_session_id: focusSession,
          time_left: timeLeft,
          time_spent: isPomodoro
          ? isOnBreak
            ? Math.max(600 - timeLeft, 0) 
            : Math.max(3000 - timeLeft, 0) 
          : Math.max(duration - timeLeft, 0), 
      
          
          is_on_break: isOnBreak,
          is_pomodoro: isPomodoro,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        
        setIsRunning(false);
        console.log(isOnBreak)
        if (isPomodoro && data.is_on_break) {
            
            setIsOnBreak(true);
            setTimeLeft(600);
          } else  if(isPomodoro) {
            
            setIsOnBreak(false);
            setTimeLeft(3000);
          }
      } 
      else {
        setError("Failed to stop the timer");
        console.log(error);
      }
    } catch (err) {
      setError("Failed to connect the server");
      console.log(error);
    }
  };



 

  const getProgressPercentage = () => {
    const totalTime = isPomodoro ? (isOnBreak ? 600 : 3000) : duration ;
    console.log(`duration:${duration},totalTime: ${totalTime}, timeLeft: ${timeLeft}`);
    return ((totalTime - timeLeft) / totalTime) * 100;
  };

  const formatTime =(seconds)=>{
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }


  return (
    <>
      <div className="focus-page">
        <div className="header">
          <h1>Focus Timer</h1>
          <button 
    className="home-button"
    onClick={() => navigate('/')}
  >
    <Home size={24} />
  </button>
        </div>
        <div className="focus-timer">
          {taskId ? (
            <h3>Focusing on task: 
              <span>{title}</span></h3>
          ) : (
            <h3>Pomodoro Mode</h3>
          )}
          
          <div className="timer-content">
          <div className="timer-circle">
            <div className="progress-background"></div>
           
            <svg className="progress-ring" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="46"
                style={{
                    fill:"transparent",
                    stroke:"lightblue",
                    strokeWidth:"5",
                    strokeLinecap:"round",
                  strokeDasharray: '289',
                  strokeDashoffset: `${289 - (getProgressPercentage() * 2.89)}`
                }}
              />
             
            </svg>
           
         
          </div>
          <div className="time-and-status">
            <h1 className="time-display">
              {formatTime(timeLeft)}
              
            </h1>
            {isPomodoro && (
            <div className="timer-status">
              {isOnBreak ? "Break Time" : "Focus Time"}
            </div>
          )}
          </div>
        </div>  
        <div className="buttons">
        <button
  className={`timer-button ${isRunning ? 'stop' : 'start'}`}
  onClick={timeLeft === 0 && !isPomodoro ? startFocus : isRunning ? stopFocus : startFocus}
>
  {isPomodoro ? (
    isRunning ? (
      <>Finish <RotateCcw size={14} /></>
    ) : (
      <>Start</>
    )
  ) : timeLeft === 0 ? (
    <>Restart<RotateCcw size={14}/></> // Show Restart when timeLeft is 0 and not Pomodoro
  ) : isRunning ? (
    "Pause"
  ) : (
    "Play"
  )}
</button>

        </div>
        
      </div>
      </div>
    </>
  )
}
