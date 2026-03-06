-- ================================================
-- CUSTOMER SUPPORT TICKET SYSTEM
-- Built by: Sneh Desai
-- -----------------------------------------------
-- FILE 6 of 6: schema.sql
-- Real SQL database design for this application.
-- In production, app.js would connect to this
-- database via a Node.js/Express backend API.
-- ================================================

CREATE DATABASE IF NOT EXISTS support_tickets;
USE support_tickets;

-- -----------------------------------------------
-- USERS TABLE
-- Stores customer and admin accounts
-- -----------------------------------------------
CREATE TABLE users (
    id            INT PRIMARY KEY AUTO_INCREMENT,
    username      VARCHAR(50)  NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,          -- always store hashed passwords (bcrypt)
    full_name     VARCHAR(100) NOT NULL,
    email         VARCHAR(100) NOT NULL UNIQUE,
    role          ENUM('customer', 'admin') NOT NULL DEFAULT 'customer',
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------
-- TICKETS TABLE
-- Core table — one row per support ticket
-- -----------------------------------------------
CREATE TABLE tickets (
    id           VARCHAR(20)  PRIMARY KEY,         -- e.g. TKT-001
    subject      VARCHAR(200) NOT NULL,
    description  TEXT         NOT NULL,
    category     ENUM('Internet','Phone','TV','Billing','Technical','Account','Other') NOT NULL,
    priority     ENUM('Low','Medium','High','Critical') NOT NULL DEFAULT 'Medium',
    status       ENUM('Open','In Progress','Resolved','Closed') NOT NULL DEFAULT 'Open',
    phone        VARCHAR(20),
    customer_id  INT          NOT NULL,
    assigned_to  INT,                              -- admin user assigned to handle this ticket
    created_at   TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    updated_at   TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES users(id),
    FOREIGN KEY (assigned_to) REFERENCES users(id)
);

-- -----------------------------------------------
-- TICKET NOTES TABLE
-- Admin notes added to each ticket
-- -----------------------------------------------
CREATE TABLE ticket_notes (
    id         INT  PRIMARY KEY AUTO_INCREMENT,
    ticket_id  VARCHAR(20) NOT NULL,
    admin_id   INT         NOT NULL,
    note       TEXT        NOT NULL,
    created_at TIMESTAMP   DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE,
    FOREIGN KEY (admin_id)  REFERENCES users(id)
);

-- -----------------------------------------------
-- SAMPLE DATA
-- -----------------------------------------------
INSERT INTO users (username, password_hash, full_name, email, role) VALUES
('customer', '$2b$10$hashedpassword1', 'John Smith',  'john@email.com',  'customer'),
('admin',    '$2b$10$hashedpassword2', 'Admin User',  'admin@sasktel.com','admin');

INSERT INTO tickets (id, subject, description, category, priority, status, customer_id) VALUES
('TKT-001', 'Internet connection dropping every hour',
 'My internet drops every hour for 2-3 minutes. Happening for 3 days.', 'Internet', 'High', 'In Progress', 1),
('TKT-002', 'Incorrect charge on February bill',
 'Charged $45 for a service I never requested.', 'Billing', 'Medium', 'Open', 1),
('TKT-003', 'Phone service not working in basement',
 'No signal in basement office.', 'Phone', 'Low', 'Resolved', 1),
('TKT-004', 'Cannot login to MyAccount portal',
 'Getting error 403 on login. Password reset not working.', 'Account', 'Critical', 'Open', 1);

-- -----------------------------------------------
-- COMMON QUERIES (matching app.js functions)
-- -----------------------------------------------

-- getTickets() — all tickets for a customer
-- SELECT t.*, u.full_name AS customer_name
-- FROM tickets t JOIN users u ON t.customer_id = u.id
-- WHERE t.customer_id = ? ORDER BY t.created_at DESC;

-- submitTicket() — insert new ticket
-- INSERT INTO tickets (id, subject, description, category, priority, phone, customer_id)
-- VALUES (?, ?, ?, ?, ?, ?, ?);

-- updateTicket() — change status and priority
-- UPDATE tickets SET status = ?, priority = ?, updated_at = NOW() WHERE id = ?;

-- Add admin note
-- INSERT INTO ticket_notes (ticket_id, admin_id, note) VALUES (?, ?, ?);

-- Admin dashboard stats
SELECT
  COUNT(*)                                                    AS total,
  SUM(status = 'Open')                                        AS open,
  SUM(status = 'In Progress')                                 AS in_progress,
  SUM(status IN ('Resolved','Closed'))                        AS resolved,
  SUM(priority = 'Critical' AND status NOT IN ('Resolved','Closed')) AS critical
FROM tickets;

-- Filter tickets (admin)
-- SELECT t.*, u.full_name
-- FROM tickets t JOIN users u ON t.customer_id = u.id
-- WHERE (? = 'all' OR t.status = ?)
-- AND   (? = 'all' OR t.priority = ?)
-- AND   (? = 'all' OR t.category = ?)
-- AND   (t.subject LIKE ? OR u.full_name LIKE ? OR t.id LIKE ?)
-- ORDER BY t.created_at DESC;

-- Export report
-- SELECT t.id, t.subject, u.full_name, t.category, t.priority, t.status, t.created_at
-- FROM tickets t JOIN users u ON t.customer_id = u.id
-- ORDER BY t.created_at DESC;

-- Tickets by category (analytics)
SELECT category, COUNT(*) AS total,
  SUM(status = 'Open') AS open,
  AVG(TIMESTAMPDIFF(HOUR, created_at, updated_at)) AS avg_resolution_hours
FROM tickets
GROUP BY category
ORDER BY total DESC;
