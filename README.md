# 🎫 Customer Support Ticket System

A full-stack inspired web application for managing customer support tickets — featuring role-based authentication, customer registration, ticket management, and an admin control panel.

Built by **Sneh Desai** — Computer Science Student & SaskTel Employee, University of Regina

---

## 🌐 Live Demo

👉 [Click here to view the live project](https://snehdesai04-ai.github.io/customer-support-ticket-system/ticket_index.html)

---

## 📸 Features

### 👤 Customer Side
- ✅ Create your own account with name, email and password
- ✅ Login and view your personal dashboard
- ✅ Submit support tickets with category, priority and description
- ✅ Track ticket status in real time (Open → In Progress → Resolved)
- ✅ Filter tickets by status
- ✅ View admin notes and updates on each ticket

### 🛡️ Admin Side
- ✅ Dedicated admin panel with full ticket overview
- ✅ Filter tickets by status, priority, and category
- ✅ Search tickets by subject, customer name, or ticket ID
- ✅ Update ticket status and priority
- ✅ Add notes visible to the customer
- ✅ Export all tickets as a CSV report
- ✅ Live dashboard stats (Total, Open, In Progress, Resolved, Critical)

---

## 🛠️ Technologies Used

| Technology | Purpose |
|---|---|
| HTML | Page structure across 3 separate pages |
| CSS | Warm luxury parchment theme — Playfair Display + DM Sans fonts |
| JavaScript | Authentication, ticket logic, localStorage data management |
| SQL | Full database schema for backend integration |
| localStorage | Simulates a real database in the browser |

---

## 📁 Project Structure

```
customer-support-ticket-system/
├── ticket_index.html      → Login + Registration page
├── ticket_dashboard.html  → Customer dashboard
├── ticket_admin.html      → Admin control panel
├── ticket_style.css       → Shared aesthetic styling
├── ticket_app.js          → All application logic
└── ticket_schema.sql      → SQL database schema
```

---

## 🔐 How Authentication Works

| Role | How to Access |
|---|---|
| 👤 Customer | Click "Create Account" tab → Register → Sign in |
| 🛡️ Admin | Username: `admin` / Password: `admin123` |

- Customers can self-register with their own name, email and password
- Sessions are managed using `sessionStorage`
- User accounts are stored using `localStorage` (simulating a real database)
- Admin account is fixed — only one admin exists

---

## 🗄️ SQL Schema Highlights

The `ticket_schema.sql` file includes a production-ready database design:

- `users` table — stores customers and admin with roles
- `tickets` table — core ticket data with `ENUM` for status and priority
- `ticket_notes` table — admin notes linked to tickets via `FOREIGN KEY`
- `ON DELETE CASCADE` — removes notes when a ticket is deleted
- `AUTO INCREMENT` timestamps — tracks created and updated times
- Complex filter queries — `WHERE`, `AND`, `LIKE`, `JOIN`, `GROUP BY`
- CSV export query — generates full ticket reports

---

## 🚀 How to Run Locally

1. Clone or download this repository
2. Open the folder in **VS Code**
3. Right-click `ticket_index.html` → **Open with Live Server**
4. The login page opens in your browser
5. Click **"Create Account"** to register, or use admin credentials

---

## 💡 Real-World Relevance

This project is modelled after how enterprise telecom companies like **SaskTel** manage customer support workflows:

- Customers submit and track their own tickets online
- Support agents (admins) update status and add resolution notes
- Management can export ticket reports for analysis
- Role-based access ensures customers only see their own data

---

## 👨‍💻 About the Developer

**Sneh Desai**
- 📍 Regina, SK, Canada
- 🎓 Diploma in Computer Science — University of Regina (Expected April 2026)
- 💼 Service Representative — SaskTel
- 📧 snehdesai04@icloud.com
- 🐙 [GitHub](https://github.com/snehdesai04-ai)
