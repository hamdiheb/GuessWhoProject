import { useState } from "react";
import {useNavigate} from 'react-router-dom'
import './SignUp.css'

import email_icon from './Assets_SignUp/email.jpg'

function SignUp() {
  // State
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const navigate = useNavigate();

  // Function
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!username || !email || !password) {
        alert('All fields are required.');
        return;
    }
    navigate('/profile')

    console.log('Username:', username);
    console.log('Email:', email);
    console.log('Password:', password);
  };

  return (
        <div className='container'>
            <div className='header'>
                <div className="text">Sign Up</div>
                <div className='underline'></div>
            </div>

            <form onSubmit={handleSubmit}>
            <div className='inputs'>

                 <div className='input'>
                    <input 
                    type='text'
                    placeholder='Username'
                    value={username}
                    onChange={(e) =>setUsername(e.target.value)}
                    />
                </div>

                <div className='input'>
                    <img src={email_icon} alt='Email' />
                    
                    <input 
                    type='email'
                    placeholder='Email'
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    />
                </div>

                
               
                <div className='input'>
                    <input 
                    type='password'
                    placeholder='Password'
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    />
                </div>  
            </div> 

            <button className='submit' type='submit'>
                Sign Up
            </button>
            </form>

            <div className='login-link'>
                Already have an account? <span>Sign In</span>
            </div>
        </div>
  );
}

export default SignUp; 