from escpos.printer import Usb

def main():
    p = Usb(0x1fc9, 0x2016, 0)
    p.charcode(code='AUTO')
    p.text('Hello world\n')
    p.text('カタカナ\n')
    p.barcode('1324354657687', 'EAN13', 64, 2, '', '')
    p.qr('https://www.dgkim.net/')
    p.cut()


if __name__ == '__main__':
    main()
