# EnterpriseSolutionsRD — API Documentation

**Base URL:** `http://localhost:4000`

---

## Authentication

The API uses JWT tokens. After logging in, the token is set as an **HttpOnly cookie** (`auth_token`).  
Alternatively, send the token in the `Authorization` header:

```
Authorization: Bearer <token>
```

### Permission System

Each protected endpoint checks two things:
1. A valid JWT token (`authenticateToken`)
2. A role-based module permission (`requireModulePermission`)

Permissions are stored in the `permissions` table per `role_id` + `module_id`. Each row has four boolean flags:

| Flag | Grants access to |
|------|-----------------|
| `can_read` | GET (list / get by ID) |
| `can_insert` | POST (create) |
| `can_update` | PUT (edit, enable, disable) |
| `can_delete` | DELETE (soft-delete) |

---

## Users

### POST `/api/users/login`
> **Auth:** Not required · **Permission:** None

Authenticates a user and sets the `auth_token` cookie.

**Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `username` | string | ✅ | User's username |
| `password` | string | ✅ | User's password |

**Example:**
```json
{
  "username": "admin",
  "password": "mypassword123"
}
```

**Responses:** `200 OK` · `400 Bad Request` · `401 Invalid credentials` · `403 Account disabled`

---

### POST `/api/users/logout`
> **Auth:** Required · **Permission:** None

Revokes the current token and clears the auth cookie.

**Body:** None

**Responses:** `200 OK` · `401 Unauthorized`

---

### POST `/api/users/register`
> **Auth:** Required · **Permission:** module `users` → `can_insert`

Creates a new user with an auto-generated dedicated role.

**Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `username` | string | ✅ | Unique username |
| `password` | string | ✅ | Plain-text password (hashed with argon2) |
| `employee_id` | number | ❌ | Link to an existing employee record |
| `role_name` | string | ❌ | Name for the auto-created role. Defaults to `{username}_role` |

**Example:**
```json
{
  "username": "jdoe",
  "password": "securepass456",
  "employee_id": 3,
  "role_name": "sales_agent"
}
```

**Responses:** `201 Created` · `400 Bad Request` · `404 Employee not found` · `409 Username already exists`

---

### PUT `/api/users/:user_id/disable`
> **Auth:** Required · **Permission:** module `users` → `can_update`

Soft-disables a user account. Cannot disable your own account.

**URL Params:**
| Param | Type | Description |
|-------|------|-------------|
| `user_id` | number | ID of the user to disable |

**Body:** None

**Responses:** `200 OK` · `400 Bad Request` · `404 Not Found`

---

### PUT `/api/users/:user_id/enable`
> **Auth:** Required · **Permission:** module `users` → `can_update`

Re-enables a previously disabled user account.

**URL Params:**
| Param | Type | Description |
|-------|------|-------------|
| `user_id` | number | ID of the user to enable |

**Body:** None

**Responses:** `200 OK` · `400 Bad Request` · `404 Not Found`

---

## Categories

### GET `/api/categories`
> **Auth:** Required · **Permission:** module `categories` → `can_read`

Lists active categories with pagination and search.

**Query Params:**
| Param | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `search` | string | ❌ | — | Filter by category name (case-insensitive) |
| `is_active` | string | ❌ | — | Filter by status: `"true"`, `"false"`, or `"1"` |
| `page` | number | ❌ | `1` | Page number |
| `limit` | number | ❌ | `10` | Results per page (max 100) |
| `sortBy` | string | ❌ | `category_name` | `category_id` or `category_name` |
| `sortOrder` | string | ❌ | `asc` | `asc` or `desc` |

**Example:** `GET http://localhost:4000/api/categories?search=tech&page=1&limit=20&sortOrder=desc`

**Responses:** `200 OK` · `401 Unauthorized` · `403 Forbidden`

---

### GET `/api/categories/:category_id`
> **Auth:** Required · **Permission:** module `categories` → `can_read`

Returns a single category with its associated products.

