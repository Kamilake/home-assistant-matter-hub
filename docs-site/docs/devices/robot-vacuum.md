# Robot Vacuum

로봇 청소기는 다음 기능을 갖춘 Matter **Robotic Vacuum Cleaner** 디바이스로 노출됩니다:

- **On/Off** - 청소 시작 및 정지
- **RVC Operational State** - 현재 상태 (idle, running, docked, error)
- **RVC Run Mode** - 방별 청소를 포함한 청소 모드
- **Service Area** - Apple Home용 방 선택(Matter 1.4), 다층 맵 지원
- **RVC Clean Mode** - 팬 속도 및 걸레 강도와 함께 청소 유형 선택 (Sweeping, Mopping 등)
- **Power Source** - 배터리 잔량 및 충전 상태 (사용 가능한 경우)
- **Identify** - Apple Home의 "Play Sound"가 `vacuum.locate`를 트리거하여 로봇을 찾음 (v2.0.27+)

## Server Mode (Apple Home 및 Alexa에 필요)

:::warning
**Apple Home과 Alexa는 브리지된 로봇 청소기를 제대로 지원하지 않습니다.** 청소기가 브리지의 일부가 아닌 **독립형 Matter 디바이스**로 나타나야 합니다.

청소기가 Apple Home에서 "Updating"으로 표시되거나, Siri 명령에 응답하지 않거나, Alexa에서 검색되지 않는 경우 **반드시** **Server Mode**를 사용해야 합니다.
:::

### Server Mode란?

Server Mode는 단일 디바이스를 브리지된 디바이스 대신 **독립형 Matter 디바이스**로 노출합니다. 이것이 필요한 이유는 다음과 같습니다:

- Apple Home은 브리지된 RVC에 대한 Siri 음성 명령을 지원하지 않음
- Alexa는 브리지된 RVC를 전혀 검색하지 않음
- 청소기가 Apple Home에서 "Updating" 또는 "Not Responding"으로 표시됨

### Server Mode 활성화 방법

1. Matter Hub 웹 인터페이스에서 **새 브리지를 생성**합니다
2. 브리지 생성 마법사에서 **"Server Mode" 체크박스를 활성화**합니다
3. 이 브리지에 **청소기를 추가**합니다 (노드에 단독으로 두는 것이 가장 좋음)
4. **새 브리지를 페어링**합니다 (Apple Home 또는 Alexa)
5. 다른 디바이스는 일반 브리지에 그대로 둡니다

:::note
Server Mode 노드는 최대 **10개의 디바이스**를 수용합니다. 첫 번째 엔티티가 기본 항목이며 노드 이름과 타입을 결정합니다. 노드당 둘 이상의 디바이스를 실행하는 것은 실험적이며, [Standalone Devices](../getting-started/standalone-devices.md)를 참조하세요. 청소기의 경우 여전히 노드에 단독으로 두는 것이 가장 좋습니다.
:::

### Server Mode 활성화 후

- 청소기가 (브리지되지 않은) 네이티브 Matter 디바이스로 나타납니다
- "Hey Siri, start the vacuum"과 같은 Siri 음성 명령이 작동합니다
- Alexa가 청소기를 검색하고 제어합니다
- Apple Home에서 Service Area를 통한 방 선택이 작동합니다

---

## 청소 모드

RVC Clean Mode 클러스터를 사용하면 청소 유형을 선택할 수 있습니다. 이는 Dreame 및 Ecovacs 청소기에 대해 자동으로 활성화되며, 다른 브랜드(Roborock 포함)에 대해서는 수동으로 구성할 수 있습니다.

### 지원되는 청소 모드

| Mode | Matter Tag | 설명 |
|------|-----------|-------------|
| Vacuum | Vacuum | 건식 흡입만 |
| Mop | Mop | 물걸레질만 |
| Vacuum & Mop | Vacuum + Mop | 흡입과 걸레질 동시 수행 |
| Vacuum Then Mop | DeepClean + Vacuum + Mop | 먼저 흡입 후 걸레질 (Apple Home에는 "Deep Clean"으로 표시됨) |

