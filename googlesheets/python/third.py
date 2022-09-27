
import os.path
import os

from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google.oauth2 import service_account
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

from dotenv import load_dotenv
load_dotenv('./.env')

# If modifying these scopes, delete the file token.json.
SCOPES = ['https://www.googleapis.com/auth/spreadsheets']

# The ID and range of a sample spreadsheet.
SAMPLE_SPREADSHEET_ID = os.environ.get('GOOGLE_SHEET_KEY')
SAMPLE_RANGE_NAME = 'Sheet1!A1:E5'
SERVICE_ACCOUNT_FILE = './credentials.json'

OUTPUT_RANGE_NAME = 'Sheet2!A1:E5'

def main():
    """Shows basic usage of the Sheets API.
    Prints values from a sample spreadsheet.
    """
    creds = service_account.Credentials.from_service_account_file(
        SERVICE_ACCOUNT_FILE, scopes=SCOPES)

    try:
        service = build('sheets', 'v4', credentials=creds)

        # Call the Sheets API
        sheet = service.spreadsheets()
        result = sheet.values().get(spreadsheetId=SAMPLE_SPREADSHEET_ID,
                                    range=SAMPLE_RANGE_NAME).execute()
        values = result.get('values', [])

        if not values:
            print('No data found.')
            return

        body = {
            'values': []
        }
        for row in values:
            # Print columns A and E, which correspond to indices 0 and 4.
            print('%s, %s' % (row[0], row[4]))
            body['values'].append(row)
        

        
        result = service.spreadsheets().batchUpdate(
            spreadsheetId=SAMPLE_SPREADSHEET_ID,
            body={
                'requests': [{
                    'addSheet': {
                        'properties': {
                            'title': 'Sheet2'
                        }
                    }
                }]
            }
        ).execute()
        print('create worksheet result', result)
        result = service.spreadsheets().values().update(
            spreadsheetId=SAMPLE_SPREADSHEET_ID, range=OUTPUT_RANGE_NAME,
            valueInputOption='USER_ENTERED', body=body).execute()
        print('update values result', result)
    except HttpError as err:
        print(err)


if __name__ == '__main__':
    main()
