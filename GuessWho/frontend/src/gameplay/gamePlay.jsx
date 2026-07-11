import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../../../backend/server'
import './Gameplay.css'

export default function Gameplay() {
  const { gameId } = useParams() // route: /Gameplay/:gameId — this is the game_code value

  const [userId, setUserId] = useState(null)
  const [questions, setQuestions] = useState([])
  const [gameAnswers, setGameAnswers] = useState([])
  const [questionIndex, setQuestionIndex] = useState(0)
  const [answerText, setAnswerText] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  // Get the logged-in user's id from localStorage (set at login/signup)
  useEffect(() => {
    const storedId = localStorage.getItem('currentUserId')
    if (!storedId) {
      setError('You need to be logged in to play.')
      return
    }
    setUserId(Number(storedId))
  }, [])

  // Load the game row (questions + any existing answers)
  const fetchGame = useCallback(async () => {
    if (!gameId) {
      setError('Missing game code.')
      setLoading(false)
      return
    }
    const { data, error } = await supabase
      .from('game')
      .select('game_questions, game_answers')
      .eq('id', gameId)
      .single()

    if (error) {
      console.error(error)
      setError('Could not load this game.')
      setLoading(false)
      return
    }

    setQuestions(data.game_questions || [])
    setGameAnswers(data.game_answers || [])
    setLoading(false)
  }, [gameId])

  useEffect(() => {
    fetchGame()
  }, [fetchGame])

  // Pre-fill the input if this user already answered the current question
  useEffect(() => {
    if (questions.length === 0) return
    const currentQuestion = questions[questionIndex]
    const entry = gameAnswers.find((a) => a.question === currentQuestion)
    const existing = entry?.answers?.find((a) => a.user_id === userId)
    setAnswerText(existing?.answer ?? '')
  }, [questionIndex, questions, gameAnswers, userId])

  async function submitAnswer() {
    if (!userId || questions.length === 0) return
    const trimmed = answerText.trim()
    if (!trimmed) return

    setSubmitting(true)
    setError(null)

    const currentQuestion = questions[questionIndex]

    // Build the updated game_answers array immutably
    const updatedAnswers = [...gameAnswers]
    const entryIndex = updatedAnswers.findIndex((a) => a.question === currentQuestion)

    if (entryIndex === -1) {
      // No entry yet for this question
      updatedAnswers.push({
        question: currentQuestion,
        answers: [{ user_id: userId, answer: trimmed }],
      })
    } else {
      // Entry exists: replace this user's answer if present, else append
      const entry = updatedAnswers[entryIndex]
      const userAnswerIndex = entry.answers.findIndex((a) => a.user_id === userId)
      const updatedUserAnswers = [...entry.answers]

      if (userAnswerIndex === -1) {
        updatedUserAnswers.push({ user_id: userId, answer: trimmed })
      } else {
        updatedUserAnswers[userAnswerIndex] = { user_id: userId, answer: trimmed }
      }

      updatedAnswers[entryIndex] = { ...entry, answers: updatedUserAnswers }
    }

    const { error } = await supabase
      .from('game')
      .update({ game_answers: updatedAnswers })
      .eq('id', gameId)

    setSubmitting(false)

    if (error) {
      console.error(error)
      setError('Could not save your answer. Try again.')
      return
    }

    setGameAnswers(updatedAnswers)
    nextQuestion()
  }

  function nextQuestion() {
    if (questionIndex < questions.length - 1) {
      setQuestionIndex((prev) => prev + 1)
    }
  }

  if (loading) {
    return <p className="loading">Loading...</p>
  }

  if (error) {
    return <p className="loading">{error}</p>
  }

  if (questions.length === 0) {
    return <p className="loading">No questions for this game yet.</p>
  }

  const isLastQuestion = questionIndex === questions.length - 1

  return (
    <section className="gameplay">
      <div className="game-card">
        <p className="question-counter">
          Question {questionIndex + 1} of {questions.length}
        </p>
        <p>{questions[questionIndex]}</p>
        <input
          type="text"
          value={answerText}
          onChange={(e) => setAnswerText(e.target.value)}
          disabled={submitting}
          placeholder="Type your answer..."
        />
        <button onClick={submitAnswer} disabled={submitting || !answerText.trim()}>
          {submitting ? 'Saving...' : isLastQuestion ? 'Submit' : 'Next'}
        </button>
      </div>
    </section>
  )
}
