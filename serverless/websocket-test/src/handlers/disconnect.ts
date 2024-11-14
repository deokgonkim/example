
export const handler = async (event) => {
    console.log('event', JSON.stringify(event, null, 4));
    return {
        statusCode: 200,
        body: JSON.stringify({
            message: 'disconnectHandler',
            event,
        }),
    };
};