:::note
**대체 동작 (v2.0.26+):** 청소 모드 엔티티에 전용 "Vacuum Then Mop" 옵션이 없으면, HAMH는 자동으로 "Vacuum & Mop" 옵션으로 대체합니다. 따라서 청소 모드 엔티티에는 `vacuum`, `mop`, `vacuum_and_mop`만 있으면 됩니다.
:::

### 자동 감지 (Dreame, Ecovacs)

Dreame 청소기의 경우, 청소 모드 엔티티는 청소기 엔티티 ID에서 자동으로 도출됩니다:
- `vacuum.r2d2` → `select.r2d2_cleaning_mode`

Ecovacs의 경우, 청소 모드 엔티티는 이름 패턴(`*cleaning_mode*`)으로 자동 감지됩니다.

엔티티 이름이 다르지 않은 한 수동 구성이 필요하지 않습니다.

### 수동 구성 (Ecovacs, Roborock, 기타)

청소 모드 엔티티를 자동 감지할 수 없는 청소기의 경우 수동으로 구성해야 합니다:

1. **브리지 설정** → **Entity Mappings**로 이동합니다
2. **청소기 엔티티를 편집**합니다 (예: `vacuum.t20_omni`)
3. **Cleaning Mode Entity**를 청소 모드를 제어하는 select 엔티티로 설정합니다
4. 변경 사항은 약 30초 이내에 자동으로 적용됩니다

:::tip
올바른 select 엔티티를 찾으려면, Home Assistant에서 청소기 디바이스에 속하며 "Vacuum", "Mop", "Vacuum and mop" 등의 옵션이 있는 `select.*` 엔티티를 찾으세요. 이름은 브랜드와 언어에 따라 다릅니다.
:::

### 청소 모드 헬퍼 생성 (Roborock 및 기타)

일부 통합(특히 공식 Roborock 통합)은 **청소 모드 select 엔티티를 노출하지 않습니다**. 이것이 없으면 HAMH는 vacuum, mop, vacuum+mop 모드 간에 전환할 수 없습니다.

Home Assistant 헬퍼와 자동화를 사용하여 직접 만들 수 있습니다:

#### 1단계: Input Select 헬퍼 생성

**Settings → Devices & Services → Helpers → Create Helper → Dropdown**으로 이동하여 다음을 생성합니다:

- **Name:** Roborock Cleaning Mode Store
- **Entity ID:** `input_select.roborock_cleaning_mode_store`
- **Options:** `vacuum`, `mop`, `vacuum_and_mop`

#### 2단계: 템플릿 Select 엔티티 생성

Home Assistant `configuration.yaml`(또는 별도의 템플릿 파일)에 다음을 추가합니다:

```yaml
template:
  - select:
      - name: "Roborock Cleaning Mode"
        unique_id: roborock_cleaning_mode_hamh
        icon: mdi:robot-vacuum
        state: "{{ states('input_select.roborock_cleaning_mode_store') }}"
        availability: >
          {{ states('input_select.roborock_cleaning_mode_store') not in ['unknown','unavailable'] }}
        options: >
          {{ ['vacuum', 'mop', 'vacuum_and_mop'] }}
        select_option:
          - service: input_select.select_option
            target:
              entity_id: input_select.roborock_cleaning_mode_store
            data:
              option: "{{ option }}"
```

#### 3단계: 설정을 적용하는 자동화 생성

이 자동화는 청소 모드 저장소를 감시하고 모드가 변경될 때 올바른 팬 속도 및 걸레 강도 설정을 적용합니다:

```yaml
alias: "Roborock - Apply Cleaning Mode"
triggers:
  - entity_id: input_select.roborock_cleaning_mode_store
    trigger: state
actions:
  - choose:
      - conditions:
          - condition: state
            entity_id: input_select.roborock_cleaning_mode_store
            state: vacuum
        sequence:
          - action: vacuum.set_fan_speed
            target:
              entity_id: vacuum.roborock_s7_maxv
            data:
              fan_speed: balanced
          - action: select.select_option
            target:
              entity_id: select.roborock_s7_maxv_mop_intensity
            data:
              option: "off"
      - conditions:
          - condition: state
            entity_id: input_select.roborock_cleaning_mode_store
            state: mop
        sequence:
          - action: vacuum.set_fan_speed
            target:
              entity_id: vacuum.roborock_s7_maxv
            data:
              fan_speed: "off"
          - action: select.select_option
            target:
              entity_id: select.roborock_s7_maxv_mop_intensity
            data:
              option: mild
      - conditions:
          - condition: state
            entity_id: input_select.roborock_cleaning_mode_store
            state: vacuum_and_mop
        sequence:
          - action: vacuum.set_fan_speed
            target:
              entity_id: vacuum.roborock_s7_maxv
            data:
              fan_speed: balanced
          - action: select.select_option
            target:
              entity_id: select.roborock_s7_maxv_mop_intensity
            data:
              option: mild
```

