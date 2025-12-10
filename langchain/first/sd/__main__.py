import os

# from langchain.llms import OpenAI
from langchain_community.llms import OpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain.agents import TextToImageAgent

# Define your OpenAI API key (replace with your own)
openai_api_key = os.getenv("OPENAI_API_KEY")

# Initialize OpenAI model
openai = OpenAI(api_key=openai_api_key)

# Define the LangChain prompt with user input capture
prompt = ChatPromptTemplate.from_messages([
    ('system', "Write a creative text description of: {{USER_INPUT}}")
])

# Create the TextToImageAgent using Stable Diffusion model
agent = TextToImageAgent(
    model_name="stabilityai/stable-diffusion-3-medium",
    prompt=prompt,
    llm=openai
)

# Get user input for the image description
user_input = input("Enter a description for the image: ")

# Generate the image using LangChain
generated_image = agent.run(USER_INPUT=user_input)

# Display or save the generated image (implementation depends on your library)
print(f"Image generation successful! You can now access the generated image data.")
# Replace with your preferred method to display or save the image (e.g., libraries like Pillow)
