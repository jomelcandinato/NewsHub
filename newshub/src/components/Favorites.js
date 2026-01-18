import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Favorites = () => {
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchFavorites = async () => {
            if (!user) return;

            try {
                setLoading(true);
                const token = localStorage.getItem('token');
                const response = await fetch('http://localhost:5000/api/favorites', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch favorites');
                }

                const data = await response.json();
                setFavorites(data.favorites || []);
            } catch (err) {
                setError(err.message);
                console.error('Error fetching favorites:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchFavorites();
    }, [user]);

    const removeFavorite = async (articleId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/favorites', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    article_id: articleId,
                    article_title: 'Remove',
                    article_category: 'General',
                    article_source: 'Remove',
                    article_image: '',
                    article_url: ''
                })
            });

            if (response.ok) {
                setFavorites(favorites.filter(fav => fav.article_id !== articleId));
                alert('Removed from favorites!');
            }
        } catch (error) {
            console.error('Error removing favorite:', error);
            alert('Failed to remove favorite');
        }
    };

    const formatDate = (dateString) => {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
            });
        } catch (error) {
            return dateString;
        }
    };

    const handleArticleClick = (favorite) => {
        // Create a proper article object from the favorite data
        const articleData = {
            article_id: favorite.article_id,
            title: favorite.article_title,
            description: favorite.description,
            content: favorite.description || 'Full content not available. This article was saved as a favorite.',
            pubDate: favorite.pubDate || favorite.saved_at,
            source_name: favorite.article_source,
            category: [favorite.article_category || 'General'],
            image_url: favorite.article_image,
            link: favorite.article_url,
            country: 'ph' // Default to Philippines, you might want to store country in favorites
        };
        
        // Navigate to the article detail page with the favorite data
        navigate(`/favorites/${favorite.favorite_id}`, { 
            state: { 
                article: articleData,
                fromFavorites: true 
            } 
        });
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
            gap: '8px'
        },
        favoritesGrid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '25px'
        },
        favoriteCard: {
            background: 'white',
            borderRadius: '12px',
            overflow: 'hidden',
            boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
            transition: 'all 0.3s ease',
            position: 'relative',
            cursor: 'pointer'
        },
        favoriteImage: {
            height: '150px',
            overflow: 'hidden'
        },
        image: {
            width: '100%',
            height: '100%',
            objectFit: 'cover'
        },
        favoriteContent: {
            padding: '20px'
        },
        favoriteTitle: {
            fontSize: '16px',
            fontWeight: '600',
            color: '#2c3e50',
            marginBottom: '10px',
            lineHeight: '1.4'
        },
        favoriteMeta: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '15px',
            flexWrap: 'wrap',
            gap: '10px'
        },
        category: {
            background: '#3498db',
            color: 'white',
            padding: '4px 12px',
            borderRadius: '15px',
            fontSize: '12px',
            fontWeight: '600'
        },
        savedDate: {
            fontSize: '12px',
            color: '#7f8c8d'
        },
        removeButton: {
            position: 'absolute',
            top: '10px',
            right: '10px',
            background: '#e74c3c',
            color: 'white',
            border: 'none',
            width: '30px',
            height: '30px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            fontSize: '16px',
            zIndex: '10'
        },
        emptyState: {
            textAlign: 'center',
            padding: '60px 20px',
            color: '#7f8c8d',
            background: 'white',
            borderRadius: '12px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
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
        sourceInfo: {
            fontSize: '14px',
            color: '#7f8c8d',
            marginTop: '5px'
        }
    };

    if (!user) {
        return (
            <div style={styles.container}>
                <Link to="/login" style={styles.backButton}>
                    ← Back to Login
                </Link>
                <div style={styles.errorMessage}>
                    Please login to view your favorites.
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div style={styles.loadingSpinner}>
                <div style={styles.spinner}></div>
                <p>Loading favorites...</p>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h2 style={styles.title}>❤️ Favorites ({favorites.length})</h2>
                <Link to="/" style={styles.backButton}>
                    ← Back to News
                </Link>
            </div>

            {error && (
                <div style={styles.errorMessage}>
                    ⚠️ {error}
                </div>
            )}

            {favorites.length > 0 ? (
                <div style={styles.favoritesGrid}>
                    {favorites.map((fav, index) => (
                        <div 
                            key={index} 
                            style={styles.favoriteCard}
                            onClick={() => handleArticleClick(fav)}
                        >
                            <button 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    removeFavorite(fav.article_id);
                                }} 
                                style={styles.removeButton}
                                title="Remove from favorites"
                            >
                                ✕
                            </button>
                            <div style={styles.favoriteImage}>
                                <img 
                                    src={fav.article_image || 'https://images.unsplash.com/photo-1588681664899-f142ff2dc9b1?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80'} 
                                    alt={fav.article_title} 
                                    style={styles.image} 
                                />
                            </div>
                            <div style={styles.favoriteContent}>
                                <h3 style={styles.favoriteTitle}>{fav.article_title}</h3>
                                <div style={styles.favoriteMeta}>
                                    <span style={styles.category}>{fav.article_category || 'General'}</span>
                                    <span style={styles.savedDate}>Saved: {formatDate(fav.saved_at)}</span>
                                </div>
                                <div style={styles.sourceInfo}>
                                    Source: {fav.article_source}
                                    {fav.pubDate && (
                                        <span style={{ marginLeft: '10px' }}>
                                            Published: {formatDate(fav.pubDate)}
                                        </span>
                                    )}
                                </div>
                                {fav.description && (
                                    <p style={{ fontSize: '14px', color: '#555', marginTop: '10px' }}>
                                        {fav.description.substring(0, 100)}...
                                    </p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div style={styles.emptyState}>
                    <h3>No favorites yet</h3>
                    <p>Click the heart icon on articles to add them to your favorites</p>
                    <Link to="/" style={styles.backButton}>
                        Browse News
                    </Link>
                </div>
            )}
        </div>
    );
};

export default Favorites;