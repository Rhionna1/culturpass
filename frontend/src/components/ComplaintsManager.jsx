import { useState, useEffect } from 'react';
import { getAllComplaints, getUnreviewedComplaints, getRacismComplaints, reviewComplaint } from '../services/api.js';

// ComplaintsManager — admin component for viewing and managing complaints
const ComplaintsManager = () => {
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState('all');
    const [reviewingId, setReviewingId] = useState(null);
    const [adminNotes, setAdminNotes] = useState('');

    useEffect(() => {
        fetchComplaints(activeFilter);
    }, [activeFilter]);

    const fetchComplaints = (filter) => {
        setLoading(true);
        const call = filter === 'racism' ? getRacismComplaints()
            : filter === 'unreviewed' ? getUnreviewedComplaints()
                : getAllComplaints();

        call
            .then(res => {
                setComplaints(res.data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    };

    const handleReview = (id) => {
        reviewComplaint(id, adminNotes)
            .then(() => {
                setReviewingId(null);
                setAdminNotes('');
                fetchComplaints(activeFilter);
            })
            .catch(() => {});
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric',
            hour: '2-digit', minute: '2-digit',
        });
    };

    return (
        <div style={styles.container}>
            <p style={styles.sectionTitle}>Complaints & Messages</p>

            {/* Filter tabs */}
            <div style={styles.filters}>
                {[
                    { key: 'all', label: 'All' },
                    { key: 'unreviewed', label: 'Unreviewed' },
                    { key: 'racism', label: '🚨 Racism Reports' },
                ].map(f => (
                    <button
                        key={f.key}
                        style={{
                            ...styles.filterBtn,
                            ...(activeFilter === f.key ? styles.filterBtnActive : {}),
                            ...(f.key === 'racism' ? styles.filterBtnRacism : {}),
                        }}
                        onClick={() => setActiveFilter(f.key)}
                    >
                        {f.label}
                    </button>
                ))}
            </div>

            {loading ? (
                <p style={styles.empty}>Loading complaints...</p>
            ) : complaints.length === 0 ? (
                <p style={styles.empty}>No complaints found.</p>
            ) : (
                <div style={styles.list}>
                    {complaints.map(complaint => (
                        <div
                            key={complaint.id}
                            style={{
                                ...styles.card,
                                ...(complaint.isRacismComplaint ? styles.cardRacism : {}),
                                ...(complaint.reviewed ? styles.cardReviewed : {}),
                            }}
                        >
                            {/* Racism flag */}
                            {complaint.isRacismComplaint && (
                                <div style={styles.racismFlag}>
                                    🚨 Racism Report — Priority Review Required
                                </div>
                            )}

                            {/* Complaint type */}
                            <p style={styles.complaintType}>{complaint.complaintTypes}</p>

                            {/* Message */}
                            <p style={styles.message}>"{complaint.message}"</p>

                            {/* Meta info */}
                            <div style={styles.meta}>
                <span style={styles.metaItem}>
                  👤 {complaint.submittedBy}
                </span>
                                <span style={styles.metaItem}>
                  🕐 {formatDate(complaint.createdAt)}
                </span>
                                <span style={{
                                    ...styles.statusBadge,
                                    ...(complaint.reviewed ? styles.badgeReviewed : styles.badgePending),
                                }}>
                  {complaint.reviewed ? 'Reviewed' : 'Pending review'}
                </span>
                            </div>

                            {/* Admin notes if reviewed */}
                            {complaint.reviewed && complaint.adminNotes && (
                                <div style={styles.adminNotes}>
                                    <p style={styles.adminNotesLabel}>Admin notes:</p>
                                    <p style={styles.adminNotesText}>{complaint.adminNotes}</p>
                                </div>
                            )}

                            {/* Review form */}
                            {!complaint.reviewed && (
                                reviewingId === complaint.id ? (
                                    <div style={styles.reviewForm}>
                    <textarea
                        style={styles.notesInput}
                        placeholder="Add admin notes (optional)..."
                        value={adminNotes}
                        onChange={e => setAdminNotes(e.target.value)}
                        rows={3}
                    />
                                        <div style={styles.reviewBtns}>
                                            <button
                                                style={styles.markReviewedBtn}
                                                onClick={() => handleReview(complaint.id)}
                                            >
                                                ✓ Mark as reviewed
                                            </button>
                                            <button
                                                style={styles.cancelBtn}
                                                onClick={() => {
                                                    setReviewingId(null);
                                                    setAdminNotes('');
                                                }}
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <button
                                        style={styles.reviewBtn}
                                        onClick={() => setReviewingId(complaint.id)}
                                    >
                                        Review this complaint
                                    </button>
                                )
                            )}
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
        border: '0.5px solid #E8D5C8',
        borderRadius: '8px',
        padding: '16px',
        marginTop: '20px',
    },
    sectionTitle: {
        fontSize: '13px',
        fontWeight: '500',
        color: '#3D2B1F',
        marginBottom: '14px',
    },
    filters: {
        display: 'flex',
        gap: '8px',
        marginBottom: '14px',
        flexWrap: 'wrap',
    },
    filterBtn: {
        backgroundColor: '#F5EBE0',
        border: '0.5px solid #D4B8A8',
        borderRadius: '20px',
        padding: '5px 14px',
        fontSize: '12px',
        color: '#6B4F3A',
        cursor: 'pointer',
        fontFamily: 'inherit',
        fontWeight: '500',
    },
    filterBtnActive: {
        backgroundColor: '#1A0F0A',
        borderColor: '#1A0F0A',
        color: '#F5EBE0',
    },
    filterBtnRacism: {
        borderColor: '#F7C1C1',
    },
    empty: {
        fontSize: '12px',
        color: '#8B6A56',
    },
    list: {
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
    },
    card: {
        backgroundColor: '#F5EBE0',
        border: '0.5px solid #E8D5C8',
        borderRadius: '8px',
        padding: '14px',
    },
    cardRacism: {
        backgroundColor: '#FDF0F0',
        borderColor: '#F7C1C1',
        borderWidth: '1px',
    },
    cardReviewed: {
        opacity: 0.7,
    },
    racismFlag: {
        fontSize: '12px',
        fontWeight: '500',
        color: '#791F1F',
        backgroundColor: '#FCEBEB',
        padding: '6px 10px',
        borderRadius: '6px',
        marginBottom: '10px',
    },
    complaintType: {
        fontSize: '12px',
        fontWeight: '500',
        color: '#3D2B1F',
        marginBottom: '6px',
    },
    message: {
        fontSize: '13px',
        color: '#6B4F3A',
        lineHeight: '1.5',
        marginBottom: '10px',
        fontStyle: 'italic',
    },
    meta: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        flexWrap: 'wrap',
        marginBottom: '10px',
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
    badgePending: {
        backgroundColor: '#FAEEDA',
        color: '#633806',
    },
    badgeReviewed: {
        backgroundColor: '#EAF3DE',
        color: '#27500A',
    },
    adminNotes: {
        backgroundColor: '#FFFFFF',
        border: '0.5px solid #E8D5C8',
        borderRadius: '6px',
        padding: '10px 12px',
        marginBottom: '8px',
    },
    adminNotesLabel: {
        fontSize: '10px',
        fontWeight: '500',
        color: '#8B6A56',
        textTransform: 'uppercase',
        letterSpacing: '0.04em',
        marginBottom: '4px',
    },
    adminNotesText: {
        fontSize: '12px',
        color: '#3D2B1F',
        lineHeight: '1.5',
    },
    reviewBtn: {
        backgroundColor: 'transparent',
        border: '0.5px solid #D4B8A8',
        borderRadius: '6px',
        padding: '6px 14px',
        fontSize: '11px',
        color: '#6B4F3A',
        cursor: 'pointer',
        fontFamily: 'inherit',
        fontWeight: '500',
    },
    reviewForm: {
        marginTop: '8px',
    },
    notesInput: {
        width: '100%',
        padding: '8px 12px',
        fontSize: '12px',
        color: '#3D2B1F',
        backgroundColor: '#FFFFFF',
        border: '0.5px solid #D4B8A8',
        borderRadius: '6px',
        outline: 'none',
        fontFamily: 'inherit',
        resize: 'vertical',
        boxSizing: 'border-box',
        marginBottom: '8px',
    },
    reviewBtns: {
        display: 'flex',
        gap: '8px',
    },
    markReviewedBtn: {
        backgroundColor: '#EAF3DE',
        color: '#27500A',
        border: '0.5px solid #C0DD97',
        borderRadius: '6px',
        padding: '6px 14px',
        fontSize: '11px',
        fontWeight: '500',
        cursor: 'pointer',
        fontFamily: 'inherit',
    },
    cancelBtn: {
        backgroundColor: 'transparent',
        color: '#8B6A56',
        border: '0.5px solid #D4B8A8',
        borderRadius: '6px',
        padding: '6px 14px',
        fontSize: '11px',
        cursor: 'pointer',
        fontFamily: 'inherit',
    },
};

export default ComplaintsManager;