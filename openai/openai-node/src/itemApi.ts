
const SHOP_API_ENDPOINT = process.env.SHOP_API_ENDPOINT;

const itemApi = {
    getAllItems: async () => {
        return fetch(`${SHOP_API_ENDPOINT}/items`).then(res => res.json());
    },

    getAllAvailableTimeSlots: async () => {
        return fetch(`${SHOP_API_ENDPOINT}/schedule/available_timeslots`).then(res => res.json());
    }
}

export default itemApi;
