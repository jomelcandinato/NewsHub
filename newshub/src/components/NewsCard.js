import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const NewsCard = ({ article, country = 'ph' }) => {
    const [isFavorite, setIsFavorite] = useState(false);
    const { user } = useAuth();
    const navigate = useNavigate();

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
            console.error('Error formatting date:', error);
            return dateString || 'Unknown date';
        }
    };

    const getImageUrl = () => {
        try {
            if (article.image_url) {
                return article.image_url;
            }
            if (article.article_image) {
                return article.article_image;
            }
            if (article.urlToImage) {
                return article.urlToImage;
            }
            return 'https://images.unsplash.com/photo-1588681664899-f142ff2dc9b1?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80';
        } catch (error) {
            console.error('Error getting image URL:', error);
            return 'https://images.unsplash.com/photo-1588681664899-f142ff2dc9b1?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80';
        }
    };

    const getArticleId = () => {
        return article.article_id || article.title;
    };

    const getCategory = () => {
        if (article.category && article.category.length > 0) {
            // Return the first category that's not 'top'
            const nonTopCategory = article.category.find(cat => cat !== 'top');
            return nonTopCategory || article.category[0] || 'General';
        }
        if (article.article_category) {
            return article.article_category;
        }
        return 'General';
    };

    const getSource = () => {
        return article.source_name || article.article_source || article.source?.name || 'Unknown Source';
    };

    const handleFavoriteClick = async (e) => {
        e.stopPropagation();
        
        if (!user) {
            alert('Please login or register an account first to add favorites.');
            navigate('/login');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/favorites', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    article_id: getArticleId(),
                    article_title: article.title,
                    article_category: getCategory(),
                    article_source: getSource(),
                    article_image: getImageUrl(),
                    article_url: article.link || article.url || '#',
                    description: article.description || '',
                    pubDate: article.pubDate || article.publishedAt || new Date().toISOString()
                })
            });

            const data = await response.json();
            if (response.ok) {
                setIsFavorite(data.isFavorite);
                if (data.isFavorite) {
                    alert('✅ Added to favorites!');
                } else {
                    alert('❌ Removed from favorites');
                }
            }
        } catch (error) {
            console.error('Error adding to favorites:', error);
            alert('Failed to update favorites. Please try again.');
        }
    };

    const checkIfFavorite = useCallback(async () => {
        if (!user) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/favorites', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                const isFav = data.favorites.some(fav => 
                    fav.article_id === getArticleId()
                );
                setIsFavorite(isFav);
            }
        } catch (error) {
            console.error('Error checking favorites:', error);
        }
    }, [user, article.article_id, article.title]);

    useEffect(() => {
        if (user) {
            checkIfFavorite();
        }
    }, [user, checkIfFavorite]);

    const handleReadMoreClick = async (e) => {
        e.preventDefault();
        
        if (!user) {
            alert('Please login or register an account first to read news articles.');
            navigate('/login');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            await fetch('http://localhost:5000/api/reading-history', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    article_id: getArticleId(),
                    article_title: article.title,
                    article_category: getCategory(),
                    article_source: getSource(),
                    description: article.description || '',
                    content: article.content || article.description || '',
                    image_url: getImageUrl(),
                    link: article.link || article.url || '#',
                    pubDate: article.pubDate || article.publishedAt || new Date().toISOString()
                })
            });
            
            // Navigate to the article detail page with the full article data
            navigate(`/news/${encodeURIComponent(getArticleId())}`, { 
                state: { 
                    article: article,
                    country: country 
                } 
            });
        } catch (error) {
            console.error('Error saving reading history:', error);
            // Navigate even if saving history fails
            navigate(`/news/${encodeURIComponent(getArticleId())}`, { 
                state: { 
                    article: article,
                    country: country 
                } 
            });
        }
    };

    const styles = {
        card: {
            background: 'white',
            borderRadius: '12px',
            overflow: 'hidden',
            boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
            transition: 'all 0.3s ease',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            cursor: 'pointer'
        },
        image: {
            height: '200px',
            overflow: 'hidden'
        },
        img: {
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.5s ease'
        },
        content: {
            padding: '20px',
            flex: '1',
            display: 'flex',
            flexDirection: 'column'
        },
        categoryRow: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '12px'
        },
        categoryBadge: {
            background: '#3498db',
            color: 'white',
            padding: '4px 12px',
            borderRadius: '15px',
            fontSize: '12px',
            fontWeight: '600',
            textTransform: 'uppercase'
        },
        source: {
            fontSize: '12px',
            color: '#7f8c8d',
            fontWeight: '600'
        },
        title: {
            fontSize: '18px',
            fontWeight: '700',
            marginBottom: '10px',
            color: '#2c3e50',
            lineHeight: '1.4'
        },
        description: {
            fontSize: '14px',
            color: '#555',
            lineHeight: '1.6',
            marginBottom: '20px',
            flex: '1'
        },
        footer: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingTop: '15px',
            borderTop: '1px solid #eee',
            marginTop: 'auto'
        },
        date: {
            fontSize: '12px',
            color: '#7f8c8d'
        },
        readMore: {
            color: '#3498db',
            textDecoration: 'none',
            fontWeight: '600',
            fontSize: '14px',
            cursor: 'pointer',
            background: 'none',
            border: 'none',
            padding: '0'
        },
        favoriteButton: {
            position: 'absolute',
            top: '10px',
            right: '10px',
            background: isFavorite ? '#e74c3c' : 'rgba(255, 255, 255, 0.9)',
            border: 'none',
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            fontSize: '20px',
            color: isFavorite ? 'white' : '#e74c3c',
            boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
            transition: 'all 0.3s',
            zIndex: '10'
        },
        countryBadge: {
            position: 'absolute',
            top: '10px',
            left: '10px',
            background: country === 'ph' ? '#3498db' : '#9b59b6',
            color: 'white',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '10px',
            fontWeight: '600',
            zIndex: '10'
        },
        topNewsBadge: {
            position: 'absolute',
            top: '50px',
            left: '10px',
            background: '#e74c3c',
            color: 'white',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '10px',
            fontWeight: '600',
            zIndex: '10'
        }
    };

    const isTopNews = article.category && article.category.includes('top');

    return (
        <div style={styles.card}>
            <div style={styles.countryBadge}>
                {country === 'ph' ? '🇵🇭 PH' : '🌍 WW'}
            </div>
            {isTopNews && (
                <div style={styles.topNewsBadge}>
                    🔥 TOP
                </div>
            )}
            <button 
                style={styles.favoriteButton}
                onClick={handleFavoriteClick}
                title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            >
                {isFavorite ? '❤️' : '🤍'}
            </button>
            
            <div style={styles.image}>
                <img 
                    src={getImageUrl()} 
                    alt={article.title} 
                    loading="lazy" 
                    style={styles.img}
                    onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://images.unsplash.com/photo-1588681664899-f142ff2dc9b1?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80';
                    }}
                />
            </div>
            <div style={styles.content}>
                <div style={styles.categoryRow}>
                    <span style={styles.categoryBadge}>{getCategory()}</span>
                    <span style={styles.source}>{getSource()}</span>
                </div>
                <h3 style={styles.title}>{article.title}</h3>
                <p style={styles.description}>
                    {article.description?.substring(0, 150) || 'No description available...'}
                </p>
                <div style={styles.footer}>
                    <span style={styles.date}>{formatDate(article.pubDate || article.publishedAt)}</span>
                    <button 
                        onClick={handleReadMoreClick}
                        style={styles.readMore}
                    >
                        Read More →
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NewsCard;