import { Link, useLocation, useNavigate } from 'react-router-dom';
import Logo from '../assets/Logo.jsx';
import { useAuth } from '../context/AuthContext.jsx';

// Navigation bar — appears on every page
const NavBar = ({ onAddEvent, onContact }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { isLoggedIn, isAdmin, user, logout } = useAuth();

    const isActive = (path) => location.pathname === path;

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <nav style={styles.nav}>

            <Link to="/" style={styles.logoLink}>
                <Logo size={36} />
                <span style={styles.brandName}>CULTUR<span style={styles.brandAccent}>PASS</span></span>
            </Link>

            <div style={styles.links}>
                <Link to="/" style={isActive('/') ? styles.linkActive : styles.link}>
                    Discover
                </Link>

                {isLoggedIn() && (
                    <Link
                        to="/my-events"
                        style={isActive('/my-events') ? styles.linkActive : styles.link}
                    >
                        My Events
                    </Link>
                )}

                {isAdmin() && (
                    <Link
                        to="/admin"
                        style={isActive('/admin') ? styles.linkActive : styles.link}
                    >
                        Admin
                    </Link>
                )}

                <button onClick={onAddEvent} style={styles.submitBtn}>
                    + Add Event
                </button>
                <button onClick={onContact} style={styles.envelopeBtn}>
                    ✉️
                </button>

                {isLoggedIn() ? (
                    <div style={styles.userRow}>
                        <span style={styles.userName}>{user?.email?.split('@')[0]}</span>
                        <button onClick={handleLogout} style={styles.logoutBtn}>
                            Sign out
                        </button>
                    </div>
                ) : (
                    <Link
                        to="/signin"
                        style={isActive('/signin') ? styles.linkActive : styles.link}
                    >
                        Sign In
                    </Link>
                )}
            </div>

        </nav>
    );
};

const styles = {
    nav: {
        backgroundColor: '#1A0F0A',
        padding: '12px 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 100,
    },
    logoLink: {
        display: 'flex',
        alignItems: 'center',
    },
    links: {
        display: 'flex',
        alignItems: 'center',
        gap: '28px',
    },
    link: {
        color: '#F5EBE0',
        opacity: 0.7,
        fontSize: '13px',
        letterSpacing: '0.04em',
        textDecoration: 'none',
    },
    linkActive: {
        color: '#F0A882',
        opacity: 1,
        fontSize: '13px',
        letterSpacing: '0.04em',
        textDecoration: 'none',
    },
    submitBtn: {
        backgroundColor: '#D85A30',
        color: '#FFFFFF',
        fontSize: '12px',
        fontWeight: '500',
        letterSpacing: '0.04em',
        padding: '8px 16px',
        borderRadius: '6px',
        border: 'none',
        cursor: 'pointer',
        fontFamily: 'inherit',
    },
    userRow: {
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
    },
    userName: {
        fontSize: '13px',
        color: '#F0A882',
    },
    logoutBtn: {
        background: 'transparent',
        border: '0.5px solid rgba(245,235,224,0.3)',
        borderRadius: '6px',
        padding: '6px 12px',
        fontSize: '12px',
        color: '#F5EBE0',
        cursor: 'pointer',
        fontFamily: 'inherit',
    },
    envelopeBtn: {
        background: 'transparent',
        border: 'none',
        fontSize: '20px',
        cursor: 'pointer',
        padding: '4px',
        display: 'flex',
        alignItems: 'center',
    },
    brandName: {
        fontSize: '14px',
        fontWeight: '500',
        color: '#F5EBE0',
        letterSpacing: '0.08em',
        marginLeft: '10px',
    },
    brandAccent: {
        color: '#D85A30',
    },
};

export default NavBar;