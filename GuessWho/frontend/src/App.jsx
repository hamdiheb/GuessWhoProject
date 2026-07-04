import { Routes, Route } from "react-router-dom";

import SignIn from "./signin/SignIn";
import SignUp from "./signup/SignUp";
import Dashboard from "./dashboard/Dashboard";

function App() {
  return (
    <Routes>
      <Route path="/" element={<SignUp />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/signin" element={<SignIn />} />
      <Route path="/dashboard" element={<Dashboard />} />
    </Routes>
  );
}

export default App;
