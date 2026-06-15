import { useState, useEffect } from 'react';
import { createEvent, getCategories } from '../services/api.js';

const TOTAL_STEPS = 9;

// SubmitEventModal — multi-step event submission form
const SubmitEventModal = ({ onClose }) => {
    // Dynamic categories fetched from the backend
    const [categories, setCategories] = useState([]);

    // Fetch categories on modal open
    useEffect(() => {
        getCategories()
            .then(res => setCategories(res.data.map(c => c.name)))
            .catch(() => {});
    }, []);
    const [step, setStep] = useState(1);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [form, setForm] = useState({
        eventType: 'event',
        title: '',
        category: '',
        description: '',
        eventDate: '',
        venueName: '',
        address: '',
        city: '',
        state: '',
        ticketUrl: '',
        ticketDeadline: '',
        isFree: false,
        priceMin: '',
        priceMax: '',
        imageUrl: '',
        businessName: '',
        happyHourDays: '',
        happyHourStart: '',
        happyHourEnd: '',
    });

    const update = (field, value) => {
        setForm(prev => ({ ...prev, [field]: value }));
    };

    const isStepValid = () => {
        switch (step) {
            case 1: return form.title.trim() !== '';
            case 2: return form.category !== '';
            case 3: return form.description.trim() !== '';
            case 4: return form.eventDate !== '';
            case 5: return form.venueName.trim() !== '' && form.address.trim() !== '' && form.city.trim() !== '';
            case 6: return form.ticketUrl.trim() !== '';
            case 7: return form.isFree || (form.priceMin !== '' && form.priceMax !== '');
            case 8: return form.imageUrl.trim() !== '';
            default: return true;
        }
    };

    const next = () => {
        if (isStepValid()) {
            setStep(prev => Math.min(prev + 1, TOTAL_STEPS));
        }
    };
    const back = () => setStep(prev => Math.max(prev - 1, 1));

    const handleSubmit = () => {
        setSubmitting(true);
        const payload = {
            eventType: form.eventType,
            title: form.title,
            category: form.category,
            description: form.description,
            eventDate: form.eventType === 'happyhour' ? null : form.eventDate,
            ticketUrl: form.ticketUrl || null,
            ticketDeadline: form.ticketDeadline || null,
            isFree: form.isFree,
            priceMin: form.isFree ? null : parseFloat(form.priceMin) || null,
            priceMax: form.isFree ? null : parseFloat(form.priceMax) || null,
            imageUrl: form.imageUrl,
            // Location fields — sent separately so backend can find or create location
            venueName: form.venueName,
            address: form.address,
            city: form.city,
            state: form.state || '',
            // Happy Hour specific fields
            businessName: form.eventType === 'happyhour' ? form.businessName : null,
            happyHourDays: form.eventType === 'happyhour' ? form.happyHourDays : null,
            happyHourStart: form.eventType === 'happyhour' ? form.happyHourStart : null,
            happyHourEnd: form.eventType === 'happyhour' ? form.happyHourEnd : null,
            source: 'user',
            status: 'pending',
        };

        createEvent(payload)
            .then(() => {
                setSubmitting(false);
                setSubmitted(true);
            })
            .catch(() => {
                setSubmitting(false);
            });
    };

    const renderStep = () => {
        switch (step) {
            case 1:
                return (
                    <StepWrapper
                        step={step}
                        question="What type of listing is this?"
                        hint="Choose the type that best describes what you are posting"
                    >
                        <div style={styles.categoryGrid}>
                            <button
                                onClick={() => update('eventType', 'event')}
                                style={{
                                    ...styles.categoryBtn,
                                    ...(form.eventType === 'event' ? styles.categoryBtnActive : {}),
                                }}
                            >
                                🎭 Event
                            </button>
                            <button
                                onClick={() => update('eventType', 'happyhour')}
                                style={{
                                    ...styles.categoryBtn,
                                    ...(form.eventType === 'happyhour' ? styles.categoryBtnActive : {}),
                                }}
                            >
                                🍸 Happy Hour
                            </button>
                        </div>

                        {/* Show different title field based on event type */}
                        <div style={{ marginTop: '20px' }}>
                            {form.eventType === 'happyhour' ? (
                                <>
                                    <label style={styles.deadlineLabel}>Business name (required)</label>
                                    <input
                                        style={{ ...styles.input, marginBottom: '12px' }}
                                        placeholder="e.g. The Rustic Bar & Grill"
                                        value={form.businessName}
                                        onChange={e => update('businessName', e.target.value)}
                                        autoFocus
                                    />
                                    <label style={styles.deadlineLabel}>Listing title</label>
                                    <input
                                        style={styles.input}
                                        placeholder="e.g. Happy Hour at The Rustic"
                                        value={form.title}
                                        onChange={e => update('title', e.target.value)}
                                    />
                                </>
                            ) : (
                                <>
                                    <label style={styles.deadlineLabel}>Event name</label>
                                    <input
                                        style={styles.input}
                                        placeholder="e.g. Dallas Jazz Night at the Majestic"
                                        value={form.title}
                                        onChange={e => update('title', e.target.value)}
                                        autoFocus
                                    />
                                </>
                            )}
                        </div>
                    </StepWrapper>
                );
            case 2:
                return (
                    <StepWrapper
                        step={step}
                        question="What category best describes your event?"
                        hint="Choose the one that fits best"
                    >
                        <div style={styles.categoryGrid}>
                            {categories.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => update('category', cat)}
                                    style={{
                                        ...styles.categoryBtn,
                                        ...(form.category === cat ? styles.categoryBtnActive : {}),
                                    }}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </StepWrapper>
                );
            case 3:
                return (
                    <StepWrapper
                        step={step}
                        question="Tell us about your event"
                        hint="What can attendees expect?"
                    >
            <textarea
                style={styles.textarea}
                placeholder="Describe the experience, performers, highlights..."
                value={form.description}
                onChange={e => update('description', e.target.value)}
                rows={5}
            />
                    </StepWrapper>
                );
            case 4:
                return (
                    <StepWrapper
                        step={step}
                        question={form.eventType === 'happyhour' ? "When is Happy Hour?" : "When is your event?"}
                        hint={form.eventType === 'happyhour' ? "Days and hours for your Happy Hour" : "Date and start time"}
                    >
                        {form.eventType === 'happyhour' ? (
                            <>
                                <label style={styles.deadlineLabel}>Days (e.g. Mon - Fri, Daily, Weekends)</label>
                                <input
                                    style={{ ...styles.input, marginBottom: '12px' }}
                                    placeholder="e.g. Monday - Friday"
                                    value={form.happyHourDays}
                                    onChange={e => update('happyHourDays', e.target.value)}
                                />
                                <label style={styles.deadlineLabel}>Start time</label>
                                <input
                                    style={{ ...styles.input, marginBottom: '12px' }}
                                    placeholder="e.g. 4:00 PM"
                                    value={form.happyHourStart}
                                    onChange={e => update('happyHourStart', e.target.value)}
                                />
                                <label style={styles.deadlineLabel}>End time</label>
                                <input
                                    style={styles.input}
                                    placeholder="e.g. 7:00 PM"
                                    value={form.happyHourEnd}
                                    onChange={e => update('happyHourEnd', e.target.value)}
                                />
                            </>
                        ) : (
                            <input
                                style={styles.input}
                                type="datetime-local"
                                value={form.eventDate}
                                onChange={e => update('eventDate', e.target.value)}
                            />
                        )}
                    </StepWrapper>
                );
            case 5:
                return (
                    <StepWrapper
                        step={step}
                        question="Where is your event taking place?"
                        hint="Venue name and address"
                    >
                        <input
                            style={{ ...styles.input, marginBottom: '12px' }}
                            placeholder="Venue name"
                            value={form.venueName}
                            onChange={e => update('venueName', e.target.value)}
                        />
                        <input
                            style={{ ...styles.input, marginBottom: '12px' }}
                            placeholder="Street address"
                            value={form.address}
                            onChange={e => update('address', e.target.value)}
                        />
                        <input
                            style={{ ...styles.input, marginBottom: '12px' }}
                            placeholder="City"
                            value={form.city}
                            onChange={e => update('city', e.target.value)}
                        />
                        <input
                            style={styles.input}
                            placeholder="State (e.g. TX, IL, NY)"
                            value={form.state}
                            onChange={e => update('state', e.target.value)}
                        />
                    </StepWrapper>
                );
            case 6:
                return (
                    <StepWrapper
                        step={step}
                        question="Where can people buy tickets?"
                        hint="Paste the link to your ticketing page — purchases happen there, not on CulturPass"
                    >
                        <input
                            style={{ ...styles.input, marginBottom: '16px' }}
                            placeholder="https://www.eventbrite.com/your-event"
                            value={form.ticketUrl}
                            onChange={e => update('ticketUrl', e.target.value)}
                        />
                        <label style={styles.deadlineLabel}>
                            Ticket deadline (optional) — last date to purchase tickets
                        </label>
                        <input
                            style={styles.input}
                            type="datetime-local"
                            value={form.ticketDeadline}
                            onChange={e => update('ticketDeadline', e.target.value)}
                        />
                    </StepWrapper>
                );
            case 7:
                return (
                    <StepWrapper
                        step={step}
                        question="What is the price of admission?"
                        hint="Set a price range or mark it as free"
                    >
                        <div style={styles.freeToggleRow}>
                            <span style={styles.freeLabel}>This event is free</span>
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
                            <div style={styles.priceRow}>
                                <input
                                    style={{ ...styles.input, flex: 1 }}
                                    placeholder="Min price e.g. 15"
                                    value={form.priceMin}
                                    onChange={e => update('priceMin', e.target.value)}
                                    type="number"
                                />
                                <span style={styles.priceDash}>—</span>
                                <input
                                    style={{ ...styles.input, flex: 1 }}
                                    placeholder="Max price e.g. 35"
                                    value={form.priceMax}
                                    onChange={e => update('priceMax', e.target.value)}
                                    type="number"
                                />
                            </div>
                        )}
                    </StepWrapper>
                );
            case 8:
                return (
                    <StepWrapper
                        step={step}
                        question="Add an image for your event"
                        hint="Paste a URL to an image that represents your event"
                    >
                        <input
                            style={styles.input}
                            placeholder="https://example.com/event-image.jpg"
                            value={form.imageUrl}
                            onChange={e => update('imageUrl', e.target.value)}
                        />
                        {form.imageUrl && (
                            <img
                                src={form.imageUrl}
                                alt="Event preview"
                                style={styles.imagePreview}
                                onError={e => e.target.style.display = 'none'}
                            />
                        )}
                    </StepWrapper>
                );
            case 9:
                return (
                    <StepWrapper
                        step={step}
                        question="Review your event"
                        hint="Make sure everything looks right before submitting"
                    >
                        <div style={styles.reviewList}>
                            <ReviewRow label="Title" value={form.title} />
                            <ReviewRow label="Category" value={form.category} />
                            <ReviewRow label="Date" value={form.eventDate} />
                            <ReviewRow label="Venue" value={form.venueName} />
                            <ReviewRow label="City" value={form.city} />
                            <ReviewRow label="Ticket link" value={form.ticketUrl} />
                            <ReviewRow label="Price" value={form.isFree ? 'Free' : `$${form.priceMin} – $${form.priceMax}`} />
                        </div>
                        <p style={styles.reviewNote}>
                            Your event will be reviewed by our team and posted within 48 hours if approved.
                        </p>
                    </StepWrapper>
                );
            default:
                return null;
        }
    };

    return (
        <div style={styles.backdrop}>
            <div style={styles.modal}>

                {/* Progress bar */}
                <div style={styles.progressBar}>
                    <div style={{
                        ...styles.progressFill,
                        width: `${(step / TOTAL_STEPS) * 100}%`,
                    }} />
                </div>

                {/* Step counter */}
                <p style={styles.stepCounter}>Step {step} of {TOTAL_STEPS}</p>

                {/* Close button */}
                <button style={styles.closeBtn} onClick={onClose}>✕</button>

                {/* Step content */}
                {submitted ? (
                    <div style={styles.successContainer}>
                        <p style={styles.successIcon}>🎭</p>
                        <h2 style={styles.successTitle}>Event submitted!</h2>
                        <p style={styles.successText}>
                            Your event is under review. It will appear on CulturPass within 48 hours if approved.
                        </p>
                        <button style={styles.doneBtn} onClick={onClose}>Done</button>
                    </div>
                ) : (
                    <>
                        {renderStep()}
                        <div style={styles.navButtons}>
                            {step > 1 && (
                                <button style={styles.backBtn} onClick={back}>← Back</button>
                            )}
                            {step < TOTAL_STEPS ? (
                                <button
                                    style={{
                                        ...styles.nextBtn,
                                        opacity: isStepValid() ? 1 : 0.4,
                                        cursor: isStepValid() ? 'pointer' : 'not-allowed',
                                    }}
                                    onClick={next}
                                >
                                    Next →
                                </button>
                            ) : (
                                <button
                                    style={styles.submitBtn}
                                    onClick={handleSubmit}
                                    disabled={submitting}
                                >
                                    {submitting ? 'Submitting...' : 'Submit Event'}
                                </button>
                            )}
                        </div>
                    </>
                )}

            </div>
        </div>
    );
};

