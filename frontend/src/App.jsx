import { BrowserRouter, Routes, Route } from 'react-router-dom';
import NavBar from './components/NavBar.jsx';

// Pages — we will build these one by one
import HomePage from './pages/HomePage.jsx';

// App — sets up routing for the entire application
const App = () => {
  return (
      <BrowserRouter>
        <NavBar />
        <Routes>
          <Route path="/" element={<HomePage />} />
        </Routes>
      </BrowserRouter>
  );
};

export default App;