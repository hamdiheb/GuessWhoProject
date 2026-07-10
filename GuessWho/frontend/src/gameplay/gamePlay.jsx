import { useState, useEffect } from 'react'
import { supabase } from '../../../backend/server'

export default function Gameplay() {
  const [games, setGames] = useState([])
  const [skills, setSkills] = useState([])
  async function fetchUsersData() {
    const { data, error } = await supabase.from('game').select('*')
    if (error) {
      console.error(error)
      return
    }
    setGames(data)
  }

  useEffect(() => {
    fetchUsersData()
  }, [])

  async function fetchUserSkills() {
    const { data, error } = await supabase.from('users').select('*')
    if (error) {
      console.error(error)
      return
    }
    setSkills(data)
  }

  useEffect(() => {
    fetchUserSkills()
  }, [])

  function userSkill() {
    let skillUser = []
    games[0]?.joined_users.forEach((user) => {
      skillUser = skills.forEach((skill) => {
        return skill.id == user
      })
    })
    console.log(skillUser)
  }

  useEffect(() => {
    userSkill()
  }, [])
  if (games.length === 0) {
    return <p>Loading...</p>
  }
  return (
    <section>
      <h1>Game Code: {games[0].game_code}</h1>
      <article>
        <ul>
          {games[0].joined_users.map((user, index) => (
            <li key={index}>{user}</li>
          ))}
        </ul>
        <section>{}</section>
      </article>
    </section>
  )
}
