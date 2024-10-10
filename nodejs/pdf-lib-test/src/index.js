import fs from 'fs';
import { createSimpleDocument } from './document.js';

const main = async () => {
    const createdDocument = await createSimpleDocument();
    fs.writeFileSync('./output/simple.pdf', createdDocument);
}

main().catch(err => console.error(err));
