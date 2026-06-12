import { useAuth } from '../context/AuthContext.jsx';
import { Navigate } from 'react-router-dom';

// ProtectedRoute — redirects away if user doesn't have the required role
const ProtectedRoute = ({ children, requireAdmin = false }) => {
    const { isLoggedIn, isAdmin } = useAuth();

    // If route requires admin and user is not admin — redirect to homepage
    if (requireAdmin && !isAdmin()) {
        return <Navigate to="/" replace />;
    }

    // If route requires login and user is not logged in — redirect to sign in
    if (!requireAdmin && !isLoggedIn()) {
        return <Navigate to="/signin" replace />;
    }

    return children;
};

export default ProtectedRoute;