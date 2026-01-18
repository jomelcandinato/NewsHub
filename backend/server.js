const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));
app.use(express.json());

const db = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'newshub_db'
});

db.connect((err) => {
    if (err) {
        console.error('Database connection failed:', err);
        return;
    }
    console.log('Connected to MySQL database');
    
    // Create tables
    createTables();
});

const createTables = () => {
    return new Promise((resolve, reject) => {
        // Users table (without role)
        const usersTable = `
            CREATE TABLE IF NOT EXISTS users (
                user_id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(50) UNIQUE NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                reset_token VARCHAR(255),
                reset_token_expiry DATETIME,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `;
        
        // Reading history table
        const readingHistoryTable = `
            CREATE TABLE IF NOT EXISTS reading_history (
                history_id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                article_id VARCHAR(255),
                article_title TEXT NOT NULL,
                article_category VARCHAR(100),
                article_source VARCHAR(100),
                description TEXT,
                content TEXT,
                image_url TEXT,
                link TEXT,
                pubDate DATETIME,
                read_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
            )
        `;
        
        // Favorites table
        const favoritesTable = `
            CREATE TABLE IF NOT EXISTS favorites (
                favorite_id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                article_id VARCHAR(255),
                article_title TEXT NOT NULL,
                article_category VARCHAR(100),
                article_source VARCHAR(100),
                article_image TEXT,
                article_url TEXT,
                description TEXT,
                pubDate DATETIME,
                saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
            )
        `;
        
        // Search history table
        const searchHistoryTable = `
            CREATE TABLE IF NOT EXISTS search_history (
                search_id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                search_query TEXT NOT NULL,
                search_results INT,
                searched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
            )
        `;
        
        db.query(usersTable, (err) => {
            if (err) {
                console.error('Error creating users table:', err);
                reject(err);
                return;
            }
            console.log('✅ Users table ready');
            
            db.query(readingHistoryTable, (err) => {
                if (err) {
                    console.error('Error creating reading_history table:', err);
                    reject(err);
                    return;
                }
                console.log('✅ Reading history table ready');
                
                db.query(favoritesTable, (err) => {
                    if (err) {
                        console.error('Error creating favorites table:', err);
                        reject(err);
                        return;
                    }
                    console.log('✅ Favorites table ready');
                    
                    db.query(searchHistoryTable, (err) => {
                        if (err) {
                            console.error('Error creating search_history table:', err);
                            reject(err);
                            return;
                        }
                        console.log('✅ Search history table ready');
                        resolve();
                    });
                });
            });
        });
    });
};

// Middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }
    
    jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid token' });
        }
        req.user = user;
        next();
    });
};

