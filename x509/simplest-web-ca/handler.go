package main

import (
	"encoding/json"
	"io"
	"net/http"
)

func (ca *CA) handleCACert(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}
	w.Header().Set("Content-Type", "application/x-pem-file")
	w.Header().Set("Content-Disposition", `attachment; filename="ca.crt"`)
	w.Write(ca.CACertPEM())
}

func (ca *CA) handleSign(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}

	body, err := io.ReadAll(io.LimitReader(r.Body, 64*1024))
	if err != nil || len(body) == 0 {
		http.Error(w, "failed to read request body", http.StatusBadRequest)
		return
	}

	certPEM, err := ca.SignCSR(body)
	if err != nil {
		http.Error(w, "sign error: "+err.Error(), http.StatusBadRequest)
		return
	}

	w.Header().Set("Content-Type", "application/x-pem-file")
	w.Write(certPEM)
}

func (ca *CA) handleListCerts(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}

	certs, err := ca.ListCerts()
	if err != nil {
		http.Error(w, "list error: "+err.Error(), http.StatusInternalServerError)
		return
	}
	if certs == nil {
		certs = []IssuedCert{}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(certs)
}
