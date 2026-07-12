import { Routes, Route } from "react-router-dom";

import SignUp from './signup/SignUp'
import SignIn from "./signin/SignIn";
//import Dashboard from './dashboard/Dashboard'
//import Profile from './profile/Profile'
//import Gameplay from './gameplay/gamePlay'
//import HostSetup from "./host/HostSetup";

function App() {
  return (
    <Routes>
      <Route path="/" element={<SignUp />} />
      <Route path="/signin" element={<SignIn />} />
      <Route path="/profile" element={<h1>profile</h1>} />
      <Route path="/dashboard" element={<h1>Dashboard</h1>} />
      <Route path="/gamePlay" element={<h1>Gameplay</h1>} />
      <Route path="/host-setup/:gameCode" element={<h1>Host Setup</h1>} />
    </Routes>
  );
}

export default App;
