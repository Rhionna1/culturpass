import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { isEventSaved, saveEvent, unsaveEvent } from '../services/api.js';

// EventCard — displays a single event in the discovery grid
const EventCard = ({ event }) => {
    const navigate = useNavigate();
    const { isLoggedIn, user } = useAuth();

    // State for whether this event is saved by the current user
    const [saved, setSaved] = useState(false);
    const [savingInProgress, setSavingInProgress] = useState(false);

    // Check if this event is already saved when the card loads
    useEffect(() => {
        if (isLoggedIn() && user) {
            isEventSaved(user.id, event.id)
                .then(res => setSaved(res.data.saved))
                .catch(() => {});
        }
    }, [event.id]);

    // Toggle save/unsave when heart is clicked
    const handleSave = (e) => {
        // Stop the click from navigating to the event detail page
        e.stopPropagation();

        if (!isLoggedIn()) {
            navigate('/signin');
            return;
        }

        if (savingInProgress) return;
        setSavingInProgress(true);

        if (saved) {
            unsaveEvent(user.id, event.id)
                .then(() => {
                    setSaved(false);
                    setSavingInProgress(false);
                })
                .catch(() => setSavingInProgress(false));
        } else {
            saveEvent(user.id, event.id)
                .then(() => {
                    setSaved(true);
                    setSavingInProgress(false);
                })
                .catch(() => setSavingInProgress(false));
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    // Formats a date range for multi-day events — e.g. "Jun 20 – Jun 22, 2026"
    const formatDateRange = (start, end) => {
        const startDate = new Date(start);
        const endDate = new Date(end);
        const startStr = startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const endStr = endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        return `${startStr} – ${endStr}`;
    };

    const formatPrice = (event) => {
        if (event.isFree) return { text: 'Free entry', free: true };
        if (event.priceMin && event.priceMax)
            return { text: `$${event.priceMin} – $${event.priceMax}`, free: false };
        if (event.priceMin)
            return { text: `From $${event.priceMin}`, free: false };
        return { text: 'See event', free: false };
    };

    const price = formatPrice(event);

    return (
        <div style={styles.card} onClick={() => navigate(`/events/${event.id}`)}>

            {/* Event image placeholder */}
            <div style={{
                ...styles.imagePlaceholder,
                backgroundColor: getCategoryColor(event.category),
            }}>
        <span style={styles.categoryInitial}>
          {event.category?.charAt(0).toUpperCase()}
        </span>
            </div>

            {/* Card body */}
            <div style={styles.body}>

                {/* Category badges + save button */}
                <div style={styles.topRow}>
                    <div style={styles.badgeRow}>
                        <span style={styles.categoryBadge}>{event.category}</span>
                        {event.eventType === 'happyhour' && (
                            <span style={styles.happyHourBadge}>🍸 Happy Hour</span>
                        )}
                    </div>
                    {/* Heart icon — filled if saved, outline if not */}
                    <span
                        style={{
                            ...styles.heartBtn,
                            color: saved ? '#D85A30' : '#D4B8A8',
                        }}
                        onClick={handleSave}
                        title={saved ? 'Remove from saved' : 'Save event'}
                    >
            {saved ? '♥' : '♡'}
          </span>
                </div>

                {/* Event title */}
                <p style={styles.title}>{event.title}</p>

                {/* Date or Happy Hour hours */}
                {event.eventType === 'happyhour' ? (
                    <p style={styles.meta}>
                        🍸 {event.happyHourDays} · {event.happyHourStart} – {event.happyHourEnd}
                    </p>
                ) : event.endDate ? (
                    <p style={styles.meta}>
                        📅 {formatDateRange(event.eventDate, event.endDate)}
                    </p>
                ) : (
                    <p style={styles.meta}>
                        📅 {formatDate(event.eventDate)}
                    </p>
                )}

                {/* Price */}
                <p style={{
                    ...styles.price,
                    color: price.free ? '#3B6D11' : '#D85A30',
                }}>
                    {price.text}
                </p>

            </div>
        </div>
    );
};

// Assigns a color to each category for the image placeholder
const getCategoryColor = (category) => {
    const colors = {
        Art: '#BA7517',
        Culture: '#6B4F3A',
        Dance: '#993C1D',
        Drink: '#1A3A2A',
        Family: '#2A4A6B',
        Fashion: '#4A1F3A',
        Film: '#1A0F0A',
        Fitness: '#1A3A1A',
        Food: '#3D2B1F',
        'LGBTQIA+': '#6B1A3A',
        Music: '#2A1810',
        Religious: '#3A3A1A',
        'Smoke Friendly': '#2A3A1A',
        default: '#D85A30',
    };
    return colors[category] || colors.default;
};

const styles = {
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: '8px',
        border: '0.5px solid #E8D5C8',
        overflow: 'hidden',
        breakInside: 'avoid',
        marginBottom: '16px',
        cursor: 'pointer',
    },
    imagePlaceholder: {
        width: '100%',
        height: '200px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    categoryInitial: {
        fontSize: '48px',
        color: 'rgba(245, 235, 224, 0.2)',
        fontWeight: '700',
    },
    body: {
        padding: '12px 14px',
    },
    topRow: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '8px',
    },
    badgeRow: {
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        flexWrap: 'wrap',
    },
    categoryBadge: {
        fontSize: '10px',
        fontWeight: '500',
        color: '#993C1D',
        backgroundColor: '#FAECE7',
        padding: '2px 8px',
        borderRadius: '10px',
    },
    happyHourBadge: {
        fontSize: '10px',
        fontWeight: '500',
        color: '#1A3A2A',
        backgroundColor: '#E1F5EE',
        padding: '2px 8px',
        borderRadius: '10px',
    },
    heartBtn: {
        fontSize: '18px',
        cursor: 'pointer',
        transition: 'color 0.2s',
    },
    title: {
        fontSize: '13px',
        fontWeight: '500',
        color: '#3D2B1F',
        marginBottom: '6px',
        lineHeight: '1.4',
    },
    meta: {
        fontSize: '11px',
        color: '#8B6A56',
        marginBottom: '4px',
    },
    price: {
        fontSize: '12px',
        fontWeight: '500',
        marginTop: '6px',
    },
};

export default EventCard;