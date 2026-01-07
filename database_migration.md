
# Database Initialization Script

Run the following SQL commands to initialize your Railway MySQL database. You can execute this using any MySQL client (e.g., TablePlus, DBeaver, MySQL Workbench) or via the Railway Dashboard CLI if available.

```sql
-- Create database if it doesn't exist (Railway usually creates one for you, but this is safe)
CREATE DATABASE IF NOT EXISTS callnest;
USE callnest;

-- 1. Leads Table (For future expansion)
CREATE TABLE IF NOT EXISTS leads (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    mobile VARCHAR(50) NOT NULL,
    message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Call Sessions (From Retell)
CREATE TABLE IF NOT EXISTS call_sessions (
    call_id VARCHAR(255) PRIMARY KEY, -- Retell Call ID
    agent_id VARCHAR(255),
    recording_url TEXT,
    summary TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Inferred Intents (From Groq LLM)
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

-- 4. Bookings (Core Logic)
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

-- 5. Calendar Events (Sync Status)
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

-- 6. Audit Logs (System Observability)
CREATE TABLE IF NOT EXISTS audit_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    call_id VARCHAR(255),
    action VARCHAR(255) NOT NULL,
    details TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## How to Run It

### Option 1: Using a GUI Client (Recommended)
1.  Download **TablePlus** or **DBeaver** (free).
2.  Create a **New Connection** -> **MySQL**.
3.  Fill in the details from your Railway Dashboard (Variables tab):
    *   **Host**: `MYSQLHOST` (or `RAILWAY_TCP_PROXY_DOMAIN`)
    *   **Port**: `MYSQLPORT`
    *   **User**: `MYSQLUSER`
    *   **Password**: `MYSQLPASSWORD`
    *   **Database**: `MYSQLDATABASE`
4.  Connect and open a **New SQL Editor**.
5.  **Copy-paste the script above** and click **Run**.

### Option 2: Using CLI (If you have mysql installed)
```bash
mysql -h <RAILWAY_HOST> -P <RAILWAY_PORT> -u <RAILWAY_USER> -p<RAILWAY_PASSWORD> <RAILWAY_DB_NAME> < schema.sql
```
