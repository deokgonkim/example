#!/bin/bash

if [ $# -lt 2 ]; then
    echo "사용법: $0 <파일패턴> <결과파일명> [지정해상도]"
    exit 1
fi

FILE_PATTERN=$1
OUTPUT_NAME=$2
SPECIFIED_WIDTH=$3

# 1. 파일 목록 확인 및 첫 번째 파일 추출
# 패턴에 공백이 있을 수 있으므로 ls 결과를 배열로 받거나 head로 처리
FIRST_FILE=$(ls -1 $FILE_PATTERN 2>/dev/null | head -n 1)

if [ -z "$FIRST_FILE" ]; then
    echo "오류: 패턴($FILE_PATTERN)에 맞는 파일을 찾을 수 없습니다."
    exit 1
fi

# 2. 해상도 결정
if [ -z "$SPECIFIED_WIDTH" ]; then
    # ffprobe 결과가 숫자로만 나오도록 확실히 필터링 (-v 0, -of csv=p=0)
    SCALE_WIDTH=$(ffprobe -v 0 -select_streams v:0 -show_entries stream=width -of csv=p=0 "$FIRST_FILE" | tr -d '\r\n ')
    
    # 만약 추출에 실패했을 경우를 대비한 방어 코드
    if ! [[ "$SCALE_WIDTH" =~ ^[0-9]+$ ]]; then
        echo "경고: 원본 해상도를 읽지 못했습니다. 기본값 640을 사용합니다."
        SCALE_WIDTH=640
    fi
    echo "원본 해상도 분석 결과: ${SCALE_WIDTH}px"
else
    SCALE_WIDTH=$SPECIFIED_WIDTH
    echo "지정 해상도 사용: ${SCALE_WIDTH}px"
fi

# 3. GIF 생성 (인자 주위에 따옴표를 확실히 둘러주세요)
echo "변환 중: $OUTPUT_NAME..."

#    -vf "scale=${SCALE_WIDTH}:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse" \
ffmpeg -v info -threads 1 -f image2 -pattern_type glob -i "$FILE_PATTERN" \
    -vf "scale=${SCALE_WIDTH}:-1:flags=lanczos,split[s0][s1];[s0]palettegen=stats_mode=single[p];[s1][p]paletteuse" \
    -y "$OUTPUT_NAME"

if [ $? -eq 0 ]; then
    echo "성공: $OUTPUT_NAME"
else
    echo "실패: ffmpeg 실행 중 에러가 발생했습니다."
fi
