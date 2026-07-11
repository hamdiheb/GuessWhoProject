import { Routes, Route } from 'react-router-dom'

import SignUp from './signup/SignUp'
import Dashboard from './dashboard/Dashboard'
import Profile from './profile/Profile'
import Gameplay from './gameplay/gamePlay'
import HostSetup from './host/HostSetup'
import JoinGame from './join-game/JoinGame'

function App() {
  return (
    <Routes>
      <Route path="/" element={<SignUp />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/gamePlay/:gameId" element={<Gameplay />} />
      <Route path="/host-setup/:gameCode" element={<HostSetup />} />
      <Route path="/join-game" element={<JoinGame />} />
    </Routes>
  )
}

export default App
