# Database Setup & Configuration Guide

This guide walks you through setting up and configuring the MySQL 8 database for **CivicConnect AI**.

---

## 1. Prerequisites

* **MySQL Server 8.0+** running locally (e.g., service `MySQL80` on port `3306`).
* MySQL Client or **MySQL Workbench** installed.

---

## 2. Create the Database

Open PowerShell or Command Prompt and run the following command:

```powershell
# Using MySQL Command-Line Client
& "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -p -e "CREATE DATABASE IF NOT EXISTS civicconnect_ai CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

Or run the provided SQL script:

```powershell
& "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -p < database_setup.sql
```

### Alternatively via MySQL Workbench:
1. Connect to your local MySQL instance.
2. Open a new SQL tab.
3. Paste:
   ```sql
   CREATE DATABASE IF NOT EXISTS civicconnect_ai CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```
4. Click **Execute** (lightning bolt icon).

---

## 3. Configuring Database Credentials Securely

Do **not** commit plaintext production passwords to Git. CivicConnect AI supports environment variables that override default configurations automatically.

### Option A: Set Environment Variables (Recommended)
Before running the backend, set your MySQL password in your terminal session:

```powershell
# In PowerShell:
$env:SPRING_DATASOURCE_USERNAME = "root"
$env:SPRING_DATASOURCE_PASSWORD = "your_actual_mysql_password"
```

### Option B: Update `backend/src/main/resources/application.properties`
For local development, you can set the password directly in:
`backend/src/main/resources/application.properties`

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/civicconnect_ai?createDatabaseIfNotExist=true&useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
spring.datasource.username=root
spring.datasource.password=your_actual_mysql_password
```

---

## 4. Entity & Schema Architecture

Hibernate is configured with:
```properties
spring.jpa.hibernate.ddl-auto=update
```
When you launch the Spring Boot backend, Hibernate inspects your MySQL instance and automatically creates or updates the required tables without deleting existing data.

### Database Tables:

| Table Name | Description | Key Relationships |
|---|---|---|
| `users` | Stores Citizen and Municipal Authority credentials | Referenced by complaints and audit history |
| `complaints` | Core complaint data, location, photo path, AI triage scores | Foreign key to `users(id)` |
| `complaint_status_history` | Complete timeline audit trail with timestamps and user notes | Foreign key to `complaints(id)` |
| `authority_remarks` | Official remarks and directives entered by municipal staff | Foreign key to `complaints(id)` and `users(id)` |

---

## 5. Seed Demo Data

When the backend starts with `app.seed.enabled=true` (the default in development), the `DataSeederService` will automatically insert:
* **1 Authority Officer Account:** `admin@civicconnect.gov` / `Admin@123`
* **2 Example Citizen Accounts:** `citizen@example.com` / `Citizen@123`, `anita@example.com` / `Citizen@123`
* **Sample Civic Complaints** across Roads, Water Supply, Electricity, and Sanitation with different statuses and timeline history.
