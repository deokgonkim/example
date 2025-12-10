const escpos = require('escpos');
// escpos.USB = require('escpos-usb');

const main = async () => {
    // const device = new escpos.USB();
    const device = new escpos.Network('192.168.1.153');

    const options = {
        encoding: 'EUC-KR',
    }

    const printer = new escpos.Printer(device, options);

    device.open((error) => {
        printer
            .encode('EUC-KR')
            .font('a')
            .align('ct')
            .style('bu')
            .size(1, 1)
            .text('Hello World')
            .text('하이룽', "EUC-KR")
            .barcode('123456789012', 'EAN13')
            .qrimage('https://www.dgkim.net', function(error) {
                this.cut();
                this.close();
            });
    });
}

main().catch(console.error);