:::note
`vacuum.roborock_s7_maxv` 및 `select.roborock_s7_maxv_mop_intensity`를 실제 엔티티 ID로 교체하세요. 팬 속도 및 걸레 강도 값을 청소기에서 사용 가능한 옵션에 맞게 조정하세요.
:::

#### 4단계: HAMH에서 구성

1. **Entity Mappings**로 이동 → 청소기를 편집합니다
2. **Cleaning Mode Entity**를 `select.roborock_cleaning_mode_hamh`(템플릿 select)로 설정합니다
3. **Mop Intensity Entity**를 `select.roborock_s7_maxv_mop_intensity`로 설정합니다

이 설정 후, Apple Home은 Vacuum, Mop, Vacuum & Mop, Deep Clean(Vacuum Then Mop)을 청소 모드로 표시합니다. 모드를 전환하면 자동화가 올바른 설정을 적용합니다.

---

## 흡입 레벨 / 팬 속도 (Apple Home Intensity 옵션)

청소기에 팬 속도 옵션이 있으면, HAMH는 Apple Home이 Vacuum 청소 유형 아래에 선택 가능한 옵션으로 표시하는 추가 intensity 모드를 생성합니다.

### 자동 감지

팬 속도 지원은 청소기의 `fan_speed_list` 속성에서 **자동으로 감지**됩니다. 수동 구성이 필요하지 않습니다.

### Apple Home 표시 제한 사항

Apple Home은 RVC 청소 모드에 대해 **3개의 intensity 구간**만 지원합니다: **Quiet**, **Automatic**, **Max**. HAMH는 모든 팬 속도에 대한 모드를 생성하지만 Apple Home은 intensity 태그당 하나의 옵션만 렌더링합니다:

| 팬 속도 | Apple Home 레이블 | Matter Tag |
|----------------|-----------------|------------|
| quiet, silent, gentle | Quiet | Quiet |
| balanced, standard, normal, auto | Automatic | Auto |
| turbo, strong, max | Max | Max |

어떤 태그 패턴과도 일치하지 않는 팬 속도(예: "off", "custom", "max_plus")는 Apple Home에서 숨겨지지만 다른 컨트롤러를 통해서는 여전히 작동합니다.

### 수동 재정의 (suctionLevelEntity)

청소기가 내장 팬 속도 대신 흡입 제어를 위해 별도의 `select.*` 엔티티를 사용하는 경우, Entity Mapping에서 `suctionLevelEntity`를 구성하세요.

---

## 걸레 강도 (Apple Home Intensity 옵션)

청소기에 걸레 강도 / 물 양 옵션이 있으면, HAMH는 Mop 청소 유형 아래에 걸레 강도 모드를 추가합니다.

### 자동 감지

걸레 강도 엔티티는 Dreame 및 Ecovacs 청소기에 대해 **자동으로 감지**됩니다. Roborock의 경우, `*mop_intensity*`, `*mop_pad_humidity*`, `*water_volume*`, 또는 `*water_amount*`와 일치하는 엔티티가 자동 감지됩니다.

### 수동 구성 (mopIntensityEntity)

1. **Entity Mappings**로 이동 → 청소기를 편집합니다
2. **Mop Intensity Entity**를 select 엔티티로 설정합니다 (예: `select.roborock_s7_maxv_mop_intensity`)
3. 변경 사항이 자동으로 적용됩니다

### Apple Home Intensity 레이블

Apple Home은 걸레 강도에 대해 팬 속도와 동일한 **Quiet / Automatic / Max** 레이블을 표시하며, 이는 Apple의 제한 사항입니다. 레이블은 HAMH가 아닌 Matter 모드 태그에서 가져옵니다. 내부적으로 라우팅은 올바릅니다:

