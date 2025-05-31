import datetime
import os
from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))

# stable diffusion
import torch
from diffusers import StableDiffusionPipeline

secret = os.getenv("HUGGINGFACE_ACCESS_TOKEN")

pipe = StableDiffusionPipeline.from_pretrained(
    "runwayml/stable-diffusion-v1-5",
    torch_dtype=torch.float16,
    use_auth_token=secret
)
pipe = pipe.to("mps")  # M1 Pro에서 Metal GPU 사용

prompt = "A cat holding a sign that says hello world"

# warmup pass for MPS
pipe(prompt, num_inference_steps=1).images

image = pipe(
    prompt,
    negative_prompt="",
    num_inference_steps=25,
    guidance_scale=7.0,
    width=512,
    height=512
).images[0]

image.save(os.path.join('output', f'second-{datetime.datetime.now().isoformat()}.png'))

