from locust import HttpUser, task, between
import random
import string
import time

def random_string(length=6):
    return ''.join(random.choices(string.ascii_lowercase, k=length))

def random_phone():
    # Indian mobile number (starts with 6-9)
    return str(random.randint(6, 9)) + ''.join(str(random.randint(0, 9)) for _ in range(9))

class RegisterUserLoadTest(HttpUser):
    wait_time = between(0.1, 0.5)   # realistic user wait time

    @task
    def register_user(self):
        ts = int(time.time() * 1000)
        email = f"user{ts}{random_string()}@gmail.com"
        phone = random_phone()

        payload = {
            "formData":{

            "name": "Load Test User",
            "email": email,
            "phone": phone,
            "password": "Testing123",
            "gender": "male"
            }

        }

        headers = {
            "Content-Type": "application/json"
        }

        with self.client.post(
            "/api/auth/registerUser",
            json=payload,
            headers=headers,
            catch_response=True
        ) as response:

            if response.status_code not in (200, 201):
                response.failure(
                    f"Failed: {response.status_code} | {response.text}"
                )
            else:
                response.success()
