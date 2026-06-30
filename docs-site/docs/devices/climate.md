# Climate / Thermostat

Home Assistant `climate` 엔티티는 Matter **Thermostat** 디바이스에 매핑됩니다. 브리지는 디바이스의 `hvac_modes` 속성에서 기능을 자동으로 감지하여 올바른 feature 세트를 노출합니다.

## Feature 변형

서모스탯 타입은 디바이스가 지원하는 HVAC 모드에 따라 자동으로 선택됩니다:

| HA hvac_modes | Matter Features | 설명 |
|---------------|----------------|-------------|
| `heat` 전용 | Heating | 난방 전용 TRV, 온수기 |
| `cool` 전용 | Cooling | 냉방 전용 에어컨 |
| `heat` + `cool` (`heat_cool` 없음) | Heating + Cooling | 자동 전환 없는 듀얼 모드. Apple Home에 Auto 버튼이 표시되지 않음. |
| `heat_cool` 존재 | Heating + Cooling + AutoMode | 듀얼 설정값을 갖춘 완전한 HVAC |
| `heat_cool` 전용 (명시적 `heat`/`cool` 없음) | Heating + Cooling | 구역형 에어컨, `controlSequenceOfOperation`이 `hvac_action`에 따라 동적으로 전환됨 |

## HVAC 모드 매핑

| HA Mode | Matter SystemMode |
|---------|------------------|
| `off` | Off |
| `heat` | Heat |
| `cool` | Cool |
| `heat_cool` | Auto |
| `auto` | Auto* |
| `dry` | Dry |
| `fan_only` | FanOnly |

> **중요:** Matter의 "Auto" 모드는 온도에 따라 난방/냉방 간 자동 전환을 의미합니다. 이는 일반적으로 "디바이스가 결정"을 의미하는 `auto` 모드가 아니라 HA의 `heat_cool` 모드와 일치합니다.

## 지원되는 속성

| HA Attribute | Matter Property | 비고 |
|-------------|----------------|-------|
| `current_temperature` | Local Temperature | 사용 불가 시 설정값으로 대체됨 |
| `temperature` | Occupied Heating/Cooling Setpoint | 단일 설정값 모드 |
| `target_temp_high` | Occupied Cooling Setpoint | Auto 모드 (듀얼 설정값) |
| `target_temp_low` | Occupied Heating Setpoint | Auto 모드 (듀얼 설정값) |
| `hvac_action` | Thermostat Running State | 활성 난방/냉방 표시 |
| `min_temp` / `max_temp` | Absolute Min/Max limits | 설정값 범위 제한 |

## 보조 팬 (opt-in)

Apple Home은 서모스탯 팬이나 `fan_only` 모드를 표시하지 않으므로 에어컨의 팬이 서모스탯 타일에 절대 나타나지 않습니다. **Entity Mapping**에서 엔티티별로 `climateExposeFan`을 설정하면 동일한 climate 엔티티에 바인딩된 별도의 Matter **Fan** 타일로 에어컨 팬을 노출합니다.

이는 climate 엔티티가 `FAN_MODE` feature를 보고할 때만 적용됩니다. 이를 활성화하면 에어컨이 composed 디바이스로 다시 등록되어 해당 에어컨의 일회성 재페어링이 강제됩니다.

이제 Fan 타일을 끄면 `climate.turn_off`가 전송됩니다(더 이상 에어컨을 냉방/난방으로 전환하지 않음). 켜면 에어컨이 `fan_only` 상태가 되고, 타일의 속도는 `climate.set_fan_mode`에 매핑됩니다.

## 온도 표시 단위

`ThermostatUserInterfaceConfiguration` 클러스터는 HA 온도 단위 기본 설정(°C 또는 °F)을 Matter 컨트롤러에 노출합니다. 컨트롤러는 이를 사용하여 선호하는 단위로 온도를 표시할 수 있습니다.

## 호환성

| Controller | Heat | Cool | Auto | Dry | Fan Only |
|------------|------|------|------|-----|----------|
| Apple Home | ✅ | ✅ | ✅ | ❌ | ❌ |
| Google Home | ✅ | ✅ | ✅ | ❌ | ❌ |
| Amazon Alexa | ✅ | ✅ | ✅ | ❌ | ❌ |

> Dry 및 Fan Only 모드는 Matter를 통해 노출되지만 컨트롤러 지원은 다양합니다. Apple Home과 Google Home은 일반적으로 Heat, Cool, Auto, Off만 표시합니다.

## 문제 해결

### Apple Home에 Auto 버튼이 표시되지 않아야 하는데 표시됨

디바이스가 `heat`와 `cool`만 지원하고 `heat_cool`은 지원하지 않는 경우, HAMH는 의도적으로 AutoMode를 노출하지 않습니다. 그래도 Auto가 표시되면, HA 엔티티의 `hvac_modes` 목록에 `heat_cool`이 포함되어 있지 않은지 확인하세요 (Developer Tools → States).

### Apple Home에서 모드 전환 / 명령 충돌

이 문제는 v2.0.20에서 수정되었습니다. 이제 AutoMode는 디바이스가 실제로 `heat_cool`(듀얼 설정값)을 지원할 때만 노출됩니다. 최신 버전으로 업데이트하세요.

### Alexa가 온도 명령을 거부함

단일 기능 서모스탯(난방 전용 또는 냉방 전용)은 `controlSequenceOfOperation`에 적합성 문제가 있어 Alexa가 명령을 거부했습니다. v2.0.27에서 수정되어, 이제 시퀀스가 `CoolingAndHeating` 대신 `CoolingOnly` 또는 `HeatingOnly`로 동적으로 설정됩니다.

### 현재 온도가 잘못된 값을 표시함

`current_temperature`가 `null`이거나 사용 불가한 경우, 브리지는 설정값으로 대체합니다. Developer Tools에서 HA 엔티티의 `current_temperature` 속성을 확인하세요.

### heat_cool 모드만 있는 구역형 에어컨

`hvac_modes`에 `heat_cool`만 보고하는 디바이스(명시적 `heat` 또는 `cool` 없음)는 v2.0.27부터 처리됩니다. `controlSequenceOfOperation`은 `hvac_action`에 따라 `CoolingOnly`와 `HeatingOnly` 간에 동적으로 전환됩니다.
