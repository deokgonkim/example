package controllers

import (
	"log"
	"strconv"
	"gin-with-apm/models"
	"github.com/gin-gonic/gin"
	_ "github.com/go-sql-driver/mysql"
)

func GetUser(c *gin.Context) {
	var user []models.User
	_, err := dbmap.Select(&user, "select * from user")
	if err == nil {
		c.JSON(200, user)
	} else {
		log.Println(err)
		c.JSON(404, gin.H{"error": "user not found"})
	}
}

func GetUserDetail(c *gin.Context) {
	id := c.Params.ByName("id")
	var user models.User
	err := dbmap.SelectOne(&user, "SELECT * FROM user WHERE id=? LIMIT 1", id)
	if err == nil {
		user_id, _ := strconv.ParseInt(id, 0, 64)
		content := &models.User{
			Id:        	user_id,
			Login:  	user.Login,
			Password:  	user.Password,
			Fullname: 	user.Fullname,
		}
		c.JSON(200, content)
	} else {

		c.JSON(404, gin.H{"error": "user not found"})
	}
}
func Login(c *gin.Context) {
	var user models.User
	c.Bind(&user)
	err := dbmap.SelectOne(&user, "select * from user where login=? LIMIT 1", user.Login)
	if err == nil {
		user_id := user.Id
		content := &models.User{
			Id:        	user_id,
			Login:  	user.Login,
			Fullname:  	user.Fullname,
			Password: 	user.Password,
		}
		c.JSON(200, content)
	} else {
		c.JSON(404, gin.H{"error": "user not found"})
	}
}
func PostUser(c *gin.Context) {
	var user models.User
	c.Bind(&user)
	log.Println(user)
	if user.Login != "" && user.Password != "" && user.Fullname != "" {
		if insert, _ := dbmap.Exec(`INSERT INTO user (login, password, fullname) VALUES (?, ?, ?)`, user.Login, user.Password, user.Fullname); insert != nil {
			user_id, err := insert.LastInsertId()
			if err == nil {
				content := &models.User{
					Id:        	user_id,
					Login:  	user.Login,
					Password:  	user.Password,
					Fullname: 	user.Fullname,
				}
				c.JSON(201, content)
			} else {
				checkErr(err, "Insert failed")
			}
		}
	} else {
		c.JSON(400, gin.H{"error": "Fields are empty"})
	}
}
func UpdateUser(c *gin.Context) {
	id := c.Params.ByName("id")
	var user models.User
	err := dbmap.SelectOne(&user, "SELECT * FROM user WHERE id=?", id)
	if err == nil {
		var json models.User
		c.Bind(&json)
		user_id, _ := strconv.ParseInt(id, 0, 64)
		user := models.User{
			Id:        	user_id,
			Login:  	user.Login,
			Password:  	user.Password,
			Fullname: 	json.Fullname,
		}
		if user.Fullname != "" {
			_, err = dbmap.Update(&user)
			if err == nil {
				c.JSON(200, user)
			} else {
				checkErr(err, "Updated failed")
			}
		} else {
			c.JSON(400, gin.H{"error": "fields are empty"})
		}
	} else {
		c.JSON(404, gin.H{"error": "user not found"})
	}
}