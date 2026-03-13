# rmovie

Single-entrypoint Serverless app that reads a private Google Sheet through the Google Sheets API, picks a random row with a non-empty `url`, shows the `name` and `url`, then redirects after 2 seconds.

## Requirements

- Node.js 20+
- AWS credentials configured for Serverless deployment
- A Google service account with Google Sheets API access
- A Google Sheet shared with that service account

## Google Sheets format

Your sheet must contain at least these columns:

- `name`
- `url`

Rows with an empty `url` are skipped automatically.

## Google API setup

1. In Google Cloud, enable the Google Sheets API.
2. Create a service account.
3. Download the service account JSON key as `credentials.json` into the project root, or place it elsewhere and set `GOOGLE_CREDENTIALS_FILE`.
4. Share your Google Sheet with the service account email from that JSON file.
5. Copy your spreadsheet ID from the sheet URL:

```text
https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit
```

6. Set the range to the sheet tab or explicit range you want to read, such as `Sheet1` or `Sheet1!A:Z`.

## Install

```bash
npm install
```

## Deploy

Set the Google Sheets config and deploy:

```bash
export GOOGLE_CREDENTIALS_FILE="credentials.json"
export GOOGLE_SHEETS_SPREADSHEET_ID="your-spreadsheet-id"
export GOOGLE_SHEETS_RANGE="Sheet1"
npm run deploy
```

If you do not want to package a credentials file, you can inject the JSON directly:

```bash
export GOOGLE_SERVICE_ACCOUNT_JSON="$(cat credentials.json)"
export GOOGLE_SHEETS_SPREADSHEET_ID="your-spreadsheet-id"
export GOOGLE_SHEETS_RANGE="Sheet1"
npm run deploy
```

## Local invoke

```bash
export GOOGLE_CREDENTIALS_FILE="credentials.json"
export GOOGLE_SHEETS_SPREADSHEET_ID="your-spreadsheet-id"
export GOOGLE_SHEETS_RANGE="Sheet1"
npm run invoke:local
```

## Behavior

- `GET /` reads the Google Sheet through the Google Sheets API
- only the `name` and `url` columns are used
- rows without `url` are skipped
- a random valid row is selected
- the HTML page shows `name` and `url`
- the page redirects to the selected `url` after 2 seconds
- the page includes a `Stop` button to cancel the redirect
- the page includes a `Next` link that fetches another random row

## Notes

- `credentials.json` is ignored by Git in [.gitignore](/home/dgkim/git/example/serverless/rmovie/.gitignore)
- when deploying to AWS Lambda, the credentials file must be present in the packaged app or provided through `GOOGLE_SERVICE_ACCOUNT_JSON`
- the sheet does not need to be public

## Instruction

I want serverless project with single entrypoint.
If the user access the url, the server returns random url.
The random url should be chosen from google sheets.
Google sheets contains several columns and the 'name' and 'url' column should be used.
if the row has no value for 'url'. skip that url and choose next random row.
returning html page should display 'name' and 'url' column and redirect in 2 second.
and show the 'next' link to refresh and get next new url.
Create README.md and add this instruction at the end of it.
