import os
from mcp.server.fastmcp import FastMCP
import weatherapi

mcp = FastMCP("FirstMCP")

@mcp.tool()
async def get_forecast(latitude: float, longitude: float) -> str:
    """
    Get weather forecast for a location
    
    Args:
        latitude (float): Latitude of the location
        longitude (float): Longitude of the location
    """
    forecast = weatherapi.get_forecast(latitude, longitude)
    return f"""
City: {forecast['name']}
Temperature: {forecast['main']['temp']}°C
Humidity: {forecast['main']['humidity']}%
Weather: {forecast['weather'][0]['description']}
Wind Speed: {forecast['wind']['speed']} m/s
Feels Like: {forecast['main']['feels_like']}°C
Visibility: {forecast['visibility']} m
"""

if __name__ == "__main__":
    mcp.run(transport='stdio')