// User Registration
app.post('/api/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        
        if (!username || !email || !password) {
            return res.status(400).json({ error: 'All fields are required' });
        }
        
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: 'Invalid email format' });
        }
        
        // Validate password strength
        if (password.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters long' });
        }
        
        const checkQuery = 'SELECT * FROM users WHERE username = ? OR email = ?';
        db.query(checkQuery, [username, email], async (err, results) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ error: 'Database error' });
            }
            
            if (results.length > 0) {
                return res.status(400).json({ error: 'Username or email already exists' });
            }
            
            const hashedPassword = await bcrypt.hash(password, 10);
            
            const insertQuery = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
            db.query(insertQuery, [username, email, hashedPassword], (err, result) => {
                if (err) {
                    console.error('Database error:', err);
                    return res.status(500).json({ error: 'Failed to create user' });
                }
                
                const token = jwt.sign(
                    { userId: result.insertId, username, email },
                    process.env.JWT_SECRET || 'your-secret-key',
                    { expiresIn: '7d' }
                );
                
                res.status(201).json({
                    message: 'User registered successfully',
                    token,
                    user: { userId: result.insertId, username, email }
                });
            });
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// User Login
app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password are required' });
        }
        
        console.log('Login attempt for:', username);
        
        const query = 'SELECT * FROM users WHERE username = ? OR email = ?';
        db.query(query, [username, username], async (err, results) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ error: 'Database error' });
            }
            
            if (results.length === 0) {
                console.log('No user found for:', username);
                return res.status(401).json({ error: 'Invalid credentials' });
            }
            
            const user = results[0];
            console.log('User found:', user.username);
            
            const validPassword = await bcrypt.compare(password, user.password);
            console.log('Password valid:', validPassword);
            
            if (!validPassword) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }
            
            const token = jwt.sign(
                { userId: user.user_id, username: user.username, email: user.email },
                process.env.JWT_SECRET || 'your-secret-key',
                { expiresIn: '7d' }
            );
            
            res.json({
                message: 'Login successful',
                token,
                user: {
                    userId: user.user_id,
                    username: user.username,
                    email: user.email
                }
            });
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Forgot Password
app.post('/api/forgot-password', (req, res) => {
    try {
        const { email } = req.body;
        
        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }
        
        const query = 'SELECT * FROM users WHERE email = ?';
        db.query(query, [email], (err, results) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ error: 'Database error' });
            }
            
            if (results.length === 0) {
                return res.json({ message: 'If your email exists, you will receive a reset link' });
            }
            
            const resetToken = Math.random().toString(36).substring(2) + Date.now().toString(36);
            const resetTokenExpiry = new Date(Date.now() + 3600000);
            
            const updateQuery = 'UPDATE users SET reset_token = ?, reset_token_expiry = ? WHERE email = ?';
            db.query(updateQuery, [resetToken, resetTokenExpiry, email], (err) => {
                if (err) {
                    console.error('Database error:', err);
                    return res.status(500).json({ error: 'Failed to process request' });
                }
                
                console.log('Reset token for', email, ':', resetToken);
                
                res.json({
                    message: 'If your email exists, you will receive a reset link',
                    resetToken
                });
            });
        });
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Reset Password
app.post('/api/reset-password', async (req, res) => {
    try {
        const { token, newPassword } = req.body;
        
        if (!token || !newPassword) {
            return res.status(400).json({ error: 'Token and new password are required' });
        }
        
        const query = 'SELECT * FROM users WHERE reset_token = ? AND reset_token_expiry > NOW()';
        db.query(query, [token], async (err, results) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ error: 'Database error' });
            }
            
            if (results.length === 0) {
                return res.status(400).json({ error: 'Invalid or expired reset token' });
            }
            
            const user = results[0];
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            
            const updateQuery = 'UPDATE users SET password = ?, reset_token = NULL, reset_token_expiry = NULL WHERE user_id = ?';
            db.query(updateQuery, [hashedPassword, user.user_id], (err) => {
                if (err) {
                    console.error('Database error:', err);
                    return res.status(500).json({ error: 'Failed to reset password' });
                }
                
                res.json({ message: 'Password reset successfully' });
            });
        });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Add to Reading History
