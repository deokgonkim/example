'use strict';

const fs = require('node:fs/promises');
const path = require('node:path');
const { google } = require('googleapis');
const { createHtml } = require('./page');

// column name is case-insensitive and whitespace-insensitive
const REQUIRED_COLUMNS = ['name', 'url'];

function normalizeHeader(value) {
  return String(value).trim().toLowerCase();
}

function rowsToObjects(rows) {
  if (rows.length === 0) {
    return [];
  }

  const header = rows[0].map(normalizeHeader);

  for (const column of REQUIRED_COLUMNS) {
    if (!header.includes(column)) {
      throw new Error(`Missing required column: ${column}`);
    }
  }

  return rows.slice(1).map((columns) => {
    const record = {};

    header.forEach((key, index) => {
      record[key] = String(columns[index] ?? '').trim();
    });

    return record;
  });
}

function pickRandom(items) {
  const randomIndex = Math.floor(Math.random() * items.length);
  return items[randomIndex];
}

function response(statusCode, body, contentType = 'text/plain; charset=utf-8') {
  return {
    statusCode,
    headers: {
      'content-type': contentType,
      'cache-control': 'no-store'
    },
    body
  };
}

async function loadGoogleCredentials() {
  const inlineCredentials = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;

  if (inlineCredentials) {
    return JSON.parse(inlineCredentials);
  }

  const credentialsFile = process.env.GOOGLE_CREDENTIALS_FILE || 'credentials.json';
  const absolutePath = path.resolve(process.cwd(), credentialsFile);
  const fileContents = await fs.readFile(absolutePath, 'utf8');
  return JSON.parse(fileContents);
}

async function fetchSheetRows() {
  const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
  const range = process.env.GOOGLE_SHEETS_RANGE || 'Sheet1';

  if (!spreadsheetId) {
    throw new Error('GOOGLE_SHEETS_SPREADSHEET_ID is not set');
  }

  const credentials = await loadGoogleCredentials();
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly']
  });
  const sheets = google.sheets({ version: 'v4', auth });

  const result = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range
  });
  const values = result.data.values || [];

  return rowsToObjects(values);
}

module.exports.main = async () => {
  try {
    const rows = await fetchSheetRows();
    const validRows = rows.filter((row) => row.url);

    if (validRows.length === 0) {
      return response(404, 'No rows with a valid url were found.');
    }

    const selected = pickRandom(validRows);
    return response(200, createHtml(selected), 'text/html; charset=utf-8');
  } catch (error) {
    return response(500, error.message);
  }
};
