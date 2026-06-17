import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../services/api.js';

// RegisterPage — create a new FunctionPass account
const RegisterPage = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [form, setForm] = useState({ displayName: '', email: '', password: '', confirmPassword: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

    const handleSubmit = () => {
        if (!form.displayName || !form.email || !form.password || !form.confirmPassword) {
            setError('Please fill in all fields');
            return;
        }
        if (form.password !== form.confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        if (form.password.length < 8) {
            setError('Password must be at least 8 characters');
            return;
        }

        setLoading(true);
        setError('');

        api.post('/auth/register', {
            email: form.email,
            password: form.password,
            displayName: form.displayName,
        })
            .then(res => {
                login(res.data.token);
                navigate('/');
            })
            .catch(err => {
                setError(err.response?.data?.error || 'Something went wrong');
                setLoading(false);
            });
    };

    return (
        <div style={styles.page}>
            <div style={styles.card}>

                <h1 style={styles.title}>Create your account</h1>
                {/* Subtitle — y(our) plays on both personal and communal ownership */}
                <p style={styles.subtitle}>Join FunctionPass and discover y(our) events</p>

                {error && <p style={styles.error}>{error}</p>}

                <div style={styles.field}>
                    <label style={styles.label}>Display name</label>
                    <input
                        style={styles.input}
                        placeholder="How should we call you?"
                        value={form.displayName}
                        onChange={e => update('displayName', e.target.value)}
                    />
                </div>

                <div style={styles.field}>
                    <label style={styles.label}>Email</label>
                    <input
                        style={styles.input}
                        type="email"
                        placeholder="you@email.com"
                        value={form.email}
                        onChange={e => update('email', e.target.value)}
                    />
                </div>

                <div style={styles.field}>
                    <label style={styles.label}>Password</label>
                    <input
                        style={styles.input}
                        type="password"
                        placeholder="At least 8 characters"
                        value={form.password}
                        onChange={e => update('password', e.target.value)}
                    />
                </div>

                <div style={styles.field}>
                    <label style={styles.label}>Confirm password</label>
                    <input
                        style={styles.input}
                        type="password"
                        placeholder="Repeat your password"
                        value={form.confirmPassword}
                        onChange={e => update('confirmPassword', e.target.value)}
                    />
                </div>

                <button
                    style={{
                        ...styles.btn,
                        opacity: loading ? 0.6 : 1,
                    }}
                    onClick={handleSubmit}
                    disabled={loading}
                >
                    {loading ? 'Creating account...' : 'Create account'}
                </button>

                <p style={styles.switchText}>
                    Already have an account?{' '}
                    <Link to="/signin" style={styles.switchLink}>Sign in</Link>
                </p>

            </div>
        </div>
    );
};

const styles = {
    page: {
        backgroundColor: '#F5EBE0',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: '16px',
        border: '0.5px solid #E8D5C8',
        padding: '40px',
        width: '100%',
        maxWidth: '420px',
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
        marginBottom: '28px',
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
        marginBottom: '16px',
    },
    label: {
        display: 'block',
        fontSize: '12px',
        fontWeight: '500',
        color: '#6B4F3A',
        marginBottom: '6px',
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
        boxSizing: 'border-box',
    },
    btn: {
        width: '100%',
        backgroundColor: '#D85A30',
        color: '#FFFFFF',
        border: 'none',
        borderRadius: '8px',
        padding: '14px',
        fontSize: '14px',
        fontWeight: '500',
        cursor: 'pointer',
        fontFamily: 'inherit',
        marginTop: '8px',
        marginBottom: '20px',
    },
    switchText: {
        fontSize: '13px',
        color: '#8B6A56',
        textAlign: 'center',
    },
    switchLink: {
        color: '#D85A30',
        fontWeight: '500',
        textDecoration: 'none',
    },
};

export default RegisterPage;