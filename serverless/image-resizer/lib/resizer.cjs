// import sharp from 'sharp';
const sharp = require('sharp');
const convert = require('heic-convert');

console.log('Sharp Version', sharp.versions);

/**
 * HEIC 파일을 JPG 파일로 변환하여 반환한다.
 * @param {Buffer} buf 
 * @returns
 */
const heicToJpg = async (buf) => {
    return convert({
        buffer: buf,
        format: 'JPEG',
        quality: 1
    })
}

/**
 * 이미지를 지정한 크기로 리사이즈 하여 반환한다.
 * @param {Buffer} buf 
 * @param {Number} size 
 * @returns 
 */
const resizeTo = async (buf, size) => {
    const image = sharp(buf);
    const metadata = await image.metadata();
    console.log(`width ${metadata.width} height ${metadata.height}`)
    if (metadata.width > metadata.height) {
        return image
            .resize({ height: size })
            .rotate() // https://github.com/lovell/sharp/issues/2297
            .toBuffer();
    } else {
        return image
            .resize({ width: size })
            .rotate() // https://github.com/lovell/sharp/issues/2297
            .toBuffer();
    }
}

module.exports = {
    heicToJpg,
    resizeTo
}
