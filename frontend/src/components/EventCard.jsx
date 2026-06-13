import { useNavigate } from 'react-router-dom';

// EventCard — displays a single event in the discovery grid
const EventCard = ({ event }) => {
    const navigate = useNavigate();
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
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

                {/* Category badge + happy hour badge + save button */}
                <div style={styles.topRow}>
                    <div style={styles.badgeRow}>
                        <span style={styles.categoryBadge}>{event.category}</span>
                        {event.eventType === 'happyhour' && (
                            <span style={styles.happyHourBadge}>🍸 Happy Hour</span>
                        )}
                    </div>
                    <span style={styles.heartBtn}>♡</span>
                </div>

                {/* Event title */}
                <p style={styles.title}>{event.title}</p>

                {/* Date */}
                <p style={styles.meta}>
                    📅 {formatDate(event.eventDate)}
                </p>

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
    categoryBadge: {
        fontSize: '10px',
        fontWeight: '500',
        color: '#993C1D',
        backgroundColor: '#FAECE7',
        padding: '2px 8px',
        borderRadius: '10px',
    },
    heartBtn: {
        fontSize: '16px',
        color: '#D4B8A8',
        cursor: 'pointer',
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
    badgeRow: {
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        flexWrap: 'wrap',
    },
    happyHourBadge: {
        fontSize: '10px',
        fontWeight: '500',
        color: '#1A3A2A',
        backgroundColor: '#E1F5EE',
        padding: '2px 8px',
        borderRadius: '10px',
    },
};

export default EventCard;