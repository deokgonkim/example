import axios from 'axios';

const notionApi = axios.create({
    baseURL: 'https://api.notion.com/v1',
    headers: {
        'Authorization': `Bearer ${process.env.NOTION_API_KEY}`,
        'Notion-Version': '2022-06-28'
    }
});

export const NotionApi = {
    getPage: async (pageId: string) => {
        const response = await notionApi.get(`/pages/${pageId}`);
        return response.data;
    }
}
