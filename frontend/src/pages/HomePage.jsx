import { useNavigate } from "react-router-dom";
import '../pages_css/HomePage.css';

export default function HomePage() {
  const navigate = useNavigate();

  const menu = [
    {
      title: "Focus",
      description: "Set your study timer and stay focused",
      path: "/focus",
      id:"0",
      number:"first"
    },
    {
      title: "Tasks",
      description: "Organize your study tasks",
      path: "/tasks",
      id:"1",
      number:"second"
    },
    {
      title: "Statistics",
      description: "Track your study progress",
      path: "/stats",
      id:"2",
      number:"third"
    },
  ];

  return (
    <>
      <div className="home">
        <header className="home-header">
          <h1>Focus Study Timer</h1>
        </header>
        <div className="image-container">
          <img src="src/images/kuromystudying.png" width="80%" />
        </div>
        <section className="menu-grid">
            {
                menu.map((card)=>(
                    <div 
                    key={card.id}
                    id={card.number}
                    className="menu-card"
                    onClick={() => navigate(card.path)}
                  >
                    <h2>{card.title}</h2>
                    <p>{card.description}</p>
                  </div>   
                ))
            }
            
        </section>
      </div>
    </>
  );
}

