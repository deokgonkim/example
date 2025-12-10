
pip install pyinstaller


pyinstaller --onefile printasimage.py


pyinstaller --onefile --add-data "/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc;." printasimage.py

