import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

const UserProfile = () => {
    const { user } = useAuth();
    const [readingHistory, setReadingHistory] = useState([]);
    const [favorites, setFavorites] = useState([]);
    const [searchHistory, setSearchHistory] = useState([]);
    const [activeTab, setActiveTab] = useState('reading');

    useEffect(() => {
        if (user) {
            fetchUserData();
        }
    }, [user]);

    const fetchUserData = async () => {
        const token = localStorage.getItem('token');
        
        try {
            // Fetch reading history
            const readingRes = await fetch('http://localhost:5000/api/reading-history', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (readingRes.ok) {
                const data = await readingRes.json();
                setReadingHistory(data.readingHistory);
            }

            // Fetch favorites
            const favRes = await fetch('http://localhost:5000/api/favorites', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (favRes.ok) {
                const data = await favRes.json();
                setFavorites(data.favorites);
            }

            // Fetch search history
            const searchRes = await fetch('http://localhost:5000/api/search-history', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (searchRes.ok) {
                const data = await searchRes.json();
                setSearchHistory(data.searchHistory);
            }
        } catch (error) {
            console.error('Error fetching user data:', error);
        }
    };

    const styles = {
        container: {
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '20px'
        },
        header: {
            marginBottom: '30px'
        },
        tabs: {
            display: 'flex',
            gap: '10px',
            marginBottom: '30px',
            borderBottom: '2px solid #eee'
        },
        tab: {
            padding: '12px 24px',
            background: 'transparent',
            border: 'none',
            fontSize: '16px',
            cursor: 'pointer',
            borderBottom: '3px solid transparent',
            transition: 'all 0.3s'
        },
        activeTab: {
            borderBottom: '3px solid #3498db',
            color: '#3498db',
            fontWeight: '600'
        },
        content: {
            background: 'white',
            borderRadius: '12px',
            padding: '30px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        },
        item: {
            padding: '15px',
            borderBottom: '1px solid #eee',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
        },
        emptyState: {
            textAlign: 'center',
            padding: '40px',
            color: '#7f8c8d'
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h2>👤 User Profile: {user?.username}</h2>
                <p>Email: {user?.email}</p>
            </div>

            <div style={styles.tabs}>
                <button
                    style={{ ...styles.tab, ...(activeTab === 'reading' ? styles.activeTab : {}) }}
                    onClick={() => setActiveTab('reading')}
                >
                    📖 Reading History ({readingHistory.length})
                </button>
                <button
                    style={{ ...styles.tab, ...(activeTab === 'favorites' ? styles.activeTab : {}) }}
                    onClick={() => setActiveTab('favorites')}
                >
                    ❤️ Favorites ({favorites.length})
                </button>
                <button
                    style={{ ...styles.tab, ...(activeTab === 'search' ? styles.activeTab : {}) }}
                    onClick={() => setActiveTab('search')}
                >
                    🔍 Search History ({searchHistory.length})
                </button>
            </div>

            <div style={styles.content}>
                {activeTab === 'reading' && (
                    readingHistory.length > 0 ? (
                        readingHistory.map((item, index) => (
                            <div key={index} style={styles.item}>
                                <div>
                                    <h4>{item.article_title}</h4>
                                    <p style={{ color: '#7f8c8d', fontSize: '14px' }}>
                                        {item.article_category} • {new Date(item.read_at).toLocaleDateString()}
                                    </p>
                                </div>
                                <span style={{ color: '#7f8c8d', fontSize: '14px' }}>
                                    {new Date(item.read_at).toLocaleTimeString()}
                                </span>
                            </div>
                        ))
                    ) : (
                        <div style={styles.emptyState}>
                            <h3>No reading history yet</h3>
                            <p>Start reading articles to see them here</p>
                        </div>
                    )
                )}

                {activeTab === 'favorites' && (
                    favorites.length > 0 ? (
                        favorites.map((fav, index) => (
                            <div key={index} style={styles.item}>
                                <div>
                                    <h4>{fav.article_title}</h4>
                                    <p style={{ color: '#7f8c8d', fontSize: '14px' }}>
                                        {fav.article_category} • Saved on {new Date(fav.saved_at).toLocaleDateString()}
                                    </p>
                                </div>
                                <button style={{ color: '#e74c3c', background: 'none', border: 'none', cursor: 'pointer' }}>
                                    Remove
                                </button>
                            </div>
                        ))
                    ) : (
                        <div style={styles.emptyState}>
                            <h3>No favorites yet</h3>
                            <p>Click the heart icon on articles to add them to favorites</p>
                        </div>
                    )
                )}

                {activeTab === 'search' && (
                    searchHistory.length > 0 ? (
                        searchHistory.map((search, index) => (
                            <div key={index} style={styles.item}>
                                <div>
                                    <h4>"{search.search_query}"</h4>
                                    <p style={{ color: '#7f8c8d', fontSize: '14px' }}>
                                        {search.search_results} results found
                                    </p>
                                </div>
                                <span style={{ color: '#7f8c8d', fontSize: '14px' }}>
                                    {new Date(search.searched_at).toLocaleString()}
                                </span>
                            </div>
                        ))
                    ) : (
                        <div style={styles.emptyState}>
                            <h3>No search history yet</h3>
                            <p>Your searches will appear here</p>
                        </div>
                    )
                )}
            </div>
        </div>
    );
};

export default UserProfile;