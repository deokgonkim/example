// main
import (
	"goapi/mappings"
	_ "github.com/go-sql-driver/mysql"
)

var Router *gin.Engine

var dbmap = initDb()

func initDb() *gorp.DbMap {
	db, err := sql.Open("mysql", "root:root@tcp(127.0.0.1:3306)/test_gin")
	checkErr(err, "sql.Open failed")
	dbmap := &gorp.DbMap{Db: db, Dialect: gorp.MySQLDialect{"InnoDB", "UTF8"}}
	err = dbmap.CreateTablesIfNotExists()
	checkErr(err, "Create tables failed")
	return dbmap
}

func checkErr(err error, msg string) {
	if err != nil {
		log.Fatalln(msg, err)
	}
}

func Cors() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Writer.Header().Add("Access-Control-Allow-Origin", "*")
		c.Next()
	}
}

func CreateUrlMappings() {
	Router = gin.Default()
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


func main() {
	mappings.CreateUrlMappings()
	// Listen and server on 0.0.0.0:8080
	mappings.Router.Run(":8080")
}