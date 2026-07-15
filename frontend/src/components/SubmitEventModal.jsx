import { useState, useEffect } from 'react';
import { createEvent, getCategories } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';

const TOTAL_STEPS = 9;

// SubmitEventModal — multi-step event submission form
const SubmitEventModal = ({ onClose }) => {
    // Get the logged-in user so we can set them as the event organizer
    const { user } = useAuth();
    const [categories, setCategories] = useState([]);
    const [dateError, setDateError] = useState('');

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
        isMultiDay: false,
        endDate: '',
        dailyStartTime: '',
        dailyEndTime: '',
        venueName: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
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

    const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

    // Format date for display — e.g. Dec 17, 2026
    const formatDateDisplay = (dateStr) => {
        if (!dateStr) return '—';
        return new Date(dateStr).toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric',
        });
    };

    // Convert 24-hour time to 12-hour format — e.g. 19:55 → 7:55 PM
    const formatTimeDisplay = (timeStr) => {
        if (!timeStr) return '—';
        const [hours, minutes] = timeStr.split(':').map(Number);
        const period = hours >= 12 ? 'PM' : 'AM';
        const displayHours = hours % 12 || 12;
        return `${displayHours}:${String(minutes).padStart(2, '0')} ${period}`;
    };

    // Checks if close time is valid relative to open time
    // Allows late night closes between 1:00 AM and 6:30 AM (e.g. clubs closing at 2am)
    const isValidCloseTime = (openTime, closeTime) => {
        try {
            const [openH, openM] = openTime.split(':').map(Number);
            const [closeH, closeM] = closeTime.split(':').map(Number);

            // Convert to minutes for easy comparison
            const openMins = openH * 60 + openM;
            const closeMins = closeH * 60 + closeM;

            // Allow late night closes between 1:00 AM (60 mins) and 6:30 AM (390 mins)
            const isLateNightClose = closeMins >= 60 && closeMins <= 390;

            // Close must be after open OR be a valid late night close
            return closeMins > openMins || isLateNightClose;
        } catch {
            return true;
        }
    };

    // Pure date check — no state changes, safe to call during render
    const areDatesValid = () => {
        try {
            if (!form.isMultiDay || !form.endDate || !form.eventDate) return true;
            const start = new Date(form.eventDate);
            const end = new Date(form.endDate);
            if (isNaN(start.getTime()) || isNaN(end.getTime())) return true;
            if (end <= start) return false;
            const days = (end - start) / (1000 * 60 * 60 * 24);
            if (days > 7) return false;
            // Validate close time is after open time unless it's a late night close (1am-6:30am)
            if (form.dailyStartTime && form.dailyEndTime) {
                if (!isValidCloseTime(form.dailyStartTime, form.dailyEndTime)) return false;
            }
            return true;
        } catch {
            return true;
        }
    };

    // Shows error message — only called when user clicks Next, never during render
    const validateDatesWithError = () => {
        try {
            if (!form.isMultiDay || !form.endDate || !form.eventDate) return true;
            const start = new Date(form.eventDate);
            const end = new Date(form.endDate);
            if (isNaN(start.getTime()) || isNaN(end.getTime())) return true;
            if (end <= start) {
                setDateError('End date must be after the start date.');
                return false;
            }
            const days = (end - start) / (1000 * 60 * 60 * 24);
            if (days > 7) {
                setDateError('Events cannot run longer than 7 days.');
                return false;
            }
            // Check close time is valid — allow late night closes between 1am and 6:30am
            if (form.dailyStartTime && form.dailyEndTime) {
                if (!isValidCloseTime(form.dailyStartTime, form.dailyEndTime)) {
                    setDateError('Doors close time must be after doors open time. Late night closes (1:00 AM – 6:30 AM) are allowed.');
                    return false;
                }
            }
            setDateError('');
            return true;
        } catch {
            return true;
        }
    };

    const isStepValid = () => {
        switch (step) {
            case 1: return form.title.trim() !== '' &&
                (form.eventType === 'event' || form.businessName.trim() !== '');
            case 2: return form.category !== '';
            case 3: return form.description.trim() !== '';
            case 4: {
                // Wrap in try/catch to prevent white screen crashes during validation
                try {
                    if (form.eventType === 'happyhour') {
                        return form.happyHourDays.trim() !== '' &&
                            form.happyHourStart.trim() !== '' &&
                            form.happyHourEnd.trim() !== '';
                    }
                    if (!form.eventDate) return false;
                    if (form.isMultiDay) {
                        // All three fields required before we can validate dates
                        if (!form.endDate || !form.dailyStartTime || !form.dailyEndTime) return false;
                        // Use areDatesValid — safe for render, no state changes
                        return areDatesValid();
                    }
                    return true;
                } catch {
                    // Return false on any unexpected error — keeps the Next button disabled
                    return false;
                }
            }
            case 5: return form.venueName.trim() !== '' && form.address.trim() !== '' && form.city.trim() !== '';
            case 6: return form.eventType === 'happyhour' ? true : form.ticketUrl.trim() !== '';
            case 7: return form.isFree || (form.priceMin !== '' && form.priceMax !== '');
            case 8: return true;
            default: return true;
        }
    };

    // Advance to next step — skips ticket URL (6) and price (7) for Happy Hour
    const next = () => {
        try {
            if (step === 4 && form.isMultiDay) {
                // Use validateDatesWithError to show error messages on click
                if (!validateDatesWithError()) return;
            }
            // Skip ticket URL and price steps for Happy Hour — not applicable
            let nextStep = step + 1;
            if (form.eventType === 'happyhour' && (nextStep === 6 || nextStep === 7)) {
                nextStep = 8;
            }
            if (isStepValid()) setStep(Math.min(nextStep, TOTAL_STEPS));
        } catch {
            // Silently catch any unexpected errors — keeps the form stable
        }
    };

    // Go back to previous step — skips ticket URL (6) and price (7) for Happy Hour
    const back = () => {
        let prevStep = step - 1;
        if (form.eventType === 'happyhour' && (prevStep === 6 || prevStep === 7)) {
            prevStep = 5;
        }
        setStep(Math.max(prevStep, 1));
    };

    const handleSubmit = () => {
        setSubmitting(true);
        const payload = {
            eventType: form.eventType,
            title: form.title,
            category: form.category,
            description: form.description,
            eventDate: form.eventType === 'happyhour' ? null : form.eventDate,
            endDate: form.eventType === 'happyhour' ? null : (form.isMultiDay ? form.endDate : null),
            ticketUrl: form.ticketUrl || null,
            ticketDeadline: form.ticketDeadline || null,
            isFree: form.isFree,
            priceMin: form.isFree ? null : parseFloat(form.priceMin) || null,
            priceMax: form.isFree ? null : parseFloat(form.priceMax) || null,
            imageUrl: form.imageUrl,
            venueName: form.venueName,
            address: form.address,
            city: form.city,
            state: form.state || '',
            zipCode: form.zipCode || null,
            businessName: form.eventType === 'happyhour' ? form.businessName : null,
            happyHourDays: form.eventType === 'happyhour' ? form.happyHourDays : null,
            happyHourStart: form.eventType === 'happyhour' ? form.happyHourStart : null,
            happyHourEnd: form.eventType === 'happyhour' ? form.happyHourEnd : null,
            source: 'user',
            status: 'pending',
            // Set the logged-in user as the organizer so events appear in My Events
            organizerId: user?.id || null,
        };
        createEvent(payload)
            .then(() => { setSubmitting(false); setSubmitted(true); })
            .catch(() => setSubmitting(false));
    };

    const renderStep = () => {
        switch (step) {
            case 1:
                return (
                    <StepWrapper question="What type of listing is this?" hint="Choose the type that best describes what you are posting">
                        <div style={styles.categoryGrid}>
                            <button onClick={() => update('eventType', 'event')} style={{ ...styles.categoryBtn, ...(form.eventType === 'event' ? styles.categoryBtnActive : {}) }}>
                                🎭 Event
                            </button>
                            <button onClick={() => update('eventType', 'happyhour')} style={{ ...styles.categoryBtn, ...(form.eventType === 'happyhour' ? styles.categoryBtnActive : {}) }}>
                                🍸 Happy Hour
                            </button>
                        </div>
                        <div style={{ marginTop: '20px' }}>
                            {form.eventType === 'happyhour' ? (
                                <>
                                    <label style={styles.label}>Business name (required)</label>
                                    <input style={{ ...styles.input, marginBottom: '12px' }} placeholder="e.g. The Rustic Bar & Grill" value={form.businessName} onChange={e => update('businessName', e.target.value)} autoFocus />
                                    <label style={styles.label}>Listing title</label>
                                    <input style={styles.input} placeholder="e.g. Happy Hour at The Rustic" value={form.title} onChange={e => update('title', e.target.value)} />
                                </>
                            ) : (
                                <>
                                    <label style={styles.label}>Event name</label>
                                    <input style={styles.input} placeholder="e.g. Jazz Night at the Majestic" value={form.title} onChange={e => update('title', e.target.value)} autoFocus />
                                </>
                            )}
                        </div>
                    </StepWrapper>
                );
            case 2:
                return (
                    <StepWrapper question="What category best describes your event?" hint="Choose the one that fits best">
                        <div style={styles.categoryGrid}>
                            {categories.map(cat => (
                                <button key={cat} onClick={() => update('category', cat)} style={{ ...styles.categoryBtn, ...(form.category === cat ? styles.categoryBtnActive : {}) }}>
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </StepWrapper>
                );
            case 3:
                return (
                    <StepWrapper question="Tell us about your event" hint="What can attendees expect?">
                        <textarea style={styles.textarea} placeholder="Describe the experience, performers, highlights..." value={form.description} onChange={e => update('description', e.target.value)} rows={5} />
                    </StepWrapper>
                );
            case 4:
                return (
                    <StepWrapper question={form.eventType === 'happyhour' ? "When is Happy Hour?" : "When is your event?"} hint={form.eventType === 'happyhour' ? "Days and hours for your Happy Hour" : "Select your event dates"}>
                        {form.eventType === 'happyhour' ? (
                            <>
                                <label style={styles.label}>Days (e.g. Mon - Fri, Daily, Weekends)</label>
                                <input style={{ ...styles.input, marginBottom: '12px' }} placeholder="e.g. Monday - Friday" value={form.happyHourDays} onChange={e => update('happyHourDays', e.target.value)} />
                                {/* Time pickers for Happy Hour start and end times */}
                                <label style={styles.label}>Start time</label>
                                <input style={{ ...styles.input, marginBottom: '12px' }} type="time" value={form.happyHourStart} onChange={e => update('happyHourStart', e.target.value)} />
                                <label style={styles.label}>End time</label>
                                <input style={styles.input} type="time" value={form.happyHourEnd} onChange={e => update('happyHourEnd', e.target.value)} />
                            </>
                        ) : (
                            <>
                                <label style={styles.label}>Start date</label>
                                <input style={{ ...styles.input, marginBottom: '14px' }} type="datetime-local" value={form.eventDate} onChange={e => update('eventDate', e.target.value)} />

                                {/* Multi-day toggle */}
                                <div style={styles.toggleRow}>
                                    <label style={styles.label}>Multi-day event? (e.g. weekend festival)</label>
                                    <button onClick={() => { update('isMultiDay', !form.isMultiDay); setDateError(''); }} style={{ ...styles.toggle, backgroundColor: form.isMultiDay ? '#D85A30' : '#E8D5C8' }}>
                                        <div style={{ ...styles.toggleKnob, transform: form.isMultiDay ? 'translateX(20px)' : 'translateX(0)' }} />
                                    </button>
                                </div>

                                {form.isMultiDay && (
                                    <>
                                        <label style={styles.label}>End date (max 7 days from start)</label>
                                        <input style={{ ...styles.input, marginBottom: '14px' }} type="datetime-local" value={form.endDate} onChange={e => { update('endDate', e.target.value); setDateError(''); }} />

                                        <label style={styles.label}>Daily doors open (same time each day)</label>
                                        <input style={{ ...styles.input, marginBottom: '12px' }} type="time" value={form.dailyStartTime} onChange={e => update('dailyStartTime', e.target.value)} />

                                        <label style={styles.label}>Daily doors close (same time each day)</label>
                                        <input style={styles.input} type="time" value={form.dailyEndTime} onChange={e => update('dailyEndTime', e.target.value)} />

                                        {dateError && <p style={styles.errorText}>{dateError}</p>}
                                    </>
                                )}
                            </>
                        )}
                    </StepWrapper>
                );
            case 5:
                return (
                    <StepWrapper question="Where is your event taking place?" hint="Venue name and full address">
                        <input style={{ ...styles.input, marginBottom: '12px' }} placeholder="Venue name" value={form.venueName} onChange={e => update('venueName', e.target.value)} />
                        <input style={{ ...styles.input, marginBottom: '12px' }} placeholder="Street address" value={form.address} onChange={e => update('address', e.target.value)} />
                        <input style={{ ...styles.input, marginBottom: '12px' }} placeholder="City" value={form.city} onChange={e => update('city', e.target.value)} />
                        <input style={{ ...styles.input, marginBottom: '12px' }} placeholder="State (e.g. TX, IL, NY)" value={form.state} onChange={e => update('state', e.target.value)} />
                        <input style={styles.input} placeholder="Zip code" value={form.zipCode} onChange={e => update('zipCode', e.target.value)} />
                    </StepWrapper>
                );
            case 6:
                return (
                    <StepWrapper question="Where can people buy tickets?" hint="Paste the link to your ticketing page — purchases happen there, not on FunctionPass">
                        <input style={{ ...styles.input, marginBottom: '16px' }} placeholder="https://www.eventbrite.com/your-event" value={form.ticketUrl} onChange={e => update('ticketUrl', e.target.value)} />
                        <label style={styles.label}>Ticket deadline (optional) — last date to purchase tickets</label>
                        <input style={styles.input} type="datetime-local" value={form.ticketDeadline} onChange={e => update('ticketDeadline', e.target.value)} />
                    </StepWrapper>
                );
            case 7:
                return (
                    <StepWrapper question="What is the price of admission?" hint="Set a price range or mark it as free">
                        <div style={styles.toggleRow}>
                            <span style={styles.freeLabel}>This event is free</span>
                            <button onClick={() => update('isFree', !form.isFree)} style={{ ...styles.toggle, backgroundColor: form.isFree ? '#D85A30' : '#E8D5C8' }}>
                                <div style={{ ...styles.toggleKnob, transform: form.isFree ? 'translateX(20px)' : 'translateX(0)' }} />
                            </button>
                        </div>
                        {!form.isFree && (
                            <div style={styles.priceRow}>
                                <input style={{ ...styles.input, flex: 1 }} placeholder="Min price e.g. 15" value={form.priceMin} onChange={e => update('priceMin', e.target.value)} type="number" min="0" />
                                <span style={styles.priceDash}>—</span>
                                <input style={{ ...styles.input, flex: 1 }} placeholder="Max price e.g. 35" value={form.priceMax} onChange={e => update('priceMax', e.target.value)} type="number" min="0" />
                            </div>
                        )}
                    </StepWrapper>
                );
            case 8:
                return (
                    <StepWrapper question="Add an image for your event" hint="Paste a URL to an image for now — direct photo uploads coming soon">
                        <input style={styles.input} placeholder="https://example.com/event-image.jpg" value={form.imageUrl} onChange={e => update('imageUrl', e.target.value)} />
                        {form.imageUrl && (
                            <img src={form.imageUrl} alt="Event preview" style={styles.imagePreview} onError={e => e.target.style.display = 'none'} />
                        )}
                    </StepWrapper>
                );
            case 9:
                return (
                    <StepWrapper question="Review your event" hint="Make sure everything looks right before submitting">
                        <div style={styles.reviewList}>
                            <ReviewRow label="Type" value={form.eventType === 'happyhour' ? '🍸 Happy Hour' : '🎭 Event'} />
                            <ReviewRow label="Title" value={form.title} />
                            <ReviewRow label="Category" value={form.category} />
                            {form.eventType === 'happyhour' ? (
                                <>
                                    <ReviewRow label="Business" value={form.businessName} />
                                    <ReviewRow label="Days" value={form.happyHourDays} />
                                    {/* Display Happy Hour times in 12-hour format */}
                                    <ReviewRow label="Hours" value={`${formatTimeDisplay(form.happyHourStart)} – ${formatTimeDisplay(form.happyHourEnd)}`} />
                                </>
                            ) : form.isMultiDay ? (
                                <>
                                    <ReviewRow label="Start date" value={formatDateDisplay(form.eventDate)} />
                                    <ReviewRow label="End date" value={formatDateDisplay(form.endDate)} />
                                    {/* Display daily hours in 12-hour format */}
                                    <ReviewRow label="Daily hours" value={`${formatTimeDisplay(form.dailyStartTime)} – ${formatTimeDisplay(form.dailyEndTime)}`} />
                                </>
                            ) : (
                                <ReviewRow label="Date" value={formatDateDisplay(form.eventDate)} />
                            )}
                            <ReviewRow label="Venue" value={form.venueName} />
                            <ReviewRow label="Address" value={`${form.address}, ${form.city}, ${form.state} ${form.zipCode}`} />
                            {/* Only show ticket and price for regular events — not Happy Hour */}
                            {form.eventType !== 'happyhour' && (
                                <>
                                    <ReviewRow label="Ticket link" value={form.ticketUrl} />
                                    <ReviewRow label="Price" value={form.isFree ? 'Free' : `$${form.priceMin} – $${form.priceMax}`} />
                                </>
                            )}
                        </div>
                        <p style={styles.reviewNote}>Your event will be reviewed by our team and posted within 48 hours if approved.</p>
                    </StepWrapper>
                );
            default:
                return null;
        }
    };

    return (
        <div style={styles.backdrop}>
            <div style={styles.modal}>
                <div style={styles.progressBar}>
                    <div style={{ ...styles.progressFill, width: `${(step / TOTAL_STEPS) * 100}%` }} />
                </div>
                <p style={styles.stepCounter}>Step {step} of {TOTAL_STEPS}</p>
                <button style={styles.closeBtn} onClick={onClose}>✕</button>
                {submitted ? (
                    <div style={styles.successContainer}>
                        <p style={styles.successIcon}>🎭</p>
                        <h2 style={styles.successTitle}>Event submitted!</h2>
                        <p style={styles.successText}>Your event is under review. It will appear on FunctionPass within 48 hours if approved.</p>
                        <button style={styles.doneBtn} onClick={onClose}>Done</button>
                    </div>
                ) : (
                    <>
                        {renderStep()}
                        <div style={styles.navButtons}>
                            {step > 1 && <button style={styles.backBtn} onClick={back}>← Back</button>}
                            {step < TOTAL_STEPS ? (
                                <button style={{ ...styles.nextBtn, opacity: isStepValid() ? 1 : 0.4, cursor: isStepValid() ? 'pointer' : 'not-allowed' }} onClick={next}>
                                    Next →
                                </button>
                            ) : (
                                <button style={styles.submitBtn} onClick={handleSubmit} disabled={submitting}>
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

const StepWrapper = ({ question, hint, children }) => (
    <div style={styles.stepWrapper}>
        <h2 style={styles.question}>{question}</h2>
        <p style={styles.hint}>{hint}</p>
        {children}
    </div>
);

const ReviewRow = ({ label, value }) => (
    <div style={styles.reviewRow}>
        <span style={styles.reviewLabel}>{label}</span>
        <span style={styles.reviewValue}>{value || '—'}</span>
    </div>
);

const styles = {
    backdrop: { position: 'fixed', inset: 0, backgroundColor: 'rgba(26, 15, 10, 0.75)', backdropFilter: 'blur(6px)', zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center' },
    modal: { backgroundColor: '#F5EBE0', borderRadius: '16px', padding: '40px', width: '100%', maxWidth: '520px', position: 'relative', maxHeight: '90vh', overflowY: 'auto' },
    progressBar: { width: '100%', height: '3px', backgroundColor: '#E8D5C8', borderRadius: '2px', marginBottom: '16px' },
    progressFill: { height: '100%', backgroundColor: '#D85A30', borderRadius: '2px', transition: 'width 0.3s ease' },
    stepCounter: { fontSize: '11px', color: '#8B6A56', letterSpacing: '0.04em', marginBottom: '32px' },
    closeBtn: { position: 'absolute', top: '16px', right: '20px', background: 'transparent', border: 'none', fontSize: '16px', color: '#8B6A56', cursor: 'pointer' },
    stepWrapper: { marginBottom: '32px' },
    question: { fontSize: '20px', fontWeight: '500', color: '#3D2B1F', marginBottom: '8px', lineHeight: '1.3' },
    hint: { fontSize: '13px', color: '#8B6A56', marginBottom: '24px' },
    label: { display: 'block', fontSize: '12px', fontWeight: '500', color: '#6B4F3A', marginBottom: '8px' },
    input: { width: '100%', padding: '12px 16px', fontSize: '14px', color: '#3D2B1F', backgroundColor: '#FFFFFF', border: '0.5px solid #D4B8A8', borderRadius: '8px', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' },
    textarea: { width: '100%', padding: '12px 16px', fontSize: '14px', color: '#3D2B1F', backgroundColor: '#FFFFFF', border: '0.5px solid #D4B8A8', borderRadius: '8px', outline: 'none', fontFamily: 'inherit', resize: 'vertical', boxSizing: 'border-box' },
    categoryGrid: { display: 'flex', flexWrap: 'wrap', gap: '10px' },
    categoryBtn: { padding: '8px 18px', borderRadius: '20px', border: '0.5px solid #D4B8A8', backgroundColor: '#FFFFFF', fontSize: '13px', color: '#6B4F3A', cursor: 'pointer', fontFamily: 'inherit' },
    categoryBtnActive: { backgroundColor: '#D85A30', borderColor: '#D85A30', color: '#FFFFFF' },
    toggleRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' },
    freeLabel: { fontSize: '14px', color: '#3D2B1F' },
    toggle: { width: '44px', height: '24px', borderRadius: '12px', border: 'none', cursor: 'pointer', position: 'relative', transition: 'background-color 0.2s', padding: 0, flexShrink: 0 },
    toggleKnob: { position: 'absolute', top: '3px', left: '3px', width: '18px', height: '18px', borderRadius: '50%', backgroundColor: '#FFFFFF', transition: 'transform 0.2s' },
    priceRow: { display: 'flex', alignItems: 'center', gap: '12px' },
    priceDash: { color: '#8B6A56', fontSize: '16px' },
    imagePreview: { width: '100%', borderRadius: '8px', marginTop: '16px', maxHeight: '200px', objectFit: 'cover' },
    errorText: { fontSize: '12px', color: '#993C1D', backgroundColor: '#FAECE7', padding: '8px 12px', borderRadius: '6px', marginTop: '10px' },
    reviewList: { backgroundColor: '#FFFFFF', borderRadius: '8px', border: '0.5px solid #E8D5C8', overflow: 'hidden', marginBottom: '16px' },
    reviewRow: { display: 'flex', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '0.5px solid #E8D5C8' },
    reviewLabel: { fontSize: '12px', color: '#8B6A56', fontWeight: '500' },
    reviewValue: { fontSize: '12px', color: '#3D2B1F', maxWidth: '60%', textAlign: 'right' },
    reviewNote: { fontSize: '12px', color: '#8B6A56', lineHeight: '1.6', textAlign: 'center' },
    navButtons: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' },
    backBtn: { background: 'transparent', border: 'none', fontSize: '13px', color: '#8B6A56', cursor: 'pointer', fontFamily: 'inherit' },
    nextBtn: { backgroundColor: '#3D2B1F', color: '#F5EBE0', border: 'none', borderRadius: '8px', padding: '12px 28px', fontSize: '13px', fontWeight: '500', cursor: 'pointer', fontFamily: 'inherit', marginLeft: 'auto' },
    submitBtn: { backgroundColor: '#D85A30', color: '#FFFFFF', border: 'none', borderRadius: '8px', padding: '12px 28px', fontSize: '13px', fontWeight: '500', cursor: 'pointer', fontFamily: 'inherit', marginLeft: 'auto' },
    successContainer: { textAlign: 'center', padding: '20px 0' },
    successIcon: { fontSize: '48px', marginBottom: '16px' },
    successTitle: { fontSize: '22px', fontWeight: '500', color: '#3D2B1F', marginBottom: '12px' },
    successText: { fontSize: '14px', color: '#8B6A56', lineHeight: '1.6', marginBottom: '28px' },
    doneBtn: { backgroundColor: '#D85A30', color: '#FFFFFF', border: 'none', borderRadius: '8px', padding: '12px 32px', fontSize: '13px', fontWeight: '500', cursor: 'pointer', fontFamily: 'inherit' },
};

export default SubmitEventModal;