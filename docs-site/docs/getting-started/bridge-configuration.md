# 브리지 구성

사용자 인터페이스를 사용해 여러 개의 브리지를 설정하고 각각이 엔티티에 대해 서로 다른 필터를 사용하도록 구성할 수 있습니다.
각 브리지는 다른 브리지와 완전히 독립적이며 Matter용으로 자체 포트를 사용합니다.

## 브리지 마법사(Bridge Wizard)로 빠르게 시작하기

브리지를 생성하는 가장 쉬운 방법은 **브리지 마법사**를 사용하는 것입니다:

1. 웹 UI를 열고 Bridges 페이지로 이동합니다
2. 우측 상단의 **Wizard** 버튼을 클릭합니다
3. 안내되는 단계를 따릅니다:
   - 브리지 이름을 입력합니다
   - 엔티티 필터를 구성합니다(영역, 레이블, 도메인 등)
   - 포트는 자동으로 할당됩니다(5540부터 시작)
4. 한 세션에서 여러 개의 브리지를 추가합니다
5. 검토하고 확인하여 모든 브리지를 생성합니다

마법사는 포트 할당을 자동으로 처리하고 충돌을 방지합니다.

## 수동 구성

웹 UI를 열어 브리지 구성에 접근할 수 있습니다:

- Home Assistant 애드온을 실행 중인 경우: `Open Web UI`를 클릭합니다
- Docker 컨테이너를 실행 중인 경우: `host-ip:port`를 엽니다(변경하지 않았다면 기본 포트는 8482입니다)

> [!NOTE]
> **하나의** 브리지를 사용해 **여러** 컨트롤러에 연결할 수 있습니다.
> 설정 방법에 대한 자세한 내용은 [이 가이드](../guides/connect-multiple-fabrics.md)를 참조하세요.

> [!WARNING]
> Alexa는 포트 `5540`만 지원합니다. 따라서 Alexa와 연결하기 위해 여러 개의 브리지를 생성할 수 없습니다.
> 
> 다음 방법을 사용해 작동시킨 사용자들도 있습니다:
> 1. 포트 5540으로 브리지를 생성합니다
> 2. Alexa를 해당 브리지에 연결합니다
> 3. 브리지의 포트를 변경합니다
> 4. 여전히 작동하는지 확인합니다
> 5. 다음 브리지에 대해 반복합니다

모든 브리지는 `name`(문자열), `port`(숫자), `filter`(객체) 속성을 가져야 합니다. filter 속성은
`include`(배열)과 `exclude`(배열) 속성을 포함해야 합니다.

```json
{
  "name": "My Hub",
  "port": 5540,
  "filter": {
    "include": [],
    "exclude": []
  }
}
```

include 또는 exclude 항목은 `type`과 `value` 속성을 가진 객체입니다.

## 필터 유형

| 유형 | 설명 | 예시 값 |
|------|-------------|---------------|
| `pattern` | 엔티티 ID를 와일드카드 패턴으로 매칭합니다. 와일드카드로 `*`를 사용합니다. | `light.living_room_*` |
| `regex` | 엔티티 ID에만 대해 테스트하는 정규식입니다. 레이블은 `entity_label_regex` / `device_label_regex`를 사용하세요. | `^light\.(kitchen\|bedroom)_.*` |
| `domain` | 엔티티를 도메인(점 앞부분)으로 매칭합니다. | `light`, `switch`, `sensor` |
| `platform` | 엔티티를 통합/플랫폼으로 매칭합니다. | `hue`, `zwave`, `mqtt` |
| `entity_label` | 엔티티를 레이블로 매칭합니다. 표시 이름 또는 슬러그를 허용합니다. 엔티티 수준 레이블만 확인합니다. | `Voice Control` |
| `device_label` | 엔티티를 상위 기기의 레이블로 매칭합니다. 해당 기기의 모든 엔티티가 일치합니다. | `smart_home` |
| `entity_label_regex` | 엔티티 레이블 슬러그 및 표시 이름에 대해 테스트하는 정규식입니다. | `^(matter\|voice).*` |
| `device_label_regex` | 기기 레이블 슬러그 및 표시 이름에 대해 테스트하는 정규식입니다. 일치하는 기기의 모든 엔티티가 포함됩니다. | `^(matter\|voice).*` |
| `any_field_regex` | 모든 엔티티 필드로 구성된 단일 행 문자열에 대해 테스트하는 하나의 정규식입니다. AND는 전방 탐색(lookahead), OR는 교대(alternation)를 사용하세요. | 아래 참조 |
| `area` | 엔티티를 영역 슬러그로 매칭합니다. | `living_room` |
| `entity_category` | 엔티티를 카테고리로 매칭합니다. | `config`, `diagnostic` |
| `device_name` | 엔티티를 기기 이름으로 매칭합니다(대소문자 구분 없음, 와일드카드 지원). | `Living Room*` |
| `product_name` | 엔티티를 제품/모델 이름으로 매칭합니다(대소문자 구분 없음, 와일드카드 지원). | `Hue Color Bulb` |
| `manufacturer` | 엔티티를 기기 제조사로 매칭합니다(대소문자 구분 없음, 와일드카드 지원). MQTT나 기타 범용 통합에 유용합니다. | `*Sonoff*` |
| `device_class` | 엔티티를 device class 속성으로 매칭합니다. | `temperature`, `motion` |

