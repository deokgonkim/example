import os
from dotenv import load_dotenv
load_dotenv(os.path.join('..', '.env'))

from pyowm import OWM

# Load API key from environment variables
owm = OWM(os.getenv('OPENWEATHERMAP_API_KEY'))

# Get weather manager
mgr = owm.weather_manager()

# Get current weather
observation = mgr.weather_at_place('Seoul,KR')
weather = observation.weather

# Print weather information
print(f"Temperature: {weather.temperature('celsius')['temp']}°C")
print(f"Humidity: {weather.humidity}%")
print(f"Status: {weather.status}")
