import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getEventById } from '../services/api.js';

const EventDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getEventById(id)
            .then(res => {
                setEvent(res.data);
                setLoading(false);
            })
            .catch(() => {
                setLoading(false);
            });
    }, [id]);

    if (loading) return <p style={styles.loading}>Loading event...</p>;
    if (!event) return <p style={styles.loading}>Event not found.</p>;

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const formatPrice = (event) => {
        if (event.isFree) return 'Free entry';
        if (event.priceMin && event.priceMax)
            return `$${event.priceMin} – $${event.priceMax}`;
        if (event.priceMin) return `From $${event.priceMin}`;
        return 'See event';
    };

    return (
        <div style={styles.page}>

            <button style={styles.backBtn} onClick={() => navigate(-1)}>
                ← Back
            </button>

            <div style={{
                ...styles.imageBanner,
                backgroundColor: getCategoryColor(event.category),
            }}>
                {event.imageUrl ? (
                    <img src={event.imageUrl} alt={event.title} style={styles.image} />
                ) : (
                    <span style={styles.imageInitial}>
                        {event.category?.charAt(0).toUpperCase()}
                    </span>
                )}
            </div>

            <div style={styles.content}>

                <span style={styles.categoryBadge}>{event.category}</span>

                <h1 style={styles.title}>{event.title}</h1>

                <div style={styles.metaRow}>
                    <span style={styles.metaIcon}>📅</span>
                    <span style={styles.metaText}>{formatDate(event.eventDate)}</span>
                </div>

                {event.location && (
                    <div style={styles.metaRow}>
                        <span style={styles.metaIcon}>📍</span>
                        <span style={styles.metaText}>
                            {event.location.name} — {event.location.city}, {event.location.state}
                        </span>
                    </div>
                )}

                <div style={styles.metaRow}>
                    <span style={styles.metaIcon}>🎟️</span>
                    <span style={{
                        ...styles.metaText,
                        color: event.isFree ? '#3B6D11' : '#D85A30',
                        fontWeight: '500',
                    }}>
                        {formatPrice(event)}
                    </span>
                </div>

                {/* Ticket deadline — only shows if one exists */}
                {event.ticketDeadline && (
                    <div style={styles.metaRow}>
                        <span style={styles.metaIcon}>⏰</span>
                        <span style={{
                            ...styles.metaText,
                            color: '#993C1D',
                            fontWeight: '500',
                        }}>
                            Get tickets by {formatDate(event.ticketDeadline)}
                        </span>
                    </div>
                )}

                <div style={styles.divider} />

                {event.description && (
                    <p style={styles.description}>{event.description}</p>
                )}

                <div style={styles.buttons}>
                    <button style={styles.rsvpBtn}>RSVP Now</button>
                    {event.ticketUrl && (
                        <a href={event.ticketUrl} target="_blank" rel="noopener noreferrer" style={styles.ticketBtn}>
                            Get Tickets ↗
                        </a>
                    )}
                </div>

            </div>
        </div>
    );
};

const getCategoryColor = (category) => {
    const colors = {
        Music: '#2A1810',
        Art: '#BA7517',
        Food: '#3D2B1F',
        Fashion: '#4A1F3A',
        Culture: '#6B4F3A',
        Dance: '#993C1D',
        Film: '#1A0F0A',
        default: '#D85A30',
    };
    return colors[category] || colors.default;
};

const styles = {
    page: {
        backgroundColor: '#F5EBE0',
        minHeight: '100vh',
    },
    loading: {
        padding: '40px 32px',
        color: '#8B6A56',
        fontSize: '14px',
    },
    backBtn: {
        background: 'transparent',
        border: 'none',
        color: '#8B6A56',
        fontSize: '13px',
        cursor: 'pointer',
        padding: '20px 32px',
        display: 'block',
        fontFamily: 'inherit',
    },
    imageBanner: {
        width: '100%',
        height: '300px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
    },
    image: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
    },
    imageInitial: {
        fontSize: '96px',
        color: 'rgba(245, 235, 224, 0.15)',
        fontWeight: '700',
    },
    content: {
        padding: '28px 32px',
        maxWidth: '720px',
    },
    categoryBadge: {
        fontSize: '11px',
        fontWeight: '500',
        color: '#993C1D',
        backgroundColor: '#FAECE7',
        padding: '3px 10px',
        borderRadius: '10px',
        display: 'inline-block',
        marginBottom: '14px',
    },
    title: {
        fontSize: '28px',
        fontWeight: '500',
        color: '#3D2B1F',
        lineHeight: '1.25',
        marginBottom: '20px',
    },
    metaRow: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        marginBottom: '12px',
    },
    metaIcon: {
        fontSize: '16px',
    },
    metaText: {
        fontSize: '14px',
        color: '#6B4F3A',
    },
    divider: {
        borderTop: '0.5px solid #E8D5C8',
        margin: '24px 0',
    },
    description: {
        fontSize: '15px',
        color: '#3D2B1F',
        lineHeight: '1.7',
        marginBottom: '32px',
    },
    buttons: {
        display: 'flex',
        gap: '14px',
    },
    rsvpBtn: {
        backgroundColor: '#D85A30',
        color: '#FFFFFF',
        border: 'none',
        borderRadius: '8px',
        padding: '14px 32px',
        fontSize: '13px',
        fontWeight: '500',
        letterSpacing: '0.04em',
        cursor: 'pointer',
        fontFamily: 'inherit',
    },
    ticketBtn: {
        backgroundColor: 'transparent',
        color: '#3D2B1F',
        border: '0.5px solid #D4B8A8',
        borderRadius: '8px',
        padding: '14px 32px',
        fontSize: '13px',
        letterSpacing: '0.04em',
        textDecoration: 'none',
        display: 'inline-flex',
        alignItems: 'center',
    },
};

export default EventDetailPage;