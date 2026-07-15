import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import './Gameplay.css'

const API_URL = import.meta.env.VITE_API_URL
const WAITING_POLL_INTERVAL_MS = 3000

export default function Gameplay() {
  const { gameId } = useParams()
  const navigate = useNavigate()
  const userId = localStorage.getItem('currentUserId')

  const [game, setGame] = useState(null)
  const [questionIndex, setQuestionIndex] = useState(0)
  const [answer, setAnswer] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [finished, setFinished] = useState(false)
  const [guessSubmitting, setGuessSubmitting] = useState(false)
  const [guessError, setGuessError] = useState('')

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

        setGame(data)
        setErrorMessage('')
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

  const gameQuestions = game?.game_questions || []
  const gameAnswers = game?.game_answers || []
  const gameGuesses = game?.game_guesses || []
  const gameScores = game?.game_scores || {}
  const joinedUsers = game?.joined_users || []
  const players = game?.players || []
  const isStarted = !!game?.is_started

  const playerName = (id) =>
    players.find((p) => String(p.id) === String(id))?.username || 'Unknown player'

  const allAnswered =
    gameQuestions.length > 0 &&
    joinedUsers.length > 0 &&
    gameQuestions.every((_, qIdx) =>
      joinedUsers.every((uid) => gameAnswers[qIdx]?.answers?.[uid] !== undefined),
    )

  function findCurrentSlot() {
    for (let qIdx = 0; qIdx < gameQuestions.length; qIdx++) {
      for (const authorId of joinedUsers) {
        const eligibleGuessers = joinedUsers.filter((uid) => String(uid) !== String(authorId))
        const guessesForSlot = gameGuesses[qIdx]?.[authorId] || {}
        const complete = eligibleGuessers.every((uid) => guessesForSlot[uid] !== undefined)
        if (!complete) return { questionIndex: qIdx, authorId }
      }
    }
    return null
  }

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

  async function submitGuess(slot, guessedUserId) {
    setGuessSubmitting(true)
    setGuessError('')
    try {
      const response = await fetch(`${API_URL}/api/games/${gameId}/guess`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          question_index: slot.questionIndex,
          author_id: slot.authorId,
          guessed_user_id: guessedUserId,
        }),
      })
      const data = await response.json()
      if (!response.ok) {
        setGuessError(data.error || 'Failed to submit guess')
        return
      }
      setGame((prev) => ({ ...prev, game_guesses: data.game_guesses, game_scores: data.game_scores }))
    } catch (err) {
      console.error(err)
      setGuessError('Cannot connect to the server')
    } finally {
      setGuessSubmitting(false)
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
    if (!allAnswered) {
      return (
        <section className="gameplay">
          <div className="game-card">
            <p>You're done! Waiting for other players to finish answering...</p>
          </div>
        </section>
      )
    }

    const slot = findCurrentSlot()

    if (slot === null) {
      const ranked = [...joinedUsers]
        .map((uid) => ({ uid, score: gameScores[uid] || 0 }))
        .sort((a, b) => b.score - a.score)

      return (
        <section className="gameplay">
          <div className="game-card">
            <p>Final results!</p>
            <ol>
              {ranked.map(({ uid, score }) => (
                <li key={uid}>
                  {playerName(uid)} — {score}
                </li>
              ))}
            </ol>
            <button onClick={() => navigate('/dashboard')}>Back to Dashboard</button>
          </div>
        </section>
      )
    }

    if (String(slot.authorId) === String(userId)) {
      return (
        <section className="gameplay">
          <div className="game-card">
            <p>{gameQuestions[slot.questionIndex]}</p>
            <p>Your answer: {gameAnswers[slot.questionIndex]?.answers?.[userId]}</p>
            <p>Other players are guessing who wrote this...</p>
          </div>
        </section>
      )
    }

    const myGuess = gameGuesses[slot.questionIndex]?.[slot.authorId]?.[userId]

    if (myGuess !== undefined) {
      const wasCorrect = String(myGuess) === String(slot.authorId)
      return (
        <section className="gameplay">
          <div className="game-card">
            <p>
              You guessed {playerName(myGuess)} — {wasCorrect ? 'Correct!' : 'Not quite.'}
            </p>
            <p>Waiting for others to finish guessing this one...</p>
          </div>
        </section>
      )
    }

    const candidates = joinedUsers.filter((uid) => String(uid) !== String(userId))
    const revealedAnswer = gameAnswers[slot.questionIndex]?.answers?.[slot.authorId]

    return (
      <section className="gameplay">
        <div className="game-card">
          <p>{gameQuestions[slot.questionIndex]}</p>
          <p>Someone answered: {revealedAnswer}</p>
          <p>Who wrote this?</p>
          {guessError && <p className="error">{guessError}</p>}
          {candidates.map((uid) => (
            <button key={uid} disabled={guessSubmitting} onClick={() => submitGuess(slot, uid)}>
              {playerName(uid)}
            </button>
          ))}
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
