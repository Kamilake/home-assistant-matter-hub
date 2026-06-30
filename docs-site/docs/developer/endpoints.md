# 브리지의 엔드포인트 관리

각 브리지는 Home Assistant 엔터티를 나타내는 자식 엔드포인트를 노출합니다. 이 페이지에서는 이러한 엔드포인트가 어떻게 생성, 갱신, 해제되는지 설명합니다.

## 매핑 파이프라인

레거시 엔드포인트 팩토리는 `packages/backend/src/matter/endpoints/legacy/`에 있습니다. 이는 도메인별 디스패처를 통해 HA 엔터티 하나를 Matter 엔드포인트 하나에 매핑합니다.

```
HA entity
  → createLegacyEndpointType()        (entry point)
    → dispatches on HomeAssistantDomain
      → legacy/<domain>/index.ts      (per-domain builder)
        → Matter device type + behavior servers
          → .set({ homeAssistantEntity })
```

`createLegacyEndpointType()`는 엔터티의 `domain`을 읽고, 해당 도메인의 빌더 함수를 찾아 조합된 엔드포인트 타입을 반환합니다. 빌더는 어떤 Matter 기기 타입이 적합한지 결정한 뒤(예: HA의 `supported_color_modes`에 따라 `OnOffLight` 또는 `DimmableLight`), matter.js의 `.with(...)`를 사용하여 기기 타입에 behavior 서버를 조합합니다.

behavior 서버는 matter.js 클러스터 서버를 감싸고, 모든 레거시 엔드포인트가 공유하는 behavior인 `HomeAssistantEntityBehavior`를 통해 HA 엔터티로부터 값을 가져옵니다. 각 behavior 서버는 동일한 패턴을 따릅니다.

```ts
class MyServer extends Base {
  override async initialize() {
    await super.initialize();
    const ha = await this.agent.load(HomeAssistantEntityBehavior);
    this.update(ha.entity);
    this.reactTo(ha.onChange, this.update);
  }

  private update(entity: HomeAssistantEntityInformation) {
    // read entity.state / entity.state.attributes
    // write to this.state via applyPatchState()
  }
}
```

`applyPatchState`는 matter.js 상태 쓰기에 대한 프로젝트의 래퍼입니다. 실제로 변경된 필드만 쓰며, 종료 중에 발생하는 소수의 matter.js 수명 주기 오류(`DestroyedDependencyError`, 트랜잭션 충돌)를 삼킵니다.

## BridgeEndpointManager

`packages/backend/src/services/bridges/bridge-endpoint-manager.ts`는 루트 aggregator 엔드포인트와 그에 매달린 자식 엔드포인트 집합을 소유합니다.

책임:

- **엔드포인트 생성**: 필터링된 엔터티 목록(`BridgeRegistry.includedEntities`)으로부터 엔드포인트를 빌드하고 기기를 연결합니다.
- **새로 고침**: HA 레지스트리가 변경되면 누락된 엔드포인트를 생성하고, 제거된 것을 삭제하며, 매핑된 컴패니언 센서를 재연결합니다.
- **상태 갱신 전달**: HA로부터의 상태 갱신(`subscribeEntities`를 통해)을 각 엔드포인트의 `updateStates()`를 통해 matter.js로 전달합니다.
- **상태 버스트 직렬화**: HA가 50ms 안에 200개의 상태 갱신(재시작, 씬 활성화)을 발생시킬 때 matter.js가 한 번에 하나의 배치만 보도록 합니다. 매니저는 대기 중인 배치를 유지하고 연속된 호출을 압축합니다.
- **플러그인 엔드포인트 추적**을 별도로 수행합니다: 플러그인 클러스터 이벤트에 대한 리스너를 유지하여, 플러그인이 기기를 제거할 때 분리할 수 있도록 합니다.

`start-handler.ts`의 일반적인 호출 위치:

