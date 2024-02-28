import os

from rembg import remove
from PIL import Image

image_path = os.path.join('.', 'data', 'hair_4.png')
output_path = os.path.join('.', 'data', 'hair_4_output.png')

image = Image.open(image_path)

output = remove(image)

output.save(output_path)

