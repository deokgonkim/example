require('dotenv').config();

const { google } = require('googleapis');

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

const OUTPUT_RANGE_NAME = 'Sheet3!A1:E5'

const jwt = new google.auth.JWT({
  scopes: SCOPES
})
jwt.fromJSON(require('./credentials.json'))

async function readSheet1() {
  const sheets = google.sheets({ version: 'v4', auth: jwt });
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: process.env.GOOGLE_SHEET_KEY,
    range: 'Sheet1!A1:E5',
  });
  const rows = res.data.values;
  if (!rows || rows.length === 0) {
    console.log('No data found.');
    return;
  }
  rows.forEach((row) => {
    // Print columns A and E, which correspond to indices 0 and 4.
    console.log(`${row[0]}, ${row[4]}`);
  });

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: process.env.GOOGLE_SHEET_KEY,
    resource: {
      requests: [{
        addSheet: {
          properties: {
            title: 'Sheet3'
          }
        }
      }]
    }
  })
  body = {
    values: [
      ...rows
    ]
  }
  await sheets.spreadsheets.values.update({
    spreadsheetId: process.env.GOOGLE_SHEET_KEY,
    range: OUTPUT_RANGE_NAME,
    valueInputOption: 'USER_ENTERED',
    resource: body
  })
}

readSheet1().catch(console.error);
