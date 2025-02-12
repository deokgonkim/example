package mappings

import (
	"gin-with-apm/controllers"
	"github.com/gin-gonic/gin"

	"go.elastic.co/apm/module/apmgin/v2"
)

var Router *gin.Engine

func CreateUrlMappings() {
	Router = gin.Default()
	// Elastic APM
	Router.Use(apmgin.Middleware(Router))
	Router.Use(controllers.Cors())
	// v1 of the API
	v1 := Router.Group("/v1")
	{
		v1.GET("/users/:id", controllers.GetUserDetail)
		v1.GET("/users/", controllers.GetUser)
		v1.POST("/login/", controllers.Login)
		v1.PUT("/users/:id", controllers.UpdateUser)
		v1.POST("/users", controllers.PostUser)
	}
}