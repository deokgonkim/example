package main

import (
	"crypto/rand"
	"crypto/rsa"
	"crypto/x509"
	"crypto/x509/pkix"
	"encoding/pem"
	"errors"
	"fmt"
	"math/big"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"sync"
	"time"
)

// CA holds the loaded root CA certificate and private key.
type CA struct {
	cert    *x509.Certificate
	key     *rsa.PrivateKey
	dataDir string
	mu      sync.Mutex
}

// LoadOrCreate loads the root CA from dataDir, or generates a new one.
func LoadOrCreate(dataDir string) (*CA, error) {
	if err := os.MkdirAll(filepath.Join(dataDir, "certs"), 0o700); err != nil {
		return nil, err
	}

	keyPath := filepath.Join(dataDir, "ca.key")
	crtPath := filepath.Join(dataDir, "ca.crt")

	var cert *x509.Certificate
	var key *rsa.PrivateKey

	if _, err := os.Stat(keyPath); errors.Is(err, os.ErrNotExist) {
		cert, key, err = generateRootCA(keyPath, crtPath)
		if err != nil {
			return nil, fmt.Errorf("generate root CA: %w", err)
		}
	} else {
		cert, key, err = loadRootCA(keyPath, crtPath)
		if err != nil {
			return nil, fmt.Errorf("load root CA: %w", err)
		}
	}

	return &CA{cert: cert, key: key, dataDir: dataDir}, nil
}

// CACertPEM returns the root CA certificate in PEM format.
func (ca *CA) CACertPEM() []byte {
	return pem.EncodeToMemory(&pem.Block{Type: "CERTIFICATE", Bytes: ca.cert.Raw})
}

// SignCSR signs a PEM-encoded CSR and returns the signed certificate as PEM.
// For S/MIME use: KeyUsage, ExtKeyUsage, and rfc822Name SAN are enforced by the CA.
func (ca *CA) SignCSR(csrPEM []byte) ([]byte, error) {
	block, _ := pem.Decode(csrPEM)
	if block == nil {
		return nil, errors.New("failed to decode PEM block from CSR")
	}

	csr, err := x509.ParseCertificateRequest(block.Bytes)
	if err != nil {
		return nil, fmt.Errorf("parse CSR: %w", err)
	}
	if err := csr.CheckSignature(); err != nil {
		return nil, fmt.Errorf("CSR signature invalid: %w", err)
	}

	// Extract email from CSR Subject or SANs.
	email := extractEmail(csr)

	serial, err := ca.nextSerial()
	if err != nil {
		return nil, err
	}

	now := time.Now()
	tmpl := &x509.Certificate{
		SerialNumber: serial,
		Subject:      csr.Subject,
		NotBefore:    now.Add(-time.Minute),
		NotAfter:     now.Add(365 * 24 * time.Hour),
		KeyUsage:     x509.KeyUsageDigitalSignature | x509.KeyUsageKeyEncipherment,
		ExtKeyUsage:  []x509.ExtKeyUsage{x509.ExtKeyUsageEmailProtection, x509.ExtKeyUsageClientAuth},
	}

	// Add rfc822Name SAN if we found an email.
	if email != "" {
		tmpl.EmailAddresses = []string{email}
	}

	ca.mu.Lock()
	certDER, err := x509.CreateCertificate(rand.Reader, tmpl, ca.cert, csr.PublicKey, ca.key)
	ca.mu.Unlock()
	if err != nil {
		return nil, fmt.Errorf("create certificate: %w", err)
	}

	// Persist issued cert.
	certPEM := pem.EncodeToMemory(&pem.Block{Type: "CERTIFICATE", Bytes: certDER})
	outPath := filepath.Join(ca.dataDir, "certs", fmt.Sprintf("%d.pem", serial))
	if err := os.WriteFile(outPath, certPEM, 0o644); err != nil {
		return nil, fmt.Errorf("save certificate: %w", err)
	}

	return certPEM, nil
}

// IssuedCert is a summary of an issued certificate.
type IssuedCert struct {
	Serial  string `json:"serial"`
	Subject string `json:"subject"`
	Email   string `json:"email"`
	Expiry  string `json:"expiry"`
}

