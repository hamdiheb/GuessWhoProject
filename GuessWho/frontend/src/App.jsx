import { Routes, Route } from 'react-router-dom';

import SignUp from './signup/SignUp';
import Dashboard from './dashboard/Dashboard';

function App() {
  return (
    <Routes>
      <Route path="/" element={<SignUp />} />
      <Route path="/dashboard" element={<Dashboard />} />
    </Routes>
  );
}

export default App;
