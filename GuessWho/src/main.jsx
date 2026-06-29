import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client'

import { BrowserRouter, Routes, Route } from "react-router-dom";

import './index.css'
import SignUp from '../frontend/signup/SignUp.jsx'
import Dashboard from '../frontend/dashboard/Dashboard.jsx';  

createRoot(document.getElementById('root')).render(
     <StrictMode>
      <BrowserRouter>
      <Routes>
      <Route path='/' element={<SignUp/>}/>
      <Route path='/dashboard' element={<BrowserRouter/>} />
      </Routes>
      </BrowserRouter>
  </StrictMode>
);
