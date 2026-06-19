-- CRM DATABASE SCHEMA & SEED DATA (Supabase PostgreSQL)
-- Run this script in the Supabase SQL Editor.

-- Clean up existing tables (optional, order respects foreign key constraints)
DROP TABLE IF EXISTS proposals CASCADE;
DROP TABLE IF EXISTS leads CASCADE;
DROP TABLE IF EXISTS clients CASCADE;
DROP TABLE IF EXISTS tasks CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 1. Create Users Table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create Tasks Table
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    due_date TIMESTAMP WITH TIME ZONE,
    priority VARCHAR(50) NOT NULL, -- Low, Medium, High
    status VARCHAR(50) NOT NULL, -- Pending, In Progress, Completed
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create Clients Table
CREATE TABLE clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id VARCHAR(50) UNIQUE NOT NULL, -- CLI-1001, etc.
    company_name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255) NOT NULL,
    mobile VARCHAR(50) NOT NULL,
    email VARCHAR(255) NOT NULL,
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    gst_number VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Create Leads Table
CREATE TABLE leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id VARCHAR(50) UNIQUE NOT NULL, -- LD-1001, etc.
    company_name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255) NOT NULL,
    mobile_number VARCHAR(50) NOT NULL,
    email VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    source VARCHAR(100) NOT NULL,
    requirement TEXT,
    budget NUMERIC(15, 2),
    expected_closing_date TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    assigned_date TIMESTAMP WITH TIME ZONE,
    stage VARCHAR(100) NOT NULL, -- Enquiry, Contacted, Qualified, Proposal Sent, Negotiation, Completed
    status VARCHAR(50) NOT NULL, -- Active, Won, Lost
    client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Create Proposals Table
CREATE TABLE proposals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    proposal_number VARCHAR(50) UNIQUE NOT NULL, -- PRP-2026-001, etc.
    title VARCHAR(255) NOT NULL,
    proposal_date TIMESTAMP WITH TIME ZONE NOT NULL,
    expiry_date TIMESTAMP WITH TIME ZONE,
    value NUMERIC(15, 2) NOT NULL,
    description TEXT,
    status VARCHAR(50) NOT NULL, -- Draft, Sent, Accepted, Rejected
    lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- =========================================================================
-- SEED DATA INSERTS
-- =========================================================================

-- 1. Insert User (admin@crm.com / 123456)
INSERT INTO users (id, email, password, name) VALUES (
    'e3b0c442-98fc-1c14-9afb-f3c9e9b3d1f1',
    'admin@crm.com',
    '$2b$10$A9Al394RR1vTiYJeuk8mWuQA1hyKquG84y2vxBnCsjDNs.Zplv4AO',
    'Admin User'
);

-- 2. Insert Clients (5 Clients)
INSERT INTO clients (id, client_id, company_name, contact_person, mobile, email, address, city, state, gst_number, notes) VALUES 
('c7b04e6c-7e6d-495f-9e37-9759d57a627a', 'CLI-1001', 'Acme Corporation', 'John Doe', '9876543210', 'john@acme.com', '123 Industrial Way', 'New York', 'New York', '36AAAAA1111A1Z1', 'Preferred partner, long term client.'),
('d5006b5d-e85d-4f11-8dbd-0210e750e395', 'CLI-1002', 'Globex Corporation', 'Jane Smith', '8765432109', 'jane@globex.com', '456 Corporate Blvd', 'Austin', 'Texas', '48BBBBB2222B2Z2', 'Quick payers, friendly staff.'),
('a3cb8e67-d8bd-400d-9b1b-f06b9b3e10fa', 'CLI-1003', 'Initech LLC', 'Peter Gibbons', '7654321098', 'peter@initech.com', '789 Office Park', 'Denver', 'Colorado', '08CCCCC3333C3Z3', 'Regular software updates needed.'),
('f9debd96-f36e-4e4b-bde3-f1c50bb4db14', 'CLI-1004', 'Umbrella Corp', 'Albert Wesker', '6543210987', 'albert@umbrella.com', '101 Hive Road', 'Raccoon City', 'Maine', '23DDDDD4444D4Z4', 'High security clearance required.'),
('b4fa3e9e-5e4a-4e2b-bb65-8b83648cbdf2', 'CLI-1005', 'Stark Industries', 'Pepper Potts', '5432109876', 'pepper@stark.com', '200 Malibu Point', 'Los Angeles', 'California', '06EEEEE5555E5Z5', 'R&D contracts are usually high value.');

