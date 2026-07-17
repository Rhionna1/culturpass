import { useState } from 'react';
import api from '../services/api.js';
import { searchUsers, reassignOrganizer } from '../services/api.js';

// EditEventModal — allows admin to edit any event's details
const EditEventModal = ({ event, onClose, onSaved }) => {
    const [form, setForm] = useState({
        title: event.title || '',
        description: event.description || '',
        category: event.category || '',
        eventDate: event.eventDate || '',
        endDate: event.endDate || '',
        ticketUrl: event.ticketUrl || '',
        priceMin: event.priceMin || '',
        priceMax: event.priceMax || '',
        isFree: event.isFree || false,
        status: event.status || 'active',
        imageUrl: event.imageUrl || '',
        businessName: event.businessName || '',
        happyHourDays: event.happyHourDays || '',
        happyHourStart: event.happyHourStart || '',
        happyHourEnd: event.happyHourEnd || '',
    });

    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    // State for the reassign organizer expandable section
    const [reassignOpen, setReassignOpen] = useState(false);
    const [userSearch, setUserSearch] = useState('');
    const [userResults, setUserResults] = useState([]);
    const [reassignSuccess, setReassignSuccess] = useState('');

    // Update a single form field
    const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

    // Search for users by name or email
    const handleUserSearch = () => {
        if (!userSearch.trim()) return;
        searchUsers(userSearch.trim())
            .then(res => setUserResults(res.data))
            .catch(() => setError('Could not search users.'));
    };

    // Reassign the event organizer to a selected user
    const handleReassign = (userId, displayName) => {
        reassignOrganizer(event.id, userId)
            .then(() => {
                setReassignSuccess(`Organizer reassigned to ${displayName}`);
                setUserResults([]);
                setUserSearch('');
                setTimeout(() => setReassignSuccess(''), 3000);
            })
            .catch(() => setError('Could not reassign organizer.'));
    };

    // Submit the edited event to the admin API
    const handleSave = () => {
        setSaving(true);
        setError('');

        api.put(`/admin/events/${event.id}`, {
            ...form,
            priceMin: form.isFree ? null : parseFloat(form.priceMin) || null,
            priceMax: form.isFree ? null : parseFloat(form.priceMax) || null,
            eventDate: form.eventDate || null,
            endDate: form.endDate || null,
        })
            .then(res => {
                setSaving(false);
                onSaved(res.data);
                onClose();
            })
            .catch(err => {
                setSaving(false);
                const message = err.response?.data?.error || 'Failed to save changes. Please try again.';
                setError(message);
            });
    };

    return (
        <div style={styles.backdrop}>
            <div style={styles.modal}>

                {/* Header */}
                <div style={styles.header}>
                    <h2 style={styles.title}>Edit Event</h2>
                    <button style={styles.closeBtn} onClick={onClose}>✕</button>
                </div>

                {error && <p style={styles.error}>{error}</p>}

                {/* Status */}
                <div style={styles.field}>
                    <label style={styles.label}>Status</label>
                    <select
                        style={styles.input}
                        value={form.status}
                        onChange={e => update('status', e.target.value)}
                    >
                        <option value="active">Active</option>
                        <option value="pending">Pending</option>
                        <option value="rejected">Rejected</option>
                    </select>
                </div>

                {/* Title */}
                <div style={styles.field}>
                    <label style={styles.label}>Title</label>
                    <input
                        style={styles.input}
                        value={form.title}
                        onChange={e => update('title', e.target.value)}
                    />
                </div>

                {/* Category */}
                <div style={styles.field}>
                    <label style={styles.label}>Category</label>
                    <input
                        style={styles.input}
                        value={form.category}
                        onChange={e => update('category', e.target.value)}
                    />
                </div>

                {/* Description */}
                <div style={styles.field}>
                    <label style={styles.label}>Description</label>
                    <textarea
                        style={styles.textarea}
                        value={form.description}
                        onChange={e => update('description', e.target.value)}
                        rows={4}
                    />
                </div>

                {/* Event date and optional end date — only for regular events */}
                {event.eventType !== 'happyhour' && (
                    <>
                        <div style={styles.field}>
                            <label style={styles.label}>Event start date</label>
                            <input
                                style={styles.input}
                                type="datetime-local"
                                value={form.eventDate}
                                onChange={e => update('eventDate', e.target.value)}
                            />
                        </div>
                        <div style={styles.field}>
                            <label style={styles.label}>Event end date (optional — max 7 days from start)</label>
                            <input
                                style={styles.input}
                                type="datetime-local"
                                value={form.endDate}
                                onChange={e => update('endDate', e.target.value)}
                            />
                        </div>
                    </>
                )}

                {/* Happy Hour fields */}
                {event.eventType === 'happyhour' && (
                    <>
                        <div style={styles.field}>
                            <label style={styles.label}>Business name</label>
                            <input
                                style={styles.input}
                                value={form.businessName}
                                onChange={e => update('businessName', e.target.value)}
                            />
                        </div>
                        <div style={styles.field}>
                            <label style={styles.label}>Days</label>
                            <input
                                style={styles.input}
                                value={form.happyHourDays}
                                onChange={e => update('happyHourDays', e.target.value)}
                            />
                        </div>
                        <div style={styles.twoCol}>
                            <div style={styles.field}>
                                <label style={styles.label}>Start time</label>
                                <input
                                    style={styles.input}
                                    value={form.happyHourStart}
                                    onChange={e => update('happyHourStart', e.target.value)}
                                />
                            </div>
                            <div style={styles.field}>
                                <label style={styles.label}>End time</label>
                                <input
                                    style={styles.input}
                                    value={form.happyHourEnd}
                                    onChange={e => update('happyHourEnd', e.target.value)}
                                />
                            </div>
                        </div>
                    </>
                )}

                {/* Ticket URL */}
                <div style={styles.field}>
                    <label style={styles.label}>Ticket URL</label>
                    <input
                        style={styles.input}
                        value={form.ticketUrl}
                        onChange={e => update('ticketUrl', e.target.value)}
                        placeholder="https://..."
                    />
                </div>

                {/* Price */}
                <div style={styles.field}>
                    <div style={styles.freeRow}>
                        <label style={styles.label}>Free event</label>
                        <button
                            onClick={() => update('isFree', !form.isFree)}
                            style={{
                                ...styles.toggle,
                                backgroundColor: form.isFree ? '#D85A30' : '#E8D5C8',
                            }}
                        >
                            <div style={{
                                ...styles.toggleKnob,
                                transform: form.isFree ? 'translateX(20px)' : 'translateX(0)',
                            }} />
                        </button>
                    </div>
                    {!form.isFree && (
                        <div style={styles.twoCol}>
                            <input
                                style={styles.input}
                                placeholder="Min price"
                                value={form.priceMin}
                                onChange={e => update('priceMin', e.target.value)}
                                type="number"
                            />
                            <input
                                style={styles.input}
                                placeholder="Max price"
                                value={form.priceMax}
                                onChange={e => update('priceMax', e.target.value)}
                                type="number"
                            />
                        </div>
                    )}
                </div>

                {/* Image URL */}
                <div style={styles.field}>
                    <label style={styles.label}>Image URL</label>
                    <input
                        style={styles.input}
                        value={form.imageUrl}
                        onChange={e => update('imageUrl', e.target.value)}
                        placeholder="https://..."
                    />
                </div>

                {/* Save button */}
                <button
                    style={{
                        ...styles.saveBtn,
                        opacity: saving ? 0.6 : 1,
                    }}
                    onClick={handleSave}
                    disabled={saving}
                >
                    {saving ? 'Saving...' : 'Save changes'}
                </button>

            </div>
        </div>
    );
};

