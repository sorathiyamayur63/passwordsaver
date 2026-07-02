# Security Architecture & Cryptography

PasswordSaver relies on a **Zero-Knowledge** architecture. The server is completely blind to the contents of your vault. All encryption and decryption happen locally in the user's browser.

## 1. Authentication & Key Derivation

When a user creates an account, two distinct processes happen based on their Master Password:

### Authentication (Server-Side verification)
- The Master Password is sent to the server over HTTPS.
- The server hashes the password using **Argon2id**, a memory-hard algorithm designed to resist GPU brute-forcing.
- The server stores the Argon2 hash. It *never* stores the plaintext password.

### Key Derivation (Client-Side encryption key)
- The client receives a `vaultKeySalt` (a unique random string generated during registration) from the server.
- The client uses **PBKDF2** (Password-Based Key Derivation Function 2) with **SHA-256**, iterating 100,000 times against the Master Password and the salt.
- This derives a **256-bit Encryption Key**.
- This derived key *never* leaves the client's memory. It is wiped when the user locks the vault or logs out.

## 2. Vault Encryption (AES-256-GCM)

All vault data is encrypted using **AES-256-GCM** (Advanced Encryption Standard in Galois/Counter Mode).

**Why GCM?**
GCM provides *Authenticated Encryption*. It encrypts the data and generates an authentication tag. When decrypting, if the ciphertext has been modified in transit or altered in the database by a malicious actor, the tag validation will fail, and the client will reject the payload.

**The Encryption Process:**
1. User adds a password.
2. The UI serializes the item into a JSON string.
3. The crypto module generates a random 12-byte Initialization Vector (IV).
4. AES-GCM encrypts the JSON string using the derived 256-bit key and the IV.
5. The result is packed into a base64 string format: `iv:ciphertext:authTag`.
6. Only this base64 string is sent to the backend.

## 3. Threat Models & Mitigations

### Threat: Database Breach
**Scenario:** A hacker steals the MongoDB database.
**Mitigation:** The hacker receives Argon2 password hashes and AES-256-GCM encrypted vault blobs. Without the user's Master Password, the vault data is mathematically impossible to decrypt.

### Threat: Man-in-the-Middle (MITM)
**Scenario:** An attacker intercepts network traffic.
**Mitigation:** 
- HTTPS/TLS encrypts the transport layer.
- Even if TLS is stripped, the vault payload is already encrypted via AES.
- Cookies (JWTs) are marked `Secure` (HTTPS only).

### Threat: Cross-Site Scripting (XSS)
**Scenario:** Malicious JS is executed in the browser.
**Mitigation:** 
- React automatically escapes injected strings.
- Authentication tokens (JWTs) are stored in `HttpOnly` cookies, making them invisible to JavaScript (e.g., `document.cookie`).
- CSP (Content Security Policy) can be applied via Helmet on the backend.

### Threat: Cross-Site Request Forgery (CSRF)
**Scenario:** A malicious site forces the user's browser to make an authenticated request.
**Mitigation:** 
- `SameSite=Strict` is set on the authentication cookies.

## 4. IP Geolocation Security
PasswordSaver implements a backend anomaly detection system.
- Every successful login records the `ipAddress`.
- If a user logs in from an IP address that the account has *never* used before, the system generates a `LOGIN_NEW_LOCATION` alert.
- This alert is immediately visible in the user's Activity Feed. 

## 5. Memory Security
- When the Vault is "locked", the derived 256-bit AES key is explicitly overwritten and garbage collected in the browser.
- The user must re-enter their Master Password to regenerate the key and decrypt the vault.
