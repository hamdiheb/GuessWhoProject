import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Mascot from '../components/Mascot/Mascot'

const API_URL = import.meta.env.VITE_API_URL
const WAITING_POLL_INTERVAL_MS = 3000

const gameCardClass =
  'w-full max-w-[520px] bg-surface border border-border rounded-lg shadow-card p-7 sm:p-10 box-border text-center animate-fade-slide-in'
const waitingStateClass = 'flex flex-col items-center gap-4 py-2.5 text-ink-muted'
const pulseDotClass = 'w-3 h-3 rounded-full bg-accent animate-pulse-dot'
const questionBadgeClass =
  'inline-block text-xs font-bold tracking-wide uppercase text-accent bg-accent-soft py-1.5 px-3.5 rounded-full mb-3.5'
const questionTextClass =
  'text-[22px] sm:text-2xl font-bold text-ink leading-snug tracking-tight my-2.5 mb-6 break-words'
const guessAnswerClass =
  'text-[17px] italic text-ink bg-surface-2 border border-border-soft rounded-md py-4 px-4.5 my-4 break-words'
const errorClass = 'text-danger bg-danger-soft py-2.5 px-3.5 rounded-sm my-4 text-center text-sm'
const btnPrimaryClass =
  'w-full py-[15px] rounded-full bg-accent text-white text-[15px] font-bold cursor-pointer font-sans transition-[transform,filter,box-shadow,background-color,color] duration-200 ease-spring not-disabled:hover:scale-[1.02] not-disabled:hover:brightness-110 not-disabled:hover:shadow-[0_8px_24px_var(--color-accent-glow)] not-disabled:active:scale-[0.99] disabled:bg-surface-2 disabled:text-ink-dim disabled:cursor-not-allowed disabled:opacity-70'

