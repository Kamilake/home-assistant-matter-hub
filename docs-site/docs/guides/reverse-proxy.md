# 리버스 프록시 사용

## WebSocket 지원

HAMH는 실시간 브리지 상태 업데이트와 실시간 진단 정보를 위해 WebSocket 연결을 사용합니다. 리버스 프록시는 반드시 WebSocket 업그레이드 요청을 전달해야 하며, 그렇지 않으면 UI가 실시간 업데이트를 받지 못합니다.

아래의 모든 nginx 예제에는 필요한 WebSocket 헤더가 포함되어 있습니다.

## 자체 도메인에서 실행

애플리케이션을 자체 도메인(예: `matter.example.org`)에서 실행하는 경우 특별한 구성이 필요하지 않습니다.
`nginx`의 경우 다음처럼 간단한 구성을 사용할 수 있습니다:

```nginx
location / {
    proxy_pass http://192.168.178.23:8482/;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
}
```

## 하위 경로에서 실행

애플리케이션을 하위 위치에서 실행하려면 해당 경로 아래에서 실행된다는 것을 애플리케이션에 알려야 합니다.
이를 수행하는 두 가지 방법이 있습니다:

## URL 재작성, 하위 경로 제외

URL에서 하위 경로가 제거되는 ingress 형태의 구성을 사용하는 경우, `x-ingress-path` 헤더를 추가하고 경로
값을 전달해야 합니다. 이는 Home Assistant가 내부적으로 수행하는 작업입니다.

> **신뢰에 관한 참고:** HAMH는 웹 UI의 URL을 재구성하기 위해 `x-ingress-path` 및 `x-forwarded-prefix` 헤더를 그대로 사용합니다. 앱에 직접 접근할 수 있다면(앞에 리버스 프록시가 없는 경우) 클라이언트가 이러한 헤더를 직접 설정할 수 있습니다. 이러한 헤더를 제거/덮어쓰는 신뢰할 수 있는 프록시 뒤에서 HAMH를 실행하거나, HAMH를 로컬 인터페이스에만 바인딩하고 프록시를 통해서만 노출하세요.

nginx의 경우 다음과 같습니다:

```nginx
location /hamh/ {
    # 끝에 슬래시(/)를 붙이는 것이 중요합니다.
    # 그렇지 않으면 nginx가 "hamh" 접두사를 제거하지 않습니다
    proxy_pass http://192.168.178.23:8482/;
    proxy_set_header x-ingress-path hamh;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
}
```

## URL 재작성 안 함, 경로 포함

프록시가 접두사를 제거하도록 구성할 수 없거나(또는 원하지 않는) 경우, 대신 `x-forwarded-prefix`를 설정하세요.

nginx의 경우 다음과 같습니다:

```nginx
location /hamh/ {
    # 끝의 슬래시가 없으면 nginx가 접두사를 제거하지 않도록 구성됩니다
    proxy_pass http://192.168.178.23:8482;
    proxy_set_header x-forwarded-prefix hamh;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
}
```
