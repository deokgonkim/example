# https://stackoverflow.com/questions/71422304/how-to-print-greek-characters-with-python-escpos

from escpos.printer import Usb
from escpos.exceptions import USBNotFoundError
from escpos.magicencode import MagicEncode, Encoder
import requests


resp = requests.get('https://raw.githubusercontent.com/receipt-print-hq/escpos-printer-db/3612db407d02a08acd93a1540f2b4823be3f020e/dist/capabilities.json')
js = resp.json()
encodings = list(js['encodings'].keys())

for encoding in encodings:
    print(encoding)
    try:
        p = Usb(idVendor=0x1fc9, idProduct=0x2016, in_ep=0x82, out_ep=0x02)
        p.magic.force_encoding(encoding)
        p.text(encoding)
        p.text('ΚΑΛΗΜΕΡΑ \n')
        p.cut()
        p.close()
        
    except USBNotFoundError:
        print('printer not connected or on')

    except Exception as e:
        print(e)
