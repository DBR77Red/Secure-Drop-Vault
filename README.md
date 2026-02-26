# Secure Drop Vault

A secure, self-destructing secret sharing platform. Share sensitive text, URLs, and files via a one-time link that is permanently deleted the moment it is opened.


---

## What is Secure Drop Vault?

Secure Drop Vault lets you share sensitive information without leaving a permanent trace. You create a secret, receive a unique link, and share it with the intended recipient. The moment that link is opened, the data is wiped from the server forever — it cannot be accessed again.

---

## How to Use It

### Sending a Secret

1. Open the app
2. Choose the type of secret you want to share:
   - **Text** — passwords, private notes, credentials
   - **URL** — a private or sensitive link
   - **File** — any file up to 5MB
3. Enter your content and click **Generate Secret Link**
4. Copy the link and send it to the recipient via any channel (email, chat, etc.)

> The link works **exactly once**. Once opened, it is gone.

### Receiving a Secret

1. Open the link you received
2. You will see a warning that this is a one-time message
3. Click **Reveal Secret Now**
4. View, copy, or download your content
5. The secret is permanently deleted from the server the moment you reveal it

> **Do not refresh the page after revealing.** The data only exists in your browser memory — refreshing will lose it permanently.

---

## Why is it Secure?

### One-Time Destruction
Secrets are deleted from the database in the same operation that retrieves them. There is no window where a secret can be read twice — even by the server.

### Encryption at Rest
All content, file data, and file names are encrypted using **AES-256-GCM** before being stored in the database. This is the same standard used by banks and governments. Even if someone gained direct access to the database, the data would be unreadable without the encryption key.

Each secret is encrypted with a unique random **IV (Initialization Vector)**, meaning two identical secrets produce completely different ciphertext in the database.

### Unguessable Links
Every secret link is based on a randomly generated **UUID v4** — there are 5.3 × 10³⁶ possible combinations. Brute-forcing a valid link is computationally impossible.

### Automatic Expiry
Secrets that are never opened are automatically deleted after **7 days**. Nothing lingers in the database indefinitely.

### Rate Limiting
To prevent abuse and brute-force attempts:
- Maximum **10 secrets created** per IP per 15 minutes
- Maximum **30 secret retrievals** per IP per 15 minutes

### HTTPS Enforcement
All traffic is forced over HTTPS in production. HTTP requests are permanently redirected. **HSTS** headers instruct browsers to never connect over plain HTTP.

### Server-Side File Validation
The 5MB file size limit is enforced on the server, not just the frontend. It cannot be bypassed by calling the API directly.

---

## Security Summary

| Feature | Status |
|---|---|
| AES-256-GCM encryption at rest | ✅ |
| One-time read & delete | ✅ |
| Unguessable UUID links | ✅ |
| 7-day automatic expiry | ✅ |
| Rate limiting | ✅ |
| HTTPS enforcement + HSTS | ✅ |
| Server-side file size limit | ✅ |

---

## Running Locally (for Developers)

### Prerequisites
- Node.js 20+
- A PostgreSQL database ([Neon](https://neon.tech) offers a free tier)

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/DBR77Red/Secure-Drop-Vault
   cd Secure-Drop-Vault
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Generate an encryption key**
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

4. **Create a `.env` file** in the project root:
   ```env
   DATABASE_URL=postgresql://user:password@host:5432/dbname
   ENCRYPTION_KEY=your_64_char_hex_key_here
   PORT=5000
   ```

5. **Push the database schema**
   ```bash
   npm run db:push
   ```

6. **Start the development server**
   ```bash
   npm run dev
   ```

7. Open `http://localhost:5000`

### Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Run production build |
| `npm run db:push` | Sync schema changes to the database |
| `npm run check` | TypeScript type checking |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + TypeScript |
| Routing | Wouter |
| Data Fetching | TanStack Query |
| Animations | Framer Motion |
| UI Components | shadcn/ui + Radix UI |
| Styling | Tailwind CSS |
| Backend | Node.js + Express 5 |
| Database | PostgreSQL + Drizzle ORM |
| Authentication | Passport.js |
| Build Tool | Vite + esbuild |

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `ENCRYPTION_KEY` | Yes | 64-character hex string (32 bytes) for AES-256-GCM |
| `PORT` | No | Server port (defaults to 5000) |
