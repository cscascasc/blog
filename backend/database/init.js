// Database initialization script
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

// Load environment variables
require('dotenv').config();

// Database configuration
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'blog_db',
    multipleStatements: true
};

async function initDatabase() {
    let connection;

    try {
        // Connect to MySQL server
        connection = await mysql.createConnection({
            host: dbConfig.host,
            port: dbConfig.port,
            user: dbConfig.user,
            password: dbConfig.password,
            multipleStatements: true
        });

        // Read schema file
        const schemaPath = path.join(__dirname, 'schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');

        // Execute schema
        await connection.query(schema);

        console.log('Database initialized successfully!');
    } catch (error) {
        console.error('Error initializing database:', error.message);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

// Run initialization
initDatabase();