app.post('/api/reading-history', authenticateToken, (req, res) => {
    try {
        const { 
            article_id, 
            article_title, 
            article_category, 
            article_source,
            description,
            content,
            image_url,
            link,
            pubDate
        } = req.body;
        
        if (!article_title) {
            return res.status(400).json({ error: 'Article title is required' });
        }
        
        const query = `INSERT INTO reading_history 
            (user_id, article_id, article_title, article_category, article_source, 
             description, content, image_url, link, pubDate) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        
        db.query(query, [
            req.user.userId, 
            article_id, 
            article_title, 
            article_category, 
            article_source,
            description || '',
            content || '',
            image_url || '',
            link || '',
            pubDate || new Date().toISOString()
        ], (err) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ error: 'Failed to save reading history' });
            }
            
            res.json({ message: 'Reading history saved' });
        });
    } catch (error) {
        console.error('Reading history error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get Reading History for logged in user
app.get('/api/reading-history', authenticateToken, (req, res) => {
    try {
        const query = 'SELECT * FROM reading_history WHERE user_id = ? ORDER BY read_at DESC LIMIT 20';
        db.query(query, [req.user.userId], (err, results) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ error: 'Database error' });
            }
            res.json({ readingHistory: results });
        });
    } catch (error) {
        console.error('Get reading history error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Clear Reading History
app.delete('/api/reading-history', authenticateToken, (req, res) => {
    try {
        const query = 'DELETE FROM reading_history WHERE user_id = ?';
        db.query(query, [req.user.userId], (err) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ error: 'Failed to clear reading history' });
            }
            res.json({ message: 'Reading history cleared' });
        });
    } catch (error) {
        console.error('Clear reading history error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get specific reading history entry
app.get('/api/reading-history/:historyId', authenticateToken, (req, res) => {
    try {
        const { historyId } = req.params;
        
        const query = 'SELECT * FROM reading_history WHERE history_id = ? AND user_id = ?';
        db.query(query, [historyId, req.user.userId], (err, results) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ error: 'Database error' });
            }
            
            if (results.length === 0) {
                return res.status(404).json({ error: 'Reading history entry not found' });
            }
            
            res.json({ article: results[0] });
        });
    } catch (error) {
        console.error('Get reading history entry error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Add/Remove Favorites
app.post('/api/favorites', authenticateToken, (req, res) => {
    try {
        const { 
            article_id, 
            article_title, 
            article_category, 
            article_source, 
            article_image, 
            article_url,
            description,
            pubDate
        } = req.body;
        
        if (!article_title) {
            return res.status(400).json({ error: 'Article title is required' });
        }
        
        const checkQuery = 'SELECT * FROM favorites WHERE user_id = ? AND article_id = ?';
        db.query(checkQuery, [req.user.userId, article_id], (err, results) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ error: 'Database error' });
            }
            
            if (results.length > 0) {
                const deleteQuery = 'DELETE FROM favorites WHERE user_id = ? AND article_id = ?';
                db.query(deleteQuery, [req.user.userId, article_id], (err) => {
                    if (err) {
                        console.error('Database error:', err);
                        return res.status(500).json({ error: 'Failed to remove favorite' });
                    }
                    res.json({ message: 'Removed from favorites', isFavorite: false });
                });
            } else {
                const insertQuery = `INSERT INTO favorites 
                    (user_id, article_id, article_title, article_category, article_source, 
                     article_image, article_url, description, pubDate) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
                
                db.query(insertQuery, [
                    req.user.userId, article_id, article_title, article_category, 
                    article_source, article_image, article_url,
                    description || '',
                    pubDate || new Date().toISOString()
                ], (err) => {
                    if (err) {
                        console.error('Database error:', err);
                        return res.status(500).json({ error: 'Failed to add favorite' });
                    }
                    res.json({ message: 'Added to favorites', isFavorite: true });
                });
            }
        });
    } catch (error) {
        console.error('Favorites error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get User Favorites
app.get('/api/favorites', authenticateToken, (req, res) => {
    try {
        const query = 'SELECT * FROM favorites WHERE user_id = ? ORDER BY saved_at DESC';
        db.query(query, [req.user.userId], (err, results) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ error: 'Database error' });
            }
            res.json({ favorites: results });
        });
    } catch (error) {
        console.error('Get favorites error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Save Search History
app.post('/api/search-history', authenticateToken, (req, res) => {
    try {
        const { search_query, search_results } = req.body;
        
        if (!search_query) {
            return res.status(400).json({ error: 'Search query is required' });
        }
        
        const query = 'INSERT INTO search_history (user_id, search_query, search_results) VALUES (?, ?, ?)';
        db.query(query, [req.user.userId, search_query, search_results || 0], (err) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ error: 'Failed to save search history' });
            }
            res.json({ message: 'Search history saved' });
        });
    } catch (error) {
        console.error('Search history error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get User Search History
app.get('/api/search-history', authenticateToken, (req, res) => {
    try {
        const query = 'SELECT * FROM search_history WHERE user_id = ? ORDER BY searched_at DESC LIMIT 20';
        db.query(query, [req.user.userId], (err, results) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ error: 'Database error' });
            }
            res.json({ searchHistory: results });
        });
    } catch (error) {
        console.error('Get search history error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Clear Search History
app.delete('/api/search-history', authenticateToken, (req, res) => {
    try {
        const query = 'DELETE FROM search_history WHERE user_id = ?';
        db.query(query, [req.user.userId], (err) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ error: 'Failed to clear search history' });
            }
            res.json({ message: 'Search history cleared' });
        });
    } catch (error) {
        console.error('Clear search history error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Verify Token
app.get('/api/verify', authenticateToken, (req, res) => {
    res.json({ user: req.user });
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Server is running' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});