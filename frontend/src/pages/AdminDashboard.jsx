import { useState, useEffect } from 'react';
import api from '../services/api.js';
import EditEventModal from '../components/EditEventModal.jsx';
import CategoryManager from '../components/CategoryManager.jsx';

// AdminDashboard — protected admin page for managing events
const AdminDashboard = () => {
    const [pendingEvents, setPendingEvents] = useState([]);
    const [stats, setStats] = useState({ pending: 0, active: 0, rejected: 0, total: 0 });
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const [activeNav, setActiveNav] = useState('dashboard');
    // State for the edit modal — null means closed, event object means open
    const [editingEvent, setEditingEvent] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = () => {
        setLoading(true);
        Promise.all([
            api.get('/admin/events/pending'),
            api.get('/events'),
        ]).then(([pendingRes, allRes]) => {
            const pending = pendingRes.data;
            const all = allRes.data;
            setPendingEvents(pending);
            setStats({
                pending: pending.length,
                active: all.filter(e => e.status === 'active').length,
                rejected: all.filter(e => e.status === 'rejected').length,
                total: all.length + pending.length,
            });
            setLoading(false);
        }).catch(() => setLoading(false));
    };

    const handleApprove = (id) => {
        api.put(`/admin/events/${id}/approve`)
            .then(() => fetchData());
    };

    const handleReject = (id) => {
        api.put(`/admin/events/${id}/reject`)
            .then(() => fetchData());
    };

    const handleFeature = (id) => {
        api.put(`/admin/events/${id}/feature`)
            .then(() => fetchData());
    };

    // Handle event saved from edit modal — refresh data
    const handleEventSaved = (updatedEvent) => {
        fetchData();
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric',
        });
    };

    const getCategoryColor = (category) => {
        const map = {
            Music: { bg: '#E6F1FB', color: '#0C447C' },
            Art: { bg: '#FAEEDA', color: '#633806' },
            Food: { bg: '#EAF3DE', color: '#27500A' },
            Fashion: { bg: '#EEEDFE', color: '#3C3489' },
            Culture: { bg: '#FAECE7', color: '#712B13' },
            Dance: { bg: '#FBEAF0', color: '#72243E' },
            Film: { bg: '#F1EFE8', color: '#444441' },
        };
        return map[category] || { bg: '#F1EFE8', color: '#444441' };
    };

    return (
        <div style={styles.wrap}>

            {/* Sidebar */}
            <div style={styles.sidebar}>
                <div style={styles.sidebarLogo}>
                    <p style={styles.brand}>CULTUR<span style={styles.brandAccent}>PASS</span></p>
                    <p style={styles.brandTag}>ADMIN PORTAL</p>
                </div>
                <div style={styles.nav}>
                    {[
                        { id: 'dashboard', icon: 'ti-layout-dashboard', label: 'Dashboard' },
                        { id: 'pending', icon: 'ti-clock', label: 'Pending events' },
                        { id: 'all', icon: 'ti-calendar-event', label: 'All events' },
                        { id: 'users', icon: 'ti-users', label: 'Users' },
                        { id: 'featured', icon: 'ti-star', label: 'Featured event' },
                        { id: 'settings', icon: 'ti-settings', label: 'Settings' },
                    ].map(item => (
                        <div
                            key={item.id}
                            onClick={() => setActiveNav(item.id)}
                            style={{
                                ...styles.navItem,
                                ...(activeNav === item.id ? styles.navItemActive : {}),
                            }}
                        >
                            <i
                                className={`ti ${item.icon}`}
                                style={{ fontSize: '15px', color: activeNav === item.id ? '#D85A30' : 'inherit' }}
                                aria-hidden="true"
                            />
                            {item.label}
                        </div>
                    ))}
                </div>
                <div style={styles.sidebarFooter}>
                    <p style={styles.sidebarFooterText}>
                        Signed in as {user?.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Admin'}
                    </p>
                </div>
            </div>

            {/* Main content */}
            <div style={styles.main}>

                {/* Header */}
                <div style={styles.header}>
                    <div>
                        <p style={styles.headerTitle}>Dashboard</p>
                        <p style={styles.headerSub}>
                            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                    </div>
                    <p style={styles.headerRight}>
                        Welcome back, {user?.displayName || user?.email?.split('@')[0]}!
                        {' '}
                        <span style={{ color: '#D85A30', fontWeight: '500' }}>
              ({user?.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Admin'})
            </span>
                    </p>
                </div>

                {/* Body */}
                <div style={styles.body}>

                    {/* Stats */}
                    <div style={styles.statsGrid}>
                        <div style={styles.statCard}>
                            <p style={styles.statLabel}>Pending review</p>
                            <p style={{ ...styles.statValue, color: '#BA7517' }}>{stats.pending}</p>
                        </div>
                        <div style={styles.statCard}>
                            <p style={styles.statLabel}>Active events</p>
                            <p style={{ ...styles.statValue, color: '#3B6D11' }}>{stats.active}</p>
                        </div>
                        <div style={styles.statCard}>
                            <p style={styles.statLabel}>Rejected</p>
                            <p style={{ ...styles.statValue, color: '#993C1D' }}>{stats.rejected}</p>
                        </div>
                        <div style={styles.statCard}>
                            <p style={styles.statLabel}>Total events</p>
                            <p style={styles.statValue}>{stats.total}</p>
                        </div>
                    </div>

                    {/* Pending events */}
                    <p style={styles.sectionLabel}>Pending approval</p>

                    {loading ? (
                        <p style={styles.empty}>Loading...</p>
                    ) : pendingEvents.length === 0 ? (
                        <p style={styles.empty}>No events pending review.</p>
                    ) : (
                        <div style={styles.eventList}>
                            {pendingEvents.map(event => {
                                const cat = getCategoryColor(event.category);
                                return (
                                    <div key={event.id} style={styles.eventRow}>
                                        <div style={styles.eventInfo}>
                                            <p style={styles.eventTitle}>{event.title}</p>
                                            <p style={styles.eventMeta}>
                                                {formatDate(event.eventDate)} · {event.source}
                                            </p>
                                        </div>
                                        <span style={{
                                            ...styles.badge,
                                            backgroundColor: cat.bg,
                                            color: cat.color,
                                        }}>
                      {event.category}
                    </span>
                                        <div style={styles.actions}>
                                            <button
                                                style={styles.btnApprove}
                                                onClick={() => handleApprove(event.id)}
                                            >
                                                <i className="ti ti-check" style={{ fontSize: '11px' }} aria-hidden="true" />
                                                Approve
                                            </button>
                                            <button
                                                style={styles.btnReject}
                                                onClick={() => handleReject(event.id)}
                                            >
                                                <i className="ti ti-x" style={{ fontSize: '11px' }} aria-hidden="true" />
                                                Reject
                                            </button>
                                            <button
                                                style={styles.btnFeature}
                                                onClick={() => handleFeature(event.id)}
                                            >
                                                <i className="ti ti-star" style={{ fontSize: '11px' }} aria-hidden="true" />
                                                Feature
                                            </button>
                                            <button
                                                style={styles.btnEdit}
                                                onClick={() => setEditingEvent(event)}
                                            >
                                                <i className="ti ti-edit" style={{ fontSize: '11px' }} aria-hidden="true" />
                                                Edit
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
                {/* Category management section */}
                <CategoryManager />
            </div>
            {/* Edit event modal */}
            {editingEvent && (
                <EditEventModal
                    event={editingEvent}
                    onClose={() => setEditingEvent(null)}
                    onSaved={handleEventSaved}
                />
            )}
        </div>
    );
};

const styles = {
    wrap: {
        display: 'flex',
        minHeight: '100vh',
        backgroundColor: '#F5EBE0',
    },
    sidebar: {
        width: '210px',
        backgroundColor: '#1A0F0A',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        position: 'sticky',
        top: 0,
        height: '100vh',
    },
    sidebarLogo: {
        padding: '20px 16px 14px',
        borderBottom: '0.5px solid rgba(245,235,224,0.08)',
    },
    brand: {
        fontSize: '13px',
        fontWeight: '500',
        color: '#F5EBE0',
        letterSpacing: '0.06em',
    },
    brandAccent: {
        color: '#D85A30',
    },
    brandTag: {
        fontSize: '11px',
        color: 'rgba(245,235,224,0.35)',
        letterSpacing: '0.1em',
        marginTop: '2px',
    },
    nav: {
        padding: '10px 0',
        flex: 1,
    },
    navItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '10px 16px',
        fontSize: '12px',
        color: 'rgba(245,235,224,0.55)',
        cursor: 'pointer',
    },
    navItemActive: {
        color: '#F5EBE0',
        backgroundColor: 'rgba(216,90,48,0.18)',
    },
    sidebarFooter: {
        padding: '14px 16px',
        borderTop: '0.5px solid rgba(245,235,224,0.08)',
    },
    sidebarFooterText: {
        fontSize: '11px',
        color: 'rgba(245,235,224,0.35)',
    },
    main: {
        flex: 1,
        backgroundColor: '#F5EBE0',
        display: 'flex',
        flexDirection: 'column',
    },
    header: {
        backgroundColor: '#FFFFFF',
        padding: '14px 24px',
        borderBottom: '0.5px solid #E8D5C8',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    headerTitle: {
        fontSize: '15px',
        fontWeight: '500',
        color: '#3D2B1F',
    },
    headerSub: {
        fontSize: '11px',
        color: '#8B6A56',
        marginTop: '2px',
    },
    headerRight: {
        fontSize: '12px',
        color: '#8B6A56',
    },
    body: {
        padding: '20px 24px',
        flex: 1,
    },
    statsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '12px',
        marginBottom: '24px',
    },
    statCard: {
        backgroundColor: '#FFFFFF',
        border: '0.5px solid #E8D5C8',
        borderRadius: '8px',
        padding: '14px 16px',
    },
    statLabel: {
        fontSize: '11px',
        color: '#8B6A56',
        marginBottom: '6px',
    },
    statValue: {
        fontSize: '22px',
        fontWeight: '500',
        color: '#3D2B1F',
    },
    sectionLabel: {
        fontSize: '13px',
        fontWeight: '500',
        color: '#3D2B1F',
        marginBottom: '12px',
    },
    empty: {
        fontSize: '13px',
        color: '#8B6A56',
    },
    eventList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
    },
    eventRow: {
        backgroundColor: '#FFFFFF',
        border: '0.5px solid #E8D5C8',
        borderRadius: '8px',
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
    },
    eventInfo: {
        flex: 1,
        minWidth: 0,
    },
    eventTitle: {
        fontSize: '13px',
        fontWeight: '500',
        color: '#3D2B1F',
        marginBottom: '3px',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
    },
    eventMeta: {
        fontSize: '11px',
        color: '#8B6A56',
    },
    badge: {
        fontSize: '10px',
        fontWeight: '500',
        padding: '2px 8px',
        borderRadius: '10px',
        whiteSpace: 'nowrap',
        flexShrink: 0,
    },
    actions: {
        display: 'flex',
        gap: '6px',
        flexShrink: 0,
    },
    btnApprove: {
        backgroundColor: '#EAF3DE',
        color: '#27500A',
        border: '0.5px solid #C0DD97',
        borderRadius: '6px',
        padding: '6px 12px',
        fontSize: '11px',
        fontWeight: '500',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        fontFamily: 'inherit',
    },
    btnReject: {
        backgroundColor: '#FCEBEB',
        color: '#791F1F',
        border: '0.5px solid #F7C1C1',
        borderRadius: '6px',
        padding: '6px 12px',
        fontSize: '11px',
        fontWeight: '500',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        fontFamily: 'inherit',
    },
    btnFeature: {
        backgroundColor: '#FAEEDA',
        color: '#633806',
        border: '0.5px solid #FAC775',
        borderRadius: '6px',
        padding: '6px 12px',
        fontSize: '11px',
        fontWeight: '500',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        fontFamily: 'inherit',
    },
    btnEdit: {
        backgroundColor: '#E6F1FB',
        color: '#0C447C',
        border: '0.5px solid #B5D4F4',
        borderRadius: '6px',
        padding: '6px 12px',
        fontSize: '11px',
        fontWeight: '500',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        fontFamily: 'inherit',
    },
};

export default AdminDashboard;