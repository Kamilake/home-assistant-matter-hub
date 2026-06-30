# 플러그인 시스템

Home Assistant Matter Hub는 브리지에 추가 Matter 장치를 등록하는 플러그인을 지원합니다. 플러그인은 가상 장치를 제공하거나 서드파티 서비스를 통합할 수 있습니다.

## 플러그인 설치

### npm에서

1. HAMH 웹 UI에서 **Plugins** 페이지를 엽니다
2. npm 패키지 이름을 입력합니다(예: `hamh-plugin-example`)
3. **Install**을 클릭합니다
4. 플러그인을 로드하려면 브리지를 재시작합니다

### 로컬 `.tgz` 파일에서

API를 통해 패키지화된 플러그인을 업로드합니다:

```bash
curl -X POST http://localhost:8482/api/plugins/upload \
  -H "Content-Type: application/octet-stream" \
  --data-binary @hamh-plugin-example-1.0.0.tgz
```

### 로컬 폴더에서(개발)

로컬 플러그인 디렉터리를 연결합니다:

```bash
curl -X POST http://localhost:8482/api/plugins/install-local \
  -H "Content-Type: application/json" \
  -d '{"path": "/path/to/your/plugin"}'
```

이는 심볼링크를 생성하므로 플러그인 소스의 변경 사항이 브리지 재시작 시 적용됩니다. 로컬로 연결된 플러그인은 내부 `package.json` 의존성에 추가되지 않으며 심볼링크가 유지되는 것에 의존한다는 점에 유의하세요. 이 방법은 개발 전용입니다.

## 플러그인 작성

플러그인은 `MatterHubPlugin` 인터페이스를 구현하는 클래스를 내보내는 npm 패키지입니다.

### 최소 구조

```
my-plugin/
  package.json
  index.js
```

**package.json:**

```json
{
  "name": "hamh-plugin-my-plugin",
  "version": "1.0.0",
  "main": "index.js",
  "type": "module",
  "hamhPluginApiVersion": 1
}
```

`hamhPluginApiVersion` 필드는 플러그인이 대상으로 하는 플러그인 API 버전을 선언합니다. 이것이 현재 API 버전과 일치하지 않으면 HAMH는 경고를 기록합니다.

**index.js:**

```javascript
export default class MyPlugin {
  readonly name = "hamh-plugin-my-plugin";
  readonly version = "1.0.0";

  async onStart(context) {
    await context.registerDevice({
      id: "my-device-1",
      name: "My Device",
      deviceType: "temperature_sensor",
      clusters: [
        {
          clusterId: "temperatureMeasurement",
          attributes: { measuredValue: 2150 },
        },
      ],
    });
  }

  async onShutdown() {
    // Clean up timers, connections, etc.
  }
}
```

### 플러그인 수명 주기

| 훅 | 시점 | 목적 |
|------|------|---------|
| `onStart(context)` | 브리지 시작 | 장치 등록, 연결 설정 |
| `onConfigure()` | 모든 장치 등록 후 | 영속 상태 복원 |
| `onShutdown(reason?)` | 브리지 중지 | 리소스 정리 |
| `getConfigSchema()` | 요청 시 | 구성 UI 스키마 제공 |
| `onConfigChanged(config)` | 사용자가 구성 업데이트 | 새 구성 적용 |

### PluginContext API

`onStart`에 전달되는 `context` 객체는 다음을 제공합니다:

