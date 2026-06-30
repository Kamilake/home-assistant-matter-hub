# Alexa 스마트홈 장치 일괄 삭제

HAASKA에서 마이그레이션한 후 또는 브리지를 재구성한 후처럼, Alexa에 오래되었거나 중복된 스마트홈 장치가 많은 경우
Alexa 앱에서 하나씩 삭제하는 것은 번거로울 수 있습니다. 이 가이드에서는 Amazon 웹 인터페이스와 브라우저 개발자
콘솔을 사용하는 더 빠른 방법을 설명합니다.

:::warning
이 작업은 Home Assistant Matter Hub에서 가져온 장치뿐만 아니라 Alexa 계정의 **모든** 스마트홈 장치를 삭제합니다.
삭제 후에는 "Alexa, discover devices"를 실행하여 활성화된 스킬과 브리지에서 장치를 다시 추가하세요.
:::

## 사전 준비

- 웹 브라우저(Chrome, Firefox, Edge 등)
- Amazon 계정에 로그인되어 있어야 합니다

## 단계

### 1. 지역별 Alexa API 엔드포인트 찾기

다음 URL 중 하나를 브라우저에서 열고 어느 것이 장치 목록을 JSON으로 반환하는지 확인하세요.

| 지역 | URL |
|--------|-----|
| 독일 | `https://alexa.amazon.de/api/behaviors/entities?skillId=amzn1.ask.1p.smarthome` |
| 미국 | `https://alexa.amazon.com/api/behaviors/entities?skillId=amzn1.ask.1p.smarthome` |
| 미국 (대체) | `https://layla.amazon.com/api/behaviors/entities?skillId=amzn1.ask.1p.smarthome` |
| 미국 (대체 2) | `https://pitangui.amazon.com/api/behaviors/entities?skillId=amzn1.ask.1p.smarthome` |
| 일본 | `https://alexa.amazon.co.jp/api/behaviors/entities?skillId=amzn1.ask.1p.smarthome` |
| 스페인 | `https://alexa.amazon.es/api/behaviors/entities?skillId=amzn1.ask.1p.smarthome` |

장치 정보가 담긴 JSON 응답이 표시되어야 합니다. 오류가 발생하면 다른 URL을 시도하거나 로그인되어 있는지
확인하세요.

### 2. 개발자 콘솔 열기

JSON 응답을 받은 동일한 페이지에서 브라우저 개발자 콘솔을 엽니다.

- **Chrome / Edge**: `F12` 또는 `Ctrl+Shift+J`(Windows/Linux) / `Cmd+Option+J`(macOS)를 누릅니다
- **Firefox**: `F12` 또는 `Ctrl+Shift+K`(Windows/Linux) / `Cmd+Option+K`(macOS)를 누릅니다

### 3. 삭제 스크립트 실행

다음 스크립트를 콘솔에 붙여넣고 Enter를 누릅니다.

```js
devices = await (await fetch('/nexus/v1/graphql', {
  method: 'POST',
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json"
  },
  body: JSON.stringify({
    query: `query {
      endpoints {
        items {
          friendlyName
          legacyAppliance { applianceId }
        }
      }
    }`
  })
})).json();

for (const device of devices.data.endpoints.items) {
  const res = await fetch(
    `/api/phoenix/appliance/${encodeURIComponent(device.legacyAppliance.applianceId)}`,
    {
      method: "DELETE",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json"
      }
    }
  );
  console.log(device.friendlyName, res.status);
}
```

콘솔에 각 장치 이름과 HTTP 상태 코드(`200` = 성공)가 기록됩니다.

### 4. 새로 고침 및 재검색

1. 페이지를 새로 고치면 장치 목록이 비어 있어야 합니다.
   장치가 여전히 남아 있다면 CSRF 문제일 수 있습니다. 로그아웃했다가 다시 로그인한 후 1단계부터 반복하세요.
2. **"Alexa, discover devices"**라고 말하여 활성화된 스킬과 Matter 브리지에서 장치를 다시 추가합니다.
3. 페이지를 다시 새로 고쳐 현재 장치만 표시되는지 확인합니다.

## 출처

이 방법은 원래 [rPraml](https://gist.github.com/rPraml/0b685bfaeb3a29a437c4a1f2cc3e23de)이 공유했으며
[backcountrymountains](https://github.com/RiDDiX/home-assistant-matter-hub/discussions/267)를 통해 알려졌습니다.
