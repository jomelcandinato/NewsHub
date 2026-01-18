import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import NewsAPI from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const NewsDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [article, setArticle] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [relatedArticles, setRelatedArticles] = useState([]);
    const { user } = useAuth();

    useEffect(() => {
        fetchArticle();
    }, [id, location.state]);

    const fetchArticle = async () => {
        try {
            setLoading(true);
            setError(null);

            // Check if we're viewing a favorite article
            if (window.location.pathname.includes('/favorites/')) {
                if (location.state && location.state.article) {
                    setArticle(location.state.article);
                    setLoading(false);
                    return;
                } else {
                    throw new Error('Favorite article data not available. Please go back to favorites and try again.');
                }
            }

            // Check if we have article data from location state (from reading history or previous navigation)
            if (location.state && location.state.article) {
                setArticle(location.state.article);
                setLoading(false);
                return;
            }

            // Check if this is a history URL
            if (window.location.pathname.includes('/news/history/')) {
                const historyId = id;
                if (user) {
                    try {
                        const token = localStorage.getItem('token');
                        const response = await fetch(`http://localhost:5000/api/reading-history/${historyId}`, {
                            headers: {
                                'Authorization': `Bearer ${token}`
                            }
                        });

                        if (response.ok) {
                            const data = await response.json();
                            setArticle(data.article);
                            setLoading(false);
                            return;
                        }
                    } catch (err) {
                        console.error('Error fetching from reading history:', err);
                    }
                }
            }

            // Regular news article fetch
            const data = await NewsAPI.getLatestNews('ph', 'business');
            
            if (data.results && data.results.length > 0) {
                const decodedId = decodeURIComponent(id);
                const foundArticle = data.results.find(
                    (article) => 
                        article.article_id === decodedId || 
                        article.title === decodedId ||
                        article.link?.includes(decodedId)
                );

                if (foundArticle) {
                    setArticle(foundArticle);
                    const related = data.results
                        .filter(a => a.category?.[0] === foundArticle.category?.[0] && a.article_id !== foundArticle.article_id)
                        .slice(0, 3);
                    setRelatedArticles(related);
                } else {
                    throw new Error('Article not found');
                }
            } else {
                throw new Error('No articles available');
            }
        } catch (err) {
            console.error('Error fetching article:', err);
            setError(err.message || 'Article not found or unable to load.');
            
            // Check if we have any article data in state
            if (location.state?.article) {
                setArticle(location.state.article);
            } else {
                // Create a mock article with available data
                const decodedId = decodeURIComponent(id);
                const mockArticle = {
                    article_id: id,
                    title: decodedId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
                    description: location.state?.article?.description || 'This is a detailed view of the news article. The full content would appear here with more details about the news story.',
                    content: location.state?.article?.content || 'Full article content goes here. This would be the complete story with all the details, quotes, and information about the news event. The content might include multiple paragraphs and detailed analysis.',
                    pubDate: location.state?.article?.pubDate || new Date().toISOString(),
                    source_name: location.state?.article?.article_source || 'NewsHub',
                    category: [location.state?.article?.article_category || 'general'],
                    image_url: location.state?.article?.image_url || location.state?.article?.article_image || 'https://images.unsplash.com/photo-1588681664899-f142ff2dc9b1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
                    link: location.state?.article?.link || location.state?.article?.article_url || '#'
                };
                setArticle(mockArticle);
            }
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            });
        } catch (error) {
            return dateString;
        }
    };

    const handleBack = () => {
        if (window.location.pathname.includes('/favorites/')) {
            navigate('/favorites');
        } else {
            navigate(-1);
        }
    };

    const getImageUrl = () => {
        if (article?.image_url) return article.image_url;
        if (article?.article_image) return article.article_image;
        return 'https://images.unsplash.com/photo-1588681664899-f142ff2dc9b1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80';
    };

    const getTitle = () => {
        return article?.title || article?.article_title || 'News Article';
    };

    const getDescription = () => {
        return article?.description || article?.article_description || 'No description available.';
    };

    const getContent = () => {
        if (article?.content) return article.content;
        if (article?.description) return article.description;
        return 'Full content not available. Please visit the original source for complete article.';
    };

    const getCategory = () => {
        if (article?.category && article.category.length > 0) return article.category[0];
        if (article?.article_category) return article.article_category;
        return 'General';
    };

    const getSource = () => {
        return article?.source_name || article?.article_source || 'Unknown Source';
    };

    const getLink = () => {
        return article?.link || article?.article_url || '#';
    };

    const styles = {
        container: {
            maxWidth: '900px',
            margin: '0 auto',
            padding: '30px 20px',
            minHeight: '100vh'
        },
        articleDetail: {
            background: 'white',
            borderRadius: '12px',
            overflow: 'hidden',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
        },
        articleHeader: {
            padding: '30px',
            background: 'linear-gradient(135deg, #2c3e50, #34495e)',
            color: 'white'
        },
        articleMeta: {
            display: 'flex',
            flexWrap: 'wrap',
            gap: '15px',
            marginBottom: '20px',
            fontSize: '14px',
            alignItems: 'center'
        },
        articleCategory: {
            background: '#3498db',
            padding: '6px 15px',
            borderRadius: '15px',
            fontWeight: '600',
            fontSize: '12px',
            textTransform: 'uppercase'
        },
        articleSource: {
            opacity: '0.9',
            fontSize: '14px'
        },
        articleDate: {
            opacity: '0.8',
            fontSize: '14px'
        },
        articleTitle: {
            fontSize: '32px',
            lineHeight: '1.3',
            marginBottom: '25px',
            fontWeight: '700'
        },
        articleImage: {
            width: '100%',
            maxHeight: '500px',
            borderRadius: '8px',
            overflow: 'hidden',
            marginTop: '25px',
            boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
        },
        articleImg: {
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            maxHeight: '500px'
        },
        articleContent: {
            padding: '40px'
        },
        articleDescription: {
            fontSize: '20px',
            lineHeight: '1.6',
            color: '#2c3e50',
            marginBottom: '30px',
            fontWeight: '500',
            fontStyle: 'italic',
            borderLeft: '4px solid #3498db',
            paddingLeft: '20px'
        },
        articleFullContent: {
            fontSize: '16px',
            lineHeight: '1.8',
            color: '#444',
            marginBottom: '40px',
            whiteSpace: 'pre-line'
        },
        articleFullContentParagraph: {
            marginBottom: '20px'
        },
        originalLink: {
            display: 'inline-block',
            background: '#2ecc71',
            color: 'white',
            padding: '12px 24px',
            borderRadius: '6px',
            textDecoration: 'none',
            fontWeight: '600',
            transition: 'background 0.3s',
            marginTop: '20px'
        },
        relatedArticles: {
            marginTop: '50px',
            paddingTop: '30px',
            borderTop: '1px solid #eee'
        },
        relatedTitle: {
            fontSize: '24px',
            marginBottom: '20px',
            color: '#2c3e50'
        },
        relatedGrid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '20px'
        },
        relatedCard: {
            background: '#f8f9fa',
            padding: '20px',
            borderRadius: '8px',
            cursor: 'pointer',
            transition: 'all 0.3s',
            border: '2px solid transparent'
        },
        relatedCardTitle: {
            fontSize: '16px',
            marginBottom: '10px',
            color: '#2c3e50',
            fontWeight: '600'
        },
        relatedCardDescription: {
            fontSize: '14px',
            color: '#666',
            lineHeight: '1.5'
        },
        backButton: {
            background: '#3498db',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            marginBottom: '20px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'background 0.3s',
            fontWeight: '600'
        },
        loadingContainer: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '60px 20px',
            minHeight: '50vh'
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
        errorContainer: {
            margin: '40px auto',
            maxWidth: '600px',
            textAlign: 'center',
            padding: '40px',
            background: 'white',
            borderRadius: '12px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        },
        errorIcon: {
            fontSize: '48px',
            marginBottom: '20px',
            color: '#e74c3c'
        },
        loginPrompt: {
            backgroundColor: '#fff3cd',
            border: '1px solid #ffeaa7',
            borderRadius: '8px',
            padding: '20px',
            margin: '20px 0',
            textAlign: 'center',
            color: '#856404'
        },
        loginButton: {
            background: '#3498db',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            marginTop: '10px',
            textDecoration: 'none',
            display: 'inline-block',
            fontWeight: '600',
            marginRight: '10px'
        },
        favoriteBadge: {
            display: 'inline-block',
            background: '#e74c3c',
            color: 'white',
            padding: '4px 10px',
            borderRadius: '4px',
            fontSize: '12px',
            fontWeight: '600',
            marginLeft: '10px'
        }
    };

    if (!user) {
        return (
            <div style={styles.container}>
                <button onClick={handleBack} style={styles.backButton}>
                    ← Back
                </button>
                <div style={styles.loginPrompt}>
                    <h3>🔒 Authentication Required</h3>
                    <p>Please login or register an account to read news articles.</p>
                    <button 
                        onClick={() => navigate('/login')} 
                        style={styles.loginButton}
                    >
                        Login
                    </button>
                    <button 
                        onClick={() => navigate('/register')} 
                        style={{ ...styles.loginButton, background: '#2ecc71' }}
                    >
                        Register
                    </button>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div style={styles.loadingContainer}>
                <div style={styles.spinner}></div>
                <p style={{ fontSize: '16px', color: '#7f8c8d' }}>Loading article...</p>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <button onClick={handleBack} style={styles.backButton}>
                ← {window.location.pathname.includes('/favorites/') ? 'Back to Favorites' : 'Back to News'}
            </button>

            {error && article === null ? (
                <div style={styles.errorContainer}>
                    <div style={styles.errorIcon}>⚠️</div>
                    <h2 style={{ color: '#e74c3c', marginBottom: '15px' }}>{error}</h2>
                    <p style={{ color: '#7f8c8d', marginBottom: '20px' }}>
                        {window.location.pathname.includes('/favorites/') 
                            ? 'The favorite article you\'re looking for might have been removed or is temporarily unavailable.' 
                            : 'The article you\'re looking for might have been removed or is temporarily unavailable.'}
                    </p>
                    <button onClick={handleBack} style={styles.backButton}>
                        ← {window.location.pathname.includes('/favorites/') ? 'Back to Favorites' : 'Back to News'}
                    </button>
                </div>
            ) : (
                <article style={styles.articleDetail}>
                    <div style={styles.articleHeader}>
                        <div style={styles.articleMeta}>
                            <span style={styles.articleCategory}>{getCategory()}</span>
                            <span style={styles.articleSource}>
                                Source: {getSource()}
                                {window.location.pathname.includes('/favorites/') && (
                                    <span style={styles.favoriteBadge}>
                                        ❤️ Favorite
                                    </span>
                                )}
                            </span>
                            <span style={styles.articleDate}>{formatDate(article?.pubDate || article?.saved_at)}</span>
                        </div>
                        
                        <h1 style={styles.articleTitle}>{getTitle()}</h1>
                        
                        <div style={styles.articleImage}>
                            <img 
                                src={getImageUrl()} 
                                alt={getTitle()} 
                                style={styles.articleImg} 
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = 'https://images.unsplash.com/photo-1588681664899-f142ff2dc9b1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80';
                                }}
                            />
                        </div>
                    </div>

                    <div style={styles.articleContent}>
                        <p style={styles.articleDescription}>
                            {getDescription()}
                        </p>
                        
                        <div style={styles.articleFullContent}>
                            {getContent().split('\n\n').map((paragraph, index) => (
                                <p key={index} style={styles.articleFullContentParagraph}>
                                    {paragraph}
                                </p>
                            ))}
                        </div>

                        {(getLink() && getLink() !== '#') && (
                            <a 
                                href={getLink()} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                style={styles.originalLink}
                            >
                                🔗 Read original article on {getSource()}
                            </a>
                        )}
                    </div>

                    {!window.location.pathname.includes('/favorites/') && relatedArticles.length > 0 && (
                        <div style={styles.relatedArticles}>
                            <h3 style={styles.relatedTitle}>Related Articles</h3>
                            <div style={styles.relatedGrid}>
                                {relatedArticles.map((related, index) => (
                                    <div 
                                        key={index} 
                                        style={styles.relatedCard}
                                        onClick={() => navigate(`/news/${encodeURIComponent(related.title)}`, { 
                                            state: { article: related } 
                                        })}
                                    >
                                        <h4 style={styles.relatedCardTitle}>{related.title}</h4>
                                        <p style={styles.relatedCardDescription}>
                                            {related.description?.substring(0, 100)}...
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </article>
            )}
            
            <style>
                {`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                `}
            </style>
        </div>
    );
};

export default NewsDetail;