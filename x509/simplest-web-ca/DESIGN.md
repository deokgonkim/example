# Simplest Web CA — Design & Session Log

> This document records the planning conversations, design decisions, and final implementation plan
> for the `simplest-web-ca` project.

---

## Conversation Log

### Phase 1 — Initial Request

**User:** In this directory (currently empty), I want simplest web certificate authority server.

---

**Q: Which language/runtime should I use?**
> Selected: **Go** (recommended)

**Q: What should the CA server be able to do?**
> Selected: **Issue leaf certs only** (sign CSRs submitted via HTTP)

**Q: What interface should the server expose?**
> Selected: **REST API only** (JSON/PEM over HTTP)

**Q: How should issued certificates be stored?**
> Selected: **File-based** (persist issued certs to disk)

---

### Phase 2 — Web UI & S/MIME Extension

**User:** I want a web interface that utilizes web PKI API so that users can request their S/MIME certificate on the web. Also support CSR file submission.

---

**Q: When you say "Web PKI API", do you mean using the browser's WebCrypto API to generate the key pair and CSR client-side (so the private key never leaves the browser)?**
> Selected: **Yes — key pair generated in browser via WebCrypto API** (recommended)

**Q: What information should the user fill in on the web form for an S/MIME cert request?**
> Selected: **Email address only** (recommended)

**Q: After the cert is issued, how should the user receive it?**
> Selected: **Download as .p12 / PKCS#12 bundle (cert + private key)** (recommended)

> **Design note:** Since the key pair is generated in the browser (private key never sent to server),
> the `.p12` bundle is assembled entirely client-side using `node-forge` (loaded from CDN).
> The server only ever receives the CSR and returns the signed certificate.

---

## Final Implementation Plan

### Problem Statement

Build a minimal Certificate Authority (CA) HTTP server in Go that:
- Auto-generates (or loads) a self-signed root CA key + certificate on startup
- Signs leaf S/MIME certificate CSRs submitted via REST API or web UI
- Serves a web UI where users can request an S/MIME cert (key pair generated in browser via WebCrypto API) or upload a CSR file
- Persists the root CA and issued certificates to disk

### Design Decisions

| Concern | Decision |
|---------|----------|
| Language | Go — stdlib only, no external Go dependencies |
| Cert scope | Leaf S/MIME certs only; email address is the only required subject field |
| Interface | REST API (PEM over HTTP) + single-page web UI (vanilla JS, no framework) |
| Storage | File-based (`data/` directory) |
| Key generation | Browser-side WebCrypto API (RSA-2048); private key never sent to server |
| Cert delivery | `.p12` / PKCS#12 bundle assembled client-side using `node-forge` (CDN) |
| CSR upload | User can also upload an existing `.pem` / `.csr` file |

### File Layout

```
simplest-web-ca/
├── go.mod
├── main.go            # HTTP server, routes, static file serving
├── ca.go              # CA: generate/load root, sign S/MIME CSR, persist
├── handler.go         # HTTP handler functions (REST API)
├── static/
│   └── index.html     # Single-page web UI (vanilla JS + node-forge CDN)
├── data/              # Auto-created at runtime
│   ├── ca.key         # Root CA private key (auto-generated)
│   ├── ca.crt         # Root CA certificate (auto-generated)
│   ├── serial.txt     # Auto-incrementing serial counter
│   └── certs/         # Issued leaf certs (<serial>.pem)
├── README.md
└── DESIGN.md          # This file
```

### REST API

| Method | Path     | Body                    | Response                   |
|--------|----------|-------------------------|----------------------------|
| GET    | /ca-cert | —                       | CA cert (PEM)              |
| POST   | /sign    | CSR (PEM, `text/plain`) | Signed S/MIME cert (PEM)   |
| GET    | /certs   | —                       | JSON list of issued certs  |
| GET    | /        | —                       | Serves `static/index.html` |

### CA Certificate Profile

| Field | Value |
|-------|-------|
| Key type | RSA-2048 |
| Validity | 10 years |
| KeyUsage | CertSign, CRLSign |
| BasicConstraints | CA: true |

### S/MIME Leaf Certificate Profile

| Field | Value |
|-------|-------|
| Key type | RSA-2048 (generated in browser) |
| Validity | 1 year |
| KeyUsage | DigitalSignature, KeyEncipherment |
| ExtKeyUsage | EmailProtection |
| SAN | rfc822Name = email address from CSR |
| Serial | Auto-incremented integer, persisted in `data/serial.txt` |

### Web UI Flow

**Tab 1 — Generate & Request**
1. User enters email address
2. Browser generates RSA-2048 key pair via WebCrypto API (extractable)
3. `node-forge` builds a PKCS#10 CSR with email in Subject CN and SAN `rfc822Name`
4. CSR PEM is POSTed to `/sign`
5. Server returns signed cert PEM
6. `node-forge` packages cert + private key into a PKCS#12 bundle
7. Browser downloads `smime.p12` (no password — user sets one on import)
8. CA cert download link offered (`/ca-cert`) for trust store installation

**Tab 2 — Upload CSR**
1. User selects a `.pem` / `.csr` file
2. JS reads the file and POSTs it to `/sign`
3. Server returns signed cert PEM
4. Browser downloads `cert.pem`

**Tab 3 — Issued Certs**
- Fetches `/certs` and renders a table of serial, email/subject, and expiry date

### Implementation Tasks (completed)

| ID | Title | Status |
|----|-------|--------|
| `go-mod` | Initialize Go module | ✅ done |
| `ca-core` | Implement CA core in `ca.go` | ✅ done |
| `handlers` | Implement HTTP handlers in `handler.go` | ✅ done |
| `main-server` | Wire HTTP server in `main.go` | ✅ done |
| `web-ui` | Build web UI in `static/index.html` | ✅ done |
| `readme` | Write README.md | ✅ done |
