# youtube-video-export-devtools

YouTube 페이지에서 **브라우저 개발자도구(Console)** 를 이용해  
현재 화면에 로드된 영상 목록을 추출하는 스크립트입니다.

별도의 확장 프로그램 없이 **복붙만으로 사용 가능**합니다.

---

## ✨ Features

다음 정보를 추출합니다:

- channelName (채널명)
- channelUrl (채널 URL)
- title (영상 제목)
- url (영상 URL)
- videoId
- duration (영상 길이)
- viewCountText (조회수 텍스트)
- publishedText (업로드 시점 텍스트)
- thumbnailUrl
- collectedAt (수집 시각)

출력:

- JSON 다운로드
- CSV 다운로드
- console.table 출력

---

## 🚀 Usage

1. YouTube에서 원하는 페이지 열기  
   - 채널 → Videos 탭  
   - 검색 결과  
   - 홈 피드 등

2. 개발자 도구 열기  
   - Chrome / Edge: `F12`  
   - 또는 `Ctrl + Shift + I`

3. Console 탭 이동

4. `youtube-export.js` 내용을 복사해서 붙여넣기

5. 실행하면:
   - 자동 스크롤 진행
   - 데이터 수집
   - JSON / CSV 파일 다운로드

---

## 📂 Project Structure

```
├── README.md  
└── youtube-export.js
```

---

## ⚠️ Limitations

- **현재 DOM에 로드된 영상만 수집됩니다**
  - 스크롤 기반 lazy loading 구조 때문
- YouTube UI 변경 시 selector 수정 필요
- 정확한 숫자 데이터(조회수 정수값, 정확한 업로드 날짜 등)는 포함되지 않을 수 있음

---

## 🧠 How it works

1. 페이지를 끝까지 자동 스크롤
2. 영상 카드 DOM(`yt-lockup-view-model` 등) 수집
3. CSS selector 기반으로 데이터 추출
4. JSON / CSV로 변환 후 다운로드

---

## 📌 Supported Layouts

- 채널 Videos 탭
- 검색 결과
- 홈 피드
- 일부 플레이리스트

(YouTube UI 실험에 따라 일부 케이스는 동작하지 않을 수 있음)

---

## 📚 Reference

This script was created with assistance from **ChatGPT**,  
which analyzed YouTube DOM structures and selector patterns.

- DOM reverse-engineering via browser DevTools
- Selector design for both legacy and modern YouTube layouts
- Data extraction strategy (scroll + parse)

