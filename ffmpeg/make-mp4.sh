#!/bin/bash

# 사용법 안내
if [ $# -lt 2 ]; then
    echo "사용법: $0 <파일패턴> <결과파일명.mp4> [지정해상도] [FPS:기본24] [filename]"
    echo "예시 (원본크기, 24fps): $0 '2025-05*.jpg' output.mp4"
    echo "예시 (720px, 60fps): $0 '2025-05*.jpg' fast_high.mp4 720 60"
    echo "예시 (우하단 파일명 표시): $0 'jpg/*.jpg' output.mp4 1280 4 filename"
    exit 1
fi

FILE_PATTERN=$1
OUTPUT_NAME=$2
SPECIFIED_WIDTH=$3
FPS=${4:-24}  # 네 번째 인자가 없으면 기본값 24fps
OVERLAY_MODE=$5

# 1. 첫 번째 파일 찾기 및 해상도 추출
FIRST_FILE=$(find . -maxdepth 2 -type f -path "./${FILE_PATTERN}" | sort | head -n 1)
if [ -z "$FIRST_FILE" ]; then
    echo "오류: 패턴($FILE_PATTERN)에 맞는 파일을 찾을 수 없습니다."
    exit 1
fi

# ffprobe로 해상도 추출
if [ -z "$SPECIFIED_WIDTH" ]; then
    SCALE_WIDTH=$(ffprobe -v 0 -select_streams v:0 -show_entries stream=width -of csv=p=0 "$FIRST_FILE" | tr -d '\r\n ')
    # 해상도 추출 실패 시 기본값 설정
    [[ "$SCALE_WIDTH" =~ ^[0-9]+$ ]] || SCALE_WIDTH=1280
    echo "원본 해상도(${SCALE_WIDTH}px) 및 ${FPS} FPS로 작업을 시작합니다."
else
    SCALE_WIDTH=$SPECIFIED_WIDTH
    echo "지정 해상도(${SCALE_WIDTH}px) 및 ${FPS} FPS로 작업을 시작합니다."
fi

# 2. ffmpeg를 이용한 MP4 생성
# -framerate: 입력 이미지 시퀀스의 재생 속도 (초당 사진 장수)
# -vcodec libx264: 가장 범용적인 고효율 코덱
# -crf 20: 화질 (18~23 권장, 낮을수록 고화질/대용량)
# -pix_fmt yuv420p: 모든 기기(모바일/웹) 호환성 보장
# -vf scale: 지정된 너비에 맞춰 비율 유지 (홀수 방지 위해 "trunc(oh*a/2)*2" 적용)

VIDEO_FILTER="scale=${SCALE_WIDTH}:trunc(ow/a/2)*2"
EXPORT_PATH_METADATA=0

if [ "$OVERLAY_MODE" = "filename" ]; then
    EXPORT_PATH_METADATA=1
    VIDEO_FILTER="${VIDEO_FILTER},drawtext=font='DejaVu Sans':text='%{metadata\\:lavf.image2dec.source_basename\\:UNKNOWN}':x=w-tw-40:y=h-th-30:fontsize=max(24\\,h/28):fontcolor=white:box=1:boxcolor=black@0.55:boxborderw=12"
    echo "우하단에 파일명을 표시합니다."
fi

ffmpeg -v info -stats \
    -framerate "$FPS" \
    -export_path_metadata "$EXPORT_PATH_METADATA" \
    -f image2 -pattern_type glob -i "$FILE_PATTERN" \
    -vcodec libx264 \
    -crf 20 \
    -pix_fmt yuv420p \
    -vf "$VIDEO_FILTER" \
    -y "$OUTPUT_NAME"

if [ $? -eq 0 ]; then
    echo "성공: $OUTPUT_NAME 생성 완료"
else
    echo "오류: 변환에 실패했습니다. 파일 패턴에 따옴표를 썼는지 확인하세요. (예: \"*.jpg\")"
fi
