import { Routes, Route } from "react-router-dom";

import SignUp from "./signup/SignUp";
import Dashboard from "./dashboard/Dashboard";
import Profile from "./profile/Profile";
import GameRoom from "./gameroom/GameRoom";

function App() {
  return (
    <Routes>
      <Route path="/" element={<SignUp />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/game-room/:roomCode" element={<GameRoom />} />
    </Routes>
  );
}

export default App;
