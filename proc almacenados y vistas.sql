PROCEDIMIENTOS ALMACENADOS Y VISTAS

============================================================================

-- ----------------------------------------------------------------------------
-- 1. STORED PROCEDURES: OPERACIONES BÁSICAS (CRUD / INSERCIONES)
-- ----------------------------------------------------------------------------

-- SP Empleados
CREATE OR REPLACE PROCEDURE sp_insertar_empleado(
    p_first_name VARCHAR(100), p_last_name VARCHAR(100), p_email VARCHAR(120), 
    p_id_card VARCHAR(20), p_dept_id INT, p_salary DECIMAL(12,2)
) LANGUAGE plpgsql AS $$
BEGIN
    INSERT INTO employees (first_name, last_name, email, id_card, dept_id, salary)
    VALUES (p_first_name, p_last_name, p_email, p_id_card, p_dept_id, p_salary);
END; $$;

-- SP Productos
CREATE OR REPLACE PROCEDURE sp_insertar_producto(
    p_product_name VARCHAR(150), p_description TEXT, p_category_id INT, 
    p_supplier_id INT, p_tax_id INT, p_cost_price DECIMAL(12,2), 
    p_sale_price DECIMAL(12,2), p_stock INT, p_aisle VARCHAR(50)
) LANGUAGE plpgsql AS $$
BEGIN
    INSERT INTO products (product_name, description, category_id, supplier_id, tax_id, cost_price, sale_price, stock, aisle_location)
    VALUES (p_product_name, p_description, p_category_id, p_supplier_id, p_tax_id, p_cost_price, p_sale_price, p_stock, p_aisle);
END; $$;

-- SP Ventas
CREATE OR REPLACE PROCEDURE sp_insertar_venta(
    p_invoice_number VARCHAR(50), p_user_id INT, p_subtotal DECIMAL(15,2), 
    p_taxes DECIMAL(15,2), p_total_final DECIMAL(15,2), p_payment_method VARCHAR(50)
) LANGUAGE plpgsql AS $$
BEGIN
    INSERT INTO sales (invoice_number, user_id, subtotal, taxes, total_final, payment_method)
    VALUES (p_invoice_number, p_user_id, p_subtotal, p_taxes, p_total_final, p_payment_method);
END; $$;


-- ----------------------------------------------------------------------------
-- 2. TRIGGER: CONTROL DE STOCK OPERATIVO (trg_ReducirStock)
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION fn_reducir_stock()
RETURNS TRIGGER AS $$
BEGIN
    -- Validar si hay suficiente stock disponible antes de la transacción
    IF (SELECT stock FROM products WHERE product_id = NEW.product_id) < NEW.quantity THEN
        RAISE EXCEPTION 'Error: Stock insuficiente para el producto ID %', NEW.product_id;
    END IF;

    UPDATE products 
    SET stock = stock - NEW.quantity
    WHERE product_id = NEW.product_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_ReducirStock
AFTER INSERT ON sale_details
FOR EACH ROW
EXECUTE FUNCTION fn_reducir_stock();


-- ----------------------------------------------------------------------------
-- 3. VISTAS OPERACIONALES (Diseño BD)
-- ----------------------------------------------------------------------------

-- Vista: vw_VentasCompletas
CREATE OR REPLACE VIEW vw_VentasCompletas AS
SELECT 
    s.sale_id,
    s.invoice_number,
    s.sale_date,
    u.username AS cajero,
    p.product_name,
    sd.quantity,
    sd.unit_price,
    (sd.quantity * sd.unit_price) AS total_linea,
    s.subtotal AS factura_subtotal,
    s.taxes AS factura_itbis,
    s.total_final AS factura_total,
    s.payment_method
FROM sales s
JOIN users u ON s.user_id = u.user_id
JOIN sale_details sd ON s.sale_id = sd.sale_id
JOIN products p ON sd.product_id = p.product_id;

-- Vista: vw_InventarioAlerta (Muestra stock crítico por debajo de 10 unidades)
CREATE OR REPLACE VIEW vw_InventarioAlerta AS
SELECT 
    p.product_id,
    p.product_name,
    p.stock,
    c.category_name,
    p.aisle_location,
    CASE 
        WHEN p.stock = 0 THEN 'SIN STOCK'
        ELSE 'STOCK CRÍTICO BAJO'
    END AS estado_alerta
FROM products p
JOIN categories c ON p.category_id = c.category_id
WHERE p.stock <= 10 AND p.is_active = TRUE;


-- ============================================================================
-- MÓDULO DE REPORTES (BD REPORTES)
-- ============================================================================

-- 1. Vista: Resumen de Ventas Diarias
CREATE OR REPLACE VIEW vw_ResumenVentasDiarias AS
SELECT 
    CAST(sale_date AS DATE) AS fecha,
    COUNT(DISTINCT sale_id) AS total_transacciones,
    SUM(subtotal) AS subtotal_dia,
    SUM(taxes) AS itbis_dia,
    SUM(total_final) AS total_recaudado,
    payment_method AS metodo_pago
FROM sales
GROUP BY CAST(sale_date AS DATE), payment_method;

-- 2. Funciones/SP de Reportes Avanzados

-- Reporte: Ventas por período de tiempo determinado
CREATE OR REPLACE FUNCTION sp_reporte_ventas_periodo(p_fecha_inicio TIMESTAMP, p_fecha_fin TIMESTAMP)
RETURNS TABLE(
    id_factura INT, 
    ncf_invoice VARCHAR(50), 
    fecha TIMESTAMP, 
    total_neto DECIMAL(15,2)
) LANGUAGE plpgsql AS $$
BEGIN
    RETURN QUERY 
    SELECT sale_id, invoice_number, sale_date, total_final 
    FROM sales 
    WHERE sale_date BETWEEN p_fecha_inicio AND p_fecha_fin;
END; $$;

-- Reporte: Top de Productos más vendidos
CREATE OR REPLACE FUNCTION sp_reporte_top_productos(p_limite INT)
RETURNS TABLE(
    id_producto INT, 
    nombre_producto VARCHAR(150), 
    cantidad_vendida BIGINT
) LANGUAGE plpgsql AS $$
BEGIN
    RETURN QUERY 
    SELECT p.product_id, p.product_name, SUM(sd.quantity) AS total
    FROM sale_details sd
    JOIN products p ON sd.product_id = p.product_id
    GROUP BY p.product_id, p.product_name
    ORDER BY total DESC
    LIMIT p_limite;
END; $$;