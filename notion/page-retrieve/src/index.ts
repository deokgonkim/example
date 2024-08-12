import { NotionApi } from './notionApi';


const main = async () => {
    const response = await NotionApi.getPage(process.env.PAGE_ID || '');
    console.log(JSON.stringify(response, null, 4));
}

main().catch(console.error);
