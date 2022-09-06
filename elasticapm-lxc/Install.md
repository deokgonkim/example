# Elastic APM Installation

## Install Elasticsearch

- wget -qO - https://artifacts.elastic.co/GPG-KEY-elasticsearch | sudo gpg --dearmor -o /usr/share/keyrings/elasticsearch-keyring.gpg


- `lxc exec elasticsearch bash` to access container and run.
    ```bash
    wget -qO - https://artifacts.elastic.co/GPG-KEY-elasticsearch | sudo gpg --dearmor -o /usr/share/keyrings/elasticsearch-keyring.gpg
    apt-get install apt-transport-https
    echo "deb [signed-by=/usr/share/keyrings/elasticsearch-keyring.gpg] https://artifacts.elastic.co/packages/8.x/apt stable main" | tee /etc/apt/sources.list.d/elastic-8.x.list
    apt-get update && apt-get install elasticsearch
    ```
- get kibana_system user password
    ```bash
    /usr/share/elasticsearch/bin/elasticsearch-reset-password -u kibana_system --url https://YOURHOSTNAME:9200
    ```

## Install kibana

- https://www.elastic.co/guide/en/kibana/current/deb.html

- `lxc exec kibana bash`
    ```bash
    wget -qO - https://artifacts.elastic.co/GPG-KEY-elasticsearch | sudo gpg --dearmor -o /usr/share/keyrings/elasticsearch-keyring.gpg
    apt-get install apt-transport-https
    echo "deb [signed-by=/usr/share/keyrings/elasticsearch-keyring.gpg] https://artifacts.elastic.co/packages/8.x/apt stable main" | tee /etc/apt/sources.list.d/elastic-8.x.list
    apt-get update && apt-get install kibana
    ```
- edit /etc/kibana/kibana.yaml
    ```
    elasticsearch.hosts: ["https://YOURHOSTNAME:9200"]
    elasticsearch.username: "kibana_system"
    elasticsearch.password: "PASSWORDFROMABOVE"
    ```