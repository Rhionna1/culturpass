import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../services/api.js';

// UserManager — Super Admin only component for managing users and roles
const UserManager = () => {
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = () => {
        setLoading(true);
        api.get('/super-admin/users')
            .then(res => {
                setUsers(res.data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    };

    // Update a user's role
    const handleRoleChange = (userId, newRole) => {
        api.put(`/super-admin/users/${userId}/role`, { role: newRole })
            .then(() => {
                setSuccess(`Role updated to ${newRole}`);
                setTimeout(() => setSuccess(''), 3000);
                fetchUsers();
            })
            .catch(() => setError('Could not update role.'));
    };

    // Ban a user
    const handleBanUser = (userId) => {
        api.put(`/super-admin/users/${userId}/ban`)
            .then(() => {
                setSuccess('User has been banned.');
                setTimeout(() => setSuccess(''), 3000);
                fetchUsers();
            })
            .catch(() => setError('Could not ban user.'));
    };

    // Unban a user
    const handleUnbanUser = (userId) => {
        api.put(`/super-admin/users/${userId}/unban`)
            .then(() => {
                setSuccess('User has been unbanned.');
                setTimeout(() => setSuccess(''), 3000);
                fetchUsers();
            })
            .catch(() => setError('Could not unban user.'));
    };

    const getRoleBadgeStyle = (role) => {
        const map = {
            SUPER_ADMIN: { backgroundColor: '#FAEEDA', color: '#633806' },
            ADMIN: { backgroundColor: '#E6F1FB', color: '#0C447C' },
            USER: { backgroundColor: '#F1EFE8', color: '#444441' },
            BANNED: { backgroundColor: '#FCEBEB', color: '#791F1F' },
        };
        return map[role] || map.USER;
    };

    // Filter users by search term
    const filteredUsers = users.filter(u =>
        u.email?.toLowerCase().includes(search.toLowerCase()) ||
        u.displayName?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <p style={styles.sectionTitle}>👥 User Manager</p>
                <span style={styles.superAdminBadge}>Super Admin Only</span>
            </div>

            {error && <p style={styles.error}>{error}</p>}
            {success && <p style={styles.success}>{success}</p>}

            {/* Search */}
            <input
                style={styles.search}
                placeholder="Search by name or email..."
                value={search}
                onChange={e => setSearch(e.target.value)}
            />

            {loading ? (
                <p style={styles.empty}>Loading users...</p>
            ) : filteredUsers.length === 0 ? (
                <p style={styles.empty}>No users found.</p>
            ) : (
                <div style={styles.list}>
                    {filteredUsers.map(u => (
                        <div key={u.id} style={styles.userCard}>
                            <div style={styles.userInfo}>
                                <p style={styles.userName}>{u.displayName}</p>
                                <p style={styles.userEmail}>{u.email}</p>
                            </div>
                            <div style={styles.userActions}>
                                {/* Role badge */}
                                <span style={{
                                    ...styles.roleBadge,
                                    ...getRoleBadgeStyle(u.role),
                                }}>
                  {u.role}
                </span>

                                {/* Role controls — don't show for current Super Admin */}
                                {u.email !== currentUser?.email && (
                                    <>
                                        {u.role !== 'BANNED' ? (
                                            <>
                                                {/* Promote/demote dropdown */}
                                                <select
                                                    style={styles.roleSelect}
                                                    value={u.role}
                                                    onChange={e => handleRoleChange(u.id, e.target.value)}
                                                >
                                                    <option value="USER">User</option>
                                                    <option value="ADMIN">Admin</option>
                                                    <option value="SUPER_ADMIN">Super Admin</option>
                                                </select>
                                                <button
                                                    style={styles.banUserBtn}
                                                    onClick={() => handleBanUser(u.id)}
                                                >
                                                    Ban
                                                </button>
                                            </>
                                        ) : (
                                            <button
                                                style={styles.unbanUserBtn}
                                                onClick={() => handleUnbanUser(u.id)}
                                            >
                                                Unban
                                            </button>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const styles = {
    container: {
        backgroundColor: '#FFFFFF',
        border: '1px solid #B5D4F4',
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
        color: '#0C447C',
        backgroundColor: '#E6F1FB',
        padding: '2px 8px',
        borderRadius: '10px',
        border: '0.5px solid #B5D4F4',
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
    search: {
        width: '100%',
        padding: '8px 12px',
        fontSize: '13px',
        color: '#3D2B1F',
        backgroundColor: '#F5EBE0',
        border: '0.5px solid #D4B8A8',
        borderRadius: '6px',
        outline: 'none',
        fontFamily: 'inherit',
        boxSizing: 'border-box',
        marginBottom: '12px',
    },
    empty: {
        fontSize: '12px',
        color: '#8B6A56',
    },
    list: {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
    },
    userCard: {
        backgroundColor: '#F5EBE0',
        border: '0.5px solid #E8D5C8',
        borderRadius: '8px',
        padding: '10px 14px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
    },
    userInfo: {
        flex: 1,
        minWidth: 0,
    },
    userName: {
        fontSize: '13px',
        fontWeight: '500',
        color: '#3D2B1F',
        marginBottom: '2px',
    },
    userEmail: {
        fontSize: '11px',
        color: '#8B6A56',
    },
    userActions: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        flexShrink: 0,
    },
    roleBadge: {
        fontSize: '10px',
        fontWeight: '500',
        padding: '2px 8px',
        borderRadius: '10px',
    },
    roleSelect: {
        fontSize: '11px',
        color: '#3D2B1F',
        backgroundColor: '#FFFFFF',
        border: '0.5px solid #D4B8A8',
        borderRadius: '5px',
        padding: '4px 8px',
        cursor: 'pointer',
        fontFamily: 'inherit',
    },
    banUserBtn: {
        backgroundColor: '#FCEBEB',
        color: '#791F1F',
        border: '0.5px solid #F7C1C1',
        borderRadius: '5px',
        padding: '4px 10px',
        fontSize: '11px',
        fontWeight: '500',
        cursor: 'pointer',
        fontFamily: 'inherit',
    },
    unbanUserBtn: {
        backgroundColor: '#EAF3DE',
        color: '#27500A',
        border: '0.5px solid #C0DD97',
        borderRadius: '5px',
        padding: '4px 10px',
        fontSize: '11px',
        fontWeight: '500',
        cursor: 'pointer',
        fontFamily: 'inherit',
    },
};

export default UserManager;