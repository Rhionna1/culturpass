import { useState, useEffect } from 'react';
import { getFeaturedEvent } from '../services/api.js';

// Hero — featured event section at the top of the homepage
const Hero = () => {
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getFeaturedEvent()
            .then(res => {
                setEvent(res.data);
                setLoading(false);
            })
            .catch(() => {
                setLoading(false);
            });
    }, []);

    return (
        <div style={styles.container}>

            {/* Video/image placeholder — autoplay, muted, no controls */}
            <div style={styles.videoContainer}>
                <video
                    style={styles.video}
                    autoPlay
                    muted
                    loop
                    playsInline
                />
                {/* Dark overlay */}
                <div style={styles.overlay} />
                {/* Play indicator */}
                <div style={styles.playIcon}>▶</div>
            </div>

            {/* Event info below the video */}
            <div style={styles.infoContainer}>
                {loading ? (
                    <p style={styles.loading}>Loading featured event...</p>
                ) : event ? (
                    <>
                        <h1 style={styles.title}>{event.title}</h1>
                        <p style={styles.date}>
                            {new Date(event.eventDate).toLocaleDateString('en-US', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                            })}
                        </p>
                        <div style={styles.buttons}>
                            <button style={styles.rsvpBtn}>RSVP Now</button>
                            <button style={styles.detailsBtn}>View Details</button>
                        </div>
                    </>
                ) : (
                    <p style={styles.loading}>No featured event at this time.</p>
                )}
            </div>

        </div>
    );
};

const styles = {
    container: {
        backgroundColor: '#1A0F0A',
    },
    videoContainer: {
        position: 'relative',
        width: '100%',
        height: '320px',
        backgroundColor: '#2A1810',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    video: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
    },
    overlay: {
        position: 'absolute',
        inset: 0,
        backgroundColor: 'rgba(26, 15, 10, 0.4)',
    },
    playIcon: {
        position: 'absolute',
        fontSize: '24px',
        color: 'rgba(245, 235, 224, 0.5)',
        zIndex: 1,
    },
    infoContainer: {
        padding: '20px 32px 28px',
        backgroundColor: '#1A0F0A',
        borderBottom: '0.5px solid #3D2B1F',
    },
    title: {
        fontSize: '20px',
        fontWeight: '500',
        color: '#F5EBE0',
        letterSpacing: '0.02em',
        marginBottom: '6px',
    },
    date: {
        fontSize: '13px',
        color: '#D4B8A8',
        letterSpacing: '0.03em',
        marginBottom: '16px',
    },
    buttons: {
        display: 'flex',
        gap: '12px',
    },
    rsvpBtn: {
        backgroundColor: '#D85A30',
        color: '#FFFFFF',
        fontSize: '12px',
        fontWeight: '500',
        letterSpacing: '0.06em',
        padding: '10px 24px',
        borderRadius: '6px',
        border: 'none',
        cursor: 'pointer',
    },
    detailsBtn: {
        backgroundColor: 'transparent',
        color: '#F5EBE0',
        fontSize: '12px',
        letterSpacing: '0.06em',
        padding: '10px 24px',
        borderRadius: '6px',
        border: '0.5px solid rgba(245, 235, 224, 0.3)',
        cursor: 'pointer',
    },
    loading: {
        color: '#8B6A56',
        fontSize: '13px',
    },
};

export default Hero;