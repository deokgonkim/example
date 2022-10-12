# nodejs cli prompt

CLI 상에서 사용자 입력을 받아 처리하는 프로그램 샘플

## 설치

```bash
npm ci
```

## 실행

```bash
node index.mjs
```

## 결과 예시

```
? Answer first question 1
? Answer second question 2
? list question choice1
? confirm Yes
{
    "ans1": "1",
    "ans2": "2",
    "listQuestion": "choice1",
    "confirm": true
}
```

## Reference

- https://www.npmjs.com/package/inquirer