- **`registerDevice(device)`**, 브리지에 Matter 장치를 등록
- **`unregisterDevice(deviceId)`**, 이전에 등록된 장치 제거
- **`updateDeviceState(deviceId, clusterId, attributes)`**, 장치에 속성 업데이트 전송
- **`registerDomainMapping(mapping)`**, HA 도메인을 Matter 장치 유형에 매핑([도메인 매핑](#domain-mappings) 참조)
- **`storage`**, 영속 키-값 저장소(재시작 후에도 유지됨)
- **`log`**, 범위가 지정된 로거(`info`, `warn`, `error`, `debug`)
- **`bridgeId`**, 이 플러그인이 연결된 브리지의 ID

### 지원 장치 유형

| 키 | Matter 장치 |
|-----|--------------|
| `on_off_light` | On/Off Light (0x0100) |
| `dimmable_light` | Dimmable Light (0x0101) |
| `color_temperature_light` | Color Temperature Light (0x0102) |
| `extended_color_light` | Extended Color Light (0x010D) |
| `on_off_plugin_unit` | On/Off Plug-in Unit (0x010A) |
| `dimmable_plug_in_unit` | Dimmable Plug-in Unit (0x010B) |
| `temperature_sensor` | Temperature Sensor (0x0302) |
| `humidity_sensor` | Humidity Sensor (0x0307) |
| `pressure_sensor` | Pressure Sensor (0x0305) |
| `flow_sensor` | Flow Sensor (0x0306) |
| `light_sensor` | Light Sensor (0x0106) |
| `occupancy_sensor` | Occupancy Sensor (0x0107) |
| `contact_sensor` | Contact Sensor (0x0015) |
| `air_quality_sensor` | Air Quality Sensor (0x002C) |
| `thermostat` | Thermostat (0x0301) |
| `door_lock` | Door Lock (0x000A) |
| `fan` | Fan (0x002B) |
| `window_covering` | Window Covering (0x0202) |
| `generic_switch` | Generic Switch (0x000F) |
| `water_leak_detector` | Water Leak Detector (0x0043) |

### 사용자 지정 엔드포인트(고급)

필요한 장치 유형이나 클러스터가 위의 표에 없는 경우, 플러그인은 `deviceType` 대신 `endpointType`를 통해 자체 matter.js `EndpointType`을 제공할 수 있습니다. 이를 통해 HAMH 코어를 변경하지 않고도 사용자 지정 클러스터와 자체 명령 핸들러(`Behavior` 서브클래스)를 가진 것을 포함하여 모든 Matter 장치 유형을 노출할 수 있습니다.

```typescript
import { OnOffLightDevice } from "@matter/main/devices";

const MyDeviceType = OnOffLightDevice.with(MyCustomBehavior); // your Behavior with command handlers

await context.registerDevice({
  id: "my-device-1",
  name: "My Device",
  endpointType: MyDeviceType, // provide this OR deviceType, not both
  clusters: [], // optional initial attribute state
});
```

:::warning matter.js 인스턴스가 중요합니다
라이브 `EndpointType`은 백엔드가 실행하는 정확히 동일한 matter.js 인스턴스에서 온 경우에만 작동합니다. 백엔드는 `@matter/*`를 번들링하는 반면, 외부에서 설치된 플러그인은 별도 폴더에 존재하며 자체 사본을 해결하므로, 외부 패키지의 라이브 `endpointType`은 연결되지 않습니다. 따라서 라이브 matter.js 객체를 전달하는 플러그인은 내장(built-in)으로 제공됩니다(아래 참조). 외부 플러그인은 경계를 일반 데이터로 넘는 `deviceType` + 클러스터 데이터 흐름에 가장 적합합니다.
:::

### 내장 플러그인

일부 장치 유형은 라이브 matter.js `EndpointType`(사용자 지정 클러스터 및 명령 핸들러)이 필요하며, 이는 백엔드 번들 내부에서만 작동합니다. 이러한 것은 내장 플러그인으로 제공됩니다. 다른 플러그인처럼 Plugins 페이지에 표시되고 거기서 구성합니다. 설치할 것은 없습니다.

**Camera**는 Home Assistant 카메라를 Matter Camera(0x0142)로 노출합니다. Matter `WebRtcTransportProvider` 흐름을 구현하고 HA의 WebRTC를 브리지합니다. Plugins 페이지에서 구성하세요:

| 설정 | 설명 |
|---------|-------------|
| `haUrl` | Home Assistant URL, 예: `http://homeassistant.local:8123` |
| `haToken` | 장기 액세스 토큰 |
| `cameras` | 캴마 엔터티 ID, 쉼표로 구분 |

실험적: WebRTC 미디어 경로는 종단 간 검증되지 않았으며, 2026년 기준으로 SmartThings만 Matter 카메라를 렌더링합니다.

### 클러스터 ID

클러스터 ID로 Matter.js behavior 키 이름을 사용하세요. 일반적인 것들:

| 클러스터 ID | 설명 |
|-----------|------------|
| `onOff` | On/Off 상태 |
| `levelControl` | 밝기 레벨 |
| `colorControl` | 색상(색조/채도/온도) |
| `pressureMeasurement` | 압력(0.1 kPa 단위) |
| `flowMeasurement` | 유량(0.1 m³/h 단위) |
| `windowCovering` | 창 커버 위치 및 움직임 |
| `temperatureMeasurement` | 온도(0.01°C 단위) |
| `relativeHumidityMeasurement` | 상대 습도(0.01% 단위) |
| `booleanState` | 이진 상태(열림/닫힘) |
| `occupancySensing` | 재실 감지 |
| `fanControl` | 팬 속도 및 모드 |
| `doorLock` | 잠금 상태 |

### 컨트롤러 명령 처리

Matter 컨트롤러가 속성을 쓸 때(예: 조명을 콤), 장치의 `onAttributeWrite` 콜백이 호출됩니다:

```typescript
await context.registerDevice({
  id: "my-light",
  name: "My Light",
  deviceType: "on_off_light",
  clusters: [
    { clusterId: "onOff", attributes: { onOff: false } },
  ],
  onAttributeWrite: async (clusterId, attribute, value) => {
    if (clusterId === "onOff" && attribute === "onOff") {
      console.log(`Light turned ${value ? "on" : "off"}`);
      // Forward to your actual hardware/service
    }
  },
});
```

### 영속 저장소

재시작 후에도 데이터를 유지하려면 `context.storage`를 사용하세요:

```typescript
// Save
await context.storage.set("lastState", { temperature: 21.5 });

// Restore
const saved = await context.storage.get("lastState");
```

### 플러그인 구성 스키마

플러그인은 UI용으로 JSON 스키마 형태의 구성을 제공할 수 있습니다:

```typescript
getConfigSchema() {
  return {
    title: "My Plugin Config",
    properties: {
      pollingInterval: { type: "number", title: "Polling Interval (ms)" },
      apiKey: { type: "string", title: "API Key" },
    },
  };
}

async onConfigChanged(config) {
  this.pollingInterval = config.pollingInterval ?? 30000;
}
```

## 도메인 매핑

플러그인은 HAMH가 기본적으로 지원하지 않는 HA 엔터티 도메인을 처리하는 방법을 HAMH에 알리기 위해 도메인 매핑을 등록할 수 있습니다. `onStart` 중에 `context.registerDomainMapping()`을 호출하세요:

```javascript
async onStart(context) {
  // Map all "number" entities to dimmable lights
  context.registerDomainMapping({
    domain: "number",
    matterDeviceType: "dimmable_light",
  });
}
```

`matterDeviceType`은 [지원 장치 유형](#supported-device-types) 중 하나여야 합니다. 플러그인 도메인 매핑은 사용자가 구성한 재정의 이후에, 내장 도메인 테이블 이전에 확인되며, HAMH가 이미 처리하지 않는 도메인에만 적용됩니다.

여러 플러그인이 동일한 도메인을 등록하면 마지막 것이 적용됩니다(경고가 기록됨).

## 클라우드 제공자 / 장치 소스 플러그인

플러그인은 장치를 발견하고, 상태를 폴링하며, 컨트롤러 명령을 전달하여 외부 클라우드 서비스를 통합할 수 있습니다. 다음을 보여주는 완전한 작동 예제는 `examples/hamh-plugin-cloud-mock/`를 참조하세요:

- 외부 API로부터의 장치 발견
- 상태 변경에 대한 주기적 폴링
- Matter 컨트롤러 명령을 클라우드 API로 전달
- `context.storage`를 통한 API 토큰 안전 저장(절대 로그에 기록되지 않음)
- 폴링 간격 및 자격 증명에 대한 구성 스키마

프로덕션 플러그인을 만들려면 `MockCloudApi` 클래스를 실제 제공자의 SDK로 교체하세요.

## 오류 처리

플러그인은 안전 래퍼와 함께 프로세스 내에서 실행됩니다:

- **타임아웃**: 각 수명 주기 호출에는 10초 타임아웃이 있습니다
- **서킷 브레이커**: 3회 연속 실패 시 플러그인이 자동으로 비활성화됩니다
- **복구**: Plugins UI의 **Reset** 버튼을 사용하여 비활성화된 플러그인을 다시 활성화합니다
- **처리되지 않은 거부(rejection)**: 플러그인의 fire-and-forget 프로미스는 프로세스 수준에서 포착되어 HAMH를 크래시시키지 않고 기록됩니다

플러그인이 실패해도 브리지는 계속 실행됩니다. 다양한 실패 모드를 테스트하는 테스트 플러그인은 `examples/hamh-plugin-broken/`를 참조하세요.

## 문제 해결

| 문제 | 해결 |
|---------|----------|
| 설치 후 플러그인이 로드되지 않음 | 브리지를 재시작하세요. 플러그인은 시작 시 로드됩니다 |
| "Circuit breaker tripped" | 로그에서 오류를 확인하고 문제를 수정한 다음 Reset을 클릭하세요 |
| 컨트롤러에 장치가 나타나지 않음 | `deviceType`이 위의 지원 목록에 있는지 확인하세요 |
| 속성 업데이트가 무시됨 | `clusterId`가 behavior 키와 일치하는지 확인하세요(예: `OnOff`가 아닌 `onOff`) |
| 시작 시 플러그인 크래시 | `onStart`가 예외를 던지지 않는지 확인하고, 위험한 코드는 try/catch로 감싸세요 |

## API 레퍼런스

| 엔드포인트 | 메서드 | 설명 |
|----------|--------|-------------|
| `/api/plugins` | GET | 설치된 패키지와 브리지별 활성 플러그인 나열 |
| `/api/plugins/install` | POST | npm에서 설치(`{ packageName }`) |
| `/api/plugins/upload` | POST | 업로드한 `.tgz`에서 설치(바이너리 본문) |
| `/api/plugins/install-local` | POST | 로컬 폴더 연결(`{ path }`) |
| `/api/plugins/uninstall` | POST | 패키지 제거(`{ packageName }`) |
| `/api/plugins/:bridgeId/:pluginName/enable` | POST | 플러그인 활성화 |
| `/api/plugins/:bridgeId/:pluginName/disable` | POST | 플러그인 비활성화 |
| `/api/plugins/:bridgeId/:pluginName/reset` | POST | 서킷 브레이커 재설정 |
| `/api/plugins/:bridgeId/:pluginName/config-schema` | GET | 구성 스키마 조회 |
| `/api/plugins/:bridgeId/:pluginName/config` | POST | 구성 업데이트(`{ config }`) |