**URL Params:**
| Param | Type | Description |
|-------|------|-------------|
| `category_id` | number | ID of the category |

**Responses:** `200 OK` · `404 Not Found`

---

### POST `/api/categories`
> **Auth:** Required · **Permission:** module `categories` → `can_insert`

Creates a new category.

**Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `category_name` | string | ✅ | Unique name, max 100 characters |

**Example:**
```json
{
  "category_name": "Electronics"
}
```

**Responses:** `201 Created` · `400 Bad Request` · `409 Name already exists`

---

### PUT `/api/categories/:category_id`
> **Auth:** Required · **Permission:** module `categories` → `can_update`

Updates an existing category. At least one field required.

**URL Params:**
| Param | Type | Description |
|-------|------|-------------|
| `category_id` | number | ID of the category to update |

**Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `category_name` | string | ❌ | New name, max 100 characters |

**Example:**
```json
{
  "category_name": "Consumer Electronics"
}
```

**Responses:** `200 OK` · `400 Bad Request` · `404 Not Found` · `409 Name already taken`

---

### DELETE `/api/categories/:category_id`
> **Auth:** Required · **Permission:** module `categories` → `can_delete`

Soft-deletes a category (sets `is_active = false`).

**URL Params:**
| Param | Type | Description |
|-------|------|-------------|
| `category_id` | number | ID of the category to delete |

**Body:** None

**Responses:** `200 OK` · `400 Already inactive` · `404 Not Found`

---

## Products

### GET `/api/products`
> **Auth:** Required · **Permission:** module `products` → `can_read`

Lists products with pagination, filtering, and sorting.

**Query Params:**
| Param | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `search` | string | ❌ | — | Filter by product name or description |
| `category_id` | number | ❌ | — | Filter by category |
| `supplier_id` | number | ❌ | — | Filter by supplier |
| `is_active` | string | ❌ | — | Filter by status: `"true"`, `"false"`, or `"1"` |
| `page` | number | ❌ | `1` | Page number |
| `limit` | number | ❌ | `10` | Results per page (max 100) |
| `sortBy` | string | ❌ | `created_at` | `product_id`, `product_name`, `cost_price`, `sale_price`, `stock`, `created_at` |
| `sortOrder` | string | ❌ | `desc` | `asc` or `desc` |

**Example:** `GET http://localhost:4000/api/products?search=laptop&category_id=2&page=1&limit=15`

**Responses:** `200 OK` · `401 Unauthorized` · `403 Forbidden`

---

### GET `/api/products/:product_id`
> **Auth:** Required · **Permission:** module `products` → `can_read`

Returns a single product with category, supplier, and tax type details.

**URL Params:**
| Param | Type | Description |
|-------|------|-------------|
| `product_id` | number | ID of the product |

**Responses:** `200 OK` · `404 Not Found`

---

### POST `/api/products`
> **Auth:** Required · **Permission:** module `products` → `can_insert`

Creates a new product.

**Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `product_name` | string | ✅ | Max 150 characters |
| `category_id` | number | ✅ | Must reference an existing category |
| `supplier_id` | number | ✅ | Must reference an existing active supplier |
| `tax_id` | number | ✅ | Must reference an existing tax type |
| `cost_price` | number | ✅ | Must be > 0 |
| `sale_price` | number | ✅ | Must be > `cost_price` |
| `description` | string | ❌ | Product description |
| `stock` | integer | ❌ | Initial stock ≥ 0. Defaults to `0` |
| `aisle_location` | string | ❌ | Physical location in the store |

**Example:**
```json
{
  "product_name": "Laptop HP Pavilion 15",
  "category_id": 2,
  "supplier_id": 1,
  "tax_id": 1,
  "cost_price": 450.00,
  "sale_price": 650.00,
  "description": "15-inch laptop, 8GB RAM, 256GB SSD",
  "stock": 20,
  "aisle_location": "A3"
}
```

**Responses:** `201 Created` · `400 Bad Request` · `404 Category/Supplier/Tax not found`

