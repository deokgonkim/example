
import './App.css'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import Index from './Index'
import HelloPage from './Hello'
import FullPage from './FullPage'

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/hello" element={<HelloPage />} />
        <Route path="/fullpage" element={<FullPage />} />
      </Routes>
    </Router>
  )
}

export default App
