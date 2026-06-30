# 서비스 관리: AppEnvironment & BridgeEnvironment

## AppEnvironment
- 백엔드 애플리케이션의 루트 환경입니다.
- 전역 서비스(로깅, 스토리지, Home Assistant 클라이언트, 브리지 서비스 등)를 관리합니다.
- 시작 시 구성 옵션과 함께 인스턴스화됩니다.
- 예시:
```ts
const appEnvironment = await AppEnvironment.create(rootEnv, options);
```
- `load(ServiceClass)`를 통해 서비스에 접근할 수 있습니다.

## BridgeEnvironment
- 각 브리지 인스턴스를 위한 격리된 환경입니다.
- 브리지별 서비스(BridgeDataProvider, BridgeEndpointManager, BridgeRegistry 등)를 관리합니다.
- `BridgeEnvironment.create(parent, initialData)`를 통해 생성됩니다.
- 공유/전역 서비스를 위해 AppEnvironment에 의존합니다.
- 예시:
```ts
const bridgeEnv = await BridgeEnvironment.create(appEnvironment, bridgeData);
```

## 의존성 구조
- AppEnvironment는 모든 BridgeEnvironment의 부모/루트입니다.
- BridgeEnvironment는 AppEnvironment로부터 로깅, 스토리지, Home Assistant 클라이언트를 상속받습니다.
- 브리지별 서비스는 브리지마다 격리됩니다.

---

## 서비스 의존성 그래프

### AppEnvironment

- **LoggerService**: 다른 모든 서비스가 로깅을 위해 사용합니다.
- **AppStorage** → **BridgeStorage**: AppStorage는 영속 저장소를 제공하고, BridgeStorage는 브리지 구성을 관리합니다.
- **HomeAssistantClient**: Home Assistant와의 연결을 처리합니다.
- **HomeAssistantConfig**: HomeAssistantClient로부터 구성을 읽습니다.
- **HomeAssistantActions**: HomeAssistantClient를 사용하여 Home Assistant의 액션/서비스를 호출합니다.
- **HomeAssistantRegistry**: HomeAssistantClient를 사용하여 엔터티 상태를 추적합니다.
- **BridgeFactory**: Bridge 인스턴스를 생성합니다.
- **BridgeService**: 모든 브리지를 관리하며, BridgeStorage와 BridgeFactory에 의존합니다.
- **WebApi**: REST API를 노출하고 BridgeService와 상호작용합니다.

### BridgeEnvironment

- **BridgeDataProvider**: 브리지별 데이터/구성을 보유합니다.
- **BridgeRegistry**: HomeAssistantRegistry와 BridgeDataProvider를 사용하여 해당 브리지의 엔터티를 추적합니다.
- **BridgeEndpointManager**: HomeAssistantClient와 BridgeRegistry를 사용하여 엔드포인트/기기를 관리합니다.

---

## 데이터 및 액션 흐름

### 데이터 흐름
- HomeAssistantClient가 Home Assistant로부터 엔터티 상태를 수신합니다.
- HomeAssistantRegistry가 엔터티 상태를 추적하고 갱신합니다.
- BridgeService가 브리지 수명 주기를 관리하고 새로 고침을 조율합니다.
- BridgeStorage가 브리지 구성과 메타데이터를 영속화합니다.
- BridgeRegistry(브리지별)가 각 브리지에 관련된 엔터티를 필터링하고 관리합니다.
- BridgeEndpointManager(브리지별)가 BridgeRegistry와 엔터티 상태를 기반으로 엔드포인트/기기를 갱신합니다.


### 액션 흐름
- 액션(예: 켜기/끄기)은 behavior(예: OnOffServer)에 의해 시작됩니다.
- 이들은 HomeAssistantActions를 호출하고, 이는 HomeAssistantClient를 사용하여 Home Assistant 서비스를 호출합니다.
- BridgeService는 브리지와 엔드포인트에 대해 새로 고침이나 수명 주기 액션(시작, 중지, 재설정)을 트리거할 수 있습니다.
- WebApi는 외부 제어를 위한 엔드포인트를 노출하며, 이는 BridgeService를 호출하고 액션을 엔드포인트와 Home Assistant까지 전파합니다.
