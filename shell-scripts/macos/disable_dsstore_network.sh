#!/usr/bin/env bash
#
# macOS 네트워크(WebDAV 포함)에서 .DS_Store 관리 스크립트
#
# 설명:
# - .DS_Store 는 Finder가 폴더별 보기 설정(아이콘 위치, 정렬, 보기 방식 등)을 저장하는 숨김 파일입니다.
# - 로컬 디스크에서는 있어도 보통 문제 없고, Finder 사용성이 좋아질 수 있습니다.
# - 하지만 WebDAV / NAS / SMB 같은 네트워크 폴더에서는 보통 "안 생기는 쪽"이 더 좋습니다.
#
# 이유:
# - 서버에 불필요한 숨김 파일이 쌓임
# - 동기화/백업 시 잡파일이 늘어남
# - 다른 운영체제에서 보기에 지저분함
# - 일부 서버에서는 권한/충돌 문제를 일으킬 수 있음
# - Finder가 폴더를 열 때마다 불필요한 네트워크 쓰기 발생 가능
#
#
# 사용 방법:
# - 아래 "실행 영역"에서 원하는 함수의 주석(#)을 해제하면 실행됨
# - 여러 개 동시에 실행도 가능
#

set -euo pipefail

#######################################
# macOS 여부 확인
#######################################
check_macos() {
  if [[ "$(uname -s)" != "Darwin" ]]; then
    echo "❌ 이 스크립트는 macOS 전용입니다."
    exit 1
  fi
}

#######################################
# 네트워크 드라이브에서 .DS_Store 생성 방지
#######################################
disable_dsstore_network() {
  echo "🔧 네트워크 드라이브에서 .DS_Store 생성 방지 설정 중..."
  defaults write com.apple.desktopservices DSDontWriteNetworkStores -bool true
  echo "✅ 설정 완료"
}

#######################################
# 네트워크 드라이브에서 .DS_Store 생성 허용 (되돌리기)
#######################################
enable_dsstore_network() {
  echo "🔧 네트워크 드라이브에서 .DS_Store 생성 허용 설정 중..."
  defaults write com.apple.desktopservices DSDontWriteNetworkStores -bool false
  echo "✅ 설정 완료"
}

#######################################
# Finder 재시작
#######################################
restart_finder() {
  echo "🔄 Finder 재시작 중..."
  killall Finder >/dev/null 2>&1 || true
  sleep 1
  echo "✅ Finder 재시작 완료"
}

#######################################
# 현재 설정 확인
#######################################
show_current_setting() {
  echo "📌 현재 설정:"
  defaults read com.apple.desktopservices DSDontWriteNetworkStores 2>/dev/null || echo "값 없음"
}

#######################################
# /Volumes 내 .DS_Store 삭제
#######################################
clean_dsstore_in_volumes() {
  echo "🧹 /Volumes 아래 .DS_Store 삭제 중..."
  find /Volumes -name ".DS_Store" -type f -print -delete 2>/dev/null || true
  echo "✅ 삭제 완료"
}

#######################################
# 안내 출력
#######################################
print_summary() {
  cat <<EOF

📘 정리:
- 로컬 디스크: .DS_Store 있음 → Finder 사용성 유지
- WebDAV/NAS/공유폴더: .DS_Store 없음 → 권장

EOF
}

#######################################
# 실행 영역 (여기서 선택)
#######################################

check_macos

# ↓↓↓ 원하는 작업만 주석 해제해서 사용 ↓↓↓

disable_dsstore_network
restart_finder

# enable_dsstore_network
# restart_finder

show_current_setting

# clean_dsstore_in_volumes

# print_summary
