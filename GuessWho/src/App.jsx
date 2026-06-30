import { Routes, Route } from "react-router-dom";

import SignUp from "../frontend/signup/SignUp";
import Dashboard from "../frontend/dashboard/Dashboard";

function App() {
  return (
    <Routes>
      <Route path="/" element={<SignUp />} />
      <Route path="/dashboard" element={<Dashboard />} />
    </Routes>
  );
}

export default App;