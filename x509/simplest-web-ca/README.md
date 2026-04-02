# Simplest Web CA

A minimal S/MIME Certificate Authority server written in Go.

- **Root CA** auto-generated on first run (RSA-2048, 10-year validity)
- **Web UI** — request an S/MIME cert by email; private key generated in the browser via WebCrypto, never sent to the server; `.p12` bundle assembled client-side
- **Upload CSR** — submit an existing `.pem`/`.csr` file and receive a signed `cert.pem`
- **REST API** — scriptable with `curl`
- **File-based storage** — issued certs persisted to `data/certs/`

## Build & Run

```bash
go build -o web-ca .
./web-ca                          # listens on :8080
./web-ca -addr :9443 -data /var/ca   # custom port and data directory
```

The `data/` directory is created automatically on first run.

## Web UI

Open **http://localhost:8080** in your browser.

| Tab | Description |
|-----|-------------|
| 🔑 **Generate & Request** | Enter your email → browser generates RSA-2048 key pair → CSR sent to CA → `.p12` downloaded |
| 📤 **Upload CSR** | Pick an existing CSR file → CA signs it → `cert.pem` downloaded |
| 📋 **Issued Certs** | View all certificates issued by this CA |

## REST API

### Download the CA certificate

```bash
curl http://localhost:8080/ca-cert -o ca.crt
```

### Sign a CSR

```bash
curl -X POST http://localhost:8080/sign \
  --data-binary @your.csr \
  -H "Content-Type: text/plain" \
  -o cert.pem
```

### List issued certificates

```bash
curl http://localhost:8080/certs | jq .
```

## Trusting the CA certificate

### macOS

```bash
sudo security add-trusted-cert -d -r trustRoot \
  -k /Library/Keychains/System.keychain ca.crt
```

### Linux (Debian/Ubuntu)

```bash
sudo cp ca.crt /usr/local/share/ca-certificates/web-ca.crt
sudo update-ca-certificates
```

### Windows

```powershell
certutil -addstore -f "Root" ca.crt
```

## Importing the .p12 into your email client

The downloaded `smime.p12` has **no password** set (forge default).  
Most email clients (Thunderbird, Apple Mail, Outlook) prompt for a password during import — leave it blank or set one immediately after download.

## S/MIME certificate profile

| Field | Value |
|-------|-------|
| Key type | RSA-2048 |
| Validity | 1 year |
| KeyUsage | DigitalSignature, KeyEncipherment |
| ExtKeyUsage | EmailProtection |
| SAN | rfc822Name = email address |

## Verifying an issued certificate

```bash
openssl verify -CAfile ca.crt cert.pem
openssl x509 -in cert.pem -noout -text | grep -A4 "Subject Alternative"
```
