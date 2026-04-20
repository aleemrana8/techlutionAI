-- ═══════════════════════════════════════════════════════════════════════════════
-- Techlution AI — PostgreSQL Schema (Production-Ready)
-- Generated from Prisma schema · Aligned with Mongoose models
-- ═══════════════════════════════════════════════════════════════════════════════

-- ─── ENUM TYPES ─────────────────────────────────────────────────────────────

CREATE TYPE "Role"              AS ENUM ('ADMIN', 'CLIENT', 'STAFF');
CREATE TYPE "AdminRole"         AS ENUM ('SUPER_ADMIN', 'ADMIN', 'HR', 'FINANCE', 'MANAGER', 'SUPPORT');
CREATE TYPE "ProjectStatus"     AS ENUM ('DRAFT', 'ACTIVE', 'COMPLETED', 'ARCHIVED');
CREATE TYPE "ProjectCategory"   AS ENUM ('HEALTHCARE', 'AI_ML', 'AUTOMATION', 'COMPUTER_VISION', 'DEVOPS_CLOUD', 'DATA_PIPELINES', 'WEB_BACKEND', 'OTHER');
CREATE TYPE "LeadType"          AS ENUM ('INQUIRY', 'PROPOSAL');
CREATE TYPE "LeadStatus"        AS ENUM ('NEW', 'CONTACTED', 'QUALIFIED', 'CLOSED');
CREATE TYPE "ClientStatus"      AS ENUM ('ACTIVE', 'INACTIVE', 'PROSPECT');
CREATE TYPE "EmployeeStatus"    AS ENUM ('ACTIVE', 'ON_LEAVE', 'TERMINATED');
CREATE TYPE "FinanceType"       AS ENUM ('INCOME', 'EXPENSE');
CREATE TYPE "PaymentStatus"     AS ENUM ('PENDING', 'PAID');
CREATE TYPE "EmailStatus"       AS ENUM ('SENT', 'FAILED');
CREATE TYPE "VisitorDevice"     AS ENUM ('DESKTOP', 'MOBILE', 'TABLET', 'OTHER');
CREATE TYPE "AppointmentStatus" AS ENUM ('SCHEDULED', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW');
CREATE TYPE "BillingStatus"     AS ENUM ('PENDING', 'SUBMITTED', 'PAID', 'PARTIALLY_PAID', 'DENIED', 'VOIDED');
CREATE TYPE "DenialStatus"      AS ENUM ('OPEN', 'APPEALED', 'RESOLVED', 'WRITTEN_OFF');
CREATE TYPE "WorkflowStatus"    AS ENUM ('ACTIVE', 'PAUSED', 'DISABLED');
CREATE TYPE "WorkflowTrigger"   AS ENUM ('MANUAL', 'WEBHOOK', 'SCHEDULE', 'EVENT');
CREATE TYPE "AgentType"         AS ENUM ('LLM', 'RPA', 'DATA_PIPELINE', 'NOTIFICATION', 'CUSTOM');

-- ─── 1. ADMIN USERS ────────────────────────────────────────────────────────

CREATE TABLE admin_users (
    id            TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    username      VARCHAR(50)  NOT NULL UNIQUE,
    email         VARCHAR(255) NOT NULL UNIQUE,
    password_hash TEXT         NOT NULL,
    name          VARCHAR(100) NOT NULL,
    role          "AdminRole"  NOT NULL DEFAULT 'SUPPORT',
    is_active     BOOLEAN      NOT NULL DEFAULT true,
    last_login_at TIMESTAMPTZ,
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX idx_admin_users_role_active ON admin_users (role, is_active);
CREATE INDEX idx_admin_users_created     ON admin_users (created_at DESC);

-- ─── 2. USERS (Client-side auth) ───────────────────────────────────────────

CREATE TABLE users (
    id            TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    email         VARCHAR(255) NOT NULL UNIQUE,
    password      TEXT         NOT NULL,
    name          VARCHAR(100) NOT NULL,
    role          "Role"       NOT NULL DEFAULT 'CLIENT',
    is_active     BOOLEAN      NOT NULL DEFAULT true,
    refresh_token TEXT,
    last_login_at TIMESTAMPTZ,
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- ─── 3. VISITORS ────────────────────────────────────────────────────────────

CREATE TABLE visitors (
    id         TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    ip_address VARCHAR(45),
    device     "VisitorDevice" NOT NULL DEFAULT 'OTHER',
    browser    VARCHAR(100),
    os         VARCHAR(100),
    page       VARCHAR(500),
    referrer   VARCHAR(500),
    country    VARCHAR(100),
    city       VARCHAR(100),
    session_id VARCHAR(100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_visitors_created  ON visitors (created_at DESC);
CREATE INDEX idx_visitors_device   ON visitors (device, created_at DESC);
CREATE INDEX idx_visitors_country  ON visitors (country, created_at DESC);
CREATE INDEX idx_visitors_session  ON visitors (session_id);

-- ─── 4. LEADS ───────────────────────────────────────────────────────────────

CREATE TABLE leads (
    id         TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name       VARCHAR(100) NOT NULL,
    email      VARCHAR(255) NOT NULL,
    phone      VARCHAR(30),
    company    VARCHAR(100),
    service    VARCHAR(200),
    message    TEXT         NOT NULL CHECK (length(message) >= 10),
    type       "LeadType"   NOT NULL DEFAULT 'INQUIRY',
    budget     VARCHAR(100),
    timeline   VARCHAR(100),
    status     "LeadStatus" NOT NULL DEFAULT 'NEW',
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX idx_leads_status   ON leads (status, created_at DESC);
CREATE INDEX idx_leads_type     ON leads (type, status);
CREATE INDEX idx_leads_email    ON leads (email, created_at DESC);

-- ─── 5. CLIENTS ─────────────────────────────────────────────────────────────

CREATE TABLE clients (
    id         TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name       VARCHAR(100)   NOT NULL,
    email      VARCHAR(255)   NOT NULL UNIQUE,
    phone      VARCHAR(30),
    company    VARCHAR(100),
    industry   VARCHAR(100),
    status     "ClientStatus" NOT NULL DEFAULT 'PROSPECT',
    notes      TEXT,
    projects   INT            NOT NULL DEFAULT 0 CHECK (projects >= 0),
    revenue    NUMERIC(12,2)  NOT NULL DEFAULT 0 CHECK (revenue >= 0),
    created_at TIMESTAMPTZ    NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ    NOT NULL DEFAULT now()
);

CREATE INDEX idx_clients_status  ON clients (status, created_at DESC);
CREATE INDEX idx_clients_revenue ON clients (revenue DESC);

-- ─── 6. EMPLOYEES (Team Members) ───────────────────────────────────────────

CREATE TABLE employees (
    id         TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name       VARCHAR(100)     NOT NULL,
    email      VARCHAR(255)     NOT NULL UNIQUE,
    phone      VARCHAR(30),
    role       VARCHAR(100)     NOT NULL,
    department VARCHAR(100)     NOT NULL,
    status     "EmployeeStatus" NOT NULL DEFAULT 'ACTIVE',
    workload   INT              NOT NULL DEFAULT 0 CHECK (workload >= 0 AND workload <= 100),
    salary     NUMERIC(12,2)    CHECK (salary >= 0),
    is_founder BOOLEAN          NOT NULL DEFAULT false,
    join_date  TIMESTAMPTZ      NOT NULL DEFAULT now(),
    notes      TEXT,
    created_at TIMESTAMPTZ      NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ      NOT NULL DEFAULT now()
);

CREATE INDEX idx_employees_status_dept ON employees (status, department);
CREATE INDEX idx_employees_workload    ON employees (workload DESC);
CREATE INDEX idx_employees_founder     ON employees (is_founder) WHERE is_founder = true;

-- ─── 7. PROJECTS ────────────────────────────────────────────────────────────

CREATE TABLE projects (
    id                TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    title             VARCHAR(200)      NOT NULL,
    slug              VARCHAR(250)      NOT NULL UNIQUE,
    short_description VARCHAR(500)      NOT NULL,
    full_description  TEXT              NOT NULL,
    category          "ProjectCategory" NOT NULL,
    features          TEXT[]            DEFAULT '{}',
    workflow_steps    JSONB[]           DEFAULT '{}',
    benefits          TEXT[]            DEFAULT '{}',
    images            TEXT[]            DEFAULT '{}',
    status            "ProjectStatus"   NOT NULL DEFAULT 'DRAFT',
    tags              TEXT[]            DEFAULT '{}',
    tech_stack        TEXT[]            DEFAULT '{}',
    duration_weeks    INT               CHECK (duration_weeks >= 1),
    created_by_id     TEXT              NOT NULL REFERENCES users(id),
    created_at        TIMESTAMPTZ       NOT NULL DEFAULT now(),
    updated_at        TIMESTAMPTZ       NOT NULL DEFAULT now()
);

CREATE INDEX idx_projects_status    ON projects (status, category);
CREATE INDEX idx_projects_slug      ON projects (slug);
CREATE INDEX idx_projects_created   ON projects (created_at DESC);
CREATE INDEX idx_projects_text      ON projects USING gin (to_tsvector('english', title || ' ' || short_description));

-- ─── 8. PROJECT ASSIGNMENTS ────────────────────────────────────────────────

CREATE TABLE project_assignments (
    id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    project_ref     TEXT        NOT NULL,
    employee_id     TEXT        NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    role_in_project VARCHAR(100),
    assigned_at     TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT uq_project_assignment UNIQUE (project_ref, employee_id)
);

CREATE INDEX idx_pa_project  ON project_assignments (project_ref);
CREATE INDEX idx_pa_employee ON project_assignments (employee_id);

-- ─── 9. PROJECT FINANCE (Cost Sharing) ─────────────────────────────────────

CREATE TABLE project_finances (
    id                TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    project_ref       TEXT          NOT NULL UNIQUE,
    total_amount      NUMERIC(12,2) NOT NULL CHECK (total_amount >= 0),
    fiverr_fee_percent NUMERIC(5,2) NOT NULL DEFAULT 0 CHECK (fiverr_fee_percent >= 0 AND fiverr_fee_percent <= 100),
    zakat_enabled     BOOLEAN       NOT NULL DEFAULT false,
    zakat_percent     NUMERIC(5,2)  NOT NULL DEFAULT 2.5 CHECK (zakat_percent >= 0 AND zakat_percent <= 100),
    other_costs       JSONB         NOT NULL DEFAULT '[]',
    total_deductions  NUMERIC(12,2) NOT NULL DEFAULT 0,
    net_amount        NUMERIC(12,2) NOT NULL DEFAULT 0,
    share_per_person  NUMERIC(12,2) NOT NULL DEFAULT 0,
    total_members     INT           NOT NULL DEFAULT 0,
    founder_included  BOOLEAN       NOT NULL DEFAULT true,
    calculated_at     TIMESTAMPTZ   NOT NULL DEFAULT now(),
    created_at        TIMESTAMPTZ   NOT NULL DEFAULT now(),
    updated_at        TIMESTAMPTZ   NOT NULL DEFAULT now()
);

CREATE INDEX idx_pf_project ON project_finances (project_ref);

-- ─── 10. PROJECT SHARES ────────────────────────────────────────────────────

CREATE TABLE project_shares (
    id                 TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    project_finance_id TEXT            NOT NULL REFERENCES project_finances(id) ON DELETE CASCADE,
    employee_id        TEXT            NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    share_amount       NUMERIC(12,2)   NOT NULL CHECK (share_amount >= 0),
    payment_status     "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    notified           BOOLEAN         NOT NULL DEFAULT false,
    created_at         TIMESTAMPTZ     NOT NULL DEFAULT now(),
    updated_at         TIMESTAMPTZ     NOT NULL DEFAULT now(),

    CONSTRAINT uq_project_share UNIQUE (project_finance_id, employee_id)
);

CREATE INDEX idx_ps_finance  ON project_shares (project_finance_id);
CREATE INDEX idx_ps_employee ON project_shares (employee_id);
CREATE INDEX idx_ps_status   ON project_shares (payment_status);

-- ─── 11. FINANCE (Income / Expense Ledger) ─────────────────────────────────

CREATE TABLE finances (
    id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    type        "FinanceType"  NOT NULL,
    amount      NUMERIC(12,2)  NOT NULL CHECK (amount >= 0),
    description VARCHAR(500)   NOT NULL,
    category    VARCHAR(100),
    project_ref TEXT,
    date        TIMESTAMPTZ    NOT NULL DEFAULT now(),
    created_at  TIMESTAMPTZ    NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ    NOT NULL DEFAULT now()
);

CREATE INDEX idx_finance_type_date    ON finances (type, date DESC);
CREATE INDEX idx_finance_project      ON finances (project_ref, type);

-- ─── 12. ACTIVITY LOGS ─────────────────────────────────────────────────────

CREATE TABLE activity_logs (
    id            TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    action        VARCHAR(100) NOT NULL,
    entity        VARCHAR(100),
    entity_id     TEXT,
    details       TEXT,
    ip_address    VARCHAR(45),
    user_agent    TEXT,
    admin_user_id TEXT REFERENCES admin_users(id),
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_al_admin   ON activity_logs (admin_user_id);
CREATE INDEX idx_al_action  ON activity_logs (action);
CREATE INDEX idx_al_created ON activity_logs (created_at DESC);

-- ─── 13. EMAIL LOGS ────────────────────────────────────────────────────────

CREATE TABLE email_logs (
    id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "to"        VARCHAR(255)  NOT NULL,
    subject     VARCHAR(500)  NOT NULL,
    type        VARCHAR(100)  NOT NULL,
    project_ref TEXT,
    status      "EmailStatus" NOT NULL DEFAULT 'SENT',
    error       TEXT,
    created_at  TIMESTAMPTZ   NOT NULL DEFAULT now()
);

CREATE INDEX idx_el_type    ON email_logs (type);
CREATE INDEX idx_el_created ON email_logs (created_at DESC);

-- ─── 14. ANALYTICS SNAPSHOTS ───────────────────────────────────────────────

CREATE TABLE analytics_snapshots (
    id         TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    date       TIMESTAMPTZ   NOT NULL DEFAULT now(),
    metric     VARCHAR(100)  NOT NULL,
    value      NUMERIC(14,2) NOT NULL,
    metadata   JSONB,
    created_at TIMESTAMPTZ   NOT NULL DEFAULT now()
);

CREATE INDEX idx_analytics_metric_date ON analytics_snapshots (metric, date DESC);

-- ─── 15. AI RECOMMENDATIONS ───────────────────────────────────────────────

CREATE TABLE ai_recommendations (
    id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    priority    VARCHAR(10)  NOT NULL CHECK (priority IN ('high', 'medium', 'low')),
    type        VARCHAR(100) NOT NULL,
    message     VARCHAR(1000) NOT NULL,
    action      VARCHAR(200),
    route       VARCHAR(200),
    is_resolved BOOLEAN      NOT NULL DEFAULT false,
    resolved_at TIMESTAMPTZ,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX idx_rec_active  ON ai_recommendations (is_resolved, priority, created_at DESC);
CREATE INDEX idx_rec_type    ON ai_recommendations (type, created_at DESC);

-- ═══════════════════════════════════════════════════════════════════════════════
-- Helper: auto-update updated_at trigger
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables with updated_at
DO $$
DECLARE
    tbl TEXT;
BEGIN
    FOR tbl IN
        SELECT table_name FROM information_schema.columns
        WHERE column_name = 'updated_at'
          AND table_schema = 'public'
          AND table_name NOT IN ('visitors', 'activity_logs', 'email_logs', 'analytics_snapshots')
    LOOP
        EXECUTE format(
            'CREATE TRIGGER trg_%s_updated_at BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION update_updated_at()',
            tbl, tbl
        );
    END LOOP;
END $$;
