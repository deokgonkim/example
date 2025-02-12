package models

type User struct {
	Id        	int64  `db:"id" json:"id"`
	Login  		string `db:"login" json:"login"`
	Password  	string `db:"password" json:"password"`
	Fullname 	string `db:"fullname" json:"fullname"`
	CreatedAt	string `db:"created_at" json:"created_at"`
	UpdatedAt	string `db:"updated_at" json:"updated_at"`
}
