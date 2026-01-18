import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            console.log('Attempting login with:', { username, password });
            const result = await login(username, password);
            console.log('Login result:', result);
            
            if (result.success) {
                console.log('Login successful');
                navigate('/');
            } else {
                console.error('Login failed:', result.error);
                setError(result.error);
            }
        } catch (err) {
            console.error('Login error:', err);
            setError('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const styles = {
        container: {
            maxWidth: '450px',
            margin: '50px auto',
            padding: '40px',
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
            boxSizing: 'border-box',
            '&:focus': {
                borderColor: '#3498db',
                outline: 'none'
            }
        },
        passwordContainer: {
            position: 'relative',
            marginBottom: '10px'
        },
        forgotPasswordLink: {
            textAlign: 'right',
            marginBottom: '20px'
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
        }
    };

    return (
        <div style={styles.container}>
            <h2 style={styles.title}>Login to NewsHub</h2>
            
            {error && (
                <div style={styles.error}>
                    ⚠️ {error}
                </div>
            )}
            
            <form onSubmit={handleSubmit}>
                <div style={styles.formGroup}>
                    <label style={styles.label}>Username or Email</label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        style={styles.input}
                        required
                        placeholder="Enter username or email"
                    />
                </div>
                
                <div style={styles.formGroup}>
                    <div style={styles.passwordContainer}>
                        <label style={styles.label}>Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            style={styles.input}
                            required
                            placeholder="Enter password"
                        />
                    </div>
                    <div style={styles.forgotPasswordLink}>
                        <Link to="/forgot-password" style={styles.link}>
                            Forgot Password?
                        </Link>
                    </div>
                </div>
                
                <button 
                    type="submit" 
                    style={styles.button}
                    disabled={loading}
                >
                    {loading ? 'Logging in...' : 'Login'}
                </button>
            </form>
            
            <div style={styles.linksContainer}>
                <div>
                    Don't have an account? <Link to="/register" style={styles.boldLink}>Register</Link>
                </div>
                <Link to="/" style={styles.link}>
                    ← Back to Home
                </Link>
            </div>
        </div>
    );
};

export default Login;