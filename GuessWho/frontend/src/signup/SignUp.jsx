import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './SignUp.css';

import email_icon from './Assets_SignUp/email.jpg';
import user_icon from './Assets_SignUp/user.jpg';
import password_icon from './Assets_SignUp/password.jpg';

function SignUp() {
  // State
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const navigate = useNavigate();

  const isFormIncomplete =
    !username.trim() || !email.trim() || !password.trim();

  // Function
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isFormIncomplete) {
      alert('All fields are required.');
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/api/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message);
        return;
      }

      alert('Account created successfully!');
      navigate('/dashboard');
    } catch (error) {
      console.error(error);
      alert('Cannot connect to the server');
    }

    
  };

  return (
    <div className="container">
      <div className="header">
        <div className="text">Sign Up</div>
        <div className="underline"></div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="inputs">
          <div className="input">
            <img src={user_icon} alt="User" />

            <input
              name="username"
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="input">
            <img src={email_icon} alt="Email" />

            <input
              name="email"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="input">
            <img src={password_icon} alt="Password" />
            <input
              name="password"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
        </div>

        <button className="submit" type="submit" disabled={isFormIncomplete}>
          Sign Up
        </button>
      </form>

      <div className="login-link">
        Already have an account?{' '}
        <span onClick={() => navigate('/signin')}>Sign In</span>
      </div>
    </div>
  );
}

export default SignUp;
