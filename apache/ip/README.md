# ip

Displays IP address of client. like whatismyip.com **but MUCH SIMPLER**

## Configure

```shell
a2enmod lua
```

Place `ip.lua` in `/var/www/html`

Place `ip.conf` in `/etc/apache2/conf-enabled`

Restart apache

```shell
systemctl restart apache2
```

