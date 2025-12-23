-- Create database
CREATE DATABASE IF NOT EXISTS blog_db;
USE blog_db;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'editor', 'author', 'subscriber') DEFAULT 'author',
  status ENUM('active', 'inactive') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  -- 个人资料字段
  profile_name VARCHAR(100),
  profile_title VARCHAR(100),
  profile_bio TEXT,
  profile_skills JSON,
  profile_projects JSON,
  profile_phone VARCHAR(20),
  profile_location VARCHAR(100)
);

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create tags table
CREATE TABLE IF NOT EXISTS tags (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create articles table
CREATE TABLE IF NOT EXISTS articles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT,
  author_id INT,
  category_id INT,
  views INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (author_id) REFERENCES users(id),
  FOREIGN KEY (category_id) REFERENCES categories(id)
);

-- Create article_tags table (many-to-many relationship)
CREATE TABLE IF NOT EXISTS article_tags (
  article_id INT,
  tag_id INT,
  PRIMARY KEY (article_id, tag_id),
  FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);

-- Create friends table
CREATE TABLE IF NOT EXISTS friends (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  url VARCHAR(255) NOT NULL,
  description TEXT,
  status ENUM('active', 'inactive') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create comments table
CREATE TABLE IF NOT EXISTS comments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  article_id INT NOT NULL,
  user_id INT NOT NULL,
  content TEXT NOT NULL,
  status ENUM('approved', 'pending', 'rejected') DEFAULT 'approved',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create remember_tokens table for "Remember Me" functionality
CREATE TABLE IF NOT EXISTS remember_tokens (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  token VARCHAR(255) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_token (token),
  INDEX idx_user_id (user_id),
  INDEX idx_token (token)
);

-- Insert sample data
INSERT IGNORE INTO users (username, email, password, role, status) VALUES 
  ('admin', 'admin@example.com', '$2b$10$rOzJqQZ6vT1W9yHhNvHwEe7lIuB1pA6dG9fK5hR3sQ2uV4xYzW8eO', 'admin', 'active'), -- password: admin123
  ('john_doe', 'john@example.com', '$2b$10$rOzJqQZ6vT1W9yHhNvHwEe7lIuB1pA6dG9fK5hR3sQ2uV4xYzW8eO', 'author', 'active'); -- password: admin123

INSERT IGNORE INTO categories (name, description) VALUES 
  ('Technology', 'Tech related articles'),
  ('Lifestyle', 'Lifestyle topics'),
  ('Travel', 'Travel experiences');

INSERT IGNORE INTO tags (name) VALUES 
  ('JavaScript'),
  ('Node.js'),
  ('Express'),
  ('MySQL'),
  ('Backend');

INSERT IGNORE INTO friends (name, url, description, status) VALUES 
  ('Vue.js 官方博客', 'https://vuejs.org/blog/', 'Vue.js 官方技术博客', 'active'),
  ('React Blog', 'https://reactjs.org/blog/', 'React 官方博客', 'active'),
  ('MDN Web Docs', 'https://developer.mozilla.org/', 'Web 开发权威文档', 'active');