// Reusable step wrapper
const StepWrapper = ({ question, hint, children }) => (
    <div style={styles.stepWrapper}>
        <h2 style={styles.question}>{question}</h2>
        <p style={styles.hint}>{hint}</p>
        {children}
    </div>
);

// Reusable review row
const ReviewRow = ({ label, value }) => (
    <div style={styles.reviewRow}>
        <span style={styles.reviewLabel}>{label}</span>
        <span style={styles.reviewValue}>{value || '—'}</span>
    </div>
);

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
    progressBar: {
        width: '100%',
        height: '3px',
        backgroundColor: '#E8D5C8',
        borderRadius: '2px',
        marginBottom: '16px',
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#D85A30',
        borderRadius: '2px',
        transition: 'width 0.3s ease',
    },
    stepCounter: {
        fontSize: '11px',
        color: '#8B6A56',
        letterSpacing: '0.04em',
        marginBottom: '32px',
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
    stepWrapper: {
        marginBottom: '32px',
    },
    question: {
        fontSize: '20px',
        fontWeight: '500',
        color: '#3D2B1F',
        marginBottom: '8px',
        lineHeight: '1.3',
    },
    hint: {
        fontSize: '13px',
        color: '#8B6A56',
        marginBottom: '24px',
    },
    input: {
        width: '100%',
        padding: '12px 16px',
        fontSize: '14px',
        color: '#3D2B1F',
        backgroundColor: '#FFFFFF',
        border: '0.5px solid #D4B8A8',
        borderRadius: '8px',
        outline: 'none',
        fontFamily: 'inherit',
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
    },
    categoryGrid: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '10px',
    },
    categoryBtn: {
        padding: '8px 18px',
        borderRadius: '20px',
        border: '0.5px solid #D4B8A8',
        backgroundColor: '#FFFFFF',
        fontSize: '13px',
        color: '#6B4F3A',
        cursor: 'pointer',
        fontFamily: 'inherit',
    },
    categoryBtnActive: {
        backgroundColor: '#D85A30',
        borderColor: '#D85A30',
        color: '#FFFFFF',
    },
    freeToggleRow: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '20px',
    },
    freeLabel: {
        fontSize: '14px',
        color: '#3D2B1F',
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
    priceRow: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
    },
    priceDash: {
        color: '#8B6A56',
        fontSize: '16px',
    },
    imagePreview: {
        width: '100%',
        borderRadius: '8px',
        marginTop: '16px',
        maxHeight: '200px',
        objectFit: 'cover',
    },
    reviewList: {
        backgroundColor: '#FFFFFF',
        borderRadius: '8px',
        border: '0.5px solid #E8D5C8',
        overflow: 'hidden',
        marginBottom: '16px',
    },
    reviewRow: {
        display: 'flex',
        justifyContent: 'space-between',
        padding: '12px 16px',
        borderBottom: '0.5px solid #E8D5C8',
    },
    reviewLabel: {
        fontSize: '12px',
        color: '#8B6A56',
        fontWeight: '500',
    },
    reviewValue: {
        fontSize: '12px',
        color: '#3D2B1F',
        maxWidth: '60%',
        textAlign: 'right',
    },
    reviewNote: {
        fontSize: '12px',
        color: '#8B6A56',
        lineHeight: '1.6',
        textAlign: 'center',
    },
    navButtons: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: '8px',
    },
    backBtn: {
        background: 'transparent',
        border: 'none',
        fontSize: '13px',
        color: '#8B6A56',
        cursor: 'pointer',
        fontFamily: 'inherit',
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
        marginLeft: 'auto',
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
        marginLeft: 'auto',
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
    deadlineLabel: {
        display: 'block',
        fontSize: '12px',
        fontWeight: '500',
        color: '#6B4F3A',
        marginBottom: '8px',
    },
};

export default SubmitEventModal;