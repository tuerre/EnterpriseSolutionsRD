-- ============================================================================
-- UNIFIED SYSTEM - BUSINESS MANAGEMENT RD
-- Engine: PostgreSQL
-- ============================================================================

-- PostgreSQL handles databases differently. Usually, you create the DB
-- outside the script or use the following (requires being outside a transaction):
-- CREATE DATABASE business_management_rd;

-- ============================================================================
-- SECURITY AND HUMAN RESOURCES MODULE
-- ============================================================================

-- 1. ROLES
CREATE TABLE roles (
    role_id      SERIAL PRIMARY KEY,
    role_name    VARCHAR(50) NOT NULL UNIQUE,
    description  TEXT,
    is_active    BOOLEAN DEFAULT TRUE
);

-- 2. SYSTEM MODULES
CREATE TABLE modules (
    module_id    SERIAL PRIMARY KEY,
    name         VARCHAR(100) NOT NULL UNIQUE,
    description  TEXT
);

-- 3. PERMISSIONS BY ROLE AND MODULE
CREATE TABLE permissions (
    permission_id SERIAL PRIMARY KEY,
    role_id       INT NOT NULL,
    module_id     INT NOT NULL,
    can_read      BOOLEAN DEFAULT FALSE,
    can_insert    BOOLEAN DEFAULT FALSE,
    can_update    BOOLEAN DEFAULT FALSE,
    can_delete    BOOLEAN DEFAULT FALSE,
    CONSTRAINT FK_Permission_Role   FOREIGN KEY (role_id)   REFERENCES roles(role_id)   ON DELETE CASCADE,
    CONSTRAINT FK_Permission_Module FOREIGN KEY (module_id) REFERENCES modules(module_id) ON DELETE CASCADE,
    CONSTRAINT UQ_Role_Module       UNIQUE (role_id, module_id)
);

-- 4. DEPARTMENTS
CREATE TABLE departments (
    dept_id      SERIAL PRIMARY KEY,
    name         VARCHAR(100) NOT NULL UNIQUE,
    description  TEXT,
    is_active    BOOLEAN DEFAULT TRUE
);

-- 5. EMPLOYEES
CREATE TABLE employees (
    employee_id  SERIAL PRIMARY KEY,
    first_name   VARCHAR(100) NOT NULL,
    last_name    VARCHAR(100) NOT NULL,
    email        VARCHAR(120) NOT NULL UNIQUE,
    id_card      VARCHAR(20)  NOT NULL UNIQUE, -- (Cedula)
    dept_id      INT,
    salary       DECIMAL(12,2) NOT NULL DEFAULT 0,
    is_active    BOOLEAN DEFAULT TRUE,
    created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT FK_Employee_Dept FOREIGN KEY (dept_id) REFERENCES departments(dept_id)
);

-- 6. USERS (Access Credentials)
CREATE TABLE users (
    user_id      SERIAL PRIMARY KEY,
    employee_id  INT NULL UNIQUE,
    username     VARCHAR(50) NOT NULL UNIQUE,
    password     VARCHAR(255) NOT NULL,
    role_id      INT NOT NULL,
    is_active    BOOLEAN DEFAULT TRUE,
    created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT FK_User_Employee FOREIGN KEY (employee_id) REFERENCES employees(employee_id),
    CONSTRAINT FK_User_Role     FOREIGN KEY (role_id)     REFERENCES roles(role_id)
);

-- ============================================================================
-- CATALOG AND BUSINESS MODULE
-- ============================================================================

-- 9. CATEGORIES
CREATE TABLE categories (
    category_id   SERIAL PRIMARY KEY,
    category_name VARCHAR(100) NOT NULL UNIQUE
);

-- 10. SUPPLIERS
CREATE TABLE suppliers (
    supplier_id   SERIAL PRIMARY KEY,
    company_name  VARCHAR(150) NOT NULL,
    tax_id        VARCHAR(20) UNIQUE, -- (RNC)
    contact_name  VARCHAR(100),
    phone         VARCHAR(20),
    email         VARCHAR(150),
    address       TEXT,
    is_active     BOOLEAN DEFAULT TRUE
);

