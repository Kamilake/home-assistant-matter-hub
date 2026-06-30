# 개발자 문서

## 개요

Home Assistant Matter Hub (HAMH)는 Matter 브리지 역할을 하는 Home Assistant 애드온으로, 로컬 통신을 통해 Home Assistant 기기를 Matter 컨트롤러(Alexa, Apple Home, Google Home)에 노출합니다. 클라우드나 커스텀 스킬이 필요하지 않습니다.

이 문서는 프로젝트를 인계받거나 기여하려는 개발자를 위한 것입니다. 아키텍처, 기술, 핵심 개념을 다루며, 특히 Matter 프로토콜과 브리징 로직에 관련된 내용을 설명합니다.

---

## 문서 구조

- [Behaviors](./behaviors.md): behavior의 동작 방식, 설정, 확장 방법.
- [Service Management](./services.md): AppEnvironment, BridgeEnvironment, 그리고 서비스 의존성.
- [Endpoint Management](./endpoints.md): 브리지 엔드포인트가 관리되고 갱신되는 방식.

---

## 사용된 기술

- **TypeScript**: 백엔드, 프론트엔드, 공유 로직의 주요 언어.
- **Node.js**: 백엔드 서비스 및 CLI의 런타임.
- **Express**: 브리지 관리를 위한 REST API.
- **Vite**: 프론트엔드 빌드 도구.
- **React**: 프론트엔드 UI 프레임워크.
- **@matter/main, @matter/nodejs, @matter/general**: Matter 프로토콜과 기기 추상화를 구현하는 라이브러리.
- **home-assistant-js-websocket**: Home Assistant API와의 통합.
- **Ajv**: API 요청에 대한 JSON 스키마 검증.
- **Docker**: 배포를 위한 컨테이너화.

---

## 아키텍처

### 상위 수준 구조

- **Backend** (`packages/backend`): 브리지 로직, Matter 프로토콜, Home Assistant 통합을 구현하고 REST API를 노출합니다.
- **Frontend** (`packages/frontend`): 브리지와 기기를 관리하기 위한 UI.
- **Common** (`packages/common`): 공유 타입과 유틸리티.
- **Docs** (`packages/docs`): 문서와 가이드.

### 주요 백엔드 컴포넌트

- **BridgeService**: 브리지의 수명 주기를 관리합니다(생성, 갱신, 삭제, 시작, 중지, 새로 고침).
- **Bridge**: Matter 서버 노드와 aggregator를 포함하여 실행 중인 브리지 인스턴스를 나타냅니다.
- **BridgeFactory**: 브리지를 생성하기 위한 추상 팩토리.
- **BridgeStorage**: 브리지 구성과 메타데이터를 영속화합니다.
- **BridgeEndpointManager**: 브리지가 노출하는 엔드포인트/기기를 관리합니다.
- **HomeAssistantClient**: Home Assistant와의 연결 및 통신을 처리합니다.
- **HomeAssistantActions**: Home Assistant 서비스를 호출합니다(켜기/끄기 등).

---

## Matter 개념 및 라이브러리 사용법

### Matter Bridge

브리지는 여러 엔드포인트(기기)를 컨트롤러에 노출하는 Matter 노드입니다. HAMH에서 각 브리지는 Matter 서버 노드와 aggregator 엔드포인트로 뒷받침됩니다.

- **BridgeServerNode**: `@matter/main/node`의 `ServerNode` 하위 클래스. 브리지 메타데이터와 엔드포인트로 구성됩니다.
- **AggregatorEndpoint**: 노출된 모든 기기를 그룹화하는 루트 엔드포인트.
- **Endpoints**: 각 Home Assistant 엔터티는 Matter 엔드포인트(예: light, switch, sensor)에 매핑됩니다.

엔드포인트가 생성, 갱신, 동기화되는 방식에 대한 자세한 내용은 [Endpoint Management](./endpoints.md)를 참조하세요.

### Endpoints & Behaviors

엔드포인트는 `@matter/main/devices`의 기기 타입을 사용하여 생성되며 behavior와 결합됩니다.

- **BasicInformationServer**: 기기 메타데이터를 제공합니다.
- **IdentifyServer**: Matter identify 클러스터를 구현합니다.
- **HomeAssistantEntityBehavior**: Home Assistant 엔터티 상태/액션을 Matter 클러스터에 매핑합니다.
- **OnOffServer, LightLevelControlServer 등**: 특정 기기 클러스터(켜기/끄기, 디밍, 색상 등)를 구현합니다.

예시 (Dimmable Light):
```ts
export const DimmableLightType = Device.with(
  IdentifyServer,
  BasicInformationServer,
  HomeAssistantEntityBehavior,
  LightOnOffServer,
  LightLevelControlServer,
);
```

behavior의 동작 방식과 설정 방법에 대한 심층 설명은 [Behaviors](./behaviors.md)를 참조하세요.

### Server Node 구성

브리지 서버 노드는 `createBridgeServerConfig`를 사용하여 구성되며, 다음을 설정합니다.
- 노드 타입과 ID
- 네트워크 포트
- 제품/기기 메타데이터
- Aggregator 엔드포인트

### Bridge 수명 주기

