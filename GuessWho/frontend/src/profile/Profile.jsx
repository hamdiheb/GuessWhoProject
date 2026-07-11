import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Profile.module.css';
import Container from "../components/Container/Container";


const programmingLanguages = ['JavaScript', 'TypeScript', 'Python', 'Java', 'C#', 'C++', 'Go']

const softSkills = ['Communication', 'Teamwork', 'LeaderShip', 'Problem Solving', 'Adaptability']

const sports = ['Football', 'Basketball', 'Gym', 'Running', 'Swimming']

const hobbies = ['Reading', 'Gaming', 'Music', 'Travel', 'Cooking']

export default function Profile() {
  const navigate = useNavigate()

  const [profile, setProfile] = useState({
    fullName: '',
    programming: [],
    softSkills: [],
    sports: [],
    hobbies: [],
  })

  const handleInput = (e) => {
    setProfile({
      ...profile,
      [e.target.name]: e.target.value,
    })
  }

  const toggleItem = (field, value) => {
    const currentItems = profile[field]

    if (currentItems.includes(value)) {
      setProfile({
        ...profile,
        [field]: currentItems.filter((item) => item !== value),
      })
    } else {
      setProfile({
        ...profile,
        [field]: [...currentItems, value],
      })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!profile.fullName.trim()) {
      alert('Please complete all required fields')
      return
    }

    const userId = localStorage.getItem('currentUserId')

    if (!userId) {
      alert('You must be logged in to save a profile')
      return
    }

    const skills = [
      { category: 'programming', values: profile.programming },
      { category: 'softSkills', values: profile.softSkills },
      { category: 'sports', values: profile.sports },
      { category: 'hobbies', values: profile.hobbies },
    ]

    const { data, error } = await supabase
      .from('users')
      .update({
        full_name: profile.fullName,
        skills: skills,
      })
      .eq('id', userId)
      .select()

    if (error) {
      console.log('message:', error.message)
      console.log('details:', error.details)
      console.log('hint:', error.hint)
      console.log('code:', error.code)
      alert('Failed to save profile: ' + error.message)
      return
    }

    navigate('/dashboard')
  }

  return (
    <div className={styles.profilePage}>
    <Container className={styles.profileContainer}>


        <form onSubmit={handleSubmit}>
          <h3>Player Name</h3>
          <input
            type="text"
            name="fullName"
            placeholder="Enter your player name"
            value={profile.fullName}
            onChange={handleInput}
          />

          <h3>Programming Languages</h3>

        <h3>Programming Languages</h3>
         
         <div className={styles.checkboxGroup}>
        {programmingLanguages.map((language) => (
          <label key={language}>
            <input
              type="checkbox"
              checked={profile.programming.includes(language)}
              onChange={() =>
              toggleItem("programming", language)
              }
            />
            {language}
          </label>
        ))}
        </div>


          <h3>Soft Skills</h3>

        <div className={styles.checkboxGroup}>
        {softSkills.map((skill) => (
          <label key={skill}>
            <input
              type="checkbox"
              checked={profile.softSkills.includes(skill)}
              onChange={() =>
                toggleItem("softSkills", skill)
              }
            />
            {skill}
          </label>
        ))}
        </div>


          <h3>Sports</h3>

        <div className={styles.checkboxGroup}>
        {sports.map((sport) => (
          <label key={sport}>
            <input
              type="checkbox"
              checked={profile.sports.includes(sport)}
              onChange={() =>
              toggleItem("sports", sport)
              }
            />
            {sport}
          </label>
        ))}
        </div>

        <h3>Hobbies</h3>
       <div className={styles.checkboxGroup}>
        {hobbies.map((hobby) => (
          <label key={hobby}>
            <input
              type="checkbox"
              checked={profile.hobbies.includes(hobby)}
              onChange={() =>
                toggleItem("hobbies", hobby)
              }
            />
            {hobby}
          </label>
        ))}
        </div>

        <button type="submit">
          Save Profile
        </button>
      </form>
      </Container>

    </div>
  )
}
