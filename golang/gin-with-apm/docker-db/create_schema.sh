#!/bin/bash

mysql -h 127.0.0.1 -uroot -proot test_gin <<EOF
create table user (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    login VARCHAR(80) NOT NULL,
    fullname VARCHAR(80),
    password VARCHAR(80),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
EOF