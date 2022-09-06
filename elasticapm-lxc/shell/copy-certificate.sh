#!/bin/bash

## TODO 패스워드를 없애지 못하겠다.
## password는 아래 명령으로 찾을 수 있다.
## /usr/share/elasticsearch/bin/elasticsearch-keystore show xpack.security.http.ssl.keystore.secure_password
openssl pkcs12 -export \
-in /etc/letsencrypt/live/$(hostname)/fullchain.pem \
-inkey /etc/letsencrypt/live/$(hostname)/privkey.pem \
-out /etc/letsencrypt/live/$(hostname)/cert.p12

lxc file push /etc/letsencrypt/live/$(hostname)/cert.p12 elasticsearch/etc/elasticsearch/certs/http.p12
