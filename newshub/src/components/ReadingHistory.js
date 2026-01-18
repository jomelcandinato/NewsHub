import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ReadingHistory = () => {
    const [readingHistory, setReadingHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchReadingHistory = async () => {
            if (!user) return;

            try {
                setLoading(true);
                const token = localStorage.getItem('token');
                const response = await fetch('http://localhost:5000/api/reading-history', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch reading history');
                }

                const data = await response.json();
                setReadingHistory(data.readingHistory || []);
            } catch (err) {
                setError(err.message);
                console.error('Error fetching reading history:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchReadingHistory();
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

    const clearHistory = async () => {
        if (!window.confirm('Are you sure you want to clear all reading history?')) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/reading-history', {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();
            
            if (response.ok) {
                setReadingHistory([]);
                alert('Reading history cleared successfully!');
            } else {
                setError(data.error || 'Failed to clear reading history');
            }
        } catch (err) {
            console.error('Error clearing history:', err);
            setError('Failed to clear reading history. Please check your connection and try again.');
        }
    };

    const handleArticleClick = async (historyId, articleTitle) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/api/reading-history/${historyId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                // Navigate to article detail with the saved article data
                navigate(`/news/history/${historyId}`, { 
                    state: { 
                        article: data.article,
                        fromHistory: true 
                    } 
                });
            } else {
                // Fallback: navigate with just the title
                navigate(`/news/${encodeURIComponent(articleTitle)}`);
            }
        } catch (error) {
            console.error('Error fetching reading history entry:', error);
            navigate(`/news/${encodeURIComponent(articleTitle)}`);
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
            flexDirection: 'column',
            gap: '10px',
            transition: 'background 0.3s',
            cursor: 'pointer'
        },
        articleTitle: {
            fontSize: '18px',
            fontWeight: '600',
            color: '#2c3e50',
            margin: '0'
        },
        metaInfo: {
            display: 'flex',
            gap: '15px',
            fontSize: '14px',
            color: '#7f8c8d',
            flexWrap: 'wrap'
        },
        category: {
            background: '#3498db',
            color: 'white',
            padding: '4px 12px',
            borderRadius: '15px',
            fontSize: '12px',
            fontWeight: '600'
        },
        source: {
            fontSize: '14px',
            color: '#7f8c8d'
        },
        readTime: {
            fontSize: '14px',
            color: '#95a5a6'
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
                    Please login to view your reading history.
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div style={styles.loadingSpinner}>
                <div style={styles.spinner}></div>
                <p>Loading reading history...</p>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h2 style={styles.title}>📖 Reading History</h2>
                <div style={styles.buttonGroup}>
                    <Link to="/" style={styles.backButton}>
                        ← Back to News
                    </Link>
                    {readingHistory.length > 0 && (
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
                {readingHistory.length > 0 ? (
                    readingHistory.map((item) => (
                        <div 
                            key={item.history_id} 
                            style={styles.historyItem}
                            onClick={() => handleArticleClick(item.history_id, item.article_title)}
                        >
                            <h3 style={styles.articleTitle}>{item.article_title}</h3>
                            <div style={styles.metaInfo}>
                                <span style={styles.category}>{item.article_category || 'General'}</span>
                                <span style={styles.source}>Source: {item.article_source}</span>
                                <span style={styles.readTime}>Read on: {formatDate(item.read_at)}</span>
                            </div>
                            {item.description && (
                                <p style={{ fontSize: '14px', color: '#555', marginTop: '5px' }}>
                                    {item.description.substring(0, 100)}...
                                </p>
                            )}
                        </div>
                    ))
                ) : (
                    <div style={styles.emptyState}>
                        <h3>No reading history yet</h3>
                        <p>Start reading articles to see them appear here</p>
                        <Link to="/" style={styles.backButton}>
                            Browse News
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReadingHistory;