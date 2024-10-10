import fs from 'fs';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

import fontkit from '@pdf-lib/fontkit';

const defaultFontPath = './fonts/NotoSansKR-Regular.ttf';

export const createPdfPage = async (withFont) => {
    const pdfDoc = await PDFDocument.create();

    // const defaultFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBytes = fs.readFileSync(withFont);
    pdfDoc.registerFontkit(fontkit);
    const defaultFont = await pdfDoc.embedFont(fontBytes);

    const page = pdfDoc.addPage();

    return { pdfDoc, page, defaultFont };
}


export const drawRectangle = async ({rows = 5, columns = 2}, pages = 1) => {
    let { pdfDoc, page } = await createPdfPage(defaultFontPath);

    const { width, height } = page.getSize();
    const marginPercent = 0.05;
    const margin = width * marginPercent;
    const rectWidth = (width - margin * 2) / columns;
    const rectHeight = (height - margin * 2) / rows;

    // const paddingPercent = 0.025;
    // const padding = width * paddingPercent;

    for (let pageNum = 0; pageNum < pages; pageNum++) {
        if (page == null) {
            page = pdfDoc.addPage();
        }
        for (let row = 0; row < rows; row++) {
            for (let column = 0; column < columns; column++) {
                page.drawRectangle({
                    x: margin + column * rectWidth,
                    y: margin + row * rectHeight,
                    width: rectWidth,
                    height: rectHeight,
                    borderColor: rgb(0, 0, 0),
                    borderWidth: 2,
                    color: rgb(0.75, 0.8, 0.9),
                });
            }
        }
        page = null;
    }

    // page.drawRectangle({
    //     x: 100,
    //     y: 300,
    //     width: 200,
    //     height: 100,
    //     borderColor: rgb(0, 0, 0),
    //     borderWidth: 2,
    //     color: rgb(0.75, 0.8, 0.9),
    // });

    const bytes = await pdfDoc.save();
    return bytes;
}


export const createSimpleDocument = async () => {
    const { pdfDoc, page, defaultFont } = await createPdfPage(defaultFontPath);

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