> [!NOTE]
> 이제 웹 UI의 드롭다운에서 각 필터 유형에 마우스를 올리면 자세한 설명이 담긴 **툴팁**이 표시됩니다.

> [!WARNING]
> 기존 `label` 필터 유형은 **더 이상 사용되지 않으므로**, 명확성을 위해 `entity_label` 또는 `device_label`을 대신 사용하세요.

### Pattern과 Regex

**Pattern**은 간단한 와일드카드 매칭을 사용합니다:
- `*`는 임의의 문자(0개 이상)와 일치합니다
- 예시: `light.living_room_*`는 `light.living_room_lamp`와 일치합니다

**Regex**는 완전한 JavaScript 정규 표현식을 사용합니다:
- 복잡한 패턴에 더 강력합니다
- 예시: `^(light|switch)\.kitchen_.*`는 주방 조명과 스위치에 일치합니다

### Any Field Regex

`any_field_regex`는 엔티티별로 구성된 단일 행 문자열에 대해 하나의 정규식을 실행하며, 필드는 공백으로 연결됩니다:

```
entity_id=... domain=... platform=... area=... entity_category=... device_class=... entity_labels=slug1,slug2 entity_label_names=Display 1,Display 2 device_labels=slug1 device_label_names=Display 1 device_name=... product_name=... manufacturer=...
```

AND를 표현하려면 전방 탐색을 쌓고, OR를 표현하려면 교대를 사용합니다. 예시: `living_room` 영역의 조명 **또는** `voice` 레이블이 붙은 스위치를 포함하기:

```
(?=.*\bdomain=light\b)(?=.*\barea=living_room\b)|(?=.*\bdomain=switch\b)(?=.*\bentity_labels=.*\bvoice\b)
```

`\b` 앵커는 `domain=light`가 `domain=lightning`과 일치하는 것을 막아줍니다. 동일한 매컄는 `exclude` 목록에서도 작동하며, 반대 패턴을 주면 됩니다.

### Device Name 필터

`device_name` 필터는 엔티티 ID가 아닌 기기의 이름과 일치합니다:
- 대소문자 구분 없는 매칭
- 패턴 매칭을 위한 `*` 와일드카드 지원
- 매칭 대상: 사용자 정의 이름 → 기기 이름 → 기본 이름
- 예시: `*Philips*`는 이름에 "Philips"가 포함된 모든 기기와 일치합니다

### Product Name 필터

`product_name` 필터는 기기의 모델 또는 제품 이름과 일치합니다:
- 대소문자 구분 없는 매칭
- 패턴 매칭을 위한 `*` 와일드카드 지원
- 매칭 대상: 모델 → 기본 모델
- 예시: `Hue*Bulb`는 모델 이름에 "Hue"와 "Bulb"가 포함된 모든 기기와 일치합니다

### Device Class 필터

`device_class` 필터는 엔티티의 `device_class` 속성과 일치합니다:
- 정확한 일치(대소문자 구분)
- 일반적인 device class: `temperature`, `humidity`, `motion`, `door`, `window`, `battery`, `power`, `energy`, `illuminance`, `pressure`
- 예시: `temperature`는 `device_class: temperature`인 모든 엔티티와 일치합니다

`value` 속성은 해당 값을 포함하는 문자열입니다. 여러 개의 include 또는 exclude 규칙을 추가할 수 있으며,
이는 조합됩니다.
include 규칙 중 하나와 일치하는 모든 엔티티는 포함되지만, exclude 규칙 중 하나와 일치하는 모든 엔티티는
제외됩니다.

