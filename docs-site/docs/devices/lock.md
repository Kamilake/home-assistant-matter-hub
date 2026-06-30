# Lock

Home Assistant `lock` 엔티티는 가능한 경우 PIN 코드를 지원하는 Matter **DoorLock** 디바이스에 매핑됩니다.

## 기능

- **잠금(Lock)**, 항상 허용되며 PIN이 필요하지 않음
- **잠금 해제(Unlock)**, 자격 증명이 구성된 경우 PIN 필요
- **걸쇠 해제 / 빗장 해제(Unlatch / Unbolt)**, HA 엔티티가 `OPEN` feature를 지원할 때 사용 가능. `lock.open` 동작에 매핑됨. Apple Home에 "Unlatch" 버튼이 표시됨.

## 상태 매핑

| HA State | Matter Lock State |
|----------|------------------|
| `locked` / `locking` | Locked |
| `unlocked` / `unlocking` | Unlocked |
| `open` / `opening` | Unlatched |

## PIN 자격 증명

**Entity Mapping** UI를 통해 PIN 코드를 구성하여 Matter 컨트롤러에서 잠금 해제 시 코드를 요구할 수 있습니다.

### 설정

1. Dashboard에서 브리지로 이동합니다
2. 잠금 엔티티를 찾습니다
3. **Edit Mapping**을 클릭합니다
4. **PIN Credentials** 섹션에서 하나 이상의 PIN 코드를 추가합니다
5. 매핑을 저장합니다

PIN 자격 증명이 구성되면 컨트롤러는 잠금 해제 전에 코드를 요청합니다. PIN은 브리지에서 검증되며, 일치하는 코드만 HA에서 `lock.unlock` 동작을 트리거합니다.

### PIN 없는 잠금

잠금은 PIN 없이 항상 허용됩니다. 자격 증명이 구성된 경우 잠금 해제 동작에만 PIN 입력이 필요합니다.

### Apple Home 액세스 코드 프롬프트

PIN 지원이 있는 잠금을 커미셔닝한 후, Apple Home은 잠금 세부 정보를 처음 열 때 일회성 "Set Up an Access Code" 프롬프트를 표시할 수 있습니다. Apple Home과 브리지가 자격 증명에 대해 동일하게 인식하도록 HAMH에서 이 엔티티에 구성한 것과 동일한 PIN을 입력하세요. PIN 프롬프트를 전혀 원하지 않는 경우, 엔티티 매핑에서 `disableLockPin`을 설정하세요. 그러면 HAMH는 PinCredential feature 없이 잠금을 알리고 Apple Home은 액세스 코드 설정을 건너뜁니다.

## 걸쇠 해제 (Unbolting)

v2.0.25부터, HA 잠금 엔티티가 `OPEN` feature(`supported_features`에 보고됨)를 지원할 때 Unbolting 기능이 자동으로 활성화됩니다.

활성화되면:
- Apple Home에 Lock/Unlock과 함께 "Unlatch" 버튼이 표시됨
- Unlatch를 누르면 HA에서 `lock.open`이 호출됨
- 도어 오프너, 전기 스트라이크, 별도의 걸쇠 해제 기능이 있는 전동 잠금에 유용함

## 호환성

| Controller | Lock | Unlock | PIN Entry | Unlatch |
|------------|------|--------|-----------|---------|
| Apple Home | ✅ | ✅ | ✅ | ✅ |
| Google Home | ✅ | ⚠️ | ⚠️ | ❌ |
| Amazon Alexa | ✅ | ✅ | ⚠️ | ❌ |

> **Google Home**은 Matter 잠금에 대한 음성 잠금 해제를 비활성화했습니다(Google 정책). Google Home 앱을 통해서는 여전히 잠금을 해제할 수 있습니다.
>
> **PIN 입력** 지원은 컨트롤러에 따라 다릅니다. Apple Home이 가장 우수한 PIN 코드 지원을 제공합니다.

## 문제 해결

### 컨트롤러가 문을 잠금 해제하지 않음

1. PIN 자격 증명이 구성되어 있는지 확인하고, 구성되어 있다면 컨트롤러가 PIN 입력을 지원하는지 확인하세요
2. PIN 프롬프트가 나타나는지 확인하기 위해 (음성이 아닌) 컨트롤러 앱을 통해 잠금 해제를 시도하세요
3. Google Home은 정책상 Matter 잠금에 대한 음성 잠금 해제를 차단합니다

### Apple Home에 Unlatch 버튼이 표시되지 않음

1. HA 잠금 엔티티가 `OPEN` feature를 지원하는지 확인하세요 (Developer Tools → States에서 `supported_features` 확인)
2. Apple Home에서 디바이스를 제거하고 다시 추가하세요 (디바이스 기능이 변경됨)
3. v2.0.25 이상인지 확인하세요

### 잠금 상태가 업데이트되지 않음

Developer Tools에서 HA 잠금 엔티티가 상태를 올바르게 업데이트하는지 확인하세요. 일부 잠금 통합은 물리적 잠금 상태와 HA 상태 업데이트 사이에 지연이 있습니다. 브리지는 HA가 보고하는 상태를 그대로 반영합니다.
