CREATE DATABASE IF NOT EXISTS callnest;
USE callnest;

CREATE TABLE IF NOT EXISTS leads (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    mobile VARCHAR(50) NOT NULL,
    message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS call_sessions (
    call_id VARCHAR(255) PRIMARY KEY, -- Retell Call ID
    agent_id VARCHAR(255),
    recording_url TEXT,
    summary TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS inferred_intents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    call_id VARCHAR(255) NOT NULL,
    intent VARCHAR(50) NOT NULL, -- BOOK_NEW, RESCHEDULE, CANCEL, PREPARE, CHECK_AVAILABILITY
    confidence_score FLOAT,
    entities JSON, -- Extracted entities (topic, date, time, etc.)
    raw_response JSON, -- Full LLM response for audit
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (call_id) REFERENCES call_sessions(call_id)
);

CREATE TABLE IF NOT EXISTS bookings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    booking_code VARCHAR(20) UNIQUE NOT NULL, -- e.g. NL-A742
    call_id VARCHAR(255),
    client_name VARCHAR(255),
    topic VARCHAR(255),
    start_time DATETIME NOT NULL,
    status ENUM('TENTATIVE', 'CONFIRMED', 'CANCELLED') DEFAULT 'TENTATIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (call_id) REFERENCES call_sessions(call_id)
);

CREATE TABLE IF NOT EXISTS calendar_events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    booking_id INT,
    title VARCHAR(255) NOT NULL,
    start_time DATETIME NOT NULL,
    end_time DATETIME NOT NULL,
    status ENUM('BUSY', 'FREE') DEFAULT 'BUSY',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(id)
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    call_id VARCHAR(255),
    action VARCHAR(255) NOT NULL,
    details TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