- **Create**: BridgeService가 BridgeFactory를 통해 새 Bridge를 생성하고, BridgeStorage에 구성을 영속화합니다.
- **Start/Stop**: Bridge가 자체 Matter 서버 노드와 엔드포인트를 관리합니다.
- **Refresh**: BridgeEndpointManager가 Home Assistant로부터 기기 상태를 갱신합니다.
- **Factory Reset**: BridgeServerNode를 재설정하고 삭제할 수 있습니다.

---

## Home Assistant 통합

- **HomeAssistantClient**: 웹소켓을 통해 Home Assistant에 연결하고 연결을 유지합니다.
- **HomeAssistantActions**: Home Assistant 서비스를 호출합니다(예: `light.turn_on`).
- **Entity Mapping**: 각 Home Assistant 엔터티는 적절한 behavior와 함께 Matter 엔드포인트에 매핑됩니다.
- **State Sync**: BridgeEndpointManager가 엔터티 상태 변경을 구독하고 엔드포인트를 갱신합니다.

---

## REST API

백엔드는 브리지 관리, 엔터티 매핑, 진단, 백업 등을 위해 Express를 통한 REST API를 노출합니다. 엔드포인트의 전체 목록, 요청/응답 형식, WebSocket 메시지 타입은 [API Reference](../guides/api-reference.md)를 참조하세요.

---

## matter.js 업그레이드

`@matter/*` 패키지는 `packages/backend/package.json`에서 특정 버전으로 고정되어 있습니다. matter.js는 HAMH가 사용하는 내부 API(SessionManager, CaseServer, DeviceAdvertiser)에 대해 semver 안정성을 보장하지 않기 때문에 업그레이드에는 신중한 검증이 필요합니다.

### 업그레이드 체크리스트

1. 대상 버전에 대한 matter.js 변경 로그와 마이그레이션 가이드를 검토합니다.
2. HAMH가 사용하는 API에서 호환성을 깨는 변경 사항을 찾습니다.
   - `SessionManager` (세션 수명 주기, `subscriptionsChanged`, `sessions.added/deleted`)
   - `MutableEndpoint.with()` (behavior 조합)
   - `ServerNode` / `CommissioningServer` (브리지 수명 주기)
   - `MdnsService` / `DeviceAdvertiser` (mDNS 광고)
   - `@matter/main/devices`의 기기 타입 정의
3. 세 패키지를 함께 업데이트합니다: `@matter/general`, `@matter/main`, `@matter/nodejs`.
4. 전체 검증 시퀀스를 실행합니다.
   ```bash
   pnpm run lint
   pnpm run build
   pnpm run test
   ```
5. 최소한 하나의 컨트롤러(Apple Home, Google Home 또는 Alexa)로 페어링을 테스트합니다.
6. 복합 기기(온도 + 습도 + 압력 센서 그룹화)를 테스트합니다.
7. 서버 모드(vacuum 엔드포인트)를 테스트합니다.
8. forceSync 동작을 테스트합니다(`autoForceSync`를 활성화하고 변경된 상태가 푸시되는지 확인).
9. 세션 정리를 테스트합니다(동일한 피어에 대해 새 CASE 세션이 열릴 때 오래된 세션이 닫히는지 확인).
10. Docker 이미지를 빌드하고 올바르게 시작되는지 확인합니다.
    ```bash
    docker build -f apps/home-assistant-matter-hub/Dockerfile -t hamh-test .
    ```

### 알려진 내부 API 의존성

| HAMH 파일 | matter.js API | 목적 |
|---|---|---|
| `bridge.ts` | `SessionManager.sessions`, `.subscriptionsChanged` | 세션 진단 및 오래된 세션 정리 |
| `bridge.ts` | `DeviceAdvertiser.restartAdvertisement()` | 세션 정리 후 mDNS 재공지 |
| `bridge.ts` | `CommissioningServer.enterCommissionableMode()` | 멀티 어드민 커미셔닝 윈도우 |
| `create-legacy-endpoint-type.ts` | `MutableEndpoint.with()` | 모든 기기 타입에 대한 behavior 조합 |
| `bridge-server-node.ts` | `ServerNode` 하위 클래스 | 브리지 서버 수명 주기 |
| `mdns.ts` | `MdnsService` | mDNS 구성 |

---

## 개발 및 인계 노트

- **백엔드부터 시작**: BridgeService, Bridge, BridgeEndpointManager, HomeAssistantClient를 이해하세요.
- **Matter 개념**: `@matter` 라이브러리의 Matter 노드, 엔드포인트, aggregator, 클러스터 추상화에 익숙해지세요.
- **Entity mapping**: Home Assistant 엔터티가 엔드포인트와 behavior에 매핑되는 방식을 검토하세요.
- **Frontend**: UI는 React로 작성되었으며, REST API를 통해 백엔드와 통신합니다.
- **Docker**: 배포/테스트를 위해 제공된 Dockerfile을 사용하세요.
- **Testing**: 백엔드 로직을 위해 제공된 스크립트와 테스트 파일을 사용하세요.

---

## 추가 자료

- [Matter Protocol Specification](https://csa-iot.org/all-solutions/matter/)
- [Home Assistant Developer Docs](https://developers.home-assistant.io/)
- [HAMH User Documentation](https://riddix.github.io/home-assistant-matter-hub)

---

## 연락처 및 유지 관리자

이 프로젝트는 [riddix](https://github.com/riddix)가 유지 관리합니다. 질문이나 기여는 GitHub에서 이슈나 토론을 열어주세요.
