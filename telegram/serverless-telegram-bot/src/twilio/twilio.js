const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require('twilio')(accountSid, authToken);

module.exports.sendMessage = async (from, to, message) => {
  return client.messages
    .create({
      body: message,
      from,
      to,
    })
    .then((message) => {
      console.log(message.sid);
      return message;
    });
};
