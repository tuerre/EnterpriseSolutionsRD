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
| `can_delete` | PUT (soft-deactivate) |

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

Creates a new user. If `role_id` is provided, assigns that existing role. Otherwise, an auto-generated dedicated role is created with all permissions set to `false`.

**Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `username` | string | ✅ | Unique username |
| `password` | string | ✅ | Plain-text password (hashed with argon2) |
| `employee_id` | number | ❌ | Link to an existing employee record |
| `role_id` | number | ❌ | Assign an existing active role. Takes precedence over `role_name` |
| `role_name` | string | ❌ | Name for the auto-created role. Defaults to `{username}_role`. Ignored if `role_id` is provided |

**Example:**
```json
{
  "username": "jdoe",
  "password": "securepass456",
  "employee_id": 3,
  "role_id": 2
}
```

**Responses:** `201 Created` · `400 Bad Request` · `404 Employee / Role not found` · `409 Username already exists`

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

## Roles & Permissions

### GET `/api/users/roles`
> **Auth:** Required · **Permission:** module `users` → `can_read`

Lists all roles with their permission count and user count.

**Body:** None

**Responses:** `200 OK` · `403 Forbidden` · `500 Server Error`

---

### POST `/api/users/roles`
> **Auth:** Required · **Permission:** module `users` → `can_insert`

Creates a new role. Automatically seeds a permission row for every existing module (all flags `false` by default). Pass `permissions` to override specific modules on creation.

**Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `role_name` | string | ✅ | Unique role name |
| `description` | string | ❌ | Optional description |
| `is_active` | boolean | ❌ | Defaults to `true` |
| `permissions` | array | ❌ | Initial permission overrides. Each item: `{ module_id \| module_name, can_read, can_insert, can_update, can_delete }` |

**Example:**
```json
{
  "role_name": "sales_agent",
  "description": "Can read and create sales",
  "permissions": [
    { "module_name": "sales", "can_read": true, "can_insert": true }
  ]
}
```

**Responses:** `201 Created` · `400 Bad Request` · `409 Name already exists` · `500 Server Error`

---

### GET `/api/users/roles/:role_id`
> **Auth:** Required · **Permission:** module `users` → `can_read`

Returns a single role with its full permission details per module.

**URL Params:**
| Param | Type | Description |
|-------|------|-------------|
| `role_id` | number | ID of the role |

**Responses:** `200 OK` · `400 Bad Request` · `404 Not Found` · `500 Server Error`

---

### PUT `/api/users/roles/:role_id`
> **Auth:** Required · **Permission:** module `users` → `can_update`

Updates an existing role's metadata. At least one field required.

**URL Params:**
| Param | Type | Description |
|-------|------|-------------|
| `role_id` | number | ID of the role to update |

**Body (all optional):**
| Field | Type | Description |
|-------|------|-------------|
| `role_name` | string | New unique name |
| `description` | string | Updated description |
| `is_active` | boolean | Enable or disable the role |

**Responses:** `200 OK` · `400 Bad Request` · `404 Not Found` · `409 Name taken` · `500 Server Error`

---

### GET `/api/users/roles/:role_id/permissions`
> **Auth:** Required · **Permission:** module `users` → `can_read`

Returns all permissions for a given role with module details, ordered by module ID.

**URL Params:**
| Param | Type | Description |
|-------|------|-------------|
| `role_id` | number | ID of the role |

**Responses:** `200 OK` · `400 Bad Request` · `404 Not Found` · `500 Server Error`

---

### PUT `/api/users/roles/:role_id/permissions`
> **Auth:** Required · **Permission:** module `users` → `can_update`

Bulk upserts permissions for a role. Each item is created if it doesn't exist, or updated if it does.

**URL Params:**
| Param | Type | Description |
|-------|------|-------------|
| `role_id` | number | ID of the role |

**Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `permissions` | array | ✅ | Non-empty array of `{ module_id \| module_name, can_read, can_insert, can_update, can_delete }` |

**Example:**
```json
{
  "permissions": [
    { "module_name": "products", "can_read": true, "can_insert": true, "can_update": false, "can_delete": false },
    { "module_id": 3, "can_read": true, "can_insert": false, "can_update": true, "can_delete": true }
  ]
}
```

**Responses:** `200 OK` · `400 Bad Request` · `404 Role or Module not found` · `500 Server Error`

---

### PUT `/api/users/users/:user_id/role`
> **Auth:** Required · **Permission:** module `users` → `can_update`

Assigns a different role to an existing user.

