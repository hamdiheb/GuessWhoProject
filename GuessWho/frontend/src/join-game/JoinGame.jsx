import React, { useState } from 'react'
import { supabase } from '../../../backend/server'
import styles from '../join-game/Joingame.module.css'
import { useNavigate } from 'react-router-dom'

function JoinGame() {
  const [gameCode, setGameCode] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleJoin = async () => {
    if (!gameCode.trim()) {
      alert('Please enter a game code.')
      return
    }

    const userId = localStorage.getItem('currentUserId')
    if (!userId) {
      alert('You must be logged in to join a game.')
      return
    }

    setLoading(true)

    // game_code is stored as a number (see Dashboard's randomCode), so cast the input
    const codeAsNumber = Number(gameCode.trim())

    const { data: game, error: fetchError } = await supabase
      .from('game')
      .select('id, joined_users')
      .eq('game_code', codeAsNumber)
      .single()

    if (fetchError || !game) {
      setLoading(false)
      alert('No game found with that code. Double-check it and try again.')
      return
    }

    const currentJoinedUsers = game.joined_users || []
    const userIdNum = Number(userId)

    // Only add the user if they haven't already joined (e.g. rejoining after a refresh)
    const updatedJoinedUsers = currentJoinedUsers.includes(userIdNum)
      ? currentJoinedUsers
      : [...currentJoinedUsers, userIdNum]

    const { error: updateError } = await supabase
      .from('game')
      .update({ joined_users: updatedJoinedUsers })
      .eq('id', game.id)

    setLoading(false)

    if (updateError) {
      alert('Failed to join game: ' + updateError.message)
      return
    }

    navigate(`/gamePlay/${game.id}`)
  }

  return (
    <div className={styles.page}>
      <div className={styles.joinContainer}>
        <div className={styles.header}>
          <div className={styles.text}>Join a Game</div>
          <div className={styles.underline}></div>
        </div>

        <div className={styles.inputs}>
          <div className={styles.input}>
            <input
              type="text"
              placeholder="Enter Game Code"
              value={gameCode}
              onChange={(e) => setGameCode(e.target.value)}
              disabled={loading}
            />
          </div>
        </div>

        <div className={styles.buttonsSection}>
          <button className={styles.submit} onClick={handleJoin} disabled={loading}>
            {loading ? 'Joining...' : 'Join Game'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default JoinGame