-- 11. TAX TYPES (ITBIS)
CREATE TABLE tax_types (
    tax_id       SERIAL PRIMARY KEY,
    name         VARCHAR(50) NOT NULL, -- e.g., 'Standard ITBIS'
    percentage   DECIMAL(5,2) NOT NULL  -- e.g., 18.00
);

-- 12. PRODUCTS
CREATE TABLE products (
    product_id   SERIAL PRIMARY KEY,
    product_name VARCHAR(150) NOT NULL,
    description  TEXT,
    category_id  INT NOT NULL,
    supplier_id  INT NOT NULL,
    tax_id       INT NOT NULL,
    cost_price   DECIMAL(12,2) NOT NULL,
    sale_price   DECIMAL(12,2) NOT NULL,
    stock        INT NOT NULL DEFAULT 0,
    aisle_location VARCHAR(50),
    is_active    BOOLEAN DEFAULT TRUE,
    created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT FK_Product_Cat  FOREIGN KEY (category_id) REFERENCES categories(category_id),
    CONSTRAINT FK_Product_Supp FOREIGN KEY (supplier_id) REFERENCES suppliers(supplier_id),
    CONSTRAINT FK_Product_Tax  FOREIGN KEY (tax_id)      REFERENCES tax_types(tax_id)
);

-- 13. SYSTEM MOVEMENTS (Audit Log)
CREATE TABLE system_movements (
    movement_id   SERIAL PRIMARY KEY,
    module_id     INT NOT NULL,
    user_id       INT NOT NULL,
    reference_id  INT,                -- ID of affected record
    action_type   VARCHAR(50) NOT NULL, -- e.g., 'STOCK_IN', 'SALARY_CHANGE'
    amount        DECIMAL(12,2),
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes         TEXT,
    CONSTRAINT FK_Mov_Module FOREIGN KEY (module_id) REFERENCES modules(module_id),
    CONSTRAINT FK_Mov_User   FOREIGN KEY (user_id)   REFERENCES users(user_id)
);

-- 14. SALES (Header)
CREATE TABLE sales (
    sale_id        SERIAL PRIMARY KEY,
    invoice_number VARCHAR(50) NOT NULL UNIQUE,
    sale_date      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user_id        INT NOT NULL,
    subtotal       DECIMAL(15,2) NOT NULL DEFAULT 0,
    taxes          DECIMAL(15,2) NOT NULL DEFAULT 0,
    total_final    DECIMAL(15,2) NOT NULL DEFAULT 0,
    payment_method VARCHAR(50),
    CONSTRAINT FK_Sale_User FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- 15. SALE DETAILS
CREATE TABLE sale_details (
    detail_id      SERIAL PRIMARY KEY,
    sale_id        INT NOT NULL,
    product_id     INT NOT NULL,
    quantity       INT NOT NULL,
    unit_price     DECIMAL(15,2) NOT NULL,
    CONSTRAINT FK_DetailSale_Sale    FOREIGN KEY (sale_id)    REFERENCES sales(sale_id) ON DELETE CASCADE,
    CONSTRAINT FK_DetailSale_Product FOREIGN KEY (product_id) REFERENCES products(product_id)
);

-- 16. PURCHASES
CREATE TABLE purchases (
    purchase_id   SERIAL PRIMARY KEY,
    supplier_id   INT NOT NULL,
    purchase_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    total_amount  DECIMAL(15,2) NOT NULL,
    CONSTRAINT FK_Purchase_Supp FOREIGN KEY (supplier_id) REFERENCES suppliers(supplier_id)
);

-- 17. PURCHASE DETAILS
CREATE TABLE purchase_details (
    detail_id     SERIAL PRIMARY KEY,
    purchase_id   INT NOT NULL,
    product_id    INT NOT NULL,
    quantity      INT NOT NULL,
    CONSTRAINT FK_DetailPurch_Purch   FOREIGN KEY (purchase_id) REFERENCES purchases(purchase_id) ON DELETE CASCADE,
    CONSTRAINT FK_DetailPurch_Product FOREIGN KEY (product_id)  REFERENCES products(product_id)
);