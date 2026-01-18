import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const SearchHistory = () => {
    const [searchHistory, setSearchHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchSearchHistory = async () => {
            if (!user) return;

            try {
                setLoading(true);
                const token = localStorage.getItem('token');
                const response = await fetch('http://localhost:5000/api/search-history', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch search history');
                }

                const data = await response.json();
                setSearchHistory(data.searchHistory || []);
            } catch (err) {
                setError(err.message);
                console.error('Error fetching search history:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchSearchHistory();
    }, [user]);

    const formatDate = (dateString) => {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            });
        } catch (error) {
            return dateString;
        }
    };

    const handleSearchClick = (query) => {
        navigate(`/?search=${encodeURIComponent(query)}`);
    };

    const clearHistory = async () => {
        if (!window.confirm('Are you sure you want to clear all search history?')) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/search-history', {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();
            
            if (response.ok) {
                setSearchHistory([]);
                alert('Search history cleared successfully!');
            } else {
                setError(data.error || 'Failed to clear search history');
            }
        } catch (err) {
            console.error('Error clearing history:', err);
            setError('Failed to clear search history. Please check your connection and try again.');
        }
    };

    const styles = {
        container: {
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '20px'
        },
        header: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '30px',
            flexWrap: 'wrap',
            gap: '20px'
        },
        title: {
            color: '#2c3e50',
            fontSize: '28px',
            margin: '0'
        },
        clearButton: {
            background: '#e74c3c',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '600',
            transition: 'background 0.3s',
            '&:hover': {
                background: '#c0392b'
            }
        },
        backButton: {
            background: '#3498db',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '600',
            transition: 'background 0.3s',
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            '&:hover': {
                background: '#2980b9'
            }
        },
        historyList: {
            background: 'white',
            borderRadius: '12px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
            overflow: 'hidden'
        },
        historyItem: {
            padding: '20px',
            borderBottom: '1px solid #eee',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            transition: 'background 0.3s',
            cursor: 'pointer',
            flexWrap: 'wrap',
            gap: '15px',
            '&:hover': {
                background: '#f8f9fa'
            }
        },
        searchQuery: {
            fontSize: '16px',
            fontWeight: '600',
            color: '#2c3e50',
            margin: '0'
        },
        searchInfo: {
            display: 'flex',
            gap: '15px',
            alignItems: 'center',
            flexWrap: 'wrap'
        },
        resultsCount: {
            background: '#2ecc71',
            color: 'white',
            padding: '4px 12px',
            borderRadius: '15px',
            fontSize: '12px',
            fontWeight: '600'
        },
        searchTime: {
            fontSize: '14px',
            color: '#7f8c8d'
        },
        emptyState: {
            textAlign: 'center',
            padding: '60px 20px',
            color: '#7f8c8d'
        },
        loadingSpinner: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '60px 20px'
        },
        spinner: {
            width: '50px',
            height: '50px',
            border: '5px solid #f3f3f3',
            borderTop: '5px solid #3498db',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            marginBottom: '20px'
        },
        errorMessage: {
            backgroundColor: '#ffeaea',
            border: '1px solid #ff6b6b',
            borderRadius: '8px',
            padding: '20px',
            margin: '20px 0',
            textAlign: 'center',
            color: '#d32f2f'
        },
        buttonGroup: {
            display: 'flex',
            gap: '10px',
            flexWrap: 'wrap'
        }
    };

    if (!user) {
        return (
            <div style={styles.container}>
                <Link to="/login" style={styles.backButton}>
                    ← Back to Login
                </Link>
                <div style={styles.errorMessage}>
                    Please login to view your search history.
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div style={styles.loadingSpinner}>
                <div style={styles.spinner}></div>
                <p>Loading search history...</p>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h2 style={styles.title}>🔍 Search History</h2>
                <div style={styles.buttonGroup}>
                    <Link to="/" style={styles.backButton}>
                        ← Back to News
                    </Link>
                    {searchHistory.length > 0 && (
                        <button onClick={clearHistory} style={styles.clearButton}>
                            Clear All
                        </button>
                    )}
                </div>
            </div>

            {error && (
                <div style={styles.errorMessage}>
                    ⚠️ {error}
                </div>
            )}

            <div style={styles.historyList}>
                {searchHistory.length > 0 ? (
                    searchHistory.map((search, index) => (
                        <div 
                            key={index} 
                            style={styles.historyItem}
                            onClick={() => handleSearchClick(search.search_query)}
                        >
                            <div>
                                <h3 style={styles.searchQuery}>"{search.search_query}"</h3>
                            </div>
                            <div style={styles.searchInfo}>
                                <span style={styles.resultsCount}>
                                    {search.search_results} results
                                </span>
                                <span style={styles.searchTime}>
                                    {formatDate(search.searched_at)}
                                </span>
                            </div>
                        </div>
                    ))
                ) : (
                    <div style={styles.emptyState}>
                        <h3>No search history yet</h3>
                        <p>Your searches will appear here</p>
                        <Link to="/" style={styles.backButton}>
                            Search News
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SearchHistory;