**URL Params:**
| Param | Type | Description |
|-------|------|-------------|
| `user_id` | number | ID of the user |

**Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `role_id` | number | ✅ | ID of the role to assign. Must be an active role |

**Example:**
```json
{
  "role_id": 4
}
```

**Responses:** `200 OK` · `400 Bad Request / Inactive role` · `404 User or Role not found` · `500 Server Error`

---

## Employees

### GET `/api/employees`
> **Auth:** Required · **Permission:** module `employees` → `can_read`

Returns all employees with their department info, ordered by first name.

**Responses:** `200 OK` · `403 Forbidden` · `500 Server Error`

---

### GET `/api/employees/:employee_id`
> **Auth:** Required · **Permission:** module `employees` → `can_read`

Returns a single employee with their department info.

**URL Params:**
| Param | Type | Description |
|-------|------|-------------|
| `employee_id` | number | ID of the employee |

**Responses:** `200 OK` · `400 Bad Request` · `404 Not Found` · `500 Server Error`

---

### POST `/api/employees`
> **Auth:** Required · **Permission:** module `employees` → `can_insert`

Creates a new employee.

**Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `first_name` | string | ✅ | Employee's first name |
| `last_name` | string | ✅ | Employee's last name |
| `email` | string | ✅ | Unique email address |
| `id_card` | string | ✅ | Unique national ID / Cédula |
| `dept_id` | number | ❌ | Link to an existing department |
| `salary` | decimal | ❌ | Salary amount. Defaults to `0` |

**Example:**
```json
{
  "first_name": "Ana",
  "last_name": "Martínez",
  "email": "ana.martinez@empresa.com",
  "id_card": "001-9876543-2",
  "dept_id": 2,
  "salary": 45000.00
}
```

**Responses:** `201 Created` · `400 Bad Request` · `409 Email or ID card already registered` · `500 Server Error`

---

### PUT `/api/employees/:employee_id`
> **Auth:** Required · **Permission:** module `employees` → `can_update`

Updates an existing employee. At least one field required.

**URL Params:**
| Param | Type | Description |
|-------|------|-------------|
| `employee_id` | number | ID of the employee to update |

**Body (all optional):**
| Field | Type | Description |
|-------|------|-------------|
| `first_name` | string | Updated first name |
| `last_name` | string | Updated last name |
| `email` | string | New unique email |
| `id_card` | string | New unique national ID |
| `dept_id` | number | New department (pass `null` to unassign) |
| `salary` | decimal | Updated salary |

**Responses:** `200 OK` · `400 Bad Request` · `404 Not Found` · `409 Email or ID card conflict` · `500 Server Error`

---

### PUT `/api/employees/delete/:employee_id`
> **Auth:** Required · **Permission:** module `employees` → `can_delete`

Soft-deactivates an employee (sets `is_active = false`).

**URL Params:**
| Param | Type | Description |
|-------|------|-------------|
| `employee_id` | number | ID of the employee to deactivate |

**Body:** None

**Responses:** `200 OK` · `400 Invalid ID / Already inactive` · `404 Not Found` · `500 Server Error`

---

### PUT `/api/employees/reactivate/:employee_id`
> **Auth:** Required · **Permission:** module `employees` → `can_update`

Re-activates a previously deactivated employee.

**URL Params:**
| Param | Type | Description |
|-------|------|-------------|
| `employee_id` | number | ID of the employee to reactivate |

**Body:** None

**Responses:** `200 OK` · `400 Invalid ID / Already active` · `404 Not Found` · `500 Server Error`

---

## Departments

### GET `/api/departments`
> **Auth:** Required · **Permission:** module `departments` → `can_read`

Returns all departments with their employee count, ordered by name.

**Responses:** `200 OK` · `403 Forbidden` · `500 Server Error`

---

### GET `/api/departments/:dept_id`
> **Auth:** Required · **Permission:** module `departments` → `can_read`

Returns a single department with its employee list.

**URL Params:**
| Param | Type | Description |
|-------|------|-------------|
| `dept_id` | number | ID of the department |

**Responses:** `200 OK` · `400 Bad Request` · `404 Not Found` · `500 Server Error`

---

### POST `/api/departments`
> **Auth:** Required · **Permission:** module `departments` → `can_insert`

Creates a new department.

**Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | ✅ | Unique department name |
| `description` | string | ❌ | Optional description |

**Example:**
```json
{
  "name": "Ventas",
  "description": "Equipo de ventas y atención al cliente"
}
```

