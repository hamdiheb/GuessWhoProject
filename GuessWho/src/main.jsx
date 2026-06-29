import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client'
import './index.css'
import SignUp from '../frontend/signup/SignUp.jsx'
import { BrowserRouter } from 'react-router-dom';

createRoot(document.getElementById('root')).render(
     <StrictMode>
      <BrowserRouter>
      <SignUp />
      </BrowserRouter>
  </StrictMode>
);
