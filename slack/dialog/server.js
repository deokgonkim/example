const express = require('express');
const bodyParser = require('body-parser');
const { openDialog, sendMessageToChannel } = require('./test');

const app = express();
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.post('/slack/actions', (req, res) => {
  const payload = JSON.parse(req.body.payload);
  console.log('received', payload);
  const triggerId = payload.trigger_id;

  if (payload.type == 'shortcut') {
    openDialog(triggerId).then((result) => {
        console.log('dialog opened', result);
    });
  } else if (payload.type == 'dialog_submission') {
    sendMessageToChannel("#general", `## Ticket submitted

- Title: ${payload.submission.title}
- Description: ${payload.submission.description}`);
  }

  // Respond to Slack to acknowledge the interaction
  res.status(200).send('');
});

app.get('/', (req, res) => {
    res.send('Your Express App is running');
});

app.listen(3000, () => {
  console.log('Server started on port 3000');
});
