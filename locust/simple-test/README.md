# simple test

## Using docker-compose

- Run container
    ```bash
    docker-compose up --build
    ```

- Access locust console
    - http://localhost:8089

- If you want to run another script (default script is `locustfile.py`)
    - Open `docker-compose.yml`
    - edit `command` part

## If local python runtime environment is prepared

- Run locust locally
    ```bash
    locust -f helloworld.py
    ```