---

### PUT `/api/products/:product_id`
> **Auth:** Required · **Permission:** module `products` → `can_update`

Updates an existing active product. At least one field required.

**URL Params:**
| Param | Type | Description |
|-------|------|-------------|
| `product_id` | number | ID of the product to update |

**Body (all optional):**
| Field | Type | Description |
|-------|------|-------------|
| `product_name` | string | Max 150 characters |
| `description` | string | Product description |
| `category_id` | number | Must reference an existing category |
| `supplier_id` | number | Must reference an existing active supplier |
| `tax_id` | number | Must reference an existing tax type |
| `cost_price` | number | Must be > 0 |
| `sale_price` | number | Must be ≥ `cost_price` |
| `stock` | integer | Must be ≥ 0 |
| `aisle_location` | string | Physical location |

**Example:**
```json
{
  "sale_price": 699.99,
  "stock": 15,
  "aisle_location": "B2"
}
```

**Responses:** `200 OK` · `400 Bad Request / Inactive product` · `404 Not Found`

---

### DELETE `/api/products/:product_id`
> **Auth:** Required · **Permission:** module `products` → `can_delete`

Soft-deletes a product (sets `is_active = false`).

**URL Params:**
| Param | Type | Description |
|-------|------|-------------|
| `product_id` | number | ID of the product to delete |

**Body:** None

**Responses:** `200 OK` · `400 Already inactive` · `404 Not Found`

---

## Suppliers

### GET `/api/suppliers`
> **Auth:** Required · **Permission:** module `suppliers` → `can_read`

Lists suppliers with pagination and search.

**Query Params:**
| Param | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `search` | string | ❌ | — | Filter by company name, contact name, email, or tax ID |
| `is_active` | string | ❌ | — | Filter by status: `"true"`, `"false"`, or `"1"` |
| `page` | number | ❌ | `1` | Page number |
| `limit` | number | ❌ | `10` | Results per page (max 100) |
| `sortBy` | string | ❌ | `company_name` | `supplier_id`, `company_name`, `tax_id`, `contact_name`, `email`, `phone` |
| `sortOrder` | string | ❌ | `asc` | `asc` or `desc` |

**Example:** `GET http://localhost:4000/api/suppliers?search=acme&limit=5`

**Responses:** `200 OK` · `401 Unauthorized` · `403 Forbidden`

---

### GET `/api/suppliers/:supplier_id`
> **Auth:** Required · **Permission:** module `suppliers` → `can_read`

Returns a single supplier with its products and purchase history.

**URL Params:**
| Param | Type | Description |
|-------|------|-------------|
| `supplier_id` | number | ID of the supplier |

**Responses:** `200 OK` · `404 Not Found`

---

### POST `/api/suppliers`
> **Auth:** Required · **Permission:** module `suppliers` → `can_insert`

Creates a new supplier.

**Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `company_name` | string | ✅ | Max 150 characters |
| `tax_id` | string | ✅ | Unique tax/RNC identifier, max 20 characters |
| `contact_name` | string | ❌ | Contact person name, max 100 characters |
| `phone` | string | ❌ | Phone number, max 20 characters |
| `email` | string | ❌ | Valid email format, max 150 characters |
| `address` | string | ❌ | Physical address |

**Example:**
```json
{
  "company_name": "TechSupply Corp",
  "tax_id": "131-12345-6",
  "contact_name": "Maria Fernandez",
  "phone": "809-555-0101",
  "email": "contact@techsupply.com",
  "address": "Av. 27 de Febrero #101, Santo Domingo"
}
```

**Responses:** `201 Created` · `400 Bad Request` · `409 Tax ID already registered`

---

### PUT `/api/suppliers/:supplier_id`
> **Auth:** Required · **Permission:** module `suppliers` → `can_update`

Updates an existing active supplier. At least one field required.

**URL Params:**
| Param | Type | Description |
|-------|------|-------------|
| `supplier_id` | number | ID of the supplier to update |

