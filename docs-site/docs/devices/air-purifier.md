# Air Purifier

Home Assistant의 `fan` 도메인에 속한 공기청정기는 Air Purifier 디바이스로 Matter 컨트롤러에 노출될 수 있습니다.

## 기능

- **On/Off 제어** - 공기청정기를 켜거나 끔
- **속도 제어** - 팬 속도 조절 (지원되는 경우)
- **프리셋 모드** - Auto 모드 및 기타 프리셋 (지원되는 경우)
- **회전(Rocking)** - `oscillating` 속성을 Matter Rocking feature에 매핑 (v2.0.27+)
- **바람 모드(Wind Modes)** - Natural Wind 및 Sleep Wind 프리셋 모드 (v2.0.27+)
- **HEPA 필터 수명 모니터링** - Matter 컨트롤러에 남은 필터 수명 표시

## HEPA 필터 수명 모니터링

Matter의 Air Purifier 디바이스 타입에는 HEPA Filter Monitoring이 포함되어 있어, 호환되는 Matter 컨트롤러(Apple Home, Google Home, Alexa)에 남은 필터 수명을 표시합니다.

### 자동 감지

공기청정기 엔티티에 다음 속성 중 하나라도 있으면 필터 수명 모니터링이 자동으로 활성화됩니다:

- `filter_life`
- `filter_life_remaining`
- `filter_life_level`

값은 백분율(0-100)이어야 하며, 100 = 새 필터, 0 = 교체 필요입니다.

### 별도의 센서 엔티티 사용

많은 Home Assistant 통합은 필터 수명을 fan 엔티티의 속성이 아닌 별도의 센서 엔티티(예: `sensor.air_purifier_filter_life`)로 노출합니다.

별도의 센서를 사용하려면 **Entity Mapping**에서 구성하세요:

1. Dashboard에서 브리지로 이동합니다
2. 공기청정기 엔티티를 찾습니다
3. **Edit Mapping**을 클릭합니다
4. **Filter Life Sensor** 필드에 센서 엔티티 ID를 입력합니다 (예: `sensor.luftreiniger_filter_life`)
5. 매핑을 저장합니다

센서는 백분율 값(0-100)을 제공해야 합니다.

### 템플릿 센서 우회 방법

필터 수명을 fan 엔티티에 직접 속성으로 추가하려는 경우 Home Assistant의 customization을 사용할 수 있습니다:

```yaml
# configuration.yaml
homeassistant:
  customize:
    fan.air_purifier:
      filter_life: "{{ states('sensor.air_purifier_filter_life') | int }}"
```

또는 필터 수명 속성을 포함하는 템플릿 fan 엔티티를 생성하세요.

## 변경 표시 (Change Indication)

필터 모니터링은 필터 수명에 따라 `changeIndication` 속성을 자동으로 설정합니다:

| 필터 수명 | Change Indication | 의미 |
|-------------|-------------------|---------|
| > 20% | **Ok** | 필터 양호 |
| 5% - 20% | **Warning** | 필터 수명 부족 |
| < 5% | **Critical** | 필터 즉시 교체 필요 |

## 예시 엔티티

```yaml
# Example air purifier entity with filter life attribute
fan.living_room_air_purifier:
  state: "on"
  attributes:
    percentage: 50
    preset_mode: "auto"
    preset_modes:
      - "auto"
      - "sleep"
      - "turbo"
    filter_life: 85  # 85% remaining
    supported_features: 15
```

## 호환성

| Controller | Filter Life Display |
|------------|---------------------|
| Apple Home | ✅ 필터 상태 표시 |
| Google Home | ✅ 필터 상태 표시 |
| Amazon Alexa | ⚠️ 제한적 지원 |

## Composed Air Purifier

v2.0.27부터, 서모스탯 또는 습도 센서와 Home Assistant 디바이스를 공유하는 공기청정기는 **Matter Composed Device**로 노출될 수 있습니다(Matter 사양 9.4.4절 참조). 이는 온도 및 습도용 하위 엔드포인트가 있는 부모 Air Purifier 엔드포인트를 생성하여, 컨트롤러가 모든 측정값을 하나의 통합된 디바이스에 표시할 수 있게 합니다.

Composed 공기청정기는 Bridge Settings에서 `autoComposedDevices`가 활성화되어 있고 공기청정기 엔티티가 온도/습도 센서와 디바이스를 공유할 때 자동으로 생성됩니다.

---

## 회전 및 바람 모드

v2.0.27부터, 공기청정기는 다음을 제대로 지원합니다:

- **회전(Rocking)**, fan 엔티티에 `oscillating` 속성이 있으면 Matter Rocking feature로 노출됨
- **Natural Wind**, "Natural" 프리셋 모드를 Matter의 naturalWind feature에 매핑
- **Sleep Wind**, "Sleep" 프리셋 모드를 Matter의 sleepWind feature에 매핑

이러한 기능은 이전에 air purifier 디바이스 타입에서 누락되어 있었습니다.

---

## 문제 해결

### 필터 수명이 표시되지 않음

1. 센서가 숫자 백분율 값(0-100)을 제공하는지 확인하세요
2. Entity Mapping에서 센서 엔티티 ID가 올바른지 확인하세요
3. Matter 컨트롤러에서 디바이스를 제거하고 다시 추가하세요 (디바이스 기능이 변경됨)

### 필터가 항상 100%로 표시됨

센서 값이 업데이트되지 않을 수 있습니다. Home Assistant Developer Tools > States에서 센서가 올바른 값을 반환하는지 확인하세요.