레이블은 엔티티 수준 또는 기기 수준에서 적용할 수 있습니다:
- 엔티티에 직접 할당된 레이블을 매칭하려면 `entity_label`을 사용합니다
- 상위 기기에 할당된 레이블을 매칭하려면 `device_label`을 사용합니다(해당 기기의 모든 엔티티가 일치합니다)
- 기존 `label` 유형도 여전히 작동하지만 엔티티 레이블만 매칭하므로, 명확한 제어를 위해 새 유형을 사용하세요

필터 값으로 **표시 이름**(예: `My Smart Lights`) 또는 **슬러그**(예: `my_smart_lights`) 중 하나를 사용할 수 있습니다. 표시 이름은 자동으로 올바른 슬러그로 변환됩니다.

> [!TIP]
> 웹 UI의 **Filter Reference** 페이지를 사용하면 사용 가능한 모든 필터 값(도메인, 플랫폼, 엔티티 카테고리, device class, 기기 이름, 제품 이름, 레이블, 영역)을 클릭 한 번으로 복사하는 기능과 함께 탐색할 수 있습니다.

> [!WARNING]
> 레이블 추가 또는 제거와 같이 엔티티를 변경할 때는 변경 사항이 적용되도록 matter-hub 애플리케이션을
> 새로고침해야 합니다(예: 브리지 편집 또는 애드온 재시작).

## 예제

### 기본 구성

```json
{
  "name": "My Hub",
  "port": 5540,
  "filter": {
    "include": [
      {
        "type": "label",
        "value": "my_voice_assist"
      },
      {
        "type": "pattern",
        "value": "light.awesome*"
      }
    ],
    "exclude": [
      {
        "type": "platform",
        "value": "hue"
      },
      {
        "type": "domain",
        "value": "fan"
      },
      {
        "type": "entity_category",
        "value": "diagnostic"
      }
    ]
  }
}
```

### 복잡한 매칭을 위한 Regex 사용

"kitchen" 또는 "living_room"으로 시작하는 모든 조명과 스위치를 매칭합니다:

```json
{
  "name": "Main Rooms",
  "port": 5540,
  "filter": {
    "include": [
      {
        "type": "regex",
        "value": "^(light|switch)\\.(kitchen|living_room)_.*"
      }
    ],
    "exclude": []
  }
}
```

### Device Name 필터 사용

Philips 기기의 모든 엔티티를 포함하고 IKEA 기기는 제외합니다:

```json
{
  "name": "Brand Filter",
  "port": 5541,
  "filter": {
    "include": [
      {
        "type": "device_name",
        "value": "*Philips*"
      }
    ],
    "exclude": [
      {
        "type": "device_name",
        "value": "*IKEA*"
      }
    ]
  }
}
```

### 여러 필터 유형 조합

여러 필터 유형을 사용한 더 큰 예시입니다:

```json
{
  "name": "Living Room Hub",
  "port": 5542,
  "filter": {
    "include": [
      {
        "type": "area",
        "value": "living_room"
      },
      {
        "type": "label",
        "value": "voice_control"
      },
      {
        "type": "pattern",
        "value": "light.guest_*"
      }
    ],
    "exclude": [
      {
        "type": "entity_category",
        "value": "diagnostic"
      },
      {
        "type": "entity_category",
        "value": "config"
      },
      {
        "type": "regex",
        "value": ".*_battery$"
      },
      {
        "type": "device_name",
        "value": "*Test*"
      }
    ]
  }
}
```

이 구성은 다음과 같습니다:
- **포함**: "living_room" 영역의 모든 엔티티, "voice_control" 레이블이 있는 엔티티, "guest_"로 시작하는 모든 조명
- **제외**: 진단(diagnostic) 및 구성(config) 엔티티, "_battery"로 끝나는 모든 엔티티, 이름에 "Test"가 포함된 모든 기기

## 기능 플래그(Feature Flags)

기능 플래그는 브리지의 고급 동작을 제어합니다. 웹 UI의 **Bridge Settings → Feature Flags** 섹션에서 구성합니다.

> [!WARNING]
> **autoComposedDevices는 파괴적 변경(BREAKING CHANGE)입니다**: 이 플래그를 활성화하면 습도/압력이 자동 매핑된 온도 센서의 Matter 엔드포인트 구조가 변경됩니다. 컨트롤러는 이를 **새 기기**로 인식하므로 방, 루틴, 음성 별칭을 다시 할당해야 합니다. 새 브리지에만 활성화하거나 재구성할 준비가 되어 있을 때만 활성화하세요.

