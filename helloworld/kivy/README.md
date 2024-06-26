# kivy + pyinstaller

`kivy` is framework to create desktop application
`pyinstaller` is to make python application as executable file

## Install dependencies

```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

## Run kivy application

```bash
python app.py
```

## Prepare app for executable distribution

```bash
pyinstaller --onefile app.py
```

## Build application

```bash
pyinstaller app.spec
```
