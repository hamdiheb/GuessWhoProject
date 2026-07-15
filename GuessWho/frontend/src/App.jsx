import { Routes, Route } from "react-router-dom";
import SignUp from './signup/SignUp'
import SignIn from "./signin/SignIn";
import Dashboard from './dashboard/Dashboard'
// import Profile from './profile/Profile'
import Gameplay from './gameplay/gamePlay'
import HostSetup from "./dashboard/host/HostSetup";
import JoinGame from "./dashboard/join/JoinGame";

function App() {
  return (
    <Routes>
      <Route path="/" element={<SignUp />} />
      <Route path="/signin" element={<SignIn />} />
      {/* <Route path="/profile" element={<Profile />} /> */}
      <Route path="/dashboard" element={<Dashboard />} /> 
      <Route path="/gamePlay/:gameId" element={<Gameplay />} />
      <Route path="/host-setup/:gameCode" element={<HostSetup />} />
      <Route path="/join-game" element={<JoinGame />} />
    </Routes>
  );
}
 
export default App;
