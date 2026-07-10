import { useState, useEffect } from 'react'
import { supabase } from '../../../backend/server'
import './Gameplay.css'
export default function Gameplay() {
  const [usersOnGame, setUsersOnGame] = useState([])
  const [registeredUsers, setRegisteredUsers] = useState([])
  const [userSkills, setUserSkills] = useState([])

  async function fetchUsersOnGame() {
    const { data, error } = await supabase.from('game').select('*')
    if (error) {
      console.error(error)
      return
    }
    setUsersOnGame(data)
  }

  useEffect(() => {
    fetchUsersOnGame()
  }, [])

  async function fetchRegistredUsers() {
    const { data, error } = await supabase.from('users').select('*')
    if (error) {
      console.log(error)
      return
    }
    setRegisteredUsers(data)
  }

  useEffect(() => {
    fetchRegistredUsers()
  }, [])

  function fetchSkills(data) {
    if (usersOnGame.length <= 1) {
      const joinedIds = usersOnGame[0]?.joined_users ?? []

      const matchedSkills = data
        .filter((element) => joinedIds.includes(element.id))
        .flatMap((element) => element.skills)

      setUserSkills(matchedSkills)
    }
  }

  useEffect(() => {
    fetchSkills(registeredUsers)
  }, [registeredUsers, usersOnGame])

  if (usersOnGame.length === 0) {
    return <p className="loading">Loading...</p>
  }

  return (
    <section className="gameplay">
      <div className="game-card">
        <header className="game-header">
          <h1>Game Room</h1>
          <p className="game-code">
            Code: <span>{usersOnGame[0].game_code}</span>
          </p>
        </header>

        <article className="game-content">
          <div className="players-section">
            <h2>Online Players</h2>

            <ul className="players-list">
              {usersOnGame[0].joined_users.map((user, index) => (
                <li key={index} className="player-item">
                  Player {index}
                  <span>{user}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="skills-section">
            <h2>Skills</h2>

            <div className="skills-grid">
              {userSkills.map((skill, index) => (
                <button key={index} className="skill-button">
                  <span className="skill-name">{skill.values}</span>
                  <small>{skill.category}</small>
                </button>
              ))}
            </div>
          </div>
        </article>
      </div>
    </section>
  )
}
