import { Client } from '@notionhq/client';

const notion = new Client({
    auth: process.env.NOTION_API_KEY
});

const main = async () => {
    const page = await notion.pages.retrieve({
        page_id: process.env.PAGE_ID || ''
    });
    console.log(JSON.stringify(page, null, 4));
}

main().catch(console.error);