-- 3. Insert Leads (10 Leads)
INSERT INTO leads (id, lead_id, company_name, contact_person, mobile_number, email, city, state, source, requirement, budget, expected_closing_date, notes, assigned_date, stage, status, client_id) VALUES 
('1e9a2b3c-4d5e-6f7a-8b9c-0d1e2f3a4b5c', 'LD-1001', 'Cyberdyne Systems', 'Sarah Connor', '4321098765', 'sarah@cyberdyne.com', 'Los Angeles', 'California', 'Website', 'Need custom manufacturing automation software.', 50000.00, NOW() + INTERVAL '30 days', 'Very interested in robotic arm integration details.', NOW() - INTERVAL '5 days', 'Enquiry', 'Active', NULL),
('2e9a2b3c-4d5e-6f7a-8b9c-0d1e2f3a4b5c', 'LD-1002', 'Wayne Enterprises', 'Bruce Wayne', '3210987654', 'bruce@wayne.com', 'Gotham', 'New Jersey', 'Referral', 'Security systems audit and upgrade.', 120000.00, NOW() + INTERVAL '45 days', 'Met at a charity gala. High value deal.', NOW() - INTERVAL '4 days', 'Contacted', 'Active', 'd5006b5d-e85d-4f11-8dbd-0210e750e395'),
('3e9a2b3c-4d5e-6f7a-8b9c-0d1e2f3a4b5c', 'LD-1003', 'Hooli Inc', 'Gavin Belson', '2109876543', 'gavin@hooli.com', 'Palo Alto', 'California', 'Cold Email', 'Signature compression algorithm integration.', 80000.00, NOW() + INTERVAL '15 days', 'Wants premium support and 24/7 availability.', NOW() - INTERVAL '8 days', 'Qualified', 'Active', NULL),
('4e9a2b3c-4d5e-6f7a-8b9c-0d1e2f3a4b5c', 'LD-1004', 'Tyrell Corporation', 'Eldon Tyrell', '1098765432', 'eldon@tyrell.com', 'Los Angeles', 'California', 'Event', 'AI chatbot assistant development.', 150000.00, NOW() + INTERVAL '10 days', 'Needs sophisticated NLP logic.', NOW() - INTERVAL '12 days', 'Proposal Sent', 'Active', 'c7b04e6c-7e6d-495f-9e37-9759d57a627a'),
('5e9a2b3c-4d5e-6f7a-8b9c-0d1e2f3a4b5c', 'LD-1005', 'Oscorp Industries', 'Norman Osborn', '9988776655', 'norman@oscorp.com', 'New York', 'New York', 'Partner', 'Bio-tech analysis portal.', 95000.00, NOW() + INTERVAL '20 days', 'Wants custom visual graphing dashboard.', NOW() - INTERVAL '2 days', 'Negotiation', 'Active', NULL),
('6e9a2b3c-4d5e-6f7a-8b9c-0d1e2f3a4b5c', 'LD-1006', 'Massive Dynamic', 'Nina Sharp', '8877665544', 'nina@massive.com', 'Boston', 'Massachusetts', 'Website', 'Portal for device tracking and telemetry.', 60000.00, NOW() - INTERVAL '1 day', 'Completed successfully. Converted to Stark.', NOW() - INTERVAL '20 days', 'Completed', 'Won', 'b4fa3e9e-5e4a-4e2b-bb65-8b83648cbdf2'),
('7e9a2b3c-4d5e-6f7a-8b9c-0d1e2f3a4b5c', 'LD-1007', 'Wonka Industries', 'Willy Wonka', '7766554433', 'willy@wonka.com', 'Chicago', 'Illinois', 'Cold Call', 'Factory control system automation.', 45000.00, NOW() + INTERVAL '60 days', 'Eccentric owner, needs easy to use UI.', NOW() - INTERVAL '1 day', 'Enquiry', 'Active', NULL),
('8e9a2b3c-4d5e-6f7a-8b9c-0d1e2f3a4b5c', 'LD-1008', 'Virtucon Industries', 'Dr. Evil', '6655443322', 'evil@virtucon.com', 'Las Vegas', 'Nevada', 'Website', 'Satellite control tracking software.', 200000.00, NOW() + INTERVAL '90 days', 'Demands ''one million dollars'' discount.', NOW() - INTERVAL '15 days', 'Contacted', 'Active', NULL),
('9e9a2b3c-4d5e-6f7a-8b9c-0d1e2f3a4b5c', 'LD-1009', 'Soylent Corporation', 'Robert Thorn', '5544332211', 'robert@soylent.com', 'New York', 'New York', 'Partner', 'Supply chain logistics tracker.', 35000.00, NOW() - INTERVAL '3 days', 'Converted. Very happy with the results.', NOW() - INTERVAL '14 days', 'Completed', 'Won', 'a3cb8e67-d8bd-400d-9b1b-f06b9b3e10fa'),
('0e9a2b3c-4d5e-6f7a-8b9c-0d1e2f3a4b5c', 'LD-1010', 'LexCorp', 'Lex Luthor', '4433221100', 'lex@lexcorp.com', 'Metropolis', 'New York', 'Referral', 'Titanium alloy procurement tracker.', 110000.00, NOW() - INTERVAL '5 days', 'Decided to build internally. Lost opportunity.', NOW() - INTERVAL '10 days', 'Negotiation', 'Lost', 'f9debd96-f36e-4e4b-bde3-f1c50bb4db14');