```ts
const manager = new BridgeEndpointManager(client, registry, mappingStorage, bridgeId, log);
manager.startObserving();
```

## HomeAssistantRegistry.enableAutoRefresh

`HomeAssistantRegistry`는 타이머(기본 60초)에 따라 HA의 entity / device / label / area 레지스트리를 폴링합니다. `enableAutoRefresh(callback)`는 인터벌을 연결하며, 콜백은 레지스트리 지문(fingerprint)이 실제로 변경되었을 때만 실행됩니다.

```ts
enableAutoRefresh = initBridges
  .then(() => registry$)
  .then((r) => r.enableAutoRefresh(() => bridgeService.refreshAll()));
```

콜백은 중복 실행을 방지합니다. 이전 틱이 아직 재시도 중이면(느린 HA, 재연결) 다음 틱은 쌓이지 않고 건너뜁니다.

## 엔드포인트 갱신 흐름

1. HA 엔터티 상태가 변경됩니다.
2. `subscribeEntities`가 배치 전달을 발생시킵니다.
3. `BridgeEndpointManager.updateStates(states)`가 호출됩니다.
4. 진행 중인 갱신이 없으면 `runUpdateStates`를 즉시 실행합니다. 실행 중인 것이 있으면 가장 최신 배치를 저장해 두었다가 실행 중인 호출이 완료될 때 가져가도록 합니다.
5. `runUpdateStates`는 배치를 레지스트리에 병합하고 모든 자식 엔드포인트에 `endpoint.updateStates(states)`를 병렬로 디스패치합니다.
6. 각 `LegacyEndpoint.updateStates`는 엔터티를 마지막으로 캐시된 상태(상태 문자열 및 속성에 대한 deep-equal 검사)와 비교하여 변경된 것이 없으면 조기에 반환합니다. 따라서 matter.js 클러스터 쓰기는 필요하지 않을 때 발생하지 않습니다.

## 전체 레지스트리 새로 고침 흐름

1. `HomeAssistantRegistry.enableAutoRefresh`에서 인터벌이 발생합니다.
2. `reload()`가 WS 타임아웃에 대해 `fetchRegistries()`를 최대 10회 재시도합니다.
3. 다섯 개의 HA 호출(`config/entity_registry/list`, `getStates`, `config/device_registry/list`, `config/label_registry/list`, `config/area_registry/list`)이 `sendHaMessage`를 통해 각각 30초 타임아웃으로 병렬 실행됩니다.
4. 레지스트리는 구조적 entity/device/state 메타데이터에 대해 MD5 지문을 계산합니다. 변경 없음 → 건너뜁니다.
5. 변경됨 → 레지스트리를 재구축하고 `onRefresh` 콜백을 호출하며, 이는 `BridgeService.refreshAll()` → 각 브리지의 `refreshDevices()`에 도달합니다.

## 새 도메인을 추가할 때 시작할 위치

1. `EndpointType`을 반환하는 빌더 함수와 함께 `packages/backend/src/matter/endpoints/legacy/<domain>/index.ts`를 생성합니다.
2. matter.js 기기 타입(`@matter/main/devices`)과 behavior 서버(`@matter/main/behaviors` 및 `packages/backend/src/matter/behaviors/`의 HAMH 로컬 behavior)를 선택합니다.
3. 도메인이 새 클러스터에 매핑되는 경우 `packages/common/src/clusters/index.ts`에 enum 항목을 추가합니다. `create-legacy-endpoint-type.test.ts`의 클러스터 검증 테스트는 HAMH 엔드포인트가 노출하는 모든 클러스터 ID가 해당 enum에 있는지 확인합니다.
4. 도메인을 `createLegacyEndpointType()`에 연결합니다.
5. `docs-site/docs/guides/controller-compatibility.md`에 컨트롤러 호환성 행을 추가합니다. 벤더 문서나 페어 테스트로 입증되기 전까지 모든 셀은 `❓`로 시작합니다.
