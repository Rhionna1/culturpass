import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import NavBar from './components/NavBar.jsx';
import CurtainAnimation from './components/CurtainAnimation.jsx';
import SubmitEventModal from './components/SubmitEventModal.jsx';
import HomePage from './pages/HomePage.jsx';
import EventDetailPage from './pages/EventDetailPage.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import ContactModal from './components/ContactModal.jsx';
import MyEventsPage from './pages/MyEventsPage.jsx';
import { AuthProvider } from './context/AuthContext.jsx';

// App — sets up routing, curtain animation, and event submission modal
const App = () => {
    const [showCurtain, setShowCurtain] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [showContact, setShowContact] = useState(false);

    useEffect(() => {
        const hasVisited = localStorage.getItem('functionpass_visited');
        if (!hasVisited) {
            setShowCurtain(true);
        }
    }, []);

    const handleCurtainComplete = () => {
        localStorage.setItem('functionpass_visited', 'true');
        setShowCurtain(false);
    };

    return (
        <AuthProvider>
            <BrowserRouter>
            {showCurtain && (
                <CurtainAnimation onComplete={handleCurtainComplete} />
            )}
                <NavBar onAddEvent={() => setShowModal(true)} onContact={() => setShowContact(true)} />
            {showModal && (
                <SubmitEventModal onClose={() => setShowModal(false)} />
            )}
                {showContact && (
                    <ContactModal onClose={() => setShowContact(false)} />
                )}
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/events/:id" element={<EventDetailPage />} />
                <Route path="/admin" element={
                    <ProtectedRoute requireAdmin={true}>
                        <AdminDashboard />
                    </ProtectedRoute>
                } />
                <Route path="/my-events" element={
                    <ProtectedRoute>
                        <MyEventsPage />
                    </ProtectedRoute>
                } />
                <Route path="/signin" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
            </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
};

export default App;