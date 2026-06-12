import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../services/api.js';

// MyEventsPage — shows all events submitted by the logged in user
const MyEventsPage = () => {
    const { isLoggedIn, user } = useAuth();
    const navigate = useNavigate();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isLoggedIn()) {
            navigate('/signin');
            return;
        }
        fetchMyEvents();
    }, []);

    const fetchMyEvents = () => {
        api.get('/events')
            .then(res => {
                setEvents(res.data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    };

    const getStatusStyle = (status) => {
        const styles = {
            active: { backgroundColor: '#EAF3DE', color: '#27500A' },
            pending: { backgroundColor: '#FAEEDA', color: '#633806' },
            rejected: { backgroundColor: '#FCEBEB', color: '#791F1F' },
        };
        return styles[status] || styles.pending;
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric',
        });
    };

    return (
        <div style={styles.page}>

            <div style={styles.header}>
                <h1 style={styles.title}>My Events</h1>
                <p style={styles.subtitle}>Events you have submitted to CulturPass</p>
            </div>

            {loading ? (
                <p style={styles.empty}>Loading your events...</p>
            ) : events.length === 0 ? (
                <div style={styles.emptyState}>
                    <p style={styles.emptyTitle}>No events yet</p>
                    <p style={styles.emptyText}>
                        You haven't submitted any events. Click "+ Add Event" in the navbar to get started.
                    </p>
                </div>
            ) : (
                <div style={styles.list}>
                    {events.map(event => (
                        <div
                            key={event.id}
                            style={styles.card}
                            onClick={() => navigate(`/events/${event.id}`)}
                        >
                            <div style={{
                                ...styles.imageBand,
                                backgroundColor: getCategoryColor(event.category),
                            }} />
                            <div style={styles.cardBody}>
                                <div style={styles.cardTop}>
                                    <span style={styles.category}>{event.category}</span>
                                    <span style={{
                                        ...styles.statusBadge,
                                        ...getStatusStyle(event.status),
                                    }}>
                    {event.status}
                  </span>
                                </div>
                                <p style={styles.cardTitle}>{event.title}</p>
                                <p style={styles.cardDate}>{formatDate(event.eventDate)}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

        </div>
    );
};

const getCategoryColor = (category) => {
    const colors = {
        Music: '#2A1810', Art: '#BA7517', Food: '#3D2B1F',
        Fashion: '#4A1F3A', Culture: '#6B4F3A', Dance: '#993C1D',
        Film: '#1A0F0A', default: '#D85A30',
    };
    return colors[category] || colors.default;
};

const styles = {
    page: {
        backgroundColor: '#F5EBE0',
        minHeight: '100vh',
        padding: '32px',
    },
    header: {
        marginBottom: '28px',
    },
    title: {
        fontSize: '22px',
        fontWeight: '500',
        color: '#3D2B1F',
        marginBottom: '6px',
    },
    subtitle: {
        fontSize: '13px',
        color: '#8B6A56',
    },
    empty: {
        fontSize: '13px',
        color: '#8B6A56',
    },
    emptyState: {
        backgroundColor: '#FFFFFF',
        border: '0.5px solid #E8D5C8',
        borderRadius: '12px',
        padding: '40px',
        textAlign: 'center',
        maxWidth: '480px',
    },
    emptyTitle: {
        fontSize: '16px',
        fontWeight: '500',
        color: '#3D2B1F',
        marginBottom: '8px',
    },
    emptyText: {
        fontSize: '13px',
        color: '#8B6A56',
        lineHeight: '1.6',
    },
    list: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
        gap: '16px',
    },
    card: {
        backgroundColor: '#FFFFFF',
        border: '0.5px solid #E8D5C8',
        borderRadius: '10px',
        overflow: 'hidden',
        cursor: 'pointer',
    },
    imageBand: {
        width: '100%',
        height: '100px',
    },
    cardBody: {
        padding: '14px 16px',
    },
    cardTop: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '8px',
    },
    category: {
        fontSize: '10px',
        fontWeight: '500',
        color: '#993C1D',
        backgroundColor: '#FAECE7',
        padding: '2px 8px',
        borderRadius: '10px',
    },
    statusBadge: {
        fontSize: '10px',
        fontWeight: '500',
        padding: '2px 8px',
        borderRadius: '10px',
        textTransform: 'capitalize',
    },
    cardTitle: {
        fontSize: '13px',
        fontWeight: '500',
        color: '#3D2B1F',
        marginBottom: '4px',
        lineHeight: '1.4',
    },
    cardDate: {
        fontSize: '11px',
        color: '#8B6A56',
    },
};

export default MyEventsPage;