function useCountUp(target, durationMs = 600) {
  const [value, setValue] = useState(target)
  const prevRef = useRef(target)

  useEffect(() => {
    const from = prevRef.current
    const to = target
    if (from === to) return undefined

    let raf
    const start = performance.now()

    function tick(now) {
      const t = Math.min(1, (now - start) / durationMs)
      const eased = 1 - Math.pow(1 - t, 3)
      setValue(Math.round(from + (to - from) * eased))
      if (t < 1) {
        raf = requestAnimationFrame(tick)
      } else {
        prevRef.current = to
      }
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, durationMs])

  return value
}

function avatarGradient(id) {
  const seed = String(id)
    .split('')
    .reduce((h, c) => h * 31 + c.charCodeAt(0), 7)
  const hue = ((seed % 360) + 360) % 360
  return `linear-gradient(135deg, hsl(${hue}, 65%, 58%), hsl(${(hue + 45) % 360}, 65%, 42%))`
}

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
  const [answerFocused, setAnswerFocused] = useState(false)

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

  function getFeaturedAuthors(qIdx) {
    const n = joinedUsers.length
    if (n <= 2) return joinedUsers

    const idx1 = (qIdx * 2) % n
    const idx2 = (idx1 + 1) % n
    return [joinedUsers[idx1], joinedUsers[idx2]]
  }

  function findCurrentSlot() {
    for (let qIdx = 0; qIdx < gameQuestions.length; qIdx++) {
      for (const authorId of getFeaturedAuthors(qIdx)) {
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

  const myScore = useCountUp(gameScores[userId] || 0)

  if (loading) return <p className="text-center text-ink-muted py-16">Loading...</p>
  if (errorMessage && gameQuestions.length === 0) return <p className={errorClass}>{errorMessage}</p>

  if (!isStarted) {
    return (
      <section className="flex justify-center py-12 px-5">
        <div className={`${gameCardClass} ${waitingStateClass}`}>
          <span className={pulseDotClass} />
          <p>Waiting for the host to launch the game...</p>
        </div>
      </section>
    )
  }

  if (gameQuestions.length === 0) {
    return <p className="text-center text-ink-muted py-16">No questions found.</p>
  }

  if (finished) {
    if (!allAnswered) {
      return (
        <section className="flex justify-center py-12 px-5">
          <div className={`${gameCardClass} ${waitingStateClass}`}>
            <span className={pulseDotClass} />
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
        <section className="flex justify-center py-12 px-5">
          <div className={`${gameCardClass} relative overflow-hidden`}>
            <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
              {Array.from({ length: 18 }).map((_, i) => (
                <span
                  key={i}
                  className="confetti-piece"
                  style={{
                    left: `${5 + i * 5}%`,
                    '--x': `${(i % 2 === 0 ? 1 : -1) * (15 + ((i * 7) % 25))}px`,
                    background: i % 3 === 0 ? 'var(--color-success)' : 'var(--color-accent)',
                    animationDelay: `${(i * 47) % 200}ms`,
                  }}
                />
              ))}
            </div>
            <p className="text-2xl font-bold text-ink mb-6">Final results!</p>
            <ol className="list-none p-0 m-0 mb-7 flex flex-col gap-2.5">
              {ranked.map(({ uid, score }, i) => (
                <li
                  key={uid}
                  className="flex items-center gap-3 py-3 px-4 bg-surface-2 border border-border-soft rounded-md text-left animate-fade-slide-in"
                  style={{ animationDelay: `${i * 90}ms` }}
                >
                  <span
                    className={`flex items-center justify-center w-[26px] h-[26px] shrink-0 rounded-full font-bold text-xs border border-border ${
                      i === 0 ? 'bg-accent text-white border-accent' : 'bg-surface text-ink-dim'
                    }`}
                  >
                    {i + 1}
                  </span>
                  <span
                    className="flex items-center justify-center w-[34px] h-[34px] shrink-0 rounded-full text-white font-bold text-sm"
                    style={{ background: avatarGradient(uid) }}
                  >
                    {playerName(uid).charAt(0).toUpperCase()}
                  </span>
                  <span className="flex-1 font-semibold text-ink text-sm break-words min-w-0">{playerName(uid)}</span>
                  <span className="font-bold text-accent text-sm">
                    {score} pt{score === 1 ? '' : 's'}
                  </span>
                </li>
              ))}
            </ol>
            <button className={btnPrimaryClass} onClick={() => navigate('/dashboard')}>
              Back to Dashboard
            </button>
          </div>
        </section>
      )
    }

    if (String(slot.authorId) === String(userId)) {
      return (
        <section className="flex justify-center py-12 px-5">
          <div className={gameCardClass} key={`author-${slot.questionIndex}-${slot.authorId}`}>
            <p className={questionBadgeClass}>Question {slot.questionIndex + 1}</p>
            <p className={questionTextClass}>{gameQuestions[slot.questionIndex]}</p>
            <p className={guessAnswerClass}>
              Your answer: "{gameAnswers[slot.questionIndex]?.answers?.[userId]}"
            </p>
            <div className={waitingStateClass}>
              <span className={pulseDotClass} />
              <p>Other players are guessing who wrote this...</p>
            </div>
          </div>
        </section>
      )
    }

    const myGuess = gameGuesses[slot.questionIndex]?.[slot.authorId]?.[userId]

    if (myGuess !== undefined) {
      const wasCorrect = String(myGuess) === String(slot.authorId)
      return (
        <section className="flex justify-center py-12 px-5">
          <div
            className={`${gameCardClass} ${
              wasCorrect
                ? 'shadow-[0_20px_50px_rgba(0,0,0,0.35),0_0_0_1px_var(--color-accent-border),0_0_40px_var(--color-accent-glow)] animate-correct-pop'
                : 'animate-shake'
            }`}
            key={`guessed-${slot.questionIndex}-${slot.authorId}`}
          >
            {wasCorrect && (
              <span className="flex items-center justify-center w-[52px] h-[52px] mx-auto mb-4 rounded-full bg-accent-soft text-accent text-2xl font-bold animate-checkmark-in">
                ✓
              </span>
            )}
            <p className="text-lg font-bold text-ink mb-1.5">
              You guessed {playerName(myGuess)} — {wasCorrect ? 'Correct!' : 'Not quite.'}
            </p>
            {!wasCorrect && (
              <p className="text-ink-muted text-sm mb-2.5">It was actually {playerName(slot.authorId)}.</p>
            )}
            <p className="text-ink-dim text-[13px] mt-3.5 mb-1">
              Your score:{' '}
              <span className="text-accent font-bold text-[15px] tabular-nums">{myScore}</span>
            </p>
            <div className={waitingStateClass}>
              <span className={pulseDotClass} />
              <p>Waiting for others to finish guessing this one...</p>
            </div>
          </div>
        </section>
      )
    }

    const candidates = joinedUsers.filter((uid) => String(uid) !== String(userId))
    const revealedAnswer = gameAnswers[slot.questionIndex]?.answers?.[slot.authorId]

    return (
      <section className="flex justify-center py-12 px-5">
        <div className={gameCardClass} key={`guessing-${slot.questionIndex}-${slot.authorId}`}>
          <p className={questionBadgeClass}>Question {slot.questionIndex + 1}</p>
          <p className={questionTextClass}>{gameQuestions[slot.questionIndex]}</p>
          <p className={guessAnswerClass}>"{revealedAnswer}"</p>
          <p className="font-semibold text-ink mb-4.5">Who wrote this?</p>
          {guessError && <p className={errorClass}>{guessError}</p>}
          <div className="flex flex-wrap justify-center gap-2.5">
            {candidates.map((uid) => (
              <button
                key={uid}
                disabled={guessSubmitting}
                onClick={() => submitGuess(slot, uid)}
                className="py-2.5 px-5 rounded-full border border-accent-border bg-transparent text-accent text-sm font-semibold cursor-pointer font-sans transition-[transform,background-color] duration-200 ease-spring not-disabled:hover:bg-accent-soft not-disabled:hover:scale-[1.03] not-disabled:active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {playerName(uid)}
              </button>
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="flex justify-center py-12 px-5">
      <div className={gameCardClass} key={`question-${questionIndex}`}>
        <div className="flex justify-center mb-2">
          <Mascot userId={userId} focused={answerFocused} />
        </div>
        <div className="mb-6.5">
          <span className={questionBadgeClass}>
            Question {questionIndex + 1} of {gameQuestions.length}
          </span>
          <div className="h-1 rounded-full bg-border overflow-hidden">
            <div
              className="h-full rounded-full bg-accent transition-[width] duration-500 ease-in-out"
              style={{ width: `${((questionIndex + 1) / gameQuestions.length) * 100}%` }}
            />
          </div>
        </div>
        <p className={`${questionTextClass} animate-fade-slide-in`}>{gameQuestions[questionIndex]}</p>
        <input
          type="text"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') nextQuestion()
          }}
          onFocus={() => setAnswerFocused(true)}
          onBlur={() => setAnswerFocused(false)}
          placeholder="Type your answer..."
          className="w-full box-border py-3.5 px-4.5 bg-surface-2 border border-border rounded-md text-[15px] font-sans text-ink placeholder:text-ink-dim mb-5 outline-none transition-[border-color,box-shadow] duration-200 focus:border-accent-border focus:shadow-[0_0_0_4px_var(--color-accent-soft)]"
        />
        {errorMessage && <p className={errorClass}>{errorMessage}</p>}
        <button className={btnPrimaryClass} onClick={nextQuestion} disabled={submitting}>
          {submitting ? 'Saving...' : questionIndex + 1 < gameQuestions.length ? 'Next' : 'Finish'}
        </button>
      </div>
    </section>
  )
}
