import sys

import easyocr


reader = easyocr.Reader(['en', 'ko'])
# result = reader.readtext(sys.argv[1])
result = reader.readtext(sys.argv[1], detail=0)
print(result)

# for line in result:
#     print(line)
