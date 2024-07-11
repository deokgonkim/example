const { WebClient } = require("@slack/web-api");

// Initialize a Slack client with your bot token.
const token = process.env.SLACK_BOT_TOKEN;
const web = new WebClient(token);

console.log(token);

// Function to open a dialog in Slack
async function openDialog(triggerId) {
  const dialog = {
    trigger_id: triggerId,
    dialog: {
      callback_id: "submit-ticket",
      title: "Submit a Ticket",
      submit_label: "Submit",
      elements: [
        {
          type: "text",
          label: "Title",
          name: "title",
        },
        {
          type: "textarea",
          label: "Description",
          name: "description",
        },
      ],
    },
  };

  try {
    // Open the dialog by calling the dialog.open method
    const response = await web.dialog.open(dialog);
    console.log(response);
  } catch (error) {
    console.error(error);
  }
}

async function sendMessageToChannel(channelId, message) {
  try {
    // Call the chat.postMessage method using the WebClient
    const result = await web.chat.postMessage({
      channel: channelId,
      text: message,
      blocks: [
        {
          type: "section",
          text: {
            type: 'mrkdwn',
            text: message,
          },
        },
      ],
    });

    console.log(result);
  } catch (error) {
    console.error(error);
  }
}

module.exports = {
  openDialog,
  sendMessageToChannel,
};
