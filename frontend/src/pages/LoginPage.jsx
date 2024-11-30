import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import '../pages_css/LoginPage.css';

export default function LoginPage(){

    const navigate = useNavigate();
    
    const [formData, setFormData]=useState({
        email: '',
        password:''
    })
    const [error, setError]=useState('');
    

    const handleChange=(e)=>{
    
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        setError('');

    }

    const handleRegister=()=>{
        navigate("/register");
    }
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        setError('');
        try{
            const response = await fetch("https://study-focus-app.onrender.com/login", {
                method: 'POST',
                credentials:'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });
            if (response.ok) {
                // If login successful, navigate to home page
                navigate('/home');
            } else {
                const data = await response.json();
                setError(data.message || 'Login failed');
                alert("User is not found")
            }
        }
        
        catch(err){
            setError("Server error. Please try again.")
            alert("User not found")
        }
        }
    return(
        <>
        <div className="login">
            
                <h1>Focus Study Timer</h1>

               <div className='login-container'>
                <form method="POST" action='/login' className='form' onSubmit={handleSubmit}>
                    <input autoComplete='off' placeholder='Email' name='email' onChange={handleChange} value={formData.email}></input>
                    <input autoComplete='off' placeholder='Password' name='password' type="password" onChange={handleChange} value={formData.password}></input>
                    <button name='submit' type='submit'>Log In</button>
                </form>
                <button onClick={handleRegister}>Register</button>
                </div>
                <img src="/images/studying.jpg"
                width="100%"/> 
           

        </div>
        </>
      )
    }