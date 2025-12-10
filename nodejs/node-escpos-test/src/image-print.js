const { createCanvas, loadImage } = require('canvas');
const sharp = require('sharp');
const escpos = require('escpos');
// escpos.USB = require('escpos-usb');

function estimateTextHeight(text, font, fontSize) {
  const canvas = createCanvas(1, 1);
  const context = canvas.getContext('2d');
  context.font = `${fontSize}px ${font}`;
  const lines = text.split('\n');
  let totalHeight = 0;
  lines.forEach(line => {
    const metrics = context.measureText(line);
    totalHeight += metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
  });
  return totalHeight;
}

const fontPath = '/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc';
const fontSize = 36;
const textUtf8 = `안녕하세요\nThis is Deokgon Kim\nWhat is going on?\na\n`;
const tmpImage = './my-text.png';
const printWidth = 550;

const canvas = createCanvas(printWidth, estimateTextHeight(textUtf8, 'Noto Sans CJK', fontSize));
const context = canvas.getContext('2d');
context.fillStyle = '#ffffff';
context.fillRect(0, 0, canvas.width, canvas.height);
context.font = `${fontSize}px Noto Sans CJK`;
context.fillStyle = '#000000';
context.fillText(textUtf8, 5, fontSize);

const buffer = canvas.toBuffer('image/png');
sharp(buffer)
  .toFile(tmpImage)
  .then(() => {
    // const device = new escpos.USB(0x1fc9, 0x2016);
    const device = new escpos.Network('192.168.1.153');
    const printer = new escpos.Printer(device);

    escpos.Image.load(tmpImage, (image) => {
      device.open(() => {
        printer.image(image, 's8')
          .then(() => {
            printer.cut();
            printer.close();
          });
      });
    });

  })
  .catch(err => {
    console.error(err);
  });
