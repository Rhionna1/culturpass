import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../services/api.js';
import { getSavedEvents, unsaveEvent } from '../services/api.js';

// MyEventsPage — shows submitted and saved events for the logged in user
const MyEventsPage = () => {
    const { isLoggedIn, user } = useAuth();
    const navigate = useNavigate();

    // Active tab — 'submitted' or 'saved'
    const [activeTab, setActiveTab] = useState('submitted');
    const [submittedEvents, setSubmittedEvents] = useState([]);
    const [savedEvents, setSavedEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isLoggedIn()) {
            navigate('/signin');
            return;
        }
        fetchData();
    }, []);

    const fetchData = () => {
        setLoading(true);
        Promise.all([
            api.get('/events'),
            user?.id ? getSavedEvents(user.id) : Promise.resolve({ data: [] }),
        ]).then(([eventsRes, savedRes]) => {
            setSubmittedEvents(eventsRes.data);
            setSavedEvents(savedRes.data);
            setLoading(false);
        }).catch(() => setLoading(false));
    };

    const getStatusStyle = (status) => {
        const map = {
            active: { backgroundColor: '#EAF3DE', color: '#27500A' },
            pending: { backgroundColor: '#FAEEDA', color: '#633806' },
            rejected: { backgroundColor: '#FCEBEB', color: '#791F1F' },
        };
        return map[status] || map.pending;
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric',
        });
    };

    const getCategoryColor = (category) => {
        const colors = {
            Art: '#BA7517', Culture: '#6B4F3A', Dance: '#993C1D',
            Drink: '#1A3A2A', Family: '#2A4A6B', Fashion: '#4A1F3A',
            Film: '#1A0F0A', Fitness: '#1A3A1A', Food: '#3D2B1F',
            'LGBTQIA+': '#6B1A3A', Music: '#2A1810', Religious: '#3A3A1A',
            'Smoke Friendly': '#2A3A1A', default: '#D85A30',
        };
        return colors[category] || colors.default;
    };

    const handleUnsave = (e, eventId) => {
        e.stopPropagation();
        if (!user?.id) return;
        unsaveEvent(user.id, eventId)
            .then(() => {
                setSavedEvents(prev => prev.filter(se => se.event.id !== eventId));
            })
            .catch(() => {});
    };

    const renderEventCard = (event, showStatus = false, showUnsave = false) => (
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
                    {showStatus && (
                        <span style={{
                            ...styles.statusBadge,
                            ...getStatusStyle(event.status),
                        }}>
              {event.status}
            </span>
                    )}
                    {event.eventType === 'happyhour' && (
                        <span style={styles.happyHourBadge}>🍸</span>
                    )}
                    {showUnsave && (
                        <span
                            style={styles.unsaveBtn}
                            onClick={e => handleUnsave(e, event.id)}
                            title="Remove from saved"
                        >
                        ♥
                    </span>
                    )}
                </div>
                <p style={styles.cardTitle}>{event.title}</p>
                <p style={styles.cardDate}>
                    {event.eventType === 'happyhour'
                        ? `${event.happyHourDays} · ${event.happyHourStart} – ${event.happyHourEnd}`
                        : formatDate(event.eventDate)
                    }
                </p>
            </div>
        </div>
    );

    return (
        <div style={styles.page}>

            <div style={styles.header}>
                <h1 style={styles.title}>My Events</h1>
                {/* Subtitle — updated to FunctionPass brand name */}
                <p style={styles.subtitle}>Your FunctionPass activity</p>
            </div>

            {/* Tab switcher */}
            <div style={styles.tabs}>
                <button
                    style={{
                        ...styles.tab,
                        ...(activeTab === 'submitted' ? styles.tabActive : {}),
                    }}
                    onClick={() => setActiveTab('submitted')}
                >
                    Submitted
                </button>
                <button
                    style={{
                        ...styles.tab,
                        ...(activeTab === 'saved' ? styles.tabActive : {}),
                    }}
                    onClick={() => setActiveTab('saved')}
                >
                    Saved ♥
                </button>
            </div>

            {loading ? (
                <p style={styles.empty}>Loading...</p>
            ) : activeTab === 'submitted' ? (
                submittedEvents.length === 0 ? (
                    <div style={styles.emptyState}>
                        <p style={styles.emptyTitle}>No events yet</p>
                        <p style={styles.emptyText}>
                            Click "+ Add Event" in the navbar to submit your first event.
                        </p>
                    </div>
                ) : (
                    <div style={styles.grid}>
                        {submittedEvents.map(event => renderEventCard(event, true))}
                    </div>
                )
            ) : (
                savedEvents.length === 0 ? (
                    <div style={styles.emptyState}>
                        <p style={styles.emptyTitle}>No saved events</p>
                        <p style={styles.emptyText}>
                            Click the ♡ heart on any event to save it here.
                        </p>
                    </div>
                ) : (
                    <div style={styles.grid}>
                        {savedEvents.map(se => renderEventCard(se.event, false, true))}
                    </div>
                )
            )}

        </div>
    );
};

const styles = {
    page: {
        backgroundColor: '#F5EBE0',
        minHeight: '100vh',
        padding: '32px',
    },
    header: {
        marginBottom: '24px',
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
    tabs: {
        display: 'flex',
        gap: '4px',
        marginBottom: '24px',
        backgroundColor: '#FFFFFF',
        border: '0.5px solid #E8D5C8',
        borderRadius: '8px',
        padding: '4px',
        width: 'fit-content',
    },
    tab: {
        backgroundColor: 'transparent',
        border: 'none',
        borderRadius: '6px',
        padding: '8px 20px',
        fontSize: '13px',
        color: '#8B6A56',
        cursor: 'pointer',
        fontFamily: 'inherit',
        fontWeight: '500',
    },
    tabActive: {
        backgroundColor: '#1A0F0A',
        color: '#F5EBE0',
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
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
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
        gap: '6px',
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
    happyHourBadge: {
        fontSize: '14px',
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
    unsaveBtn: {
        fontSize: '16px',
        color: '#D85A30',
        cursor: 'pointer',
        marginLeft: 'auto',
    },
};

export default MyEventsPage;