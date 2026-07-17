import { useState, useEffect } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'

const API_URL = import.meta.env.VITE_API_URL
const PLAYERS_REFRESH_INTERVAL_MS = 30000

function HostSetup() {
  const { gameCode } = useParams()
  const location = useLocation()
  const navigate = useNavigate()

  const gameId = location.state?.gameId
  const joinLink = `${window.location.origin}/join-game?code=${gameCode}`

  const [gameName, setGameName] = useState('Loading...')
  const [question, setQuestion] = useState('')
  const [questionsList, setQuestionsList] = useState([])
  const [players, setPlayers] = useState([])
  const [aiPrompt, setAiPrompt] = useState('')
  const [aiLoading, setAiLoading] = useState(false)

  useEffect(() => {
    if (!gameId) return

    let cancelled = false

    async function loadData() {
      try {
        const response = await fetch(`${API_URL}/api/games/${gameId}`)
        const data = await response.json()

        if (data && !cancelled) {
          setGameName(data.game_name)
          setQuestionsList(data.game_questions || [])

          if (data.players) {
            setPlayers(data.players)
          }
        }
      } catch (err) {
        console.error('Error loading data:', err)
      }
    }

    loadData()
    const intervalId = setInterval(loadData, PLAYERS_REFRESH_INTERVAL_MS)

    return () => {
      cancelled = true
      clearInterval(intervalId)
    }
  }, [gameId])

  const addQuestion = async () => {
    if (question === '') return

    try {
      const response = await fetch(`${API_URL}/api/games/${gameId}/add-question`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question }),
      })

      if (response.ok) {
        const updatedGame = await response.json()
        setQuestionsList(updatedGame.game_questions)
        setQuestion('')
      }
    } catch (err) {
      console.error('Error adding question:', err)
    }
  }

  const launchGame = async () => {
    const hostId = localStorage.getItem('currentUserId')

    try {
      const response = await fetch(`${API_URL}/api/games/${gameId}/launch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ host_id: hostId }),
      })

      const data = await response.json()

      if (!response.ok) {
        alert(data.error || 'Failed to launch game')
        return
      }

      navigate(`/gamePlay/${gameId}`)
    } catch (err) {
      console.error('Error launching game:', err)
    }
  }

  const listItemClass =
    'py-3 px-4 bg-surface-2 border border-border-soft rounded-sm text-ink text-sm animate-item-in break-words'

  async function questionGenerator() {
    if (!aiPrompt.trim() || aiLoading) return

    setAiLoading(true)
    try {
      const response = await fetch(`${API_URL}/api/games/${gameId}/generate-questions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: aiPrompt }),
      })

      const data = await response.json()

      if (response.ok) {
        setQuestionsList(data.game_questions)
        setAiPrompt('')
      } else {
        alert(data.error || 'Failed to generate questions')
      }
    } catch (err) {
      console.error('Error generating questions:', err)
    } finally {
      setAiLoading(false)
    }
  }
  return (
    <div className="max-w-[900px] mx-auto my-12 px-5 animate-fade-slide-in">
      <header className="text-center mb-8 py-8 px-6 bg-surface border border-border rounded-lg">
        <h1 className="mb-3 text-[32px]">{gameName}</h1>
        <p className="text-ink-dim text-sm">
          Room Code:
          <strong className="inline-block ml-1.5 py-1 px-3 bg-accent-soft text-accent rounded-full text-base font-bold tracking-[3px]">
            {gameCode}
          </strong>
        </p>
        <div className="mt-5 flex flex-col items-center gap-2">
          <QRCodeSVG value={joinLink} size={180} />
          <p className="text-sm text-ink-dim">Scan to join this game</p>
        </div>
      </header>

      <div className="flex gap-5 flex-wrap">
        <section className="flex-1 min-w-[280px] p-6 border border-border rounded-lg bg-surface">
          <div>
            <input
              type="text"
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') questionGenerator()
              }}
              placeholder="Describe the questions you want..."
              className="flex-1 min-w-0 py-3 px-3.5 bg-surface-2 border border-border rounded-md text-sm text-ink placeholder:text-ink-dim outline-none transition-[border-color,box-shadow] duration-200 focus:border-accent-border focus:shadow-[0_0_0_4px_var(--color-accent-soft)]"
            />
            <button
              onClick={questionGenerator}
              disabled={aiLoading}
              className="ml-2 py-2.5 px-5 bg-accent text-white border-none rounded-full text-sm font-bold cursor-pointer transition-[transform,filter] duration-200 ease-spring hover:scale-[1.04] hover:brightness-110 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {aiLoading ? 'Generating...' : 'Generate'}
            </button>
          </div>

          <h3 className="mb-4 text-ink">Questions</h3>
          <div className="flex gap-2.5 mb-4">
            <input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') addQuestion()
              }}
              placeholder="Add question..."
              className="flex-1 min-w-0 py-3 px-3.5 bg-surface-2 border border-border rounded-md text-sm text-ink placeholder:text-ink-dim outline-none transition-[border-color,box-shadow] duration-200 focus:border-accent-border focus:shadow-[0_0_0_4px_var(--color-accent-soft)]"
            />
            <button
              onClick={addQuestion}
              className="py-2.5 px-5 bg-accent text-white border-none rounded-full text-sm font-bold cursor-pointer transition-[transform,filter] duration-200 ease-spring hover:scale-[1.04] hover:brightness-110 active:scale-[0.98]"
            >
              Add
            </button>
          </div>
          <ul className="list-none p-0 m-0 flex flex-col gap-2 stagger-list">
            {questionsList.map((q, i) => (
              <li key={i} className={listItemClass}>
                {q}
              </li>
            ))}
          </ul>
        </section>

        <section className="flex-1 min-w-[280px] p-6 border border-border rounded-lg bg-surface">
          <h3 className="mb-4 text-ink">Players ({players.length})</h3>
          <ul className="list-none p-0 m-0 flex flex-col gap-2 stagger-list">
            {players.map((p, i) => (
              <li key={i} className={listItemClass}>
                {p.username}
              </li>
            ))}
          </ul>
        </section>
      </div>

      <button
        disabled={questionsList.length === 0 || players.length === 1}
        onClick={launchGame}
        className="w-full mt-6 py-4 rounded-full bg-accent text-white text-base font-bold cursor-pointer transition-[transform,filter,box-shadow,background-color,color] duration-200 ease-spring not-disabled:hover:scale-[1.02] not-disabled:hover:brightness-110 not-disabled:hover:shadow-[0_8px_24px_var(--color-accent-glow)] not-disabled:active:scale-[0.99] disabled:bg-surface-2 disabled:text-ink-dim disabled:cursor-not-allowed"
      >
        Launch Game
      </button>
    </div>
  )
}

export default HostSetup