const styles = {
    backdrop: {
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(26, 15, 10, 0.75)',
        backdropFilter: 'blur(6px)',
        zIndex: 600,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
    },
    modal: {
        backgroundColor: '#F5EBE0',
        borderRadius: '16px',
        padding: '28px',
        width: '100%',
        maxWidth: '540px',
        maxHeight: '90vh',
        overflowY: 'auto',
        position: 'relative',
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
    },
    title: {
        fontSize: '18px',
        fontWeight: '500',
        color: '#3D2B1F',
    },
    closeBtn: {
        background: 'transparent',
        border: 'none',
        fontSize: '16px',
        color: '#8B6A56',
        cursor: 'pointer',
    },
    error: {
        fontSize: '13px',
        color: '#993C1D',
        backgroundColor: '#FAECE7',
        padding: '10px 14px',
        borderRadius: '8px',
        marginBottom: '16px',
    },
    field: {
        marginBottom: '14px',
    },
    label: {
        display: 'block',
        fontSize: '11px',
        fontWeight: '500',
        color: '#6B4F3A',
        marginBottom: '5px',
        textTransform: 'uppercase',
        letterSpacing: '0.04em',
    },
    input: {
        width: '100%',
        padding: '10px 14px',
        fontSize: '13px',
        color: '#3D2B1F',
        backgroundColor: '#FFFFFF',
        border: '0.5px solid #D4B8A8',
        borderRadius: '8px',
        outline: 'none',
        fontFamily: 'inherit',
        boxSizing: 'border-box',
    },
    textarea: {
        width: '100%',
        padding: '10px 14px',
        fontSize: '13px',
        color: '#3D2B1F',
        backgroundColor: '#FFFFFF',
        border: '0.5px solid #D4B8A8',
        borderRadius: '8px',
        outline: 'none',
        fontFamily: 'inherit',
        resize: 'vertical',
        boxSizing: 'border-box',
    },
    twoCol: {
        display: 'flex',
        gap: '10px',
        marginTop: '8px',
    },
    freeRow: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '10px',
    },
    toggle: {
        width: '44px',
        height: '24px',
        borderRadius: '12px',
        border: 'none',
        cursor: 'pointer',
        position: 'relative',
        transition: 'background-color 0.2s',
        padding: 0,
    },
    toggleKnob: {
        position: 'absolute',
        top: '3px',
        left: '3px',
        width: '18px',
        height: '18px',
        borderRadius: '50%',
        backgroundColor: '#FFFFFF',
        transition: 'transform 0.2s',
    },
    saveBtn: {
        width: '100%',
        backgroundColor: '#D85A30',
        color: '#FFFFFF',
        border: 'none',
        borderRadius: '8px',
        padding: '12px',
        fontSize: '13px',
        fontWeight: '500',
        cursor: 'pointer',
        fontFamily: 'inherit',
        marginTop: '8px',
    },
};

export default EditEventModal;