# 🧹 Xcode 용량 줄이는 폴더 정리 리스트

## 1️⃣ iOS DeviceSupport (디바이스 디버깅 파일)

📂 경로

`~/Library/Developer/Xcode/iOS DeviceSupport`

- 실제 iPhone 연결할 때 생성되는 디버깅 심볼
- iOS 버전마다 **2~6GB씩 쌓임**

✅ **전부 삭제 가능**  
필요하면 다시 생성됩니다.

---
## 2️⃣ DerivedData (빌드 캐시) ⭐ 가장 큰 용량

📂 경로

`~/Library/Developer/Xcode/DerivedData`

여기에는
- 빌드 캐시
- 인덱싱 데이터
- 중간 컴파일 파일

이 들어 있습니다.

용량:

- 보통 **10~30GB**

✅ **전부 삭제해도 안전**

`rm -rf ~/Library/Developer/Xcode/DerivedData`

삭제 후 처음 빌드할 때 **조금 느려질 수 있음**.

---
## 3️⃣ CoreSimulator (시뮬레이터 데이터)

📂 경로

`~/Library/Developer/CoreSimulator`

여기에는

- iOS 시뮬레이터
- 앱 데이터
- 로그

가 들어 있습니다.

용량:

- **10~40GB** 가능

삭제 방법:

### 시뮬레이터 캐시 삭제

`~/Library/Developer/CoreSimulator/Caches`

또는 **전체 삭제 가능**

`rm -rf ~/Library/Developer/CoreSimulator/Devices`

⚠️ 삭제하면

- 시뮬레이터 앱 데이터 초기화됨

---
## 4️⃣ Archives (옛날 빌드 아카이브)

📂 경로

`~/Library/Developer/Xcode/Archives`

여기에는

- TestFlight 업로드용 빌드
- 옛날 release 빌드

가 저장됩니다.

용량:

- 프로젝트 하나당 **100MB~1GB**

오래된 것 삭제하면 **몇 GB 절약**.

---
## 5️⃣ Xcode Documentation Cache

📂 경로

`~/Library/Developer/Shared/Documentation/DocSets`

용량:

- **1~5GB**

삭제해도  
Xcode가 다시 다운로드합니다.

---
# 💻 한 번에 정리하는 커맨드

개발자들이 자주 쓰는 정리 스크립트:

```
rm -rf ~/Library/Developer/Xcode/DerivedData
rm -rf ~/Library/Developer/Xcode/iOS\ DeviceSupport
rm -rf ~/Library/Developer/CoreSimulator/Caches
```

---
# 📊 실제 용량 줄어드는 예

정리 전

```
DerivedData           28GB
DeviceSupport         18GB
CoreSimulator         25GB
Archives               6GB
-----------------------------
Total                 77GB
```

정리 후

`15~25GB`

---
# 🔥 개발자들이 잘 모르는 **숨은 30GB 폴더**

이것도 Xcode 때문에 커지는 경우 많습니다.
`~/Library/Developer/CoreSimulator/Devices`
여기 하나로 **30GB 넘는 경우도 흔함**.

