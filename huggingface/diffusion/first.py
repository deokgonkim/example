import os
from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))

# stable diffusion
import torch
from diffusers import StableDiffusion3Pipeline

secret = os.getenv("HUGGINGFACE_ACCESS_TOKEN")

pipe = StableDiffusion3Pipeline.from_pretrained("stabilityai/stable-diffusion-3-medium-diffusers", torch_dtype=torch.float16, token=secret)
# pipe = pipe.to("cuda")

image = pipe(
    "A cat holding a sign that says hello world",
    negative_prompt="",
    num_inference_steps=28,
    guidance_scale=7.0,
    width=16,
    height=16
).images[0]
image.save("output.png")
