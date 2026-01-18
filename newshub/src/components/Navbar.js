import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navbar = ({ onSearch }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const { user, logout } = useAuth();

    const handleSearch = (e) => {
        if (e) {
            e.preventDefault();
        }
        if (onSearch && searchQuery.trim()) {
            onSearch(searchQuery.trim());
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSearch(e);
        }
    };

    const handleClearSearch = () => {
        setSearchQuery('');
        if (onSearch) {
            onSearch('');
        }
    };

    const handleLogout = () => {
        logout();
    };

    const styles = {
        navbar: {
            background: 'linear-gradient(135deg, #2c3e50, #34495e)',
            color: 'white',
            padding: '15px 0',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        },
        navbarContainer: {
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '0 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '20px'
        },
        navbarBrand: {
            textDecoration: 'none',
            color: 'white'
        },
        brandTitle: {
            fontSize: '28px',
            marginBottom: '5px'
        },
        brandSubtitle: {
            fontSize: '14px',
            opacity: '0.9'
        },
        navbarSearch: {
            flex: '1',
            maxWidth: '500px'
        },
        searchForm: {
            display: 'flex',
            background: 'white',
            borderRadius: '25px',
            overflow: 'hidden',
            boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
        },
        searchInput: {
            flex: '1',
            padding: '12px 20px',
            border: 'none',
            fontSize: '16px',
            outline: 'none'
        },
        searchButton: {
            background: '#3498db',
            color: 'white',
            border: 'none',
            padding: '0 25px',
            cursor: 'pointer',
            fontSize: '18px',
            transition: 'background 0.3s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        },
        navbarLinks: {
            display: 'flex',
            gap: '15px',
            alignItems: 'center',
            flexWrap: 'wrap'
        },
        navLink: {
            color: 'white',
            textDecoration: 'none',
            fontSize: '16px',
            padding: '8px 16px',
            borderRadius: '6px',
            transition: 'background 0.3s',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
        },
        clearButton: {
            background: 'transparent',
            border: 'none',
            color: '#666',
            cursor: 'pointer',
            fontSize: '20px',
            padding: '0 15px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'color 0.3s'
        },
        userInfo: {
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '8px 16px',
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '20px'
        },
        username: {
            fontSize: '14px',
            fontWeight: '600'
        },
        logoutButton: {
            background: '#e74c3c',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            transition: 'background 0.3s'
        }
    };

    return (
        <nav style={styles.navbar}>
            <div style={styles.navbarContainer}>
                <Link to="/" style={styles.navbarBrand}>
                    <h1 style={styles.brandTitle}>📰 NewsHub</h1>
                    <p style={styles.brandSubtitle}>Global & Local News</p>
                </Link>

                <div style={styles.navbarSearch}>
                    <form onSubmit={handleSearch} style={styles.searchForm}>
                        <input
                            type="text"
                            placeholder="Search news by keywords..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyPress={handleKeyPress}
                            style={styles.searchInput}
                        />
                        {searchQuery && (
                            <button 
                                type="button" 
                                onClick={handleClearSearch} 
                                style={styles.clearButton}
                                title="Clear search"
                            >
                                ✕
                            </button>
                        )}
                        <button 
                            type="submit" 
                            style={styles.searchButton}
                            onClick={handleSearch}
                            title="Search news"
                        >
                            🔍
                        </button>
                    </form>
                </div>

                <div style={styles.navbarLinks}>
                    <Link to="/" style={styles.navLink}>
                        🏠 Home
                    </Link>
                    <Link to="/about" style={styles.navLink}>
                        ℹ️ About
                    </Link>
                    
                    {user ? (
                        <>
                            {user.role === 'admin' && (
                                <Link to="/admin" style={styles.navLink}>
                                    ⚙️ Admin
                                </Link>
                            )}
                            <div style={styles.userInfo}>
                                <span style={styles.username}>👤 {user.username}</span>
                                <button 
                                    onClick={handleLogout} 
                                    style={styles.logoutButton}
                                    title="Logout"
                                >
                                    Logout
                                </button>
                            </div>
                        </>
                    ) : (
                        <>
                            <Link to="/login" style={styles.navLink}>
                                🔐 Login
                            </Link>
                            <Link to="/register" style={styles.navLink}>
                                📝 Register
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;