// ListCerts returns a summary of all issued leaf certificates.
func (ca *CA) ListCerts() ([]IssuedCert, error) {
	dir := filepath.Join(ca.dataDir, "certs")
	entries, err := os.ReadDir(dir)
	if err != nil {
		return nil, err
	}

	var result []IssuedCert
	for _, e := range entries {
		if !strings.HasSuffix(e.Name(), ".pem") {
			continue
		}
		raw, err := os.ReadFile(filepath.Join(dir, e.Name()))
		if err != nil {
			continue
		}
		block, _ := pem.Decode(raw)
		if block == nil {
			continue
		}
		cert, err := x509.ParseCertificate(block.Bytes)
		if err != nil {
			continue
		}
		email := ""
		if len(cert.EmailAddresses) > 0 {
			email = cert.EmailAddresses[0]
		}
		result = append(result, IssuedCert{
			Serial:  cert.SerialNumber.String(),
			Subject: cert.Subject.String(),
			Email:   email,
			Expiry:  cert.NotAfter.UTC().Format(time.RFC3339),
		})
	}
	return result, nil
}

// --- helpers ---

func generateRootCA(keyPath, crtPath string) (*x509.Certificate, *rsa.PrivateKey, error) {
	key, err := rsa.GenerateKey(rand.Reader, 2048)
	if err != nil {
		return nil, nil, err
	}

	serial, _ := rand.Int(rand.Reader, new(big.Int).Lsh(big.NewInt(1), 128))
	now := time.Now()
	tmpl := &x509.Certificate{
		SerialNumber:          serial,
		Subject:               pkix.Name{CommonName: "Simplest Web CA"},
		NotBefore:             now.Add(-time.Minute),
		NotAfter:              now.Add(10 * 365 * 24 * time.Hour),
		KeyUsage:              x509.KeyUsageCertSign | x509.KeyUsageCRLSign,
		BasicConstraintsValid: true,
		IsCA:                  true,
	}

	certDER, err := x509.CreateCertificate(rand.Reader, tmpl, tmpl, &key.PublicKey, key)
	if err != nil {
		return nil, nil, err
	}

	if err := writePEM(keyPath, "RSA PRIVATE KEY", x509.MarshalPKCS1PrivateKey(key)); err != nil {
		return nil, nil, err
	}
	if err := writePEM(crtPath, "CERTIFICATE", certDER); err != nil {
		return nil, nil, err
	}

	cert, err := x509.ParseCertificate(certDER)
	return cert, key, err
}

func loadRootCA(keyPath, crtPath string) (*x509.Certificate, *rsa.PrivateKey, error) {
	keyPEM, err := os.ReadFile(keyPath)
	if err != nil {
		return nil, nil, err
	}
	block, _ := pem.Decode(keyPEM)
	if block == nil {
		return nil, nil, errors.New("invalid key PEM")
	}
	key, err := x509.ParsePKCS1PrivateKey(block.Bytes)
	if err != nil {
		return nil, nil, err
	}

	crtPEM, err := os.ReadFile(crtPath)
	if err != nil {
		return nil, nil, err
	}
	block, _ = pem.Decode(crtPEM)
	if block == nil {
		return nil, nil, errors.New("invalid cert PEM")
	}
	cert, err := x509.ParseCertificate(block.Bytes)
	return cert, key, err
}

func writePEM(path, typ string, der []byte) error {
	f, err := os.OpenFile(path, os.O_CREATE|os.O_WRONLY|os.O_TRUNC, 0o600)
	if err != nil {
		return err
	}
	defer f.Close()
	return pem.Encode(f, &pem.Block{Type: typ, Bytes: der})
}

func (ca *CA) nextSerial() (*big.Int, error) {
	ca.mu.Lock()
	defer ca.mu.Unlock()

	serialPath := filepath.Join(ca.dataDir, "serial.txt")
	var n int64 = 1
	if raw, err := os.ReadFile(serialPath); err == nil {
		n, _ = strconv.ParseInt(strings.TrimSpace(string(raw)), 10, 64)
		n++
	}
	if err := os.WriteFile(serialPath, []byte(strconv.FormatInt(n, 10)), 0o644); err != nil {
		return nil, fmt.Errorf("update serial: %w", err)
	}
	return big.NewInt(n), nil
}

func extractEmail(csr *x509.CertificateRequest) string {
	if len(csr.EmailAddresses) > 0 {
		return csr.EmailAddresses[0]
	}
	// Fallback: try CN if it looks like an email.
	cn := csr.Subject.CommonName
	if strings.Contains(cn, "@") {
		return cn
	}
	return ""
}
