from locust import HttpUser, between, task


class SimpleTestUser(HttpUser):

    wait_time = between(3, 15)

    @task
    def index(self):
        self.client.get('/')