| Apple Home 레이블 | 걸레 강도 동작 |
|-----------------|---------------------|
| Quiet | 걸레를 최저 강도로 설정 (예: "mild", "low") |
| Automatic | 걸레를 중간 강도로 설정 (예: "moderate", "medium") |
| Max | 걸레를 최고 강도로 설정 (예: "intense", "high") |

:::warning
**걸레 강도에는 청소 모드 엔티티가 필요합니다.** 청소 모드 엔티티가 구성되어 있지 않으면 HAMH는 청소기가 Mop 모드에 있는 시점을 판단할 수 없으며, 걸레 강도 옵션이 Apple Home에 나타나지 않습니다. 통합이 기본적으로 제공하지 않는 경우 위의 [청소 모드 헬퍼 생성](#creating-a-cleaning-mode-helper-roborock--others)을 참조하세요.
:::

### Matter 사양 제한 사항: Vacuum & Mop 모드

Matter 사양은 단일 `currentMode` 값만 허용합니다. "Vacuum & Mop" 모드에 있을 때 HAMH는 팬 속도와 걸레 강도를 동시에 표현할 수 없습니다. 기본 모드는 intensity 정보 없이 보고됩니다.

---

## 방 선택

방 선택은 여러 메커니즘을 통해 자동 우선순위와 함께 지원됩니다:

### 1. Home Assistant Area 매핑 (HA 2026.3+), 권장

Home Assistant 2026.3부터, **Clean Area** feature를 지원하는 청소기는 내부 세그먼트를 기존 HA 영역(area)에 매핑할 수 있습니다. 이 매핑이 HA에서 구성되면, HAMH는 방 청소에 자동으로 `vacuum.clean_area`를 사용하며 벤더별 구성이 필요하지 않습니다.

**작동 방식:**
1. 청소기 통합이 `CLEAN_AREA` 지원을 보고합니다 (supported_features 플래그 `16384`)
2. **Settings → Devices → [청소기] → Configure**에서 청소기 세그먼트를 HA 영역에 매핑합니다
3. HAMH가 매핑을 자동으로 감지하고 HA 영역에서 Matter Service Area를 생성합니다
4. 방 청소는 벤더별 명령 대신 표준 `vacuum.clean_area` 동작을 사용합니다

이는 사용 가능한 경우 **선호되는 방법**이며, `CLEAN_AREA`를 지원하는 모든 청소기 통합(현재 HA 2026.3+의 Ecovacs, Roborock, Matter 기반 청소기)에서 작동합니다.

:::note
`CLEAN_AREA` 매핑이 감지되면, 모든 벤더별 방 감지 방법(Valetudo 세그먼트, Roborock `get_maps`, Dreame 방 등)보다 우선합니다. 벤더별 방법은 `CLEAN_AREA`를 지원하지 않는 청소기에 대한 대체 수단으로 남아 있습니다.
:::

### 2. Service Area 클러스터 (Apple Home)

Apple Home은 방 선택에 Matter 1.4 **Service Area** 클러스터를 사용합니다. 이는 청소기가 방 데이터를 노출할 때(Clean Area 매핑, 벤더 속성, 또는 수동 구성을 통해) 자동으로 활성화됩니다. **Server Mode**가 필요합니다.

### 3. RVC Run Mode (Google Home, Alexa 등)

각 방에 대한 사용자 정의 청소 모드가 생성됩니다 (예: "Clean Kitchen", "Clean Living Room"). 이는 호환되는 컨트롤러에서 선택 가능한 모드로 나타납니다.

### 방 데이터 요구 사항 (벤더별 대체 수단)

`CLEAN_AREA`를 사용할 수 없는 경우, 방 선택은 엔티티 속성의 벤더별 방 데이터로 대체됩니다. 지원되는 형식:

```yaml
# Format 1: Direct object (Roborock)
rooms:
  "16": "Kitchen"
  "17": "Living Room"

# Format 2: Segments array
segments:
  - id: 1
    name: Kitchen
  - id: 2
    name: Living Room

# Format 3: Dreame nested format
rooms:
  "My Home":
    - id: 1
      name: Kitchen
    - id: 2
      name: Living Room
```

---

## 지원되는 통합

| Integration | Rooms | Cleaning Modes | Mop Intensity | 비고 |
|-------------|-------|----------------|---------------|-------|
| **Roborock (Official)** | CLEAN_AREA(HA 2026.3+) 또는 `roborock.get_maps`를 통한 자동 | 헬퍼를 통해 (위 참조) | `select.*_mop_intensity` | 구성 시 CLEAN_AREA 선호 |
| **Roborock (Xiaomi Miot)** | `rooms` 또는 `segments` 속성 | - | - | 네이티브 방 지원 |
| **Dreame** | `rooms` 속성 | 자동 감지 | 자동 감지 | 완전 자동 감지 |
| **Ecovacs** | CLEAN_AREA(HA 2026.3+) 또는 `rooms` 속성을 통한 자동 | `cleaningModeEntity`를 통해 | 자동 감지 | 구성 시 CLEAN_AREA 선호 |
| **Valetudo** | `segments` 속성 | 자동 감지 | - | v2.0.27부터 `mqtt.publish` segment_cleanup을 통한 네이티브 지원 ([#205](https://github.com/RiDDiX/home-assistant-matter-hub/issues/205)) |
| **Xiaomi** | `rooms` 속성 | - | - | 커스텀 통합이 필요할 수 있음 |
| **iRobot Roomba** | - | - | - | 기본 시작/정지, `batteryEntity` 매핑 사용 |

### Roborock (공식 통합)

v2.0.25부터, HAMH는 `roborock.get_maps` 서비스 호출을 통해 **Roborock 방을 자동으로 감지**합니다. 수동 버튼 엔티티 매핑이 필요하지 않습니다.

시작 로그에 다음이 표시됩니다: `Auto-detected X Roborock rooms`

**자동 감지되지 않는 것:** Roborock 통합은 청소 모드 엔티티를 노출하지 않습니다. vacuum/mop/vacuum+mop 모드 전환을 원하는 경우, [청소 모드 헬퍼 생성](#creating-a-cleaning-mode-helper-roborock--others)에 설명된 대로 헬퍼 엔티티를 생성하세요.

#### 대체 수단: 수동 버튼 엔티티 매핑

자동 감지가 작동하지 않는 경우(예: 구형 Roborock 펌웨어), 버튼 엔티티를 사용할 수 있습니다:

1. **Entity Mappings**를 열고 → 청소기를 편집합니다
2. **Room Button Entities**에서 각 방에 대한 버튼 엔티티를 선택합니다
3. UI는 동일한 디바이스의 버튼 엔티티를 자동으로 검색합니다

:::tip
Roborock 앱에서 **다중 방 씬(scene)**을 생성하고 결합된 방 청소를 위해 해당 버튼 엔티티를 매핑할 수도 있습니다.
:::

---

## Entity Mapping 참조

| Option | 설명 | 사용 시점 |
|--------|-------------|-------------|
| `cleaningModeEntity` | vacuum/mop/vacuum+mop 전환용 select 엔티티 | 청소 모드 제어를 원하는 경우 항상 |
| `suctionLevelEntity` | 흡입 / 팬 속도용 select 엔티티 | 청소기가 `fan_speed_list`를 노출하지 않는 경우에만 |
| `mopIntensityEntity` | 걸레 강도 / 물 양용 select 엔티티 | 걸레 제어를 원하는 경우 |
| `batteryEntity` | 배터리 잔량용 센서 엔티티 | 자동 감지됨; 자동 감지 실패 시 재정의 |
| `roomEntities` | 방 청소용 버튼 엔티티 ID 배열 | `roborock.get_maps`와 방 속성이 실패하는 경우에만 |
| `customServiceAreas` | 일반 로봇용 커스텀 방/구역 정의 | 청소기에 네이티브 방 지원이 없는 경우 ([#177](https://github.com/RiDDiX/home-assistant-matter-hub/issues/177)) |

---

## Valetudo 지원

v2.0.27부터, HAMH는 **네이티브 Valetudo 지원**을 제공합니다. Valetudo 기반 청소기(Dreame, Valetudo를 통한 Roborock)는 자동 감지되며 방 청소는 `vacuum.send_command` 대신 `segment_cleanup`과 함께 `mqtt.publish`를 사용합니다.

### 작동 방식

1. HAMH는 Valetudo select 엔티티(예: `select.*_fan_speed`, `select.*_water_grade`)를 자동으로 감지합니다
2. 방 세그먼트는 청소기 엔티티의 `segments` 속성에서 읽습니다
3. 방 청소 명령은 HA 엔티티 타겟팅 문제를 피하기 위해 `mqtt.publish`를 통해 전송됩니다
4. 수동 구성이 필요하지 않으며, Valetudo 청소기를 Server Mode 브리지에 추가하기만 하면 됩니다

### 요구 사항

- MQTT 자동 검색이 활성화된 Valetudo 펌웨어
- Home Assistant MQTT 통합 구성
- 청소기 엔티티가 방 데이터와 함께 `segments` 속성을 노출함

---

## 커스텀 Service Area

v2.0.27부터, 네이티브 방 데이터를 노출하지 않는 일반 구역 기반 로봇을 위해 **커스텀 방/구역 이름**을 정의할 수 있습니다. 이는 IR 리모컨으로 제어되는 청소기, 일반 Tuya 통합, 또는 HAMH가 방을 자동 감지할 수 없는 모든 로봇에 유용합니다.

청소기의 Entity Mapping에서 `customServiceAreas`를 구성하세요. 각 항목은 방 이름과 해당 구역의 청소를 트리거하는 서비스 호출을 정의합니다.

자세한 내용은 [#177](https://github.com/RiDDiX/home-assistant-matter-hub/issues/177)을 참조하세요.

### Batch Dispatch 모드

기본적으로, HAMH는 **선택된 방마다 하나의 서비스 호출**을 순차적으로 실행합니다(v2.0.44에서 도입된 대로 Roborock 버튼 엔티티에 대한 올바른 동작). 일부 통합, 특히 **Xiaomi Home**은 대신 모든 방 ID를 **단일 호출**로 기대합니다. 이러한 통합에 N개의 순차적 호출을 보내면 N번의 개별 청소 작업이 발생하여 사실상 마지막 방만 청소합니다.

선택하려면 임의의 area 정의에 `batchDispatch: true`를 설정하세요. HAMH는 해당 area의 `service`와 `target`을 템플릿으로 사용하여 **하나의 결합된 호출**을 실행합니다. 일치하는 데이터 키는 가능한 경우 결합됩니다: 배열은 연결되고 원시 값은 쉼표로 결합됩니다.

HAMH는 또한 선택 메타데이터를 `data`에 주입합니다:

| Key | Type | 설명 |
|-----|------|-------------|
| `selected_area_ids` | `number[]` | 컨트롤러가 선택한 Matter area ID |
| `selected_area_ids_csv` | `string` | `","`로 결합된 선택된 Matter area ID |
| `selected_area_names` | `string[]` | 선택된 모든 area의 표시 이름 |
| `selected_area_names_csv` | `string` | `","`로 결합된 선택된 표시 이름 |
| `selected_area_data` | `Record<string, unknown>[]` | 선택된 각 area의 원본 `data` 객체 (데이터가 없는 area의 경우 빈 객체 `{}`) |

순차 디스패치가 기본값으로 유지되며, 기존 구성은 영향을 받지 않습니다. 예측 가능한 배치 출력을 위해, 동일한 배치 지원 통합에 속하는 모든 area에 `batchDispatch: true`를 설정하세요.

#### 예시: Xiaomi Home 다중 방 청소

```yaml
customServiceAreas:
  - name: Kitchen
    service: xiaomi_home.vacuum_clean_room_ids
    target: vacuum.xiaomi_robot
    batchDispatch: true
    data:
      room_ids: [1]
  - name: Living Room
    service: xiaomi_home.vacuum_clean_room_ids
    target: vacuum.xiaomi_robot
    batchDispatch: true
    data:
      room_ids: [2]
  - name: Bedroom
    service: xiaomi_home.vacuum_clean_room_ids
    target: vacuum.xiaomi_robot
    batchDispatch: true
    data:
      room_ids: [3]
```

"Kitchen"과 "Living Room"이 선택되면, HAMH는 다음과 같이 단일 호출을 실행합니다:

```yaml
action: xiaomi_home.vacuum_clean_room_ids
target: vacuum.xiaomi_robot
data:
  room_ids: [1, 2]
  selected_area_ids: [1, 2]
  selected_area_ids_csv: "1,2"
  selected_area_names: [Kitchen, Living Room]
  selected_area_names_csv: "Kitchen,Living Room"
  selected_area_data: [{ room_ids: [1] }, { room_ids: [2] }]
```

배열 대신 쉼표로 구분된 필드를 기대하는 통합의 경우, 각 area를 해당 필드를 원시 값으로 하여 구성하세요. HAMH는 배치 모드에서 선택된 값을 쉼표로 결합합니다.

원본 요청은 [#291](https://github.com/RiDDiX/home-assistant-matter-hub/issues/291)을 참조하세요.

---

## Identify / Locate

v2.0.27부터, **Identify** 클러스터가 `vacuum.locate`에 매핑됩니다. Apple Home에서 "Play Sound" 또는 "Find My"를 사용하면 청소기가 위치 찾기 소리를 재생합니다.

이는 모든 청소기 구성에서 작동합니다.

---

## 충전 상태

v2.0.27부터, HAMH는 청소기가 도킹되어 충전 중일 때 `IsCharging` 상태를 보고합니다. Apple Home은 올바른 충전 표시기를 표시합니다. 도킹 중에 배터리가 100%에 도달하면 `IsAtFullCharge`도 보고됩니다.

---

## 문제 해결

### Apple Home에 청소기가 표시되지 않음

1. **Server Mode 사용**, 브리지된 청소기는 Apple Home에서 작동하지 않습니다. 전용 Server Mode 브리지를 생성하세요.
2. **모든 Home Hub 업데이트**, 모든 HomePod 및 Apple TV는 iOS/tvOS/AudioOS 18.4+여야 합니다
3. **재페어링**, Server Mode를 활성화한 후 Apple Home에서 제거하고 다시 추가하세요

### Apple Home에 방이 나타나지 않음

1. **Server Mode 확인**, 방 선택에는 Server Mode가 필요합니다
2. **청소기 재페어링**, HAMH를 업데이트한 후 Apple Home에서 제거하고 다시 추가하세요
3. **로그 확인**, 시작 로그에서 `Auto-detected X Roborock rooms` 또는 `Resolved X rooms`를 찾으세요
4. **방 데이터 확인**, 청소기 엔티티 속성에서 `rooms`, `segments`, 또는 `room_list`를 확인하세요

### 방 선택이 작동하지 않음

1. 방을 선택할 때 로그에서 오류를 확인하세요
2. 청소기 통합이 `app_segment_clean`과 함께 `vacuum.send_command`를 지원하는지 확인하세요
3. Roborock의 경우: 방은 Roborock 클라우드를 통해 트리거되므로 클라우드 연결을 확인하세요

### Apple Home에 걸레 강도가 표시되지 않음

1. **청소 모드 엔티티 구성**, 걸레 강도에는 청소 모드 엔티티가 필요합니다. [청소 모드 헬퍼 생성](#creating-a-cleaning-mode-helper-roborock--others)을 참조하세요
2. **걸레 강도 엔티티 구성**, Entity Mapping에서 `mopIntensityEntity`를 설정하세요
3. **재페어링**, 새 클러스터에는 새로운 페어링이 필요합니다

### Apple Home에 "Updating..." 또는 "No Response"가 표시됨

1. **Server Mode 확인**, Apple Home에 대해 활성화되어 있어야 합니다
2. **네트워크 확인**, [Connectivity Issues](../guides/connectivity-issues.md)를 참조하세요
3. **로그 확인**, 배터리, 클러스터 생성, 또는 Matter.js 관련 오류를 찾으세요
4. **공장 초기화**, 최후의 수단으로 브리지를 공장 초기화하고 재페어링하세요

### iPhone에는 "Updating"이 표시되지만 iPad는 정상 작동함

이 문제는 [#287](https://github.com/RiDDiX/home-assistant-matter-hub/issues/287)에서 비롯됩니다. iOS 26.4.x를 실행하는 일부 iPhone에서, 청소기 타일이 약 5일간 정상 사용 후 "Updating" 상태에서 멈춥니다. 동일한 허브의 동일한 청소기가 iPad와 Siri를 통해서는 여전히 작동하므로, 브리지 자체는 제 역할을 하고 있습니다. iPhone의 HomeKit 데몬이 일정 시간 후 Matter 구독 갱신을 중단하고 스스로 복구되지 않습니다.

iPhone을 재부팅하면 몇 분 동안 해소됩니다. Home 앱에서 "Locate"를 누르면 타일이 잠시 해제되지만, Home 앱을 다시 닫으면 곧 다시 멈춥니다.

이 문제는 Apple 측에 있습니다. HAMH는 이미 55초마다 keepalive를 푸시하고 바로 이런 종류의 멈춘 타일을 위해 새로운 구독 보고서를 강제합니다. 브리지는 데이터를 올바르게 전송하고 있으며, iPhone이 구독이 만료되면 수신을 중단할 뿐입니다.

#### 내장 세션 로테이션

최근 알파 빌드는 matter 세션을 자동으로 로테이션합니다. 5분마다 브리지는 여전히 구독을 보유하고 있는, 구성된 최대 수명보다 오래된 세션을 찾아 정상적으로 닫습니다. iPhone은 CASE를 다시 설정하고 다시 구독하는 것으로 반응하며, 이는 별도의 작업 없이 "Updating" 타일을 해소합니다.

임계값은 **Bridge Settings → Session Rotation Max Age (hours)**에서 브리지별로 조정하세요. 기본값은 4입니다. 타일이 그보다 빨리 멈추면 더 작은 값을 설정하거나, `0`으로 설정하여 로테이션을 완전히 비활성화하고 아래의 수동 우회 방법에 의존하세요. 변경 사항은 즉시 적용되며, 애드온이나 Docker 재시작이 필요하지 않습니다. 타이머가 작동했는지 확인하려면 로그에서 `Rotating session` 줄을 찾으세요.

고급 설정의 경우 `HAMH_MATTER_SESSION_MAX_AGE_HOURS` 환경 변수(Docker `-e` 플래그 또는 `.env` 파일)를 통해 시스템 전체 대체 수단도 사용할 수 있습니다. 둘 다 설정된 경우 브리지 설정이 항상 우선합니다.

#### 우회 방법

`vacuum.locate`를 일정에 따라 호출하는 HA 자동화를 실행하세요. Identify 명령은 iOS에서 실시간 상태 구독과 다른 경로를 거치며 타일을 다시 깨우는 경향이 있습니다:

```yaml
alias: Keep iPhone HomeKit vacuum tile alive
trigger:
  - platform: time_pattern
    hours: "/4"
action:
  - service: vacuum.locate
    target:
      entity_id: vacuum.r2d2
```

청소기는 매번 짧게 신호음을 냅니다. 타일이 멈춘 동안 Mac에서 `sysdiagnose`를 캡처할 수 있다면, Apple Feedback에 제출해 주세요. 그것이 iOS 측에서 제대로 된 수정을 받을 수 있는 유일한 경로입니다.

### "Deep Clean" 모드가 작동하지 않음

v2.0.26부터, "Vacuum Then Mop"(Apple Home에 "Deep Clean"으로 표시됨)은 청소 모드 엔티티에 전용 옵션이 없을 때 "Vacuum & Mop"으로 대체됩니다. 그래도 실패하면, 청소 모드 엔티티에 `vacuum_and_mop`이 옵션으로 포함되어 있는지 확인하세요.

### Vacuum 모드와 Mop 모드의 intensity 옵션이 동일하게 보임

이는 Apple Home의 제한 사항입니다. Apple은 청소기 팬 속도와 걸레 강도 모두에 대해 동일한 레이블(Quiet / Automatic / Max)을 렌더링하는데, 둘 다 동일한 Matter 모드 태그를 사용하기 때문입니다. 레이블 뒤의 라우팅은 올바릅니다. Mop 모드에서 "Quiet"를 선택하면 걸레 강도가 설정되고, Vacuum 모드에서 "Quiet"를 선택하면 팬 속도가 설정됩니다.
