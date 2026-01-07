package main

import (
	"encoding/json"
	"errors"
	"log"
	"net/http"
	"os"
	"strconv"
	"strings"
	"sync"
	"time"
)

type Item struct {
	ID          int       `json:"id"`
	Name        string    `json:"name"`
	Description string    `json:"description,omitempty"`
	CreatedAt   time.Time `json:"created_at"`
}

type ItemInput struct {
	Name        string `json:"name"`
	Description string `json:"description"`
}

type ItemStore struct {
	mu     sync.Mutex
	nextID int
	items  map[int]Item
}

func NewItemStore() *ItemStore {
	return &ItemStore{
		nextID: 1,
		items:  make(map[int]Item),
	}
}

func (s *ItemStore) List() []Item {
	s.mu.Lock()
	defer s.mu.Unlock()

	items := make([]Item, 0, len(s.items))
	for _, item := range s.items {
		items = append(items, item)
	}
	return items
}

func (s *ItemStore) Get(id int) (Item, bool) {
	s.mu.Lock()
	defer s.mu.Unlock()

	item, ok := s.items[id]
	return item, ok
}

func (s *ItemStore) Create(input ItemInput) (Item, error) {
	if strings.TrimSpace(input.Name) == "" {
		return Item{}, errors.New("name is required")
	}

	s.mu.Lock()
	defer s.mu.Unlock()

	item := Item{
		ID:          s.nextID,
		Name:        input.Name,
		Description: input.Description,
		CreatedAt:   time.Now().UTC(),
	}
	s.items[item.ID] = item
	s.nextID++
	return item, nil
}

func (s *ItemStore) Update(id int, input ItemInput) (Item, error) {
	if strings.TrimSpace(input.Name) == "" {
		return Item{}, errors.New("name is required")
	}

	s.mu.Lock()
	defer s.mu.Unlock()

	item, ok := s.items[id]
	if !ok {
		return Item{}, errors.New("item not found")
	}
	item.Name = input.Name
	item.Description = input.Description
	s.items[id] = item
	return item, nil
}

func (s *ItemStore) Delete(id int) bool {
	s.mu.Lock()
	defer s.mu.Unlock()

	if _, ok := s.items[id]; !ok {
		return false
	}
	delete(s.items, id)
	return true
}

type Server struct {
	store *ItemStore
	mux   *http.ServeMux
}

func NewServer(store *ItemStore) *Server {
	s := &Server{store: store, mux: http.NewServeMux()}
	s.routes()
	return s
}

func (s *Server) routes() {
	s.mux.HandleFunc("/health", s.handleHealth)
	s.mux.HandleFunc("/items", s.handleItems)
	s.mux.HandleFunc("/items/", s.handleItemByID)
}

func (s *Server) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	s.mux.ServeHTTP(w, r)
}

func (s *Server) handleHealth(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		respondError(w, http.StatusMethodNotAllowed, "method not allowed")
		return
	}

	respondJSON(w, http.StatusOK, map[string]string{"status": "ok"})
}

func (s *Server) handleItems(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodGet:
		items := s.store.List()
		respondJSON(w, http.StatusOK, items)
	case http.MethodPost:
		var input ItemInput
		if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
			respondError(w, http.StatusBadRequest, "invalid JSON body")
			return
		}

		item, err := s.store.Create(input)
		if err != nil {
			respondError(w, http.StatusBadRequest, err.Error())
			return
		}

		respondJSON(w, http.StatusCreated, item)
	default:
		respondError(w, http.StatusMethodNotAllowed, "method not allowed")
	}
}

func (s *Server) handleItemByID(w http.ResponseWriter, r *http.Request) {
	id, err := parseID(r.URL.Path, "/items/")
	if err != nil {
		respondError(w, http.StatusBadRequest, "invalid item id")
		return
	}

	switch r.Method {
	case http.MethodGet:
		item, ok := s.store.Get(id)
		if !ok {
			respondError(w, http.StatusNotFound, "item not found")
			return
		}
		respondJSON(w, http.StatusOK, item)
	case http.MethodPut:
		var input ItemInput
		if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
			respondError(w, http.StatusBadRequest, "invalid JSON body")
			return
		}

		item, err := s.store.Update(id, input)
		if err != nil {
			status := http.StatusBadRequest
			if err.Error() == "item not found" {
				status = http.StatusNotFound
			}
			respondError(w, status, err.Error())
			return
		}
		respondJSON(w, http.StatusOK, item)
	case http.MethodDelete:
		deleted := s.store.Delete(id)
		if !deleted {
			respondError(w, http.StatusNotFound, "item not found")
			return
		}
		w.WriteHeader(http.StatusNoContent)
	default:
		respondError(w, http.StatusMethodNotAllowed, "method not allowed")
	}
}

func parseID(path, prefix string) (int, error) {
	idPart := strings.TrimPrefix(path, prefix)
	if idPart == "" || strings.Contains(idPart, "/") {
		return 0, errors.New("invalid id")
	}
	id, err := strconv.Atoi(idPart)
	if err != nil || id <= 0 {
		return 0, errors.New("invalid id")
	}
	return id, nil
}

func respondJSON(w http.ResponseWriter, status int, payload interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	if payload != nil {
		if err := json.NewEncoder(w).Encode(payload); err != nil {
			log.Printf("encode response failed: %v", err)
		}
	}
}

func respondError(w http.ResponseWriter, status int, message string) {
	respondJSON(w, status, map[string]string{"error": message})
}

func main() {
	store := NewItemStore()
	server := NewServer(store)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	addr := ":" + port
	log.Printf("listening on %s", addr)
	if err := http.ListenAndServe(addr, server); err != nil {
		log.Fatalf("server error: %v", err)
	}
}
