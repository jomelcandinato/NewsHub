import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [resetMode, setResetMode] = useState(false);
    const [token, setToken] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const navigate = useNavigate();
    const { forgotPassword, resetPassword } = useAuth();

    const handleEmailSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setLoading(true);

        try {
            const result = await forgotPassword(email);
            if (result.success) {
                setMessage(result.data.message);
                // For development, show the token
                if (result.data.resetToken) {
                    setMessage(`${result.data.message} Reset token: ${result.data.resetToken}`);
                }
            } else {
                setError(result.error);
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleResetSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (newPassword.length < 6) {
            setError('Password must be at least 6 characters long');
            return;
        }

        setLoading(true);

        try {
            const result = await resetPassword(token, newPassword);
            if (result.success) {
                setMessage(result.data.message);
                setTimeout(() => {
                    navigate('/login');
                }, 2000);
            } else {
                setError(result.error);
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const styles = {
        container: {
            maxWidth: '400px',
            margin: '50px auto',
            padding: '30px',
            background: 'white',
            borderRadius: '12px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
        },
        title: {
            textAlign: 'center',
            marginBottom: '30px',
            color: '#2c3e50',
            fontSize: '28px'
        },
        formGroup: {
            marginBottom: '20px'
        },
        label: {
            display: 'block',
            marginBottom: '8px',
            color: '#34495e',
            fontWeight: '600'
        },
        input: {
            width: '100%',
            padding: '12px',
            border: '2px solid #e9ecef',
            borderRadius: '6px',
            fontSize: '16px',
            transition: 'border-color 0.3s'
        },
        button: {
            width: '100%',
            padding: '14px',
            background: '#3498db',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'background 0.3s',
            marginTop: '10px'
        },
        successButton: {
            background: '#2ecc71'
        },
        error: {
            backgroundColor: '#ffeaea',
            border: '1px solid #ff6b6b',
            borderRadius: '6px',
            padding: '12px',
            marginBottom: '20px',
            color: '#d32f2f',
            textAlign: 'center'
        },
        success: {
            backgroundColor: '#e8f5e9',
            border: '1px solid #4caf50',
            borderRadius: '6px',
            padding: '12px',
            marginBottom: '20px',
            color: '#2e7d32',
            textAlign: 'center'
        },
        link: {
            color: '#3498db',
            textDecoration: 'none',
            fontWeight: '500',
            fontSize: '16px'
        },
        boldLink: {
            color: '#3498db',
            textDecoration: 'none',
            fontWeight: '600',
            fontSize: '16px'
        },
        linksContainer: {
            marginTop: '20px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
        },
        switchContainer: {
            textAlign: 'center',
            marginTop: '10px',
            fontSize: '16px'
        },
        switchText: {
            display: 'inline',
            fontSize: '16px',
            color: '#000000'
        },
        switchLink: {
            display: 'inline',
            fontSize: '16px',
            color: '#3498db',
            fontWeight: '600',
            textDecoration: 'none',
            marginLeft: '5px',
            cursor: 'pointer'
        }
    };

    return (
        <div style={styles.container}>
            <h2 style={styles.title}>
                {resetMode ? 'Reset Password' : 'Forgot Password'}
            </h2>
            
            {error && (
                <div style={styles.error}>
                   ⚠️ {error}
                </div>
            )}
            
            {message && (
                <div style={styles.success}>
                    ✅ {message}
                </div>
            )}
            
            {!resetMode ? (
                <form onSubmit={handleEmailSubmit}>
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Email Address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            style={styles.input}
                            required
                            placeholder="Enter your registered email"
                        />
                    </div>
                    
                    <button 
                        type="submit" 
                        style={styles.button}
                        disabled={loading}
                    >
                        {loading ? 'Sending...' : 'Send Reset Link'}
                    </button>
                    
                    <div style={styles.switchContainer}>
                        <span style={styles.switchText}>Already have a reset token?</span>
                        <span 
                            onClick={() => setResetMode(true)}
                            style={styles.switchLink}
                        >
                            Reset Password
                        </span>
                    </div>
                </form>
            ) : (
                <form onSubmit={handleResetSubmit}>
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Reset Token</label>
                        <input
                            type="text"
                            value={token}
                            onChange={(e) => setToken(e.target.value)}
                            style={styles.input}
                            required
                            placeholder="Enter reset token from email"
                        />
                    </div>
                    
                    <div style={styles.formGroup}>
                        <label style={styles.label}>New Password</label>
                        <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            style={styles.input}
                            required
                            placeholder="Enter new password"
                        />
                    </div>
                    
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Confirm New Password</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            style={styles.input}
                            required
                            placeholder="Confirm new password"
                        />
                    </div>
                    
                    <button 
                        type="submit" 
                        style={{ ...styles.button, ...styles.successButton }}
                        disabled={loading}
                    >
                        {loading ? 'Resetting...' : 'Reset Password'}
                    </button>
                    
                    <div style={styles.switchContainer}>
                        <span style={styles.switchText}>Need a reset token?</span>
                        <span 
                            onClick={() => setResetMode(false)}
                            style={styles.switchLink}
                        >
                            Send Token
                        </span>
                    </div>
                </form>
            )}
            
            <div style={styles.linksContainer}>
                <Link to="/login" style={styles.link}>
                    ← Back to Login
                </Link>
            </div>
        </div>
    );
};

export default ForgotPassword;