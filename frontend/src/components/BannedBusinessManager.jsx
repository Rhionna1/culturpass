import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../services/api.js';

// BannedBusinessManager — Super Admin only component for banning and unbanning businesses
const BannedBusinessManager = () => {
    const { user } = useAuth();
    const [bans, setBans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('active');

    // Form state for new ban
    const [businessName, setBusinessName] = useState('');
    const [reason, setReason] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        fetchBans();
    }, []);

    const fetchBans = () => {
        setLoading(true);
        api.get('/super-admin/bans')
            .then(res => {
                setBans(res.data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    };

    // Ban a business
    const handleBan = () => {
        if (!businessName.trim() || !reason.trim()) {
            setError('Business name and reason are required.');
            return;
        }
        setError('');
        api.post('/super-admin/bans', {
            businessName: businessName.trim(),
            reason: reason.trim(),
            bannedBy: user?.email,
        })
            .then(() => {
                setBusinessName('');
                setReason('');
                setSuccess(`${businessName} has been banned.`);
                setTimeout(() => setSuccess(''), 3000);
                fetchBans();
            })
            .catch(() => setError('Could not ban business. It may already be banned.'));
    };

    // Unban a business
    const handleUnban = (name) => {
        api.put('/super-admin/bans/unban', { businessName: name })
            .then(() => {
                setSuccess(`${name} has been unbanned.`);
                setTimeout(() => setSuccess(''), 3000);
                fetchBans();
            })
            .catch(() => setError('Could not unban business.'));
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric',
        });
    };

    const activeBans = bans.filter(b => b.isActive);
    const inactiveBans = bans.filter(b => !b.isActive);

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <p style={styles.sectionTitle}>🚫 Business Ban Manager</p>
                <span style={styles.superAdminBadge}>Super Admin Only</span>
            </div>

            {error && <p style={styles.error}>{error}</p>}
            {success && <p style={styles.success}>{success}</p>}

            {/* Ban a new business */}
            <div style={styles.banForm}>
                <p style={styles.formTitle}>Ban a business</p>
                <input
                    style={styles.input}
                    placeholder="Business name (exact name as it appears on events)"
                    value={businessName}
                    onChange={e => setBusinessName(e.target.value)}
                />
                <textarea
                    style={styles.textarea}
                    placeholder="Reason for ban — be specific (e.g. repeatedly rude to Black patrons, viral racism incident)"
                    value={reason}
                    onChange={e => setReason(e.target.value)}
                    rows={3}
                />
                <button style={styles.banBtn} onClick={handleBan}>
                    🚫 Ban this business
                </button>
            </div>

            {/* Tab switcher */}
            <div style={styles.tabs}>
                <button
                    style={{ ...styles.tab, ...(activeTab === 'active' ? styles.tabActive : {}) }}
                    onClick={() => setActiveTab('active')}
                >
                    Active bans ({activeBans.length})
                </button>
                <button
                    style={{ ...styles.tab, ...(activeTab === 'inactive' ? styles.tabActive : {}) }}
                    onClick={() => setActiveTab('inactive')}
                >
                    Unbanned ({inactiveBans.length})
                </button>
            </div>

            {loading ? (
                <p style={styles.empty}>Loading bans...</p>
            ) : (
                <div style={styles.list}>
                    {(activeTab === 'active' ? activeBans : inactiveBans).length === 0 ? (
                        <p style={styles.empty}>
                            {activeTab === 'active' ? 'No active bans.' : 'No unbanned businesses.'}
                        </p>
                    ) : (
                        (activeTab === 'active' ? activeBans : inactiveBans).map(ban => (
                            <div key={ban.id} style={styles.banCard}>
                                <div style={styles.banCardTop}>
                                    <p style={styles.banName}>{ban.businessName}</p>
                                    {ban.isActive && (
                                        <button
                                            style={styles.unbanBtn}
                                            onClick={() => handleUnban(ban.businessName)}
                                        >
                                            Unban
                                        </button>
                                    )}
                                </div>
                                <p style={styles.banReason}>"{ban.reason}"</p>
                                <div style={styles.banMeta}>
                                    <span style={styles.metaItem}>Banned by: {ban.bannedBy}</span>
                                    <span style={styles.metaItem}>Date: {formatDate(ban.createdAt)}</span>
                                    <span style={{
                                        ...styles.statusBadge,
                                        ...(ban.isActive ? styles.badgeActive : styles.badgeInactive),
                                    }}>
                    {ban.isActive ? 'Active ban' : 'Unbanned'}
                  </span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

const styles = {
    container: {
        backgroundColor: '#FFFFFF',
        border: '1px solid #F7C1C1',
        borderRadius: '8px',
        padding: '16px',
        marginTop: '20px',
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '14px',
    },
    sectionTitle: {
        fontSize: '13px',
        fontWeight: '500',
        color: '#3D2B1F',
    },
    superAdminBadge: {
        fontSize: '10px',
        fontWeight: '500',
        color: '#791F1F',
        backgroundColor: '#FCEBEB',
        padding: '2px 8px',
        borderRadius: '10px',
        border: '0.5px solid #F7C1C1',
    },
    error: {
        fontSize: '12px',
        color: '#993C1D',
        backgroundColor: '#FAECE7',
        padding: '8px 12px',
        borderRadius: '6px',
        marginBottom: '12px',
    },
    success: {
        fontSize: '12px',
        color: '#27500A',
        backgroundColor: '#EAF3DE',
        padding: '8px 12px',
        borderRadius: '6px',
        marginBottom: '12px',
    },
    banForm: {
        backgroundColor: '#FDF0F0',
        border: '0.5px solid #F7C1C1',
        borderRadius: '8px',
        padding: '14px',
        marginBottom: '16px',
    },
    formTitle: {
        fontSize: '12px',
        fontWeight: '500',
        color: '#791F1F',
        marginBottom: '10px',
    },
    input: {
        width: '100%',
        padding: '8px 12px',
        fontSize: '13px',
        color: '#3D2B1F',
        backgroundColor: '#FFFFFF',
        border: '0.5px solid #D4B8A8',
        borderRadius: '6px',
        outline: 'none',
        fontFamily: 'inherit',
        boxSizing: 'border-box',
        marginBottom: '8px',
    },
    textarea: {
        width: '100%',
        padding: '8px 12px',
        fontSize: '13px',
        color: '#3D2B1F',
        backgroundColor: '#FFFFFF',
        border: '0.5px solid #D4B8A8',
        borderRadius: '6px',
        outline: 'none',
        fontFamily: 'inherit',
        resize: 'vertical',
        boxSizing: 'border-box',
        marginBottom: '10px',
    },
    banBtn: {
        backgroundColor: '#993C1D',
        color: '#FFFFFF',
        border: 'none',
        borderRadius: '6px',
        padding: '8px 18px',
        fontSize: '12px',
        fontWeight: '500',
        cursor: 'pointer',
        fontFamily: 'inherit',
    },
    tabs: {
        display: 'flex',
        gap: '4px',
        marginBottom: '12px',
        backgroundColor: '#F5EBE0',
        borderRadius: '6px',
        padding: '3px',
        width: 'fit-content',
    },
    tab: {
        backgroundColor: 'transparent',
        border: 'none',
        borderRadius: '4px',
        padding: '5px 14px',
        fontSize: '12px',
        color: '#8B6A56',
        cursor: 'pointer',
        fontFamily: 'inherit',
    },
    tabActive: {
        backgroundColor: '#1A0F0A',
        color: '#F5EBE0',
    },
    list: {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
    },
    empty: {
        fontSize: '12px',
        color: '#8B6A56',
    },
    banCard: {
        backgroundColor: '#F5EBE0',
        border: '0.5px solid #E8D5C8',
        borderRadius: '8px',
        padding: '12px',
    },
    banCardTop: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '6px',
    },
    banName: {
        fontSize: '13px',
        fontWeight: '500',
        color: '#3D2B1F',
    },
    unbanBtn: {
        backgroundColor: '#EAF3DE',
        color: '#27500A',
        border: '0.5px solid #C0DD97',
        borderRadius: '5px',
        padding: '4px 12px',
        fontSize: '11px',
        fontWeight: '500',
        cursor: 'pointer',
        fontFamily: 'inherit',
    },
    banReason: {
        fontSize: '12px',
        color: '#6B4F3A',
        fontStyle: 'italic',
        marginBottom: '8px',
        lineHeight: '1.5',
    },
    banMeta: {
        display: 'flex',
        gap: '12px',
        flexWrap: 'wrap',
        alignItems: 'center',
    },
    metaItem: {
        fontSize: '11px',
        color: '#8B6A56',
    },
    statusBadge: {
        fontSize: '10px',
        fontWeight: '500',
        padding: '2px 8px',
        borderRadius: '10px',
    },
    badgeActive: {
        backgroundColor: '#FCEBEB',
        color: '#791F1F',
    },
    badgeInactive: {
        backgroundColor: '#EAF3DE',
        color: '#27500A',
    },
};

export default BannedBusinessManager;