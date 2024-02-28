import os

from PIL import Image
import rembg


def process(session, image, size=None, bgcolor='white'):
    if size is not None:
        image = image.resize(size)
    else:
        size = image.size

    result = Image.new('RGB', size, bgcolor)
    out = rembg.remove(image, session=session)
    result.paste(out, mask=out)
    return result


input_path = os.path.join('.', 'data', 'hair_4.png')
output_path = os.path.join('.', 'data', 'hair_4_white.png')

session = rembg.new_session('u2netp')

with Image.open(input_path) as input_image:
    output_image = process(session, input_image)
    output_image.save(output_path)

