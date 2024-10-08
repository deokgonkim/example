import csv
import time
from reportlab.lib import colors
from reportlab.graphics.shapes import (Drawing, Rect, String, Line, Group)
from reportlab.pdfbase.pdfmetrics import registerFont
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas


# font_file = '/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc'
# ttc file is not supported by reportlab
font_file = './fonts/NotoSansKR.ttf' # downloaded from some github

# font
registerFont(TTFont("Times", font_file))

def card(fName, lName, width, height):
    drawing = Drawing(width, height)
    r1 = Rect(0, 0, width, height, 0, 0)
    r1.fillColor = colors.beige
    drawing.add(r1)

    wave = Group(
        Line(10, -5, 10, 10),
        Line(20, -15, 20, 20),
        Line(30, -5, 30, 10),
        Line(40, -15, 40, 20),
        Line(50, -5, 50, 10),
        Line(60, -15, 60, 20),
        Line(70, -5, 70, 10),
        Line(80, -15, 80, 20),
        Line(90, -5, 90, 10),
        String(25, -25, "Wave Audio", fontName='Times')
    )

    wave.translate(width*(10/400), height*(170/400))
    drawing.add(wave)

    name = Group(
        String(
            0,
            100,
            "%s %s" % (fName, lName),
            textAnchor='middle',
            fontName='Times',
            fontSize=18,
            fillColor=colors.black
        ),
        Line(
            -50,
            85,
            50,
            85,
            strokeColor=colors.grey,
            strokeLineCap=1,
            strokeWidth=2
        ),
        String(
            0,
            60,
            "Audio Specalist",
            textAnchor='middle',
            fontName='Times',
            fontSize=15,
            fillColor=colors.black
        )
    )
    name.translate(width*(290/400), 10)
    drawing.add(name)

    info = Group(
        String(
            0,
            30,
            "T: +447777777777",
            fontName='Times',
            fontSize=10,
            fillColor=colors.black
        ),
        String(
            0,
            20,
            "E: %s@audio.com" % fName.lower(),
            fontName='Times',
            fontSize=10,
            fillColor=colors.black
        ),
        String(
            0,
            10,
            "www.waveaudio.com",
            fontName='Times',
            fontSize=10,
            fillColor=colors.black
        )
    )
    info.translate(width*(20/400), 10)
    drawing.add(info)
    return drawing


pdf_file = 'output/namecards.pdf'
a4_width = 595.28
a4_height = 841.89
c = canvas.Canvas(pdf_file, pagesize=(595.28, 841.89))  # A4 size in points
# Card dimensions and positions
card_per_row = 2
row_per_page = 4
card_width = a4_width / card_per_row
card_height = a4_height / row_per_page
#positions = [(0, 0), (400, 0), (0, 200), (400, 200), (0, 400), (400, 400)]
positions = list()
for i in range(row_per_page):
    for j in range(card_per_row):
        positions.append((j*card_width, i*card_height))



# from https://docs.python.org/3/library/csv.html
t1 = time.time()
with open('names.csv', newline='') as csvfile:
    reader = csv.DictReader(csvfile)
    for idx, row in enumerate(reader):
        pos_idx = idx % (card_per_row * row_per_page)
        if pos_idx == 0 and idx != 0:
            c.showPage()  # Create a new page after every 6 cards
        d = card(row['First Name'], row['Last Name'], card_width, card_height)
        x, y = positions[pos_idx]
        d.drawOn(c, x, y)

c.save()

t2 = time.time()
print("That took %f s for %d cards" % ((t2-t1), (idx+1)))
