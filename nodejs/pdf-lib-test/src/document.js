import fs from 'fs';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

import fontkit from '@pdf-lib/fontkit';


export const createSimpleDocument = async () => {
    const pdfDoc = await PDFDocument.create();

    // const defaultFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBytes = fs.readFileSync('./fonts/NotoSansKR-Regular.ttf');
    pdfDoc.registerFontkit(fontkit);
    const defaultFont = await pdfDoc.embedFont(fontBytes);

    const page = pdfDoc.addPage();

    const { width, height } = page.getSize();

    const fontSize = 30;
    page.drawText('Hello, this is 덕곤!', {
        x: 50,
        y: height - 4 * fontSize,
        size: fontSize,
        font: defaultFont,
        color: rgb(0, 0.53, 0.71),
    });

    const pdfBytes = await pdfDoc.save();

    return pdfBytes;
}
