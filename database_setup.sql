-- ====================================================================
-- CivicConnect AI - MySQL 8 Database Creation & Schema Script
-- Database Name: civicconnect_ai
-- ====================================================================

-- 1. Create Database if not exists with UTF-8 character encoding
CREATE DATABASE IF NOT EXISTS civicconnect_ai
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE civicconnect_ai;

-- 2. Users Table
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    role VARCHAR(20) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Complaints Table
CREATE TABLE IF NOT EXISTS complaints (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    reference_id VARCHAR(32) NOT NULL UNIQUE,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(30) NOT NULL,
    priority VARCHAR(20) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'SUBMITTED',
    image_url VARCHAR(255),
    location VARCHAR(255) NOT NULL,
    department VARCHAR(150),
    assigned_officer VARCHAR(100),
    ai_confidence_score DOUBLE,
    ai_explanation TEXT,
    citizen_id BIGINT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_complaints_citizen FOREIGN KEY (citizen_id) REFERENCES users (id) ON DELETE CASCADE,
    INDEX idx_complaint_ref (reference_id),
    INDEX idx_complaint_status (status),
    INDEX idx_complaint_category (category),
    INDEX idx_complaint_priority (priority),
    INDEX idx_complaint_citizen (citizen_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Complaint Status History Table (Audit Trail)
CREATE TABLE IF NOT EXISTS complaint_status_history (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    complaint_id BIGINT NOT NULL,
    previous_status VARCHAR(30),
    new_status VARCHAR(30) NOT NULL,
    remarks TEXT,
    changed_by VARCHAR(100),
    timestamp DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_history_complaint FOREIGN KEY (complaint_id) REFERENCES complaints (id) ON DELETE CASCADE,
    INDEX idx_history_complaint (complaint_id),
    INDEX idx_history_timestamp (timestamp)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Authority Remarks Table
CREATE TABLE IF NOT EXISTS authority_remarks (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    complaint_id BIGINT NOT NULL,
    remark_text TEXT NOT NULL,
    authority_user_id BIGINT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_remarks_complaint FOREIGN KEY (complaint_id) REFERENCES complaints (id) ON DELETE CASCADE,
    CONSTRAINT fk_remarks_authority FOREIGN KEY (authority_user_id) REFERENCES users (id) ON DELETE CASCADE,
    INDEX idx_remark_complaint (complaint_id),
    INDEX idx_remark_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
