# PasswordSaver API Documentation

All endpoints expect and return JSON. Authenticated endpoints require valid JWT cookies (`accessToken`, `refreshToken`, `deviceToken`).

## Base URL
`/api`

---

## Auth (`/api/auth`)

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| POST | `/auth/register` | Register a new user | No |
| POST | `/auth/login` | Login and receive tokens | No |
| POST | `/auth/logout` | Revoke session and clear cookies | Yes |
| GET | `/auth/check` | Verify authentication status | Yes |
| POST | `/auth/refresh` | Obtain a new access token | No (Uses Refresh Cookie) |
| POST | `/auth/change-password` | Change the Master Password | Yes |

---

##  Vault Items (`/api/vault`)

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| GET | `/vault` | Get all encrypted vault items | Yes |
| POST | `/vault` | Create a new encrypted vault item | Yes |
| PUT | `/vault/:uuid` | Update a specific vault item | Yes |
| DELETE | `/vault/:uuid` | Move a vault item to the trash | Yes |
| DELETE | `/vault/:uuid/permanent` | Permanently delete an item | Yes |

---

##  Categories (`/api/categories`)

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| GET | `/categories` | List all user categories | Yes |
| POST | `/categories` | Create a custom category | Yes |
| PUT | `/categories/:uuid` | Update a category name/icon | Yes |
| DELETE | `/categories/:uuid` | Delete a category | Yes |

---

##  Templates (`/api/templates`)

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| GET | `/templates` | List all custom templates | Yes |
| POST | `/templates` | Create a custom template schema | Yes |
| PUT | `/templates/:uuid` | Update a template | Yes |
| DELETE | `/templates/:uuid` | Delete a template | Yes |

---

##  Organization (`/api/groups` & `/api/persons`)

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| GET | `/groups` | List all groups | Yes |
| POST | `/groups` | Create a group | Yes |
| DELETE | `/groups/:uuid` | Delete a group | Yes |
| GET | `/persons` | List all persons | Yes |
| POST | `/persons` | Create a person | Yes |
| DELETE | `/persons/:uuid` | Delete a person | Yes |

---

##  Security & Account (`/api/account`, `/api/devices`, `/api/notifications`)

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| PUT | `/account/profile` | Update account profile (name, hint) | Yes |
| DELETE | `/account` | Permanently wipe the account | Yes |
| GET | `/devices` | List all active sessions/devices | Yes |
| DELETE | `/devices/:uuid` | Revoke a specific device session | Yes |
| GET | `/notifications` | Get activity feed & IP alerts | Yes |

---

##  Backups (`/api/export` & `/api/import`)

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| GET | `/export` | Download full encrypted vault backup | Yes |
| POST | `/import` | Upload and sync backup data | Yes |

---

## HTTP Status Codes
- `200 OK` - Request succeeded.
- `201 Created` - Resource created successfully.
- `400 Bad Request` - Invalid input data or missing fields.
- `401 Unauthorized` - Missing or invalid authentication token.
- `403 Forbidden` - You do not have permission to access the resource.
- `404 Not Found` - The requested resource was not found.
- `429 Too Many Requests` - Rate limit exceeded or account locked.
- `500 Internal Server Error` - An unexpected server error occurred.
