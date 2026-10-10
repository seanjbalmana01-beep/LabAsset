CREATE DATABASE IF NOT EXISTS labasset_db;
USE labasset_db;

CREATE TABLE IF NOT EXISTS assets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    status VARCHAR(50) DEFAULT 'Available',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO assets (name, category, status) VALUES 
('Oscilloscope Model X', 'Laboratory Equipment', 'Available'),
('Digital Multimeter Pro', 'Electrical Tools', 'In Use'),
('Soldering Station 900M', 'Hardware Tools', 'Available');