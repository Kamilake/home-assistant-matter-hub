# 지원되는 기기 유형

Home-Assistant-Matter-Hub가 지원하는 모든 기기 유형과 그 기능, 컨트롤러 호환성, 구성 옵션입니다.

---

## 빠른 참조

| Home Assistant Domain | Matter Device Type |
|-----------------------|-------------------|
| `light` | Light (OnOff / Dimmable / Color Temperature / Extended Color) |
| `switch`, `input_boolean` | On/Off Plug-in Unit |
| `lock` | Door Lock |
| `cover` | Window Covering |
| `climate` | Thermostat |
| `fan` | Fan |
| `sensor` | Temperature / Humidity / Pressure / Flow / Illuminance / Air Quality |
| `weather` | Temperature + Humidity + Pressure (composed) |
| `binary_sensor` | Contact / Occupancy / Smoke/CO / OnOff Sensor |
| `media_player` | Speaker |
| `valve` | Water Valve |
| `vacuum` | Robotic Vacuum Cleaner |
| `lawn_mower` | Robotic Vacuum Cleaner |
| `water_heater` | Thermostat (Heating) |
| `select`, `input_select` | Mode Select |
| `alarm_control_panel` | Mode Select |
| `event` | Generic Switch |
| `siren` | On/Off Plug-in Unit |
| `humidifier` | Fan (\uc2b5\ub3c4 \uc81c\uc5b4 \uac00\ub2a5) |

> [!NOTE]
> 컨트롤러 호환성은 기기 유형과 펀웨어 버전에 따라 다릅니다. 모든 컨트롤러가 모든 Matter 기기 유형을 지원하는 것은 아닙니다. 현재 지원 상태는 아래 공식 문서를 확인하세요.

---

## 컨트롤러 호환성 링크