-- 4. Insert Tasks (10 Tasks)
INSERT INTO tasks (id, title, description, due_date, priority, status) VALUES 
('a1a1a1a1-b1b1-c1c1-d1d1-e1e1e1e1e1e1', 'Follow up with Bruce Wayne', 'Discuss security audit timeline and requirements', NOW() + INTERVAL '1 day', 'High', 'Pending'),
('a2a2a2a2-b2b2-c2c2-d2d2-e2e2e2e2e2e2', 'Prepare proposal for Tyrell Corp', 'Draft the agreement and scope of work for the AI assistant project', NOW() + INTERVAL '2 days', 'High', 'In Progress'),
('a3a3a3a3-b3b3-c3c3-d3d3-e3e3e3e3e3e3', 'Review LexCorp feedback', 'Analyze why proposal was rejected and document lessons learned', NOW() - INTERVAL '1 day', 'Medium', 'Completed'),
('a4a4a4a4-b4b4-c4c4-d4d4-e4e4e4e4e4e4', 'Initial call with Sarah Connor', 'Gather requirements for automation software project', NOW() - INTERVAL '2 days', 'High', 'Completed'),
('a5a5a5a5-b5b5-c5c5-d5d5-e5e5e5e5e5e5', 'Send price quote to Gavin Belson', 'Prepare and email the pricing options', NOW() + INTERVAL '3 days', 'Medium', 'Pending'),
('a6a6a6a6-b6b6-c6c6-d6d6-e6e6e6e6e6e6', 'Schedule meeting with Pepper Potts', 'Discuss onboarding and next steps for the Stark client project', NOW() + INTERVAL '5 days', 'Low', 'Pending'),
('a7a7a7a7-b7b7-c7c7-d7d7-e7e7e7e7e7e7', 'Update notes for Willy Wonka', 'Check if the client has responded to our email', NOW() + INTERVAL '4 days', 'Low', 'In Progress'),
('a8a8a8a8-b8b8-c8c8-d8d8-e8e8e8e8e8e8', 'Internal review of security guidelines', 'Verify compliance check for new proposals', NOW() - INTERVAL '3 days', 'Low', 'Completed'),
('a9a9a9a9-b9b9-c9c9-d9d9-e9e9e9e9e9e9', 'Draft contract for Initech', 'Prepare boilerplate contract and send to legal team', NOW() + INTERVAL '6 days', 'Medium', 'Pending'),
('a0a0a0a0-b0b0-c0c0-d0d0-e0e0e0e0e0e0', 'Call Dr. Evil regarding project budget', 'Clarify the payment milestones', NOW() + INTERVAL '1 day', 'High', 'Pending');

-- 5. Insert Proposals (5 Proposals)
INSERT INTO proposals (id, proposal_number, title, proposal_date, expiry_date, value, description, status, lead_id, client_id) VALUES 
('f1f1f1f1-e1e1-d1d1-c1c1-b1b1b1b1b1b1', 'PRP-2026-001', 'AI Chatbot Assistant Development', NOW() - INTERVAL '1 day', NOW() + INTERVAL '14 days', 150000.00, 'Complete NLP chatbot integration for customer support.', 'Sent', '4e9a2b3c-4d5e-6f7a-8b9c-0d1e2f3a4b5c', 'c7b04e6c-7e6d-495f-9e37-9759d57a627a'),
('f2f2f2f2-e2e2-d2d2-c2c2-b1b1b1b1b1b1', 'PRP-2026-002', 'Security Audit Agreement', NOW() - INTERVAL '2 days', NOW() + INTERVAL '10 days', 120000.00, 'Comprehensive penetration testing and report.', 'Draft', '2e9a2b3c-4d5e-6f7a-8b9c-0d1e2f3a4b5c', 'd5006b5d-e85d-4f11-8dbd-0210e750e395'),
('f3f3f3f3-e3e3-d3d3-c3c3-b1b1b1b1b1b1', 'PRP-2026-003', 'Factory Control System Automation', NOW() - INTERVAL '5 days', NOW() - INTERVAL '1 day', 45000.00, 'Installation and programming of PLC systems.', 'Accepted', '7e9a2b3c-4d5e-6f7a-8b9c-0d1e2f3a4b5c', 'a3cb8e67-d8bd-400d-9b1b-f06b9b3e10fa'),
('f4f4f4f4-e4e4-d4d4-c4c4-b1b1b1b1b1b1', 'PRP-2026-004', 'Titanium Tracker Contract', NOW() - INTERVAL '12 days', NOW() - INTERVAL '2 days', 110000.00, 'Material procurement tracking application design.', 'Rejected', '0e9a2b3c-4d5e-6f7a-8b9c-0d1e2f3a4b5c', 'f9debd96-f36e-4e4b-bde3-f1c50bb4db14'),
('f5f5f5f5-e5e5-d5d5-c5c5-b1b1b1b1b1b1', 'PRP-2026-005', 'Portal Development & Telemetry', NOW() - INTERVAL '15 days', NOW() - INTERVAL '5 days', 60000.00, 'Full portal implementation with dynamic graphing charts.', 'Accepted', '6e9a2b3c-4d5e-6f7a-8b9c-0d1e2f3a4b5c', 'b4fa3e9e-5e4a-4e2b-bb65-8b83648cbdf2');
