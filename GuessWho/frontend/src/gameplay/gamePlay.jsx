import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import './Gameplay.css'

const API_URL = import.meta.env.VITE_API_URL
const WAITING_POLL_INTERVAL_MS = 3000

export default function Gameplay() {
  const { gameId } = useParams()
  const navigate = useNavigate()
  const userId = localStorage.getItem('currentUserId')

  const [gameQuestions, setGameQuestions] = useState([])
  const [isStarted, setIsStarted] = useState(false)
  const [questionIndex, setQuestionIndex] = useState(0)
  const [answer, setAnswer] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [finished, setFinished] = useState(false)

  useEffect(() => {
    if (!userId) {
      navigate('/signin')
      return
    }
    if (!gameId) return

    let cancelled = false
    let intervalId

    async function loadGame() {
      try {
        const response = await fetch(`${API_URL}/api/games/${gameId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        })

        if (!response.ok) {
          if (!cancelled) setErrorMessage(`Failed to load game (status ${response.status})`)
          return
        }

        const data = await response.json()
        if (cancelled) return

        setGameQuestions(data.game_questions || [])
        setErrorMessage('')

        if (data.is_started) {
          setIsStarted(true)
          clearInterval(intervalId)
        }
      } catch (error) {
        console.error(error)
        if (!cancelled) setErrorMessage('Cannot connect to the server')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadGame()
    intervalId = setInterval(loadGame, WAITING_POLL_INTERVAL_MS)

    return () => {
      cancelled = true
      clearInterval(intervalId)
    }
  }, [gameId, userId, navigate])

  async function nextQuestion() {
    if (!answer.trim()) {
      setErrorMessage('Please enter an answer before continuing.')
      return
    }

    setSubmitting(true)
    setErrorMessage('')

    try {
      const response = await fetch(`${API_URL}/api/games/${gameId}/answer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          question_index: questionIndex,
          answer,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setErrorMessage(data.error || 'Failed to save answer')
        return
      }

      setAnswer('')
      if (questionIndex + 1 < gameQuestions.length) {
        setQuestionIndex((prev) => prev + 1)
      } else {
        setFinished(true)
      }
    } catch (error) {
      console.error(error)
      setErrorMessage('Cannot connect to the server')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <p className="loading">Loading...</p>
  if (errorMessage && gameQuestions.length === 0) return <p className="error">{errorMessage}</p>

  if (!isStarted) {
    return (
      <section className="gameplay">
        <div className="game-card">
          <p>Waiting for the host to launch the game...</p>
        </div>
      </section>
    )
  }

  if (gameQuestions.length === 0) return <p className="loading">No questions found.</p>

  if (finished) {
    return (
      <section className="gameplay">
        <div className="game-card">
          <p>You've answered all the questions. Thanks for playing!</p>
          <button onClick={() => navigate('/dashboard')}>Back to Dashboard</button>
        </div>
      </section>
    )
  }

  return (
    <section className="gameplay">
      <div className="game-card">
        <p>
          Question {questionIndex + 1} of {gameQuestions.length}
        </p>
        <p>{gameQuestions[questionIndex]}</p>
        <input type="text" value={answer} onChange={(e) => setAnswer(e.target.value)} />
        {errorMessage && <p className="error">{errorMessage}</p>}
        <button onClick={nextQuestion} disabled={submitting}>
          {submitting ? 'Saving...' : questionIndex + 1 < gameQuestions.length ? 'Next' : 'Finish'}
        </button>
      </div>
    </section>
  )
}
