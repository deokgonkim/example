import os

import numpy as np
from PIL import Image
import rembg


def get_gradient_2d(start, stop, width, height, is_horizontal):
    if is_horizontal:
        return np.tile(np.linspace(start, stop, width), (height, 1))
    else:
        return np.tile(np.linspace(start, stop, height), (width, 1)).T


def get_gradient_3d(width, height, start_list, stop_list, is_horizontal_list):
    result = np.zeros((height, width, len(start_list)), dtype=float)

    for i, (start, stop, is_horizontal) in enumerate(zip(start_list, stop_list, is_horizontal_list)):
        result[:, :, i] = get_gradient_2d(start, stop, width, height, is_horizontal)

    return result


def process(session, input_image, bg_image, size=None, bgcolor='white'):
    if size is not None:
        input_image = input_image.resize(size)
    else:
        size = input_image.size

    out = rembg.remove(input_image, session=session)
    bg_image.paste(out, mask=out)
    return bg_image


input_path = os.path.join('.', 'data', 'hair_4.png')
output_path = os.path.join('.', 'data', 'hair_4_gradient.png')

session = rembg.new_session('u2netp')

with Image.open(input_path) as input_image:
    print(input_image.size)
    array = get_gradient_3d(*input_image.size, (0, 0, 0), (255, 255, 255), (True, True, True))
    bg_image = Image.fromarray(np.uint8(array))

    output_image = process(session, input_image, bg_image)
    output_image.save(output_path)


