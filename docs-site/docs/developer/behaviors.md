# Home Assistant Matter Hub의 Behaviors

## 개요
Behavior는 Matter 클러스터를 구현하고 Home Assistant 엔터티 상태/액션을 Matter 엔드포인트에 매핑하는 모듈형 컴포넌트입니다. 엔드포인트를 조합하고 그 기능을 정의하는 데 사용됩니다.

## Behavior의 동작 방식
- Behavior는 특정 Matter 클러스터(예: OnOff, Identify, LightLevelControl)의 로직을 캐슸화합니다.
- `@matter/main/devices`의 기기 타입에서 `.with()` 메서드를 사용하여 조합됩니다.
- 각 엔드포인트는 기기 타입과 behavior를 결합하여 빌드됩니다. 예를 들어:

```ts
const LightEndpointType = LightDevice.with(
  BasicInformationServer,
  IdentifyServer,
  HomeAssistantEntityBehavior,
  LightOnOffServer,
  LightLevelControlServer,
);
```

- `HomeAssistantEntityBehavior`는 Home Assistant와 Matter 클러스터 간의 상태와 액션을 동기화하는 핵심 behavior입니다.

## Behavior 구성
- Behavior는 옵션이나 콜백(예: 상태 getter/setter용)을 전달하여 구성됩니다.
- 예시:
```ts
const InputButtonOnOffServer = OnOffServer({
  isOn: () => false,
  turnOn: () => ({ action: "input_button.press" }),
  turnOff: null,
}).with(["Lighting"]);
```
- 새 기기 타입이나 클러스터를 위해 커스텀 behavior를 생성할 수 있습니다.

## Behavior 확장
- 새 behavior를 추가하려면 필요한 클러스터 로직을 구현하고 구성 옵션을 노출합니다.
- `.with()`를 사용하여 기기 타입과 조합합니다.

## 예시: 커스텀 Behavior 구현하기

아래는 코드베이스에서 실제로 사용되는 패턴을 따라 커스텀 OnOffServer behavior를 구현하는 방법에 대한 간단한 예시입니다.

```ts
import { OnOffServer } from "@matter/main/behaviors";

// Custom implementation for the OnOffServer behavior
export class CustomOnOffServer extends OnOffServer {
  
  override initialize() {
    // Init the behavior
    this.state.onOff = true;
  }

  override on() {
    // device was turned on via matter
  }
  
  override off() {
    // device was turned off via matter
  }
}

// Usage with a device type
const MockSwitchEndpointType = SwitchDevice.with(
  BasicInformationServer,
  IdentifyServer,
  CustomOnOffServer.with(["Lighting"]),
);
```

이 패턴은 어떤 클러스터나 기기 타입에도 적용할 수 있습니다.
