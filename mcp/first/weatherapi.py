import os
from pprint import pprint
import httpx

OPENWEATHERMAP_API_KEY = os.getenv("OPENWEATHERMAP_API_KEY")
print("OPENWEATHERMAP_API_KEY", OPENWEATHERMAP_API_KEY)

def get_forecast(latitude: float, longitude: float) -> str:
    """
    Get weather forecast from openweathermap API
    """

    # url = f"https://api.openweathermap.org/data/3.0/onecall?lat={latitude}&lon={longitude}&appid={OPENWEATHERMAP_API_KEY}"
    url = f'https://api.openweathermap.org/data/2.5/weather?lat={latitude}&lon={longitude}&appid={OPENWEATHERMAP_API_KEY}&units=metric'
    response = httpx.get(url)
    if response.status_code == 200:
        data = response.json()
        return data
    else:
        raise Exception(f"Error: {response.status_code} - {response.text}")

def main():
    latitude = 37.55853766922363
    longitude = 126.8382348679829
    forecast = get_forecast(latitude, longitude)
    pprint(forecast)

if __name__ == "__main__":
    main()
