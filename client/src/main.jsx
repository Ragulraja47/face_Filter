import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

import FaceFilter from './FaceFilter.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <>
    <FaceFilter/>
    </>
    
  </StrictMode>,
)
