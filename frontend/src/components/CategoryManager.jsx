import { useState, useEffect } from 'react';
import { getCategories, getDeletedCategories, addCategory, deleteCategory, restoreCategory, restoreAsTemporary } from '../services/api.js';

// CategoryManager — admin component for managing event categories dynamically
const CategoryManager = () => {
    const [categories, setCategories] = useState([]);
    const [deletedCategories, setDeletedCategories] = useState([]);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('active');

    // State for temporary category fields
    const [isTemporary, setIsTemporary] = useState(false);
    const [expiresAt, setExpiresAt] = useState('');

    // Confirmation state — tracks how many times admin has confirmed to delete
    const [confirmingDelete, setConfirmingDelete] = useState(null);
    const [confirmCount, setConfirmCount] = useState(0);

    // State for inline restore form — tracks which category is being restored
    const [restoringId, setRestoringId] = useState(null);
    const [restoreAsTemp, setRestoreAsTemp] = useState(false);
    const [restoreExpiresAt, setRestoreExpiresAt] = useState('');

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = () => {
        setLoading(true);
        Promise.all([
            getCategories(),
            getDeletedCategories(),
        ]).then(([activeRes, deletedRes]) => {
            setCategories(activeRes.data);
            setDeletedCategories(deletedRes.data);
            setLoading(false);
        }).catch(() => setLoading(false));
    };

    // Handle adding a new category — supports temporary categories with expiration dates
    const handleAdd = () => {
        if (!newCategoryName.trim()) return;
        // Temporary categories must have an expiration date
        if (isTemporary && !expiresAt) {
            setError('Please set an expiration date for temporary categories.');
            return;
        }
        addCategory(newCategoryName.trim(), isTemporary, expiresAt || null)
            .then(() => {
                // Reset all fields after successful add
                setNewCategoryName('');
                setIsTemporary(false);
                setExpiresAt('');
                setError('');
                fetchCategories();
            })
            .catch(() => setError('Category already exists or could not be added.'));
    };

    // Triple confirmation delete system
    const handleDeleteClick = (category) => {
        if (confirmingDelete?.id !== category.id) {
            // First click — start confirmation
            setConfirmingDelete(category);
            setConfirmCount(1);
        } else if (confirmCount < 3) {
            // Second and third click — increment count
            setConfirmCount(prev => prev + 1);
        }
    };

    // Final delete — only fires after 3 confirmations
    // Backend blocks deletion if events still reference this category
    const handleFinalDelete = () => {
        if (!confirmingDelete) return;
        deleteCategory(confirmingDelete.id)
            .then(() => {
                setConfirmingDelete(null);
                setConfirmCount(0);
                fetchCategories();
            })
            .catch(err => {
                const message = err.response?.data?.error || 'Could not delete category.';
                setError(message);
                setConfirmingDelete(null);
                setConfirmCount(0);
            });
    };

    // Cancel delete confirmation
    const handleCancelDelete = () => {
        setConfirmingDelete(null);
        setConfirmCount(0);
    };

    // Restore a deleted category as permanent
    const handleRestore = (id) => {
        restoreCategory(id)
            .then(() => {
                setRestoringId(null);
                setRestoreAsTemp(false);
                setRestoreExpiresAt('');
                fetchCategories();
            })
            .catch(() => setError('Could not restore category.'));
    };

    // Restore a deleted category as temporary with an expiration date
    const handleRestoreAsTemporary = (id) => {
        if (!restoreExpiresAt) {
            setError('Please set an expiration date.');
            return;
        }
        restoreAsTemporary(id, restoreExpiresAt)
            .then(() => {
                setRestoringId(null);
                setRestoreAsTemp(false);
                setRestoreExpiresAt('');
                fetchCategories();
            })
            .catch(() => setError('Could not restore category as temporary.'));
    };

    const getDeleteBtnLabel = (category) => {
        if (confirmingDelete?.id !== category.id) return 'Delete';
        if (confirmCount === 1) return 'Are you sure?';
        if (confirmCount === 2) return 'Really sure?';
        return 'Final warning!';
    };

    return (
        <div style={styles.container}>
            <p style={styles.sectionTitle}>Category Management</p>

            {/* Add new category form */}
            <div style={styles.addRow}>
                <input
                    style={styles.input}
                    placeholder="New category name..."
                    value={newCategoryName}
                    onChange={e => setNewCategoryName(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleAdd()}
                />
                <button style={styles.addBtn} onClick={handleAdd}>
                    + Add
                </button>
            </div>

            {/* Temporary category toggle */}
            <div style={styles.tempToggleRow}>
                <label style={styles.tempLabel}>Temporary/seasonal category?</label>
                <button
                    onClick={() => { setIsTemporary(!isTemporary); setExpiresAt(''); }}
                    style={{
                        ...styles.toggle,
                        backgroundColor: isTemporary ? '#D85A30' : '#E8D5C8',
                    }}
                >
                    <div style={{
                        ...styles.toggleKnob,
                        transform: isTemporary ? 'translateX(20px)' : 'translateX(0)',
                    }} />
                </button>
            </div>

            {/* Expiration date — only shows when temporary is toggled on */}
            {isTemporary && (
                <div style={styles.expiresRow}>
                    <label style={styles.tempLabel}>Auto-deletes on:</label>
                    <input
                        style={styles.expiresInput}
                        type="datetime-local"
                        value={expiresAt}
                        onChange={e => setExpiresAt(e.target.value)}
                    />
                </div>
            )}

            {error && <p style={styles.error}>{error}</p>}

            {/* Tab switcher */}
            <div style={styles.tabs}>
                <button
                    style={{ ...styles.tab, ...(activeTab === 'active' ? styles.tabActive : {}) }}
                    onClick={() => setActiveTab('active')}
                >
                    Active ({categories.length})
                </button>
                <button
                    style={{ ...styles.tab, ...(activeTab === 'deleted' ? styles.tabActive : {}) }}
                    onClick={() => setActiveTab('deleted')}
                >
                    Deleted ({deletedCategories.length})
                </button>
            </div>

            {/* Triple confirmation warning */}
            {confirmingDelete && confirmCount === 3 && (
                <div style={styles.confirmBox}>
                    <p style={styles.confirmText}>
                        ⚠️ You are about to delete <strong>{confirmingDelete.name}</strong>.
                        All events in this category will keep their category label but it
                        will no longer appear as a filter option. This can be restored.
                    </p>
                    <div style={styles.confirmBtns}>
                        <button style={styles.confirmDeleteBtn} onClick={handleFinalDelete}>
                            Yes, delete it
                        </button>
                        <button style={styles.cancelBtn} onClick={handleCancelDelete}>
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {loading ? (
                <p style={styles.empty}>Loading categories...</p>
            ) : activeTab === 'active' ? (
                <div style={styles.list}>
                    {categories.map(cat => (
                        <div key={cat.id} style={styles.categoryRow}>
                            <div style={styles.categoryNameRow}>
                                <span style={styles.categoryName}>{cat.name}</span>
                                {/* Show temp badge with expiration date for seasonal categories */}
                                {cat.isTemporary && cat.expiresAt && (
                                    <span style={styles.tempBadge}>
                            ⏳ Expires {new Date(cat.expiresAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                                )}
                            </div>
                            <button
                                style={{
                                    ...styles.deleteBtn,
                                    ...(confirmingDelete?.id === cat.id ? styles.deleteBtnWarning : {}),
                                }}
                                onClick={() => handleDeleteClick(cat)}
                            >
                                {getDeleteBtnLabel(cat)}
                            </button>
                        </div>
                    ))}
                </div>
            ) : (
                <div style={styles.list}>
                    {deletedCategories.length === 0 ? (
                        <p style={styles.empty}>No deleted categories.</p>
                    ) : (
                        deletedCategories.map(cat => (
                            <div key={cat.id}>
                                <div style={styles.categoryRow}>
                                    <span style={{ ...styles.categoryName, color: '#8B6A56' }}>{cat.name}</span>
                                    {/* Show restore options button or cancel */}
                                    {restoringId === cat.id ? (
                                        <button
                                            style={styles.cancelBtn}
                                            onClick={() => { setRestoringId(null); setRestoreAsTemp(false); setRestoreExpiresAt(''); }}
                                        >
                                            Cancel
                                        </button>
                                    ) : (
                                        <button
                                            style={styles.restoreBtn}
                                            onClick={() => setRestoringId(cat.id)}
                                        >
                                            Restore
                                        </button>
                                    )}
                                </div>

                                {/* Inline restore form — shows when Restore is clicked */}
                                {restoringId === cat.id && (
                                    <div style={styles.restoreForm}>
                                        {/* Restore as permanent */}
                                        <button
                                            style={styles.restorePermanentBtn}
                                            onClick={() => handleRestore(cat.id)}
                                        >
                                            Restore as permanent
                                        </button>

                                        {/* Restore as temporary */}
                                        <button
                                            style={{
                                                ...styles.restoreTempBtn,
                                                ...(restoreAsTemp ? styles.restoreTempBtnActive : {}),
                                            }}
                                            onClick={() => setRestoreAsTemp(!restoreAsTemp)}
                                        >
                                            ⏳ Restore as temporary
                                        </button>

                                        {/* Expiration date picker — shows when restore as temp is selected */}
                                        {restoreAsTemp && (
                                            <div style={styles.restoreTempForm}>
                                                <label style={styles.tempLabel}>Auto-deletes on:</label>
                                                <input
                                                    style={styles.expiresInput}
                                                    type="datetime-local"
                                                    value={restoreExpiresAt}
                                                    onChange={e => setRestoreExpiresAt(e.target.value)}
                                                />
                                                <button
                                                    style={styles.confirmTempBtn}
                                                    onClick={() => handleRestoreAsTemporary(cat.id)}
                                                >
                                                    Confirm
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
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
    addRow: {
        display: 'flex',
        gap: '8px',
        marginBottom: '12px',
    },
    input: {
        flex: 1,
        padding: '8px 12px',
        fontSize: '13px',
        color: '#3D2B1F',
        backgroundColor: '#F5EBE0',
        border: '0.5px solid #D4B8A8',
        borderRadius: '6px',
        outline: 'none',
        fontFamily: 'inherit',
    },
    addBtn: {
        backgroundColor: '#D85A30',
        color: '#FFFFFF',
        border: 'none',
        borderRadius: '6px',
        padding: '8px 16px',
        fontSize: '12px',
        fontWeight: '500',
        cursor: 'pointer',
        fontFamily: 'inherit',
    },
    error: {
        fontSize: '12px',
        color: '#993C1D',
        backgroundColor: '#FAECE7',
        padding: '8px 12px',
        borderRadius: '6px',
        marginBottom: '12px',
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
    confirmBox: {
        backgroundColor: '#FAECE7',
        border: '0.5px solid #F0A882',
        borderRadius: '8px',
        padding: '14px',
        marginBottom: '12px',
    },
    confirmText: {
        fontSize: '13px',
        color: '#3D2B1F',
        lineHeight: '1.5',
        marginBottom: '12px',
    },
    confirmBtns: {
        display: 'flex',
        gap: '8px',
    },
    confirmDeleteBtn: {
        backgroundColor: '#993C1D',
        color: '#FFFFFF',
        border: 'none',
        borderRadius: '6px',
        padding: '7px 16px',
        fontSize: '12px',
        fontWeight: '500',
        cursor: 'pointer',
        fontFamily: 'inherit',
    },
    list: {
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '6px',
    },
    categoryRow: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '6px 10px',
        backgroundColor: '#F5EBE0',
        borderRadius: '6px',
        gap: '8px',
    },
    categoryName: {
        fontSize: '13px',
        color: '#3D2B1F',
        fontWeight: '500',
    },
    deleteBtn: {
        backgroundColor: '#FCEBEB',
        color: '#791F1F',
        border: '0.5px solid #F7C1C1',
        borderRadius: '5px',
        padding: '4px 12px',
        fontSize: '11px',
        fontWeight: '500',
        cursor: 'pointer',
        fontFamily: 'inherit',
    },
    deleteBtnWarning: {
        backgroundColor: '#993C1D',
        color: '#FFFFFF',
        borderColor: '#993C1D',
    },
    restoreBtn: {
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
    empty: {
        fontSize: '12px',
        color: '#8B6A56',
    },
    tempToggleRow: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '10px',
    },
    tempLabel: {
        fontSize: '12px',
        fontWeight: '500',
        color: '#6B4F3A',
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
        flexShrink: 0,
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
    expiresRow: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        marginBottom: '12px',
    },
    expiresInput: {
        flex: 1,
        padding: '6px 10px',
        fontSize: '12px',
        color: '#3D2B1F',
        backgroundColor: '#FFFFFF',
        border: '0.5px solid #D4B8A8',
        borderRadius: '6px',
        outline: 'none',
        fontFamily: 'inherit',
    },
    categoryNameRow: {
        display: 'flex',
        flexDirection: 'column',
        gap: '3px',
    },
    tempBadge: {
        fontSize: '10px',
        fontWeight: '500',
        color: '#633806',
        backgroundColor: '#FAEEDA',
        padding: '2px 6px',
        borderRadius: '4px',
        width: 'fit-content',
    },
    restoreForm: {
        backgroundColor: '#F5EBE0',
        border: '0.5px solid #E8D5C8',
        borderRadius: '6px',
        padding: '10px 12px',
        marginTop: '6px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
    },
    restorePermanentBtn: {
        backgroundColor: '#EAF3DE',
        color: '#27500A',
        border: '0.5px solid #C0DD97',
        borderRadius: '6px',
        padding: '6px 12px',
        fontSize: '11px',
        fontWeight: '500',
        cursor: 'pointer',
        fontFamily: 'inherit',
    },
    restoreTempBtn: {
        backgroundColor: '#FAEEDA',
        color: '#633806',
        border: '0.5px solid #FAC775',
        borderRadius: '6px',
        padding: '6px 12px',
        fontSize: '11px',
        fontWeight: '500',
        cursor: 'pointer',
        fontFamily: 'inherit',
    },
    restoreTempBtnActive: {
        backgroundColor: '#D85A30',
        color: '#FFFFFF',
        borderColor: '#D85A30',
    },
    restoreTempForm: {
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
    },
    confirmTempBtn: {
        backgroundColor: '#D85A30',
        color: '#FFFFFF',
        border: 'none',
        borderRadius: '6px',
        padding: '6px 14px',
        fontSize: '11px',
        fontWeight: '500',
        cursor: 'pointer',
        fontFamily: 'inherit',
        alignSelf: 'flex-start',
    },
    cancelBtn: {
        backgroundColor: 'transparent',
        color: '#8B6A56',
        border: '0.5px solid #D4B8A8',
        borderRadius: '5px',
        padding: '4px 12px',
        fontSize: '11px',
        cursor: 'pointer',
        fontFamily: 'inherit',
    },
};

export default CategoryManager;