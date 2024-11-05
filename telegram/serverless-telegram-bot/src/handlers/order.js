
/**
 * Dynamo DB on change event handler
 * @param {*} event
 * @param {*} context
 */
// eslint-disable-next-line no-unused-vars
const onOrderChange = (event, context) => {
    console.log('Order changed', event);
    return event;
}


module.exports = {
    onOrderChange,
}
