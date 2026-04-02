package main

import (
	"flag"
	"log"
	"net/http"
)

func main() {
	addr := flag.String("addr", ":8080", "listen address")
	dataDir := flag.String("data", "data", "directory for CA keys and issued certs")
	flag.Parse()

	ca, err := LoadOrCreate(*dataDir)
	if err != nil {
		log.Fatalf("failed to initialize CA: %v", err)
	}
	log.Printf("CA ready (data dir: %s)", *dataDir)

	mux := http.NewServeMux()
	mux.HandleFunc("/ca-cert", ca.handleCACert)
	mux.HandleFunc("/sign", ca.handleSign)
	mux.HandleFunc("/certs", ca.handleListCerts)
	mux.Handle("/", http.FileServer(http.Dir("static")))

	log.Printf("listening on %s", *addr)
	if err := http.ListenAndServe(*addr, mux); err != nil {
		log.Fatalf("server error: %v", err)
	}
}
