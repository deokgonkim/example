const qr = require('qr-image');
const fs = require('fs');
const sharp = require('sharp');

const qr_place_at_top = 550;
const qr_place_at_left = 200;
const qr_resize_to = 420;

const mergePng = async (qr, output_file) => {
    const bg = './data/bg.png';
    return sharp(bg).composite(
        [{
            input: qr,
            gravity: 'northwest',
            top: qr_place_at_top,
            left: qr_place_at_left
        }]
    ).toFile(output_file);
}
    
const main = async () => {
    const text = 'https://www.dgkim.net/';
    const qr_file = './data/qr-only.png';
    const merged_file = './data/result.png';
    const qr_image = qr.image(text, {
        type: 'png',
    });

    qr_image.pipe(fs.createWriteStream(qr_file)).on('finish', async () => {
        const qr_read = sharp(qr_file);
        const metadata = await qr_read.metadata();
        if (metadata?.width < qr_resize_to) {
            await qr_read.resize(qr_resize_to).toFile('./data/resized-qr.png');
            await mergePng('./data/resized-qr.png', merged_file)
        } else {
            await mergePng(qr_file, merged_file);
        }
    });
}

main().catch((err) => {
    console.error(err);
});
