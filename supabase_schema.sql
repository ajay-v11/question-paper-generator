-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (faculty & admin)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'faculty')),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Seed Admin User (Password: admin123)
-- Hash generated using bcrypt
INSERT INTO users (email, password_hash, name, role)
VALUES ('admin@jenisha.com', '$2b$12$wbHcNSei.fod/Wjl/qwKDOQKoMVcrev03gjHinMuwCaWKRrBvbz5G', 'Admin User', 'admin');
