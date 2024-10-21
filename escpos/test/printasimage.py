#!/usr/bin/env python
# -*- coding: utf-8 -*-

from escpos.printer import Usb
from PIL import Image, ImageFont, ImageDraw, ImageColor

def estimate_text_height(text, font_path, font_size):
    # Load the font
    font = ImageFont.truetype(font_path, font_size)
    
    # Create a dummy image to get a drawing context
    dummy_image = Image.new('RGB', (1, 1))
    draw = ImageDraw.Draw(dummy_image)
    
    # Split the text into lines
    lines = text.split('\n')
    
    # Calculate the total height
    total_height = 0
    position_y = 0
    for line in lines:
        bbox = draw.textbbox((0, position_y), line, font=font)
        print(bbox)
        position_y = bbox[3]
        total_height = bbox[3]
    
    return total_height

p = Usb(0x1fc9, 0x2016, 0)

# Some variables
font_path = '/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc'
font_size = 36
font = ImageFont.truetype(font_path, font_size)

textUtf8 = u"""안녕하세요
This is Deokgon Kim
What is going on?
a
"""
tmpImage = './my-text.png'
printWidth = 550

im = Image.new('RGB', (printWidth, estimate_text_height(textUtf8, font_path, font_size)), '#ffffff')
draw = ImageDraw.Draw(im)
draw.text((5, 0), textUtf8, font=font, font_size=font_size, fill=ImageColor.getrgb('black'))
im.save(tmpImage)

# Print an image with your printer library
# p.set(align="right")
p.image(tmpImage)
p.cut()