**Body (all optional):**
| Field | Type | Description |
|-------|------|-------------|
| `company_name` | string | Max 150 characters |
| `tax_id` | string | Max 20 characters, must be unique |
| `contact_name` | string | Max 100 characters |
| `phone` | string | Max 20 characters |
| `email` | string | Valid email format, max 150 characters |
| `address` | string | Physical address |

**Example:**
```json
{
  "phone": "809-555-9999",
  "email": "newcontact@techsupply.com"
}
```

**Responses:** `200 OK` · `400 Bad Request / Inactive supplier` · `404 Not Found` · `409 Tax ID taken`

---

### DELETE `/api/suppliers/:supplier_id`
> **Auth:** Required · **Permission:** module `suppliers` → `can_delete`

Soft-deletes a supplier (sets `is_active = false`).

**URL Params:**
| Param | Type | Description |
|-------|------|-------------|
| `supplier_id` | number | ID of the supplier to delete |

**Body:** None

**Responses:** `200 OK` · `400 Already inactive` · `404 Not Found`

---

## Customers

### GET `/api/customers`
> **Auth:** Required · **Permission:** module `customers` → `can_read`

Lists customers with pagination, filtering, and sorting.

**Query Params:**
| Param | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `search` | string | ❌ | — | Filter by first name, last name, email, or ID card |
| `status` | string | ❌ | `all` | `"all"`, `"active"`, or `"inactive"` |
| `page` | number | ❌ | `1` | Page number |
| `limit` | number | ❌ | `10` | Results per page (max 100) |
| `sortBy` | string | ❌ | `first_name` | `customer_id`, `first_name`, `last_name`, `email`, `id_card` |
| `sortOrder` | string | ❌ | `asc` | `asc` or `desc` |

**Example:** `GET http://localhost:4000/api/customers?search=Juan&status=active&page=2`

**Responses:** `200 OK` · `401 Unauthorized` · `403 Forbidden`

---

### GET `/api/customers/:customer_id`
> **Auth:** Required · **Permission:** module `customers` → `can_read`

Returns a single customer record.

**URL Params:**
| Param | Type | Description |
|-------|------|-------------|
| `customer_id` | number | ID of the customer |

**Responses:** `200 OK` · `404 Not Found`

---

### POST `/api/customers`
> **Auth:** Required · **Permission:** module `customers` → `can_insert`

Creates a new customer.

**Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `first_name` | string | ✅ | Max 100 characters |
| `last_name` | string | ✅ | Max 100 characters |
| `email` | string | ❌ | Valid email format, must be unique |
| `phone` | string | ❌ | Phone number |
| `address` | string | ❌ | Physical address |
| `id_card` | string | ❌ | National ID / Cédula, must be unique |

**Example:**
```json
{
  "first_name": "Juan",
  "last_name": "Pérez",
  "email": "juan.perez@email.com",
  "phone": "809-555-1234",
  "address": "Calle 5, Res. Las Palmas",
  "id_card": "001-1234567-8"
}
```

**Responses:** `201 Created` · `400 Bad Request` · `409 Email or ID card already registered`

---

### PUT `/api/customers/:customer_id`
> **Auth:** Required · **Permission:** module `customers` → `can_update`

Updates an existing customer. At least one field required.

**URL Params:**
| Param | Type | Description |
|-------|------|-------------|
| `customer_id` | number | ID of the customer to update |

**Body (all optional):**
| Field | Type | Description |
|-------|------|-------------|
| `first_name` | string | Max 100 characters |
| `last_name` | string | Max 100 characters |
| `email` | string | Valid email format, must be unique |
| `phone` | string | Phone number |
| `address` | string | Physical address |
| `id_card` | string | National ID, must be unique |
| `is_active` | boolean | Enable or disable the customer |

**Example:**
```json
{
  "phone": "809-555-9999",
  "address": "Av. Lincoln #200, Apto 3B"
}
```

**Responses:** `200 OK` · `400 Bad Request` · `404 Not Found` · `409 Email/ID card taken`

