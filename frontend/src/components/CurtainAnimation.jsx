import { useState, useEffect } from 'react';
import Logo from '../assets/Logo.jsx';

// CurtainAnimation — plays only on the very first visit
const CurtainAnimation = ({ onComplete }) => {
    const [animating, setAnimating] = useState(false);
    const [hidden, setHidden] = useState(false);

    useEffect(() => {
        // Start opening after a brief pause
        const openTimer = setTimeout(() => {
            setAnimating(true);
        }, 500);

        // Hide the curtains completely after animation finishes
        const hideTimer = setTimeout(() => {
            setHidden(true);
            onComplete();
        }, 2500);

        return () => {
            clearTimeout(openTimer);
            clearTimeout(hideTimer);
        };
    }, []);

    if (hidden) return null;

    return (
        <div style={styles.container}>

            {/* Left curtain */}
            <div style={{
                ...styles.curtain,
                ...styles.curtainLeft,
                transform: animating ? 'translateX(-100%)' : 'translateX(0)',
            }} />

            {/* Right curtain */}
            <div style={{
                ...styles.curtain,
                ...styles.curtainRight,
                transform: animating ? 'translateX(100%)' : 'translateX(0)',
            }} />

            {/* Logo centered between curtains */}
            {!animating && (
                <div style={styles.logoContainer}>
                    <Logo size={80} />
                </div>
            )}

        </div>
    );
};

const styles = {
    container: {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 1000,
        display: 'flex',
        overflow: 'hidden',
        pointerEvents: 'none',
    },
    curtain: {
        width: '50%',
        height: '100%',
        backgroundColor: '#1A0F0A',
        transition: 'transform 2s cubic-bezier(0.77, 0, 0.175, 1)',
        position: 'absolute',
        top: 0,
    },
    curtainLeft: {
        left: 0,
    },
    curtainRight: {
        right: 0,
    },
    logoContainer: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 1001,
    },
};

export default CurtainAnimation;