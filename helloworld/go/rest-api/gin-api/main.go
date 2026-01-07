package main

import (
	"errors"
	"net/http"
	"os"
	"strconv"
	"strings"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
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

func parseID(value string) (int, error) {
	id, err := strconv.Atoi(value)
	if err != nil || id <= 0 {
		return 0, errors.New("invalid id")
	}
	return id, nil
}

func main() {
	store := NewItemStore()
	router := gin.Default()

	router.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok"})
	})

	router.GET("/items", func(c *gin.Context) {
		c.JSON(http.StatusOK, store.List())
	})

	router.POST("/items", func(c *gin.Context) {
		var input ItemInput
		if err := c.ShouldBindJSON(&input); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid JSON body"})
			return
		}
		item, err := store.Create(input)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusCreated, item)
	})

	router.GET("/items/:id", func(c *gin.Context) {
		id, err := parseID(c.Param("id"))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid item id"})
			return
		}
		item, ok := store.Get(id)
		if !ok {
			c.JSON(http.StatusNotFound, gin.H{"error": "item not found"})
			return
		}
		c.JSON(http.StatusOK, item)
	})

	router.PUT("/items/:id", func(c *gin.Context) {
		id, err := parseID(c.Param("id"))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid item id"})
			return
		}
		var input ItemInput
		if err := c.ShouldBindJSON(&input); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid JSON body"})
			return
		}
		item, err := store.Update(id, input)
		if err != nil {
			status := http.StatusBadRequest
			if err.Error() == "item not found" {
				status = http.StatusNotFound
			}
			c.JSON(status, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, item)
	})

	router.DELETE("/items/:id", func(c *gin.Context) {
		id, err := parseID(c.Param("id"))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid item id"})
			return
		}
		if !store.Delete(id) {
			c.JSON(http.StatusNotFound, gin.H{"error": "item not found"})
			return
		}
		c.Status(http.StatusNoContent)
	})

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	if err := router.Run(":" + port); err != nil {
		panic(err)
	}
}
