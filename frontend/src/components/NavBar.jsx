import { Link, useLocation } from 'react-router-dom';
import Logo from '../assets/Logo.jsx';

// Navigation bar — appears on every page
const NavBar = () => {
    const location = useLocation();

    // Helper to check if a link is the current page
    const isActive = (path) => location.pathname === path;

    return (
        <nav style={styles.nav}>

            {/* Logo — clicking it goes to homepage */}
            <Link to="/" style={styles.logoLink}>
                <Logo size={36} />
            </Link>

            {/* Navigation links */}
            <div style={styles.links}>
                <Link
                    to="/"
                    style={isActive('/') ? styles.linkActive : styles.link}
                >
                    Discover
                </Link>
                <Link
                    to="/my-events"
                    style={isActive('/my-events') ? styles.linkActive : styles.link}
                >
                    My Events
                </Link>
                <Link
                    to="/submit-event"
                    style={styles.submitBtn}
                >
                    + Add Event
                </Link>
                <Link
                    to="/signin"
                    style={isActive('/signin') ? styles.linkActive : styles.link}
                >
                    Sign In
                </Link>
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
        transition: 'opacity 0.2s',
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
        textDecoration: 'none',
    },
};

export default NavBar;