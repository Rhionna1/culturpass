import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import NavBar from './components/NavBar.jsx';
import CurtainAnimation from './components/CurtainAnimation.jsx';
import HomePage from './pages/HomePage.jsx';

// App — sets up routing and curtain animation for the entire application
const App = () => {
    const [showCurtain, setShowCurtain] = useState(false);

    useEffect(() => {
        // Check if this is the user's first visit
        const hasVisited = localStorage.getItem('culturpass_visited');
        if (!hasVisited) {
            setShowCurtain(true);
        }
    }, []);

    const handleCurtainComplete = () => {
        // Mark that the user has visited so curtain never plays again
        localStorage.setItem('culturpass_visited', 'true');
        setShowCurtain(false);
    };

    return (
        <BrowserRouter>
            {showCurtain && (
                <CurtainAnimation onComplete={handleCurtainComplete} />
            )}
            <NavBar />
            <Routes>
                <Route path="/" element={<HomePage />} />
            </Routes>
        </BrowserRouter>
    );
};

export default App;