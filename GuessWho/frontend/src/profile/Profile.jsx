import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Profile.css';

export default function Profile() {
  const [fullName, setFullName] = useState('');
  const [aboutMe, setAboutMe] = useState('');

  const navigate = useNavigate();

  const isFormIncomplete =
    !fullName.trim() || !aboutMe.trim();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isFormIncomplete) {
      alert('Please complete all fields.');
      return;
    }
    
    try {
      const response = await fetch('/api/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName,
          aboutMe,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message);
        return;
      }

      alert('Profile created successfully!');
      navigate('/dashboard');
    } catch (error) {
      console.error(error);
      alert('Cannot connect to the server.');
    }
  };

  return (
    <div className="container">
      <h2>Create Profile</h2>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Full Name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />

        <br />
        <br />

        <textarea
          placeholder="Tell us about yourself..."
          value={aboutMe}
          onChange={(e) => setAboutMe(e.target.value)}
        />

        <br />
        <br />

        <button
          type="submit"
          disabled={isFormIncomplete}
        >
          Save Profile
        </button>
      </form>
    </div>
  );
}