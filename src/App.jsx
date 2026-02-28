import { RouterProvider } from 'react-router-dom'
import router from './router/index.jsx'
import './index.css'

function App() {
  return (
    <div className="antialiased text-slate-900 bg-white">
      <RouterProvider router={router} />
    </div>
  )
}

export default App
