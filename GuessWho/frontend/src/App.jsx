import { Routes, Route } from 'react-router-dom'

import SignUp from './signup/SignUp'
import SignIn from "./signin/SignIn";
import Dashboard from './dashboard/Dashboard'
import Profile from './profile/Profile'
import GameRoom from './gameroom/GameRoom'
import Gameplay from './gameplay/gamePlay'

function App() {
  return (
    <Routes>
      <Route path="/" element={<SignUp />} />
      <Route path="/signin" element={<SignIn />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/game-room/:roomCode" element={<GameRoom />} />
      <Route path="/gamePlay" element={<Gameplay />} />
    </Routes>
  )
}

export default App
