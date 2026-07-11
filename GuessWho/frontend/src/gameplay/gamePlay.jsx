import { useState, useEffect } from 'react'
import { supabase } from '../../../backend/server'
import './Gameplay.css'
export default function Gameplay() {
  const [gameQuestions, setGameQuestions] = useState([])
  const [questionIndex, setQuestionIndex] = useState(0)
  async function fetchUsersOnGame() {
    const { data, error } = await supabase.from('game').select('game_questions')
    if (error) {
      console.error(error)
      return
    }
    setGameQuestions(data)
  }

  useEffect(() => {
    fetchUsersOnGame()
  }, [])

  if (gameQuestions.length === 0) {
    return <p className="loading">Loading...</p>
  }

  const questions = gameQuestions[0].game_questions

  function nextQuestion() {
    if (questionIndex < questions.length - 1) {
      setQuestionIndex((prev) => prev + 1)
    }
  }
  return (
    <section className="gameplay">
      <div className="game-card">
        <p>{questions[questionIndex]}</p>
        <input type="text" />
        <button onClick={nextQuestion}>Next</button>
      </div>
    </section>
  )
}