| 기능 플래그 | 설명 | 기본값 |
|--------------|-------------|---------|
| `autoComposedDevices` | 마스터 토글: 관련 엔티티(배터리, 습도, 압력, 전력, 에너지)를 단일 Matter 엔드포인트로 결합합니다. **경고: 파괴적 변경 - 위 내용 참조.** | `false` |
| `autoBatteryMapping` | 배터리 센서를 상위 기기와 자동으로 결합합니다 | `false` |
| `autoHumidityMapping` | 습도 센서를 온도 센서와 자동으로 결합합니다 | `true` |
| `autoPressureMapping` | 압력 센서를 온도 센서와 자동으로 결합합니다 | `true` |
| `autoForceSync` | 90초마다 모든 기기 상태를 컨트롤러에 주기적으로 푸시합니다. 기기 상태가 동기화되지 않을 때 활성화하세요. | `false` |
| `coverSwapOpenClose` | 커버의 열기/닫기 명령을 바꿉니다(반전된 Alexa 명령 수정) | `false` |
| `coverDoNotInvertPercentage` | 커버의 퍼센트 반전을 건너뜁니다(Matter 표준 비준수) | `false` |
| `coverUseHomeAssistantPercentage` | HA 퍼센트를 직접 사용합니다(Alexa 친화적) | `false` |
| `includeHiddenEntities` | Home Assistant에서 숨김으로 표시된 엔티티를 포함합니다 | `false` |
| `serverMode` | 기기를 독립형 Matter 기기로 노출합니다(Apple Home/Alexa에서 로봇 청소기 사용 시 필수). 브리지당 한 기기만 가능! | `false` |
| `productNameFromNodeLabel` | 노드 레이블(사용자 지정 이름 / friendly name / 엔티티 id)를 Matter `productName`으로 보고합니다. productName을 기기 이름으로 표시하는 Aqara 컨트롤러에 유용합니다. 엔티티별 `customProductName`이 여전히 우선합니다. | `false` |
| `preferEntityRegistryName` | 구성된 `friendly_name` 대신 엔티티 레지스트리 이름(또는 `original_name`)을 `nodeLabel`로 사용합니다. HA 2026.4는 `friendly_name`에 기기 이름을 접두어로 붙여 짧은 엔티티 이름에 의존하던 음성 명령을 깨뜨립니다. `customName`이 여전히 우선합니다. | `false` |
| `vacuumOnOff` | 청소기 엔드포인트에 OnOff 클러스터를 추가합니다. Alexa 검색에 필요합니다. 서버 모드에서는 명시적으로 `false`로 설정하지 않는 한 기본 활성화됩니다. 브리지 모드에서는 기본 비활성화됩니다. | (설명 참조) |
| `vacuumIncludeUnnamedRooms` | 청소기 방 선택에서 이름이 없는 방을 포함합니다 | `false` |

## 레이블 관련 문제

> [!NOTE]
>
> 레이블의 **표시 이름**(Home Assistant에 표시되는 대로)을 필터 값으로 직접 사용할 수 있습니다.
> 예를 들어 레이블 이름이 "My Smart Lights"라면 값으로 `My Smart Lights`를 입력할 수 있으며 자동으로 변환됩니다.
>
> 원한다면 여전히 **슬러그**(예: `my_smart_lights`)를 사용할 수 있습니다. 슬러그는 항상 소문자이며 공백 대신 밑줄을 사용합니다.

> [!WARNING]
>
> - Home Assistant에서 레이블 이름을 변경해도 슬러그는 변경되지 **않습니다**. 그런 경우에는 현재 표시 이름 또는 원래 슬러그를 사용하세요.
> - 영역은 다르게 작동하며 여전히 슬러그가 필요합니다(예: `Living Room`이 아닌 `living_room`).
>
> Home Assistant에서 다음 템플릿을 사용해 슬러그를 가져올 수 있습니다:
>
> - `{{ labels() }}` - 모든 레이블을 반환합니다
> - `{{ labels("light.my_entity") }}` - 특정 엔티티의 레이블을 반환합니다
> - `{{ areas() }}` - 모든 영역을 반환합니다

레이블로 잘 작동하지 않는 경우, 레이블을 삭제하고 다시 생성할 수 있습니다.
