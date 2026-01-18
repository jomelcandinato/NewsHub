const mysql = require('mysql2');
require('dotenv').config();

const db = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: 'mysql' // Connect to default database first
});

const bcrypt = require('bcryptjs');

db.connect((err) => {
    if (err) {
        console.error('Database connection failed:', err);
        process.exit(1);
    }
    console.log('Connected to MySQL server');
    
    setupDatabase();
});

async function setupDatabase() {
    try {
        // Create database
        await query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME || 'newshub_db'}`);
        console.log(`✅ Database created/verified: ${process.env.DB_NAME || 'newshub_db'}`);
        
        // Use the database
        await query(`USE ${process.env.DB_NAME || 'newshub_db'}`);
        
        // Create users table
        await query(`
            CREATE TABLE IF NOT EXISTS users (
                user_id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(50) UNIQUE NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                role ENUM('user', 'admin') DEFAULT 'user',
                reset_token VARCHAR(255),
                reset_token_expiry DATETIME,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Users table created/verified');
        
        // Create reading_history table
        await query(`
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
        `);
        console.log('✅ Reading history table created/verified');
        
        // Create favorites table
        await query(`
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
        `);
        console.log('✅ Favorites table created/verified');
        
        // Create search_history table
        await query(`
            CREATE TABLE IF NOT EXISTS search_history (
                search_id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                search_query TEXT NOT NULL,
                search_results INT,
                searched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
            )
        `);
        console.log('✅ Search history table created/verified');
        
        // Create default admin user
        const hashedPassword = await bcrypt.hash('admin123', 10);
        await query(`
            INSERT IGNORE INTO users (username, email, password, role) 
            VALUES ('admin', 'admin@newshub.com', ?, 'admin')
        `, [hashedPassword]);
        console.log('✅ Default admin user created/verified');
        console.log('👑 Admin credentials:');
        console.log('   Username: admin');
        console.log('   Email: admin@newshub.com');
        console.log('   Password: admin123');
        
        console.log('\n🎉 Database setup completed successfully!');
        console.log('You can now start the server with:');
        console.log('   npm start');
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error setting up database:', error);
        process.exit(1);
    }
}

function query(sql, params) {
    return new Promise((resolve, reject) => {
        db.query(sql, params, (err, results) => {
            if (err) reject(err);
            else resolve(results);
        });
    });
}