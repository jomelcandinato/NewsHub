import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Register = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { register } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters long');
            return;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError('Please enter a valid email address');
            return;
        }

        // Username validation
        if (username.length < 3) {
            setError('Username must be at least 3 characters long');
            return;
        }

        if (username.length > 20) {
            setError('Username must be less than 20 characters');
            return;
        }

        setLoading(true);

        try {
            const result = await register(username, email, password);
            if (result.success) {
                navigate('/');
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
            transition: 'border-color 0.3s',
            boxSizing: 'border-box'
        },
        button: {
            width: '100%',
            padding: '14px',
            background: '#2ecc71',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'background 0.3s',
            marginTop: '10px'
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
        link: {
            color: '#3498db',
            textDecoration: 'none',
            fontWeight: '500'
        },
        boldLink: {
            color: '#3498db',
            textDecoration: 'none',
            fontWeight: '600'
        },
        linksContainer: {
            marginTop: '20px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
        },
        passwordRequirements: {
            fontSize: '12px',
            color: '#7f8c8d',
            marginTop: '5px'
        }
    };

    return (
        <div style={styles.container}>
            <h2 style={styles.title}>Create Account</h2>
            
            {error && (
                <div style={styles.error}>
                    ⚠️ {error}
                </div>
            )}
            
            <form onSubmit={handleSubmit}>
                <div style={styles.formGroup}>
                    <label style={styles.label}>Username</label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        style={styles.input}
                        required
                        placeholder="Choose a username (3-20 characters)"
                        minLength="3"
                        maxLength="20"
                    />
                </div>
                
                <div style={styles.formGroup}>
                    <label style={styles.label}>Email</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        style={styles.input}
                        required
                        placeholder="Enter your email"
                    />
                </div>
                
                <div style={styles.formGroup}>
                    <label style={styles.label}>Password</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={styles.input}
                        required
                        placeholder="At least 6 characters"
                        minLength="6"
                    />
                    <div style={styles.passwordRequirements}>
                        Must be at least 6 characters long
                    </div>
                </div>
                
                <div style={styles.formGroup}>
                    <label style={styles.label}>Confirm Password</label>
                    <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        style={styles.input}
                        required
                        placeholder="Confirm your password"
                        minLength="6"
                    />
                </div>
                
                <button 
                    type="submit" 
                    style={styles.button}
                    disabled={loading}
                >
                    {loading ? 'Creating Account...' : 'Register'}
                </button>
            </form>
            
            <div style={styles.linksContainer}>
                <div>
                    Already have an account? <Link to="/login" style={styles.boldLink}>Login</Link>
                </div>
                <Link to="/" style={styles.link}>
                    ← Back to Home
                </Link>
            </div>
        </div>
    );
};

export default Register;