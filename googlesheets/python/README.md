# google sheets with python

## Install libraries

- Prepare virtual environment
    ```bash
    python3 -m venv venv
    source venv/bin/activate
    ```

- Install Google sdk
    ```bash
    pip install -r requirements.txt
    ```

## Examples

- first.py : not working version
- second.py : Read `Sheet1` from `GOOGLE_SHEET_KEY` (.env)
- third.py : Read `Sheet1` from `GOOGLE_SHEET_KEY` (.env), and create `Sheet2` and paste contents from `Sheet1`

## Retrieve `credentials.json` file from GCP

- Enable `Google Sheets API` from GCP Console `API and Services`
- Create `Service Account` from GCP Console `IAM > Service Accounts`
- Create `Key` for `Service Account` from GCP Console

## Grant service account to Access Google Sheets

- Open `Sharing` from Google Sheets that you want to use.
- Add `client_email` value from `credentials.json`

## Reference

- https://developers.google.com/sheets/api/quickstart/python
