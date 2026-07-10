import { useState, useEffect } from 'react'
import { supabase } from '../../../backend/server'

export default function Gameplay() {
  const [usersOnGame, setUsersOnGame] = useState([])
  const [registeredUsers, setRegisteredUsers] = useState([])
  const [userSkills, setUserSkills] = useState([])

  //Fetching game data (game_code, joined_users, etc.)
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

  //Fetching all registered users
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

  //Match registered users against joined_users, collect their skills
  function fetchSkills(data) {
    if (usersOnGame.length <= 1) {
      const joinedIds = usersOnGame[0]?.joined_users ?? []
      const matchedSkills = data
        .filter((element) => joinedIds.includes(element.id))
        .flatMap((element) => element.skills) // flatMap in case `skills` is itself an array per user

      setUserSkills(matchedSkills)
    }
  }

  useEffect(() => {
    fetchSkills(registeredUsers)
  }, [registeredUsers, usersOnGame])

  if (usersOnGame.length === 0) {
    return <p>Loading...</p>
  }

  return (
    <section>
      <h1>Game Code: {usersOnGame[0].game_code}</h1>
      <article>
        <ul>
          {usersOnGame[0].joined_users.map((user, index) => (
            <li key={index}>Online user ID: {user}</li>
          ))}
        </ul>

        <section>
          {userSkills.map((skill, index) => (
            <button key={index}>
              {skill.values} <small>({skill.category})</small>
            </button>
          ))}
        </section>
      </article>
    </section>
  )
}
