import fs from 'fs';
import { createSimpleDocument, drawRectangle } from './document.js';

const main = async () => {
    const what = process.argv[2];
    const outputFile = process.argv[3];
    let createdDocument;
    switch (what) {
        case 'simple':
            createdDocument = await createSimpleDocument();
            break;
        case 'rectangle':
            createdDocument = await drawRectangle({
                rows: 1,
                columns: 1
            }, 4);
            break;
        default:
            throw new Error(`Unknown option: ${what}`);
    }
    fs.writeFileSync(outputFile, createdDocument);
}

main().catch(err => console.error(err));
