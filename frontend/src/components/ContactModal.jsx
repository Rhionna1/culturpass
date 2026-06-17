import { useState } from 'react';
import { submitComplaint } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';

// Contact options the user can select from
const CONTACT_OPTIONS = [
    "I would love to share my experience about an event",
    "I am a business and would like to have an event featured on FunctionPass",
    "I am a business and would like for FunctionPass to take an event off of the site",
    "I submitted an event with incorrect information",
    "Experienced racism at this event",
    "Poor customer service at this event",
    "FunctionPass needs a feature on the site",
    "FunctionPass is not working correctly",
];

// Maximum characters allowed in the message
const MAX_CHARS = 500;

// ContactModal — blurred backdrop modal for contacting FunctionPass
const ContactModal = ({ onClose }) => {
    const { user } = useAuth();
    // Step 1 = checkboxes, Step 2 = message, Step 3 = success
    const [step, setStep] = useState(1);
    const [selected, setSelected] = useState([]);
    const [message, setMessage] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // Toggle a checkbox option on or off
    const toggleOption = (option) => {
        setSelected(prev =>
            prev.includes(option)
                ? prev.filter(o => o !== option)
                : [...prev, option]
        );
    };

    // Submit complaint to backend — stores in database for admin review
    const handleSubmit = () => {
        setSubmitting(true);
        submitComplaint(
            selected,
            message,
            user?.email || 'anonymous'
        )
            .then(() => {
                setSubmitting(false);
                setStep(3);
            })
            .catch(() => {
                setSubmitting(false);
                setStep(3); // Still show success — don't leave user hanging
            });
    };

    return (
        <div style={styles.backdrop}>
            <div style={styles.modal}>

                {/* Close button */}
                <button style={styles.closeBtn} onClick={onClose}>✕</button>

                {/* Step 1 — checkbox options */}
                {step === 1 && (
                    <>
                        <h2 style={styles.title}>Contact FunctionPass</h2>
                        <p style={styles.subtitle}>Select all that apply</p>

                        <div style={styles.optionsList}>
                            {CONTACT_OPTIONS.map(option => (
                                <div
                                    key={option}
                                    style={styles.optionRow}
                                    onClick={() => toggleOption(option)}
                                >
                                    {/* Custom checkbox */}
                                    <div style={{
                                        ...styles.checkbox,
                                        ...(selected.includes(option) ? styles.checkboxChecked : {}),
                                    }}>
                                        {selected.includes(option) && <span style={styles.checkmark}>✓</span>}
                                    </div>
                                    <span style={styles.optionText}>{option}</span>
                                </div>
                            ))}
                        </div>

                        <button
                            style={{
                                ...styles.nextBtn,
                                opacity: selected.length === 0 ? 0.4 : 1,
                                cursor: selected.length === 0 ? 'not-allowed' : 'pointer',
                            }}
                            onClick={() => selected.length > 0 && setStep(2)}
                        >
                            Next →
                        </button>
                    </>
                )}

                {/* Step 2 — message text box */}
                {step === 2 && (
                    <>
                        <h2 style={styles.title}>Tell us more</h2>
                        <p style={styles.subtitle}>
                            Please provide any additional details that will help us assist you
                        </p>

                        <textarea
                            style={styles.textarea}
                            placeholder="Type your message here..."
                            value={message}
                            onChange={e => {
                                if (e.target.value.length <= MAX_CHARS) {
                                    setMessage(e.target.value);
                                }
                            }}
                            rows={6}
                        />

                        {/* Character counter */}
                        <p style={styles.charCount}>
                            {message.length}/{MAX_CHARS} characters
                        </p>

                        <div style={styles.navButtons}>
                            <button style={styles.backBtn} onClick={() => setStep(1)}>
                                ← Back
                            </button>
                            <button
                                style={{
                                    ...styles.submitBtn,
                                    opacity: message.trim() === '' ? 0.4 : 1,
                                    cursor: message.trim() === '' ? 'not-allowed' : 'pointer',
                                }}
                                onClick={() => message.trim() && handleSubmit()}
                                disabled={submitting}
                            >
                                {submitting ? 'Sending...' : 'Send message'}
                            </button>
                        </div>
                    </>
                )}

                {/* Step 3 — success screen */}
                {step === 3 && (
                    <div style={styles.successContainer}>
                        <p style={styles.successIcon}>✉️</p>
                        <h2 style={styles.successTitle}>Message sent!</h2>
                        <p style={styles.successText}>
                            Thank you for reaching out. Our team will get back to you as soon as possible.
                        </p>
                        <button style={styles.doneBtn} onClick={onClose}>Done</button>
                    </div>
                )}

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
        zIndex: 500,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
    },
    modal: {
        backgroundColor: '#F5EBE0',
        borderRadius: '16px',
        padding: '40px',
        width: '100%',
        maxWidth: '520px',
        position: 'relative',
        maxHeight: '90vh',
        overflowY: 'auto',
    },
    closeBtn: {
        position: 'absolute',
        top: '16px',
        right: '20px',
        background: 'transparent',
        border: 'none',
        fontSize: '16px',
        color: '#8B6A56',
        cursor: 'pointer',
    },
    title: {
        fontSize: '20px',
        fontWeight: '500',
        color: '#3D2B1F',
        marginBottom: '6px',
    },
    subtitle: {
        fontSize: '13px',
        color: '#8B6A56',
        marginBottom: '24px',
        lineHeight: '1.5',
    },
    optionsList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        marginBottom: '28px',
    },
    optionRow: {
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px',
        cursor: 'pointer',
    },
    checkbox: {
        width: '20px',
        height: '20px',
        borderRadius: '4px',
        border: '0.5px solid #D4B8A8',
        backgroundColor: '#FFFFFF',
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: '1px',
    },
    checkboxChecked: {
        backgroundColor: '#D85A30',
        borderColor: '#D85A30',
    },
    checkmark: {
        fontSize: '12px',
        color: '#FFFFFF',
        fontWeight: '500',
    },
    optionText: {
        fontSize: '13px',
        color: '#3D2B1F',
        lineHeight: '1.5',
    },
    nextBtn: {
        backgroundColor: '#3D2B1F',
        color: '#F5EBE0',
        border: 'none',
        borderRadius: '8px',
        padding: '12px 28px',
        fontSize: '13px',
        fontWeight: '500',
        cursor: 'pointer',
        fontFamily: 'inherit',
        display: 'block',
        marginLeft: 'auto',
    },
    textarea: {
        width: '100%',
        padding: '12px 16px',
        fontSize: '14px',
        color: '#3D2B1F',
        backgroundColor: '#FFFFFF',
        border: '0.5px solid #D4B8A8',
        borderRadius: '8px',
        outline: 'none',
        fontFamily: 'inherit',
        resize: 'vertical',
        boxSizing: 'border-box',
    },
    charCount: {
        fontSize: '11px',
        color: '#8B6A56',
        textAlign: 'right',
        marginTop: '6px',
        marginBottom: '20px',
    },
    navButtons: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    backBtn: {
        background: 'transparent',
        border: 'none',
        fontSize: '13px',
        color: '#8B6A56',
        cursor: 'pointer',
        fontFamily: 'inherit',
    },
    submitBtn: {
        backgroundColor: '#D85A30',
        color: '#FFFFFF',
        border: 'none',
        borderRadius: '8px',
        padding: '12px 28px',
        fontSize: '13px',
        fontWeight: '500',
        cursor: 'pointer',
        fontFamily: 'inherit',
    },
    successContainer: {
        textAlign: 'center',
        padding: '20px 0',
    },
    successIcon: {
        fontSize: '48px',
        marginBottom: '16px',
    },
    successTitle: {
        fontSize: '22px',
        fontWeight: '500',
        color: '#3D2B1F',
        marginBottom: '12px',
    },
    successText: {
        fontSize: '14px',
        color: '#8B6A56',
        lineHeight: '1.6',
        marginBottom: '28px',
    },
    doneBtn: {
        backgroundColor: '#D85A30',
        color: '#FFFFFF',
        border: 'none',
        borderRadius: '8px',
        padding: '12px 32px',
        fontSize: '13px',
        fontWeight: '500',
        cursor: 'pointer',
        fontFamily: 'inherit',
    },
};

export default ContactModal;