import { useState, useEffect } from 'react'
import { supabase } from '../../../backend/server'
import './Dashboard.css'

function Dashboard() {
  const [gameId, setGameId] = useState('')
  const [showJoin, setShowJoin] = useState(false)
  const [idInput, setIdInput] = useState('')
  const [user, setUser] = useState(null)

  useEffect(() => {
    const fetchUser = async () => {
      const userId = localStorage.getItem('currentUserId')
      if (!userId) return

      const { data, error } = await supabase
        .from('users')
        .select('username')
        .eq('id', userId)
        .single()

      if (error) {
        console.error(error)
        return
      }

      setUser(data)
    }

    fetchUser()
  }, [])

  // Function
  const handleHost = () => {
    const randomId = Math.floor(1000 + Math.random() * 9000)
    setGameId(randomId)
    setShowJoin(false)
  }
  const handleJoinClick = () => {
    setShowJoin(true)
    setGameId('')
  }
  const handleJoinSubmit = (e) => {
    e.preventDefault()
    if (!idInput) {
      alert('Please enter Game ID.')
      return
    }
    alert('Joining game with ID: ' + idInput)
  }

  return (
    <div className="dashboard-container">
      {user && <div className="user-name">Welcome, {user.username}</div>}

      <div className="header">
        <div className="text">Dashboard</div>
        <div className="underline"></div>
      </div>
      <div className="buttons-section">
        <button className="submit" onClick={handleHost}>
          {' '}
          Host a Game{' '}
        </button>
        <button className="submit" onClick={handleJoinClick}>
          {' '}
          Join a Game{' '}
        </button>
      </div>
      {gameId && <div className="game-id-box">Your Game ID: {gameId}</div>}
      {showJoin && (
        <form onSubmit={handleJoinSubmit}>
          <div className="inputs">
            <div className="input">
              <input
                type="text"
                placeholder="Enter Game ID"
                value={idInput}
                onChange={(e) => setIdInput(e.target.value)}
              />
            </div>
          </div>
          <button className="submit" type="submit">
            {' '}
            Join{' '}
          </button>
        </form>
      )}
    </div>
  )
}

export default Dashboard