---

### DELETE `/api/customers/:customer_id`
> **Auth:** Required · **Permission:** module `customers` → `can_delete`

Soft-deletes a customer (sets `is_active = false`).

**URL Params:**
| Param | Type | Description |
|-------|------|-------------|
| `customer_id` | number | ID of the customer to deactivate |

**Body:** None

**Responses:** `200 OK` · `400 Already deactivated` · `404 Not Found`

---

## Purchases

### POST `/api/purchases/add`
> **Auth:** Required · **Permission:** module `purchases` → `can_insert`

Registers a purchase from a supplier. Automatically updates product stock.

**Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `supplier_id` | number | ✅ | ID of the supplying company |
| `items` | array | ✅ | Non-empty array of products to purchase |
| `items[].product_id` | number | ✅ | ID of the product |
| `items[].quantity` | number | ✅ | Quantity to purchase, must be > 0 |

**Example:**
```json
{
  "supplier_id": 1,
  "items": [
    { "product_id": 5, "quantity": 50 },
    { "product_id": 12, "quantity": 20 }
  ]
}
```

> `total_amount` is calculated automatically using each product's `cost_price`.

**Responses:** `201 Created` · `400 Bad Request` · `500 Server Error`

---

### GET `/api/purchases/list`
> **Auth:** Required · **Permission:** module `purchases` → `can_read`

Returns all purchase records with supplier info and item details.

**Query Params:** None

**Responses:** `200 OK` · `500 Server Error`

---

## Sales

### POST `/api/sales/add`
> **Auth:** Required · **Permission:** module `sales` → `can_insert`

Registers a sale. Validates stock, calculates taxes, generates an invoice number, and reduces product stock.

**Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `items` | array | ✅ | Non-empty array of products to sell |
| `items[].product_id` | number | ✅ | ID of the product |
| `items[].quantity` | number | ✅ | Quantity to sell, must be > 0 |
| `payment_method` | string | ❌ | Payment method. Defaults to `"Efectivo"` |

**Example:**
```json
{
  "payment_method": "Tarjeta de Crédito",
  "items": [
    { "product_id": 5, "quantity": 2 },
    { "product_id": 8, "quantity": 1 }
  ]
}
```

> `subtotal`, `taxes`, and `total_final` are calculated automatically. An `invoice_number` is auto-generated as `FACT-{timestamp}-{random}`.

**Responses:** `201 Created` · `400 Bad Request (insufficient stock, inactive product)` · `500 Server Error`

---

### GET `/api/sales/list`
> **Auth:** Required · **Permission:** module `sales` → `can_read`

Returns all sales records with user info and item details.

**Query Params:** None

**Responses:** `200 OK` · `500 Server Error`

---

## Common Error Responses

| Status | Meaning |
|--------|---------|
| `400` | Validation error or bad input |
| `401` | Missing, expired, or revoked token |
| `403` | Insufficient module permission or disabled account |
| `404` | Resource not found |
| `409` | Conflict — duplicate unique value |
| `500` | Internal server error |

---

## Known Issues & Inconsistencies

### `customers` module missing from the `modules` table

All customer endpoints call `requireModulePermission('customers', ...)`, but the `customers` module is **not seeded** in the modules table. The middleware will return `404 Module not found` for every customer endpoint until the module is added.

**Fix — add to your seed/migration:**
```sql
INSERT INTO modules (name, description) VALUES ('customers', 'Customers module');
```

### Modules with no API routes

These modules exist in the DB but have no corresponding API endpoints yet:

| Module | Description |
|--------|-------------|
| `departments` | Departments module |
| `employees` | Employees module |
| `modules` | Modules module |
| `permissions` | Permissions module |
| `purchase_details` | Purchase details module |
| `roles` | Roles module |
| `sale_details` | Sale details module |
| `system_movements` | System movements module |
| `tax_types` | Tax types module |

Permissions granted on these modules via the UI have no effect until routes are implemented.