- **Alexa**: [Matter Support Documentation](https://developer.amazon.com/en-US/docs/alexa/smarthome/matter-support.html#device-categories-and-clusters)
- **Google Home**: [Supported Devices](https://developers.home.google.com/matter/supported-devices#device_type_and_control_support)
- **Apple Home**: [Matter Accessories](https://support.apple.com/en-us/102135)

---

## 상세 기기 유형

### 조명 (`light`)

Home Assistant 조명은 지원되는 기능을 기반으로 적절한 Matter 조명 유형에 매핑됩니다.

| HA Features | Matter Device Type | 기능 |
|-------------|-------------------|--------------|
| On/Off only | OnOffLight | 전원 제어 |
| Brightness | DimmableLight | 전원 + 밝기 |
| Color temp | ColorTemperatureLight | 전원 + 밝기 + 색온도 |
| RGB/HS/XY | ExtendedColorLight | 전체 색상 제어 |

**지원되는 속성:**
- `brightness` (0-255) → Matter Level (0-254)
- `color_temp` (mireds) → Matter Color Temperature (Kelvin)
- `rgb_color` / `hs_color` / `xy_color` → Matter Hue/Saturation 또는 XY

**전력 및 에너지 측정:**
- 조명은 Matter 클러스터를 통해 선택적으로 전력과 에너지 소비량을 보고할 수 있습니다
- 조명은 더 이상 자동 매핑되지 않습니다. Entity Mapping을 통해 `powerEntity` / `energyEntity`를 명시적으로 설정해야 합니다
- 이전에 에너지 수치를 표시하던 조명은 업그레이드 후 이를 표시하지 않을 수 있습니다. 복원하려면 매핑을 다시 추가하세요 ([#374](https://github.com/RiDDiX/home-assistant-matter-hub/issues/374))

**컨트롤러 참고:**
- 모든 주요 컨트롤러가 모든 조명 유형을 지원합니다
- 색온도 범위는 HA와 Matter 사양 간에 다를 수 있습니다

자세한 설정, 색상 변환, 문제 해결은 [조명 가이드](./devices/light.md)를 참조하세요.

---

### 스위치 및 불리언 (`switch`, `input_boolean`)

간단한 켜기/끄기 제어가 가능한 콘센트인 **OnOffPlugInUnit**에 매핑됩니다.

**지원되는 액션:**
- 켜기
- 끄기
- 토글

**전력 및 에너지 측정:**
- 스위치는 Matter 클러스터를 통해 선택적으로 전력과 에너지 소비량을 보고할 수 있습니다
- 동일한 기기의 HA power/energy 센서 엔터티로부터 자동 매핑됩니다
- Entity Mapping을 통한 수동 매핑: `powerEntity`, `energyEntity`

**활용 사례:**
- 스마트 플러그
- 릴레이
- 가상 스위치
- 헬퍼 불리언

---

### 잠금장치 (`lock`)

가능한 경우 PIN 코드 지원과 함께 **DoorLock**에 매핑됩니다.

**지원되는 액션:**
- 잠금(PIN 불필요)
- 잠금 해제(구성된 경우 PIN 필요)
- 고리 풀기 / 빗장 풀기(HA 엔터티가 `OPEN` 기능을 지원하는 경우)

**지원되는 상태:**
- `locked` / `locking` → Matter Locked
- `unlocked` / `unlocking` → Matter Unlocked
- `open` / `opening` → Matter Unlatched

**기능 플래그:**
- **PIN Credentials** - Entity Mapping UI를 통해 PIN 코드를 구성합니다
- **Lock without PIN** - 잠금은 항상 허용되며 잠금 해제만 PIN이 필요합니다(Alpha)
- **Unlatch (Unbolting)** - HA 잠금장치가 `OPEN` 기능을 지원할 때 자동으로 활성화됩니다. `lock.open` 액션에 매핑됩니다. Apple Home은 "Unlatch" 버튼을 표시합니다.

**컨트롤러 참고:**
- PIN 코드 입력은 모든 컨트롤러에서 지원되지 않을 수 있습니다
- 일부 컨트롤러는 잠금 해제에 추가 확인을 요구할 수 있습니다
- Google Home은 Matter 잠금장치에 대한 음성 잠금 해제를 비활성화했습니다(Google 정책)
- Apple Home은 잠금장치가 Unbolting 기능을 지원할 때 "Unlatch" 버튼을 표시합니다

PIN 자격 증명, 고리 풀기 설정, 문제 해결은 [잠금장치 가이드](./devices/lock.md)를 참조하세요.

---

### 커버 (`cover`)

위치 및 기울기 제어를 지원하는 **WindowCovering**에 매핑됩니다.

**지원되는 기능:**
| HA Feature | Matter Capability |
|------------|------------------|
| `open` / `close` | 열기/닫기 명령 |
| `set_position` | 리프트 백분율 (0-100%) |
| `set_tilt_position` | 기울기 백분율 (0-100%) |
| `stop` | 움직임 정지 |

**기능 플래그 (Bridge Settings):**
| Flag | 설명 |
|------|-------------|
| `coverDoNotInvertPercentage` | 백분율 반전 건너뛰기(Matter 규격 비준수) |
| `coverUseHomeAssistantPercentage` | Matter에 HA 백분율 표시(Alexa 친화적) |
| `coverSwapOpenClose` | 열기/닫기 명령 교체(반대로 된 Alexa 명령 수정) |

**지원되는 Device Class:**
- `blind`
- `curtain`
- `shade`
- `shutter`
- `awning`
- `garage`(제한적 지원)

백분율 매핑, 기능 플래그, 문제 해결은 [커버 가이드](./devices/cover.md)를 참조하세요.

---

### 공조 (`climate`)

난방, 냉방, 자동 모드를 지원하는 **Thermostat**에 매핑됩니다.

**지원되는 HVAC 모드:**
| HA Mode | Matter SystemMode |
|---------|------------------|
| `off` | Off |
| `heat` | Heat |
| `cool` | Cool |
| `heat_cool` | Auto |
| `auto` | Auto* |
| `dry` | Dry |
| `fan_only` | FanOnly |

> **중요:** Matter의 "Auto" 모드는 온도에 따라 난방/냉방을 자동으로 전환하는 것을 의미합니다. 이는 일반적으로 "기기가 결정"을 의미하는 `auto` 모드가 아니라 HA의 `heat_cool` 모드와 일치합니다.

**지원되는 속성:**
- `current_temperature` → Local Temperature(사용 불가한 경우 설정값으로 대체)
- `target_temp_high` / `target_temp_low` → 설정값(Setpoints)
- `hvac_action` → Running State(활성 난방/냉방 표시)
- `min_temp` / `max_temp` → 온도조절기 제한

> **Auto 표시에는 `hvac_action`이 필요:** Auto 상태에서 컨트롤러는 running state를 통해 기기가 지금 난방 중인지 냉방 중인지를 표시하며, HAMH는 이를 HA `hvac_action`에서 매핑합니다. `hvac_action`을 게시하지 않는 에어컨(다수의 IR / SmartIR 블래스터)는 이를 비워두므로 Apple Home은 온도를 설정값과 비교하는 방식으로 대체하며, 에어컨이 계속 냉방 중이더라도 목표 온도에 도달하면 Cooling을 표시했다가 Heating으로 전환할 수 있습니다 ([#309](https://github.com/RiDDiX/home-assistant-matter-hub/issues/309)).

**기능 변형 (HA hvac_modes에서 자동 감지):**
- **Heating Only**: 난방 전용 TRV, 온수기. `Heating` 기능만 노출
- **Cooling Only**: 냉방 전용 에어컨. `Cooling` 기능만 노출
- **Heating + Cooling**: `heat`와 `cool`은 있지만 `heat_cool`이 없는 기기. AutoMode 없이 `Heating` + `Cooling` 노출. Apple Home이 Auto 버튼을 표시하지 않아 모드 전환을 방지합니다.
- **Full HVAC (AutoMode)**: hvac_modes에 `heat_cool`이 있는 기기. 이중 설정값과 함께 `Heating` + `Cooling` + `AutoMode` 노출
- **heat_cool 전용 구역** *(v2.0.27 신규)*: `heat_cool`은 있지만 명시적인 `heat`나 `cool` 모드가 없는 기기(예: 구역형 에어컨). AutoMode 없이 `Heating` + `Cooling` 노출. `controlSequenceOfOperation`이 `hvac_action`에 따라 `CoolingOnly`와 `HeatingOnly` 사이를 동적으로 전환합니다. ([#207](https://github.com/RiDDiX/home-assistant-matter-hub/issues/207))

> **v2.0.20 신규:** 이제 AutoMode는 기기가 Home Assistant에서 `heat_cool`(이중 설정값)을 지원할 때만 노출됩니다. `auto` 모드만 있는 기기(단일 설정값, 기기가 결정)는 더 이상 AutoMode를 얻지 않으며, 이는 이전에 Apple Home이 충돌하는 명령을 보내고 모드 전환을 일으키던 문제를 유발했습니다.

> **v2.0.27 신규:** `auto` + `cool`을 가지지만 명시적인 `heat` 모드가 없는 기기(예: SmartIR 에어컨)는 더 이상 Matter 적합성 오류로 충돌하지 않습니다. AutoMode 기능이 없는 기기의 경우 `controlSequenceOfOperation`이 이제 `CoolingAndHeating` 대신 `CoolingOnly` 또는 `HeatingOnly`로 동적으로 설정됩니다. ([#28](https://github.com/RiDDiX/home-assistant-matter-hub/issues/28))

이는 단일 기능 온도조절기에서 Alexa가 명령을 거부하는 것을 방지합니다 ([#136](https://github.com/RiDDiX/home-assistant-matter-hub/issues/136)).

**온도 표시 단위:**
`ThermostatUserInterfaceConfiguration` 클러스터는 HA 온도 단위 설정(°C 또는 °F)을 Matter 컨트롤러에 노출합니다.

자세한 기능 변형, 모드 매핑, 문제 해결은 [공조 가이드](./devices/climate.md)를 참조하세요.

---

### 팬 (`fan`)

속도 및 방향 제어를 지원하는 **Fan** 기기에 매핑됩니다.

**지원되는 기능:**
| HA Feature | Matter Capability |
|------------|------------------|
| On/Off | FanControl On/Off |
| Speed percentage | FanControl SpeedPercent |
| Preset modes | FanControl FanMode |
| Direction | FanControl AirflowDirection |
| Oscillation | FanControl Rocking |

**바람 모드:**
| Feature | 설명 |
|---------|-------------|
| **Oscillation** | `oscillating` 속성을 Matter Rocking에 매핑 |
| **Natural Wind** | "Natural" 프리셋 모드를 naturalWind에 매핑 |
| **Sleep Wind** | "Sleep" 프리셋 모드를 sleepWind에 매핑 |

**Entity Mapping:**
- Entity Mapping UI를 통해 **Air Purifier** 기기 유형으로 매핑할 수 있습니다
- Air Purifier는 HEPA 필터 모니터링을 위한 `filterLifeEntity`를 지원합니다

**속도 매핑:**
- HA 백분율 (0-100%) → Matter 백분율 (0-100)
- 명명된 프리셋은 Low/Medium/High/Auto에 매핑

---

### 센서 (`sensor`)

`device_class`와 `unit_of_measurement`를 기반으로 다양한 센서 유형이 매핑됩니다.

#### 온도 센서
- **Device Class:** `temperature`
- **단위:** `°C`, `°F`
- **Matter Type:** TemperatureSensor

#### 습도 센서
- **Device Class:** `humidity`
- **단위:** `%`
- **Matter Type:** HumiditySensor

#### 압력 센서
- **Device Class:** `pressure`, `atmospheric_pressure`
- **단위:** `hPa`, `mbar`, `kPa`, `Pa`
- **Matter Type:** PressureSensor

#### 유량 센서
- **Device Class:** `volume_flow_rate`
- **단위:** `m³/h`, `L/min`, `gal/min`
- **Matter Type:** FlowSensor

#### 조도 센서
- **Device Class:** `illuminance`
- **단위:** `lx`
- **Matter Type:** IlluminanceSensor

#### 공기질 센서
| Device Class | Matter Cluster |
|--------------|----------------|
| `aqi` | AirQuality |
| `pm25` | PM2.5 Concentration |
| `pm10` | PM10 Concentration |
| `co2` | CO2 Concentration |
| `volatile_organic_compounds` | TVOC Concentration |

#### 자동 센서 그룹화

HAMH는 동일한 HA 기기의 관련 센서를 하나의 Matter 엔드포인트로 자동 결합할 수 있습니다:

| Feature Flag | 설명 |
|--------------|-------------|
| `autoBatteryMapping` | 배터리 센서를 기본 센서와 결합(기본값: 비활성화) |
| `autoHumidityMapping` | 습도 센서를 온도 센서와 결합(기본값: 활성화) |
| `autoPressureMapping` | 압력 센서를 온도 센서와 결합(기본값: 활성화) |

**Entity Mapping**을 통해 센서를 수동으로 할당할 수도 있습니다:
- `batteryEntity`: 배터리 센서 엔터티 ID
- `humidityEntity`: 습도 센서 엔터티 ID
- `pressureEntity`: 압력 센서 엔터티 ID

자세한 설정 안내는 [온도 & 습도 센서](./devices/temperature-humidity-sensor.md)를 참조하세요.

---

### 날씨 (`weather`)

습도와 압력 측정 클러스터가 하나의 기기에 쌓인 **TemperatureSensor**에 매핑됩니다. 날씨 엔터티의 상태는 텍스트 조건(예: `sunny`)이므로 측정값은 속성에서 가져옵니다.

**지원되는 속성:**
- `temperature` + `temperature_unit` → Temperature
- `humidity` (%) → Humidity
- `pressure` + `pressure_unit` (`hPa`, `mbar`, `inHg`, `mmHg`) → Pressure(hPa로 변환)

**동작:**
- 기본적으로 켜집니다. 브리지 필터와 일치하는 `weather.*` 엔터티가 자동으로 노출됩니다. 원하지 않는 것을 제외하려면 엔터티별 `disabled` 매핑을 사용하세요.
- 습도와 압력은 선택 사항입니다. 누락된 측정값은 0이 아닌 값 없음으로 보고됩니다.

**컨트롤러 참고:**
- 온도와 습도는 독립형 센서 유형이 작동하는 곳(Apple, Google, Alexa)에서 작동합니다.
- 압력은 Google 전용입니다. Apple Home은 기압을 표시하지 않으며 Alexa는 Pressure 클러스터를 지원하지 않습니다.
- 세 가지 측정값은 하나의 TemperatureSensor 기기에 쌓입니다. 각 컨트롤러가 추가 클러스터를 어떻게 렌더링하는지는 아직 커뮤니티에서 테스트되지 않았습니다.

---

### 바이너리 센서 (`binary_sensor`)

`device_class` 속성을 기반으로 매핑됩니다.

| Device Class | Matter Device Type | 컨트롤러 표시 |
|--------------|-------------------|--------------------|
| `running`, `plug`, `power`, `battery_charging`, `light` | OnOffSensor | On/Off |
| `door`, `window`, `garage_door`, `opening`, `lock` | ContactSensor | Open/Closed |
| `cold` | Contact Sensor (기본) | Open/Closed |
| `battery`, `heat`, `connectivity`, `problem`, `safety`, `sound`, `tamper`, `update`, `vibration` | ContactSensor | Open/Closed |
| `motion`, `moving` | OccupancySensor (PIR) | Motion detected/Clear |
| `occupancy`, `presence` | OccupancySensor (PhysicalContact) | Occupied/Clear |
| `moisture` | Contact Sensor (기본) | Open/Closed |
| `smoke` | SmokeCoAlarm (Smoke) | Alarm |
| `carbon_monoxide`, `gas` | SmokeCoAlarm (CO) | Alarm |
| 기타 / 미설정 | OnOffSensor | On/Off |

> [!NOTE]
> 누수(`moisture`) 및 동결(`cold`) `binary_sensor`는 기본적으로 Matter 1.3 Contact Sensor로 설정되며, 이는 Alexa 브리지를 안정적으로 유지합니다. Matter 1.4 Water Leak, Water Freeze, Rain detector 유형은 device-type override를 통해 엔터티별로 선택할 수 있습니다 ([#365](https://github.com/RiDDiX/home-assistant-matter-hub/issues/365)).

---

### 미디어 플레이어 (`media_player`)

볼륨 및 재생 제어를 지원하는 **Speaker** 기기에 매핑됩니다.

**지원되는 기능:**
- On/Off
- 볼륨 제어 (0-100%)
- 음소거
- 재생/일시정지
- 정지
- 다음/이전 트랙

**기기 유형 재정의:**
미디어 플레이어는 Entity Mapping을 통해 다른 기기 유형으로 재정의할 수 있습니다. 예를 들어 미디어 플레이어를 **OnOffPlugInUnit**(스위치)에 매핑하면 Alexa 같은 컨트롤러에서 간단한 켜기/끄기 스위치로 나타나므로 전원 제어만 필요할 때 유용합니다.

**컨트롤러 참고:**
- Matter의 미디어 플레이어 지원은 제한적입니다
- 모든 컨트롤러가 모든 기능을 지원하지는 않습니다
- Apple Home에서 가장 잘 지원됩니다

---

### 이벤트 (`event`)

**GenericSwitch** 기기에 매핑됩니다.

**지원되는 활용 사례:**
- 초인종
- 버튼 이벤트
- 리모컨 버튼 누름

**동작:**
- HA `event.*` 엔터티의 이벤트는 Matter GenericSwitch 위치 변경으로 전달됩니다
- 컨트롤러는 버튼 누름 이벤트에 반응할 수 있습니다

---

### 버튼 (`button`, `input_button`)

자동 꺼짐 동작과 함께 **OnOffPlugInUnit**에 매핑됩니다.

**동작:**
1. 컨트롤러가 "켜기" 명령을 보냅니다
2. HA에서 버튼 누름이 트리거됩니다
3. 3초 후 기기가 자동으로 꺼집니다

---

### 씬 (`scene`)

활성화 전용 동작과 함께 **OnOffPlugInUnit**에 매핑됩니다.

**동작:**
- "켜기"는 씬을 활성화합니다
- 활성화 후 상태는 항상 "꺼짐"으로 표시됩니다

---

### 스크립트 (`script`)

**OnOffPlugInUnit**에 매핑됩니다.

**동작:**
- "켜기"는 스크립트를 실행합니다
- 상태는 항상 "꺼짐"으로 표시됩니다(스크립트는 순간적인 액션입니다)

> **참고:** Home Assistant에서 숨겨진(`hidden_by: user`) 스크립트도 필터 구성에서 명시적으로 일치하면 포함됩니다.

---

### 밸브 (`valve`)

**WaterValve** 기기에 매핑됩니다.

**지원되는 액션:**
- 밸브 열기
- 밸브 닫기

**컨트롤러 지원:**
- Apple Home: | 제한적
- Google Home: | 제한적
- Alexa: | 제한적

---

### 가습기 (`humidifier`)

습도 제어 기능이 있는 **Fan** 기기에 매핑됩니다.

> 참고: Matter에는 기본 가습기 기기 유형이 없습니다. 가장 유사한 것으로 Fan 기기 유형이 사용되며, FanControl 클러스터가 습도 수준에 매핑됩니다.

**지원되는 기능:**
- On/Off
- 목표 습도(팬 속도 백분율로)
- 자동 모드(사용 가능한 모드에 "auto"가 포함된 경우)

---

### 청소기 (`vacuum`)

**RoboticVacuumCleaner**에 매핑됩니다.

**지원되는 기능:**
- 청소 시작/정지
- 도킹으로 복귀
- 작동 모드(Idle, Cleaning)
- 방 선택(청소기가 지원하는 경우)
- 청소 모드 선택(Sweeping, Mopping, Sweeping and mopping, Mopping after sweeping)
- 배터리 잔량(사용 가능한 경우)

**Entity Mapping 옵션:**
| Option | 설명 |
|--------|-------------|
| `roomEntities` | 방 선택용 버튼 엔터티 ID 배열(Roborock) |
| `batteryEntity` | 외부 배터리 센서 엔터티(Roomba, Deebot) |
| `cleaningModeEntity` | 청소 모드용 select 엔터티(Dreame, Ecovacs 등) |
| `suctionLevelEntity` | 흡입 레벨용 select 엔터티. Apple Home의 추가 기능 패널에 Quiet/Max 강도 토글을 추가 |
| `mopIntensityEntity` | 걸레 강도 / 물 수준용 select 엔터티. Apple Home의 추가 기능 패널에 걸레 강도 모드를 추가 |

**기능 플래그 (Bridge Settings):**
| Flag | 설명 |
|------|-------------|
| `serverMode` | 독립형 기기로 노출(Apple Home/Alexa에 필요) |
| `vacuumIncludeUnnamedRooms` | 방 선택에 이름이 없는 방도 포함 |

**주요 제한사항:**
- **서버 모드 권장** - 완전한 음성 명령 지원(Siri, Alexa)을 위해
- **서버 모드 = 브리지당 기기 하나** - 청소기가 유일한 기기여야 합니다
- **Apple Home**은 모든 홈 허브에서 iOS/tvOS/AudioOS 18.4+를 요구합니다
- **Google Home**은 RVC 지원이 제한적입니다. 기본 시작/정지는 작동하지만 방 선택과 청소 모드는 다를 수 있습니다

자세한 설정 안내는 [로봇청소기 가이드](./devices/robot-vacuum.md)를 참조하세요.

> **참고:** `lawn_mower` 엔터티는 `robotic_lawn_mower` override를 통해 RVC 매핑(시작/일시정지/도킹, 배터리, 충전 상태)을 재사용합니다 ([#301](https://github.com/RiDDiX/home-assistant-matter-hub/issues/301)).

---

### 비상 제어 패널 (`alarm_control_panel`)

**ModeSelectDevice** (0x0027)에 매핑됩니다. 각 경보 상태가 선택 가능한 모드가 됩니다.

**지원되는 모드:**
- Disarmed
- Armed Home
- Armed Away
- Armed Night
- Armed Vacation
- Armed Custom Bypass

**동작:**
- 컨트롤러에서 모드를 변경하면 HA에서 해당 `alarm_control_panel.alarm_*` 액션을 호출합니다
- 현재 모드는 엔터티의 현재 경보 상태를 반영합니다
- Apple Home 호환성을 위해 OnOff 폴백이 포함됩니다: "켬면" 경보가 설정되고 "끄면" 해제됩니다

**컨트롤러 참고:**
- Matter에는 기본 경보 패널 기기 유형이 없으므로 가장 유사한 것으로 ModeSelect가 사용됩니다
- "Hey Siri, set alarm to Armed Away" 같은 음성 명령은 작동하지 않을 수 있으므로 컨트롤러 앱을 사용하여 모드를 전환하세요

---

### Select / Input Select (`select`, `input_select`)

**ModeSelectDevice** (0x0027)에 매핑됩니다. select 엔터티의 각 옵션이 선택 가능한 모드가 됩니다.

**동작:**
- 각 옵션은 번호가 매겨진 모드로 노출됩니다
- 컨트롤러에서 모드를 변경하면 HA에서 `select.select_option`을 호출합니다
- 현재 모드는 엔터티의 현재 상태를 반영합니다

**활용 사례:**
- 세탁기 프로그램
- HVAC 작동 모드
- 관개 구역
- 씬 선택기
- 고정된 옵션 목록이 있는 모든 엔터티

**구성:** 특별한 설정이 필요 없습니다. 브리지 필터와 일치하는 `select` 및 `input_select` 엔터티는 자동으로 노출됩니다. Entity Mapping을 통해 `Mode Select` 기기 유형을 수동으로 할당할 수도 있습니다.

---

### 자동화 (`automation`)

**OnOffPlugInUnit**에 매핑됩니다.

**동작:**
- "켜기"는 자동화를 트리거합니다(한 번 실행)
- "끄기"는 자동화를 비활성화합니다
- 상태는 자동화의 활성화/비활성화 상태를 반영합니다

---

### 리모컨 (`remote`)

**OnOffPlugInUnit**에 매핑됩니다.

**동작:**
- "켜기"는 HA에서 `remote.turn_on`을 호출합니다
- "끄기"는 HA에서 `remote.turn_off`를 호출합니다
- 상태는 리모컨 엔터티의 켜기/끄기 상태를 반영합니다

---

### 사이렌 (`siren`)

**OnOffPlugInUnit**에 매핑됩니다.

**지원되는 액션:**
- 켜기 → `siren.turn_on`
- 끄기 → `siren.turn_off`

**동작:**
- 상태는 HA에서 사이렌 엔터티의 켜기/끄기 상태를 반영합니다
- 모든 컨트롤러에서 간단한 켜기/끄기 기기로 나타납니다

**컨트롤러 참고:**
- 모든 주요 컨트롤러(Apple Home, Google Home, Alexa, SmartThings)에서 표준 켜기/끄기 기기로 지원됩니다

---

### 식기세척기 (Entity Mapping Override)

Entity Mapping UI를 통해 `switch` 엔터티의 **device type override**로 사용할 수 있습니다. OperationalState와 OnOff 클러스터를 갖춘 Matter **Dishwasher** 기기 유형에 매핑됩니다.

**HA 상태 → Matter OperationalState 매핑:**
| HA State | Matter State |
|----------|-------------|
| `off`, `idle`, `standby`, `complete`, `finished` | Stopped |
| `on`, `running`, `active`, `drying`, `washing` | Running |
| `paused` | Paused |

**지원되는 명령:**
- **Start** → `homeassistant.turn_on`
- **Stop** → `homeassistant.turn_off`
- **Resume** → `homeassistant.turn_on`
- **Pause** → 지원되지 않음(오류 반환)

**컨트롤러 참고:**
- **Google Home**: 지원됨
- **Amazon Alexa**: 지원됨
- **Samsung SmartThings**: 지원됨
- **Apple Home**: 지원되지 않음(Apple은 Dishwasher 기기 유형을 지원하지 않음)

---

## Entity Mapping 커스터마이징

Entity Mapping UI를 사용하여 엔터티별로 기본 기기 유형 매핑을 재정의할 수 있습니다.

**사용 가능한 Override 유형:**
- OnOffLight
- DimmableLight
- ColorTemperatureLight
- ExtendedColorLight
- OnOffPlugInUnit
- OnOffSwitch(이제 이전의 동작 없는 플러그 대신 컨트롤러가 스위치로 렌더링하는 OnOff 서버를 갖춘 실제 0x0100 On/Off Light를 생성합니다. 옵트인 사용자는 한 번 재페어링이 필요합니다) ([#380](https://github.com/RiDDiX/home-assistant-matter-hub/issues/380))
- DoorLock
- WindowCovering
- Thermostat
- Fan
- AirPurifier
- RobotVacuumCleaner
- Humidifier/Dehumidifier
- Speaker
- BasicVideoPlayer
- HumiditySensor, TemperatureSensor, PressureSensor, LightSensor, FlowSensor
- AirQualitySensor, BatteryStorage, TVOCSensor
- WaterValve, Pump
- WaterHeater
- Dishwasher
- GenericSwitch
- SmokeCO Alarm, Water Leak Detector, Water Freeze Detector

**활용 사례:**
- Alexa에서 간단한 켜기/끄기 스위치를 위해 `media_player`를 OnOffPlugInUnit에 매핑
- HEPA 필터 모니터링을 위해 `fan`을 Air Purifier 유형에 매핑
- `switch`를 Pump 유형에 매핑
- OperationalState 지원을 위해 `switch`를 Dishwasher 유형에 매핑(Google/Alexa/SmartThings)
- 특정 조명 유형 강제

> **참고:** v2.0.25부터 엔터티 매핑 변경은 약 30초 이내에 자동으로 적용됩니다. 브리지 재시작은 필요하지 않습니다.

---

## 알려진 컨트롤러 제한사항

### Google Home

#### 장시간 꺼짐 후 조명 밝기 초기화

**문제:** 조명이 몇 분(보통 5분 이상) 동안 꺼져 있다가 Google Home을 통해 켜면 마지막으로 사용한 값 대신 밝기가 100%로 설정될 수 있습니다.

**원인:** 이는 Google Home / Matter.js 상호작용 문제입니다. Google Home은 구독 갱신 후 필수 `transitionTime` 필드 없이 밝기 명령을 보내어, 브리지가 명령을 처리하기 전에 Matter.js에서 검증 오류가 발생합니다.

**해결 방법 - Home Assistant 블루프린트:**

꺼질 때 밝기를 저장하고 켜질 때 복원하는 블루프린트를 생성합니다:

<details>
<summary>블루프린트 YAML 펼치기 (클릭)</summary>

```yaml
blueprint:
  name: Matter/Google - Restore brightness after delayed ON
  description: >
    Workaround for Google Home / Matter bridge behavior that turns lights on at 100%
    after being off for a while. Stores brightness on turn_off and restores it on
    turn_on if the light was off for at least X minutes.
  domain: automation
  input:
    light_target:
      name: Light entity
      selector:
        entity:
          domain: light
    brightness_store:
      name: Helper to store last brightness (input_number, 1..255)
      selector:
        entity:
          domain: input_number
    off_minutes_threshold:
      name: Minutes off before restore
      default: 5
      selector:
        number:
          min: 1
          max: 120
          mode: slider
          step: 1
    restore_only_if_100pct:
      name: Only restore if Google turned it on at ~100%
      description: If enabled, restore only when current brightness is very high (>=250).
      default: true
      selector:
        boolean: {}

mode: restart

trigger:
  - platform: state
    entity_id: !input light_target
    to: "off"
    id: turned_off
  - platform: state
    entity_id: !input light_target
    to: "on"
    id: turned_on

variables:
  light_entity: !input light_target
  store_entity: !input brightness_store
  minutes_threshold: !input off_minutes_threshold
  only_if_100: !input restore_only_if_100pct

action:
  - choose:
      - conditions:
          - condition: trigger
            id: turned_off
        sequence:
          - variables:
              prev_brightness: "{{ state_attr(light_entity, 'brightness') }}"
          - condition: template
            value_template: "{{ prev_brightness is number and prev_brightness|int > 0 }}"
          - service: input_number.set_value
            target:
              entity_id: "{{ store_entity }}"
            data:
              value: "{{ prev_brightness|int }}"
      - conditions:
          - condition: trigger
            id: turned_on
        sequence:
          - delay: "00:00:02"
          - variables:
              was_off_seconds: >
                {{ (as_timestamp(now()) - as_timestamp(states[light_entity].last_changed)) | int }}
              threshold_seconds: "{{ (minutes_threshold | int) * 60 }}"
              current_brightness: "{{ state_attr(light_entity, 'brightness') | int(0) }}"
              saved_brightness: "{{ states(store_entity) | int(0) }}"
          - condition: template
            value_template: >
              {{ saved_brightness > 0 and (not only_if_100 or current_brightness >= 250) }}
          - service: light.turn_on
            target:
              entity_id: "{{ light_entity }}"
            data:
              brightness: "{{ saved_brightness }}"
```

</details>

**설정:**
1. 각 조명에 대해 `input_number` 헬퍼를 생성합니다(범위 1-255)
2. 블루프린트를 가져오거나 위의 YAML로 자동화를 생성합니다
3. 구성: 조명 엔터티와 해당 헬퍼를 선택합니다

**대안:** 안정적으로 작동하는 음성 명령("Hey Google, dim the lights to 50%")을 사용하세요.

#### 커버 자동화 사용 불가

**문제:** 창문 커버링 기기(블라인드, 셔터, 커튼)는 Google Home 자동화에서 액션으로 사용할 수 없습니다. 커버 기기를 선택하면 "사용 가능한 액션 없음"이 표시됩니다.

**원인:** 이는 Matter WindowCovering 기기에 대한 Google Home의 제한사항입니다. 동일한 문제가 네이티브 Matter 블라인드(예: Smartwings)에도 영향을 줍니다.

**해결 방법:**
1. 음성 명령("Hey Google, close [cover name]")과 함께 Google Home Routines를 사용하세요
2. Home Assistant 스크립트를 생성하고 HAMH를 통해 스위치로 노출하세요
3. Google Home 자동화 대신 Home Assistant 자동화를 사용하세요

---

### Amazon Alexa / Echo 기기

#### 켜기 시 조명 밝기 초기화

**문제:** 구독 갱신(약 5분마다) 후 Alexa는 조명을 켜는 때 이전에 다른 수준으로 디머되어 있었더라도 밝기를 100%로 재설정할 수 있습니다.

**원인:** 이는 Echo 기기가 새 구독 후 `on()` 명령 직후에 명시적인 `moveToLevel(254)` 명령을 보내는 Alexa 측 동작입니다.

**근거:**
- 동일한 동작이 다른 Matter 브리지에서도 발생합니다
- 로그를 보면 Alexa가 `on()` 명령 후에 명시적으로 `level: 254`를 보냅니다
- 이는 디밍 직후에는 발생하지 않고 구독 갱신 후에만 발생합니다

**해결 방법:** 현재 이 Alexa 동작에 대한 브리지 측 해결책은 없습니다. 안정적으로 작동하는 음성 명령("Alexa, dim the lights to 50%")을 사용하세요.

---

## 새 기기 유형 요청

새 기기 유형을 요청하기 전에 다음을 확인하세요:

1. 해당 기기 유형이 [Matter Specification](https://handbook.buildwithmatter.com/how-it-works/device-types/)에 존재하는지
2. 사용 중인 컨트롤러가 해당 기기 유형을 지원하는지
3. 작동하는 기존 매핑이 없는지

새 기기 유형을 요청하려면 다음 내용과 함께 [기능 요청을 열어주세요](https://github.com/RiDDiX/home-assistant-matter-hub/issues/new?labels=enhancement):
- Home Assistant 도메인과 device class
- 원하는 Matter 기기 유형
- 사용 사례
- 사용 중인 컨트롤러
