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
    server.basePath: "/kibana"
    ```

## Fleet Server

- Access Kibana
- Menu : Management > Fleet
    - `Fleet Server Host`: https://YOURHOSTNAME:8220
    - `Generate Fleet Server policy`
- Copy Installation instruction
- run on `lxc exec fleet-server bash`
    ```bash
    curl -L -O https://artifacts.elastic.co/downloads/beats/elastic-agent/elastic-agent-8.4.1-linux-x86_64.tar.gz
    tar xzvf elastic-agent-8.4.1-linux-x86_64.tar.gz
    cd elastic-agent-8.4.1-linux-x86_64
    ./elastic-agent install -f \
    --url=https://YOURHOSTNAME:8220 \
    --fleet-server-es=https://YOURHOSTNAME:9200 \
    --fleet-server-service-token=AAEAAWVsYXN0aWMvZmxlZXQtc2VydmVyL3Rva2VuLTE2NjI1MTM3OTM1NzE6M2EyYkJObDRTc3llZ2RoTTA5Z2FYdw \
    --fleet-server-es-ca=/etc/ssl/certs/server-ca.pem \
    --certificate-authorities=/etc/ssl/certs/server-ca.pem \
    --fleet-server-cert=/etc/ssl/certs/server.crt \
    --fleet-server-cert-key=/etc/ssl/private/server.key
    ```

## apm server

- Access Kibana
- Menu : Management > Integration
    - Intall Elastic APM Integration
- Menu : Management > Fleet
    - Add agent
    - Select agent policy with APM Integration
    - Copy Installation instruction
    - run on `lxc exec apm-server bash`
        ```bash
        curl -L -O https://artifacts.elastic.co/downloads/beats/elastic-agent/elastic-agent-8.4.1-linux-x86_64.tar.gz
        tar xzvf elastic-agent-8.4.1-linux-x86_64.tar.gz
        cd elastic-agent-8.4.1-linux-x86_64
        sudo ./elastic-agent install --url=https://YOURHOSTNAME:8220 --enrollment-token=RXppUEZZTUJnalVGbGlOZGJtYk46NW4wN3AwZkRTZm1INnYwRVRuZjZFZw==
        ```