**Responses:** `201 Created` · `400 Bad Request` · `409 Name already exists` · `500 Server Error`

---

### PUT `/api/departments/:dept_id`
> **Auth:** Required · **Permission:** module `departments` → `can_update`

Updates an existing active department. At least one field required. Cannot edit inactive departments.

**URL Params:**
| Param | Type | Description |
|-------|------|-------------|
| `dept_id` | number | ID of the department to update |

**Body (all optional):**
| Field | Type | Description |
|-------|------|-------------|
| `name` | string | New unique name |
| `description` | string | Updated description |

**Responses:** `200 OK` · `400 Bad Request / Inactive department` · `404 Not Found` · `409 Name conflict` · `500 Server Error`

---

### PUT `/api/departments/delete/:dept_id`
> **Auth:** Required · **Permission:** module `departments` → `can_delete`

Soft-deactivates a department (sets `is_active = false`).

**URL Params:**
| Param | Type | Description |
|-------|------|-------------|
| `dept_id` | number | ID of the department to deactivate |

**Body:** None

**Responses:** `200 OK` · `400 Invalid ID / Already inactive` · `404 Not Found` · `500 Server Error`

---

### PUT `/api/departments/reactivate/:dept_id`
> **Auth:** Required · **Permission:** module `departments` → `can_update`

Re-activates a previously deactivated department.

**URL Params:**
| Param | Type | Description |
|-------|------|-------------|
| `dept_id` | number | ID of the department to reactivate |

**Body:** None

**Responses:** `200 OK` · `400 Invalid ID / Already active` · `404 Not Found` · `500 Server Error`

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

### PUT `/api/categories/:category_id` *(deactivate)*
> **Auth:** Required · **Permission:** module `categories` → `can_delete`

Soft-deactivates a category (sets `is_active = false`). Also deactivates all associated active products.

**URL Params:**
| Param | Type | Description |
|-------|------|-------------|
| `category_id` | number | ID of the category to deactivate |

**Body:** None

**Responses:** `200 OK` · `400 Already inactive` · `404 Not Found`

> ⚠️ **Known Issue:** This route and the edit route above share the same HTTP method and path (`PUT /:category_id`). Due to Express route ordering, the edit handler runs first. See [Known Issues](#known-issues--inconsistencies).

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
| `description` | string | ✅ | Product description |
| `category_id` | number | ✅ | Must reference an existing category |
| `supplier_id` | number | ✅ | Must reference an existing active supplier |
| `tax_id` | number | ✅ | Must reference an existing tax type |
| `cost_price` | number | ✅ | Must be > 0 |
| `sale_price` | number | ✅ | Must be > `cost_price` |
| `aisle_location` | string | ✅ | Physical location in the store |
| `stock` | integer | ❌ | Initial stock ≥ 0. Defaults to `0` |

**Example:**
```json
{
  "product_name": "Laptop HP Pavilion 15",
  "description": "15-inch laptop, 8GB RAM, 256GB SSD",
  "category_id": 2,
  "supplier_id": 1,
  "tax_id": 1,
  "cost_price": 450.00,
  "sale_price": 650.00,
  "aisle_location": "A3",
  "stock": 20
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

### PUT `/api/products/:product_id` *(deactivate)*
> **Auth:** Required · **Permission:** module `products` → `can_delete`

Soft-deactivates a product (sets `is_active = false`).

**URL Params:**
| Param | Type | Description |
|-------|------|-------------|
| `product_id` | number | ID of the product to deactivate |

**Body:** None

**Responses:** `200 OK` · `400 Already inactive` · `404 Not Found`

> ⚠️ **Known Issue:** This route and the edit route above share the same HTTP method and path (`PUT /:product_id`). Due to Express route ordering, the edit handler runs first. See [Known Issues](#known-issues--inconsistencies).

---

## Product Stock Management

> **Note:** These three routes use a different base path — `/products/...` (no `/api` prefix).

### PATCH `/products/stock`
> **Auth:** Required · **Permission:** module `products` → `can_update`

Manually adjusts product stock up or down. Logs the movement to the system audit trail.

**Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `product_id` | number | ✅ | ID of the product |
| `quantity` | integer | ✅ | Amount to add or remove. Must be > 0 |
| `type` | string | ✅ | `"IN"` to add stock, `"OUT"` to remove stock |
| `notes` | string | ❌ | Optional notes for the movement log |

**Example:**
```json
{
  "product_id": 5,
  "quantity": 10,
  "type": "IN",
  "notes": "Restock from warehouse"
}
```

**Responses:** `200 OK` · `400 Bad Request / Insufficient stock / Inactive product` · `404 Product not found` · `500 Server Error`

---

### GET `/products/low-stock`
> **Auth:** Required · **Permission:** module `products` → `can_read`

Returns all active products with stock ≤ 5, ordered by stock ascending (lowest first).

**Responses:** `200 OK` · `500 Server Error`

---

### GET `/products/history`
> **Auth:** Required · **Permission:** module `products` → `can_read`

Returns all `STOCK_IN` and `STOCK_OUT` system movements with user and module info, ordered by date descending.

**Responses:** `200 OK` · `500 Server Error`

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

### PUT `/api/suppliers/:supplier_id` *(deactivate)*
> **Auth:** Required · **Permission:** module `suppliers` → `can_delete`

Soft-deactivates a supplier (sets `is_active = false`).

**URL Params:**
| Param | Type | Description |
|-------|------|-------------|
| `supplier_id` | number | ID of the supplier to deactivate |

**Body:** None

**Responses:** `200 OK` · `400 Already inactive` · `404 Not Found`

> ⚠️ **Known Issue:** This route and the edit route above share the same HTTP method and path (`PUT /:supplier_id`). Due to Express route ordering, the edit handler runs first. See [Known Issues](#known-issues--inconsistencies).

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
| `items[].unit_price` | number | ❌ | Override unit price. Defaults to the product's `cost_price` if omitted |

**Example:**
```json
{
  "supplier_id": 1,
  "items": [
    { "product_id": 5, "quantity": 50 },
    { "product_id": 12, "quantity": 20, "unit_price": 15.50 }
  ]
}
```

> `total_amount` is calculated automatically. Duplicate `product_id` entries in `items` are aggregated (combined quantity), but conflicting `unit_price` values for the same product will be rejected.

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

> `subtotal`, `taxes`, and `total_final` are calculated automatically using the latest tax type rate. An `invoice_number` is auto-generated as `FACT-{timestamp}-{random}`.

**Responses:** `201 Created` · `400 Bad Request (insufficient stock, inactive product)` · `500 Server Error`

---

### GET `/api/sales/list`
> **Auth:** Required · **Permission:** module `sales` → `can_read`

Returns all sales records with user info and item details.

**Query Params:** None

**Responses:** `200 OK` · `500 Server Error`

---

## Tax Types

### POST `/api/tax-types/add`
> **Auth:** Required · **Permission:** module `tax_types` → `can_insert`

Creates a new tax type (ITBIS). The system uses the most recently updated rate for all sales calculations.

**Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `percentage` | decimal | ✅ | Tax rate percentage. Must be > 0 and ≤ 100 |

**Example:**
```json
{
  "percentage": 18.00
}
```

**Responses:** `201 Created` · `400 Bad Request` · `500 Server Error`

---

### GET `/api/tax-types/list`
> **Auth:** Required · **Permission:** module `tax_types` → `can_read`

Returns the most recently updated tax type record.

**Responses:** `200 OK` · `404 No tax types found` · `500 Server Error`

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

### Edit vs. deactivate routing conflict

The edit and deactivate handlers for **categories**, **products**, and **suppliers** are both registered on `PUT /:id` at the same base path. Because the edit route is mounted first in `server.js`, it intercepts all `PUT /:id` requests. The deactivate handler is unreachable unless the user lacks `can_update` permission (in which case both return 403).

**Affected routes:**
- `PUT /api/categories/:category_id` — edit always wins over deactivate
- `PUT /api/products/:product_id` — edit always wins over deactivate
- `PUT /api/suppliers/:supplier_id` — edit always wins over deactivate

**Workaround:** Ensure the authenticated user has both `can_update` and `can_delete` permissions and use a dedicated UI action that sends the correct intent. A future fix would separate these onto distinct paths (e.g., `/api/categories/:id/deactivate`).

---

### Stock management routes missing `/api` prefix

The following routes are mounted directly at `/products/...` instead of `/api/products/...`. They also lack an explicit `authenticateToken` call in `server.js`, relying solely on `requireModulePermission` to fail if no user context is present.

| Route | Actual path |
|-------|-------------|
| Stock update | `PATCH /products/stock` |
| Low stock list | `GET /products/low-stock` |
| Inventory history | `GET /products/history` |

---

### `customers` module has no routes

Customer endpoints were removed from the server. Permissions granted on the `customers` module via the roles UI have no effect until routes are re-implemented.
