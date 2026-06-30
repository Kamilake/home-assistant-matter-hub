# 컨트롤러 호환성 매트릭스

이 페이지는 커뮤니티 테스트와 공급업체가 공개한 Matter 장치 유형 목록을 바탕으로, 어떤 Matter 장치 유형이 어떤 컨트롤러와 작동하는지를 문서화합니다.

:::info
호환성은 컨트롤러 펀웨어 버전에 따라 달라집니다. 이 매트릭스는 알려진 최신 상태를 반영합니다. 불일치하는 점을 발견하면 이슈를 열어 주세요.
:::

## 장치 유형 지원

각주 번호가 표시된 행은 해당 값을 뒷받침하는 공급업체 출처로 연결됩니다. 번호가 없는 행은 커뮤니티 테스트 또는 HAMH의 이전 릴리스로 뒷받침됩니다.

| HA 도메인 | Matter 장치 유형 | Apple Home | Google Home | Alexa | Aqara Home | SmartThings |
|---|---|:---:|:---:|:---:|:---:|:---:|
| `light` | OnOffLight | ✅ | ✅ [¹](#sources) | ✅ [²](#sources) | ✅ [⁴](#sources) | ✅ |
| `light` | DimmableLight | ✅ | ✅ [¹](#sources) | ✅ [²](#sources) | ✅ [⁴](#sources) | ✅ |
| `light` | ColorTemperatureLight | ✅ | ✅ [¹](#sources) | ✅ [²](#sources) | ✅ [⁴](#sources) | ✅ |
| `light` | ExtendedColorLight | ✅ | ✅ [¹](#sources) | ✅ [²](#sources) | ✅ [⁴](#sources) | ✅ |
| `switch` | OnOffPlugInUnit | ✅ | ✅ [¹](#sources) | ✅ [²](#sources) | ✅ [⁴](#sources) | ✅ |
| `switch` | DimmablePlugInUnit | ✅ | ✅ | ✅ [²](#sources) | ✅ [⁴](#sources) | ✅ |
| `lock` | DoorLock | ✅ | ✅ [¹](#sources) | ✅ [²](#sources) | ✅ [⁴](#sources) | ✅ |
| `cover` | WindowCovering | ✅ | ✅ [¹](#sources) | ✅ [²](#sources) | ✅ [⁴](#sources) | ✅ |
| `climate` | Thermostat | ✅ | ✅ [¹](#sources) | ✅ [²](#sources) | ✅ [⁴](#sources) | ✅ |
| `fan` | Fan | ✅ | ✅ [¹](#sources) | ✅ [²](#sources) | ✅ [⁴](#sources) | ⚠️ |
| `sensor` | TemperatureSensor | ✅ | ✅ [¹](#sources) | ✅ [²](#sources) | ✅ [⁴](#sources) | ✅ |
| `sensor` | HumiditySensor | ✅ | ✅ [¹](#sources) | ✅ [²](#sources) | ✅ [⁴](#sources) | ✅ |
| `sensor` | PressureSensor | ✅ | ✅ [¹](#sources) | ❌ [²](#sources) | ✅ [⁴](#sources) | ✅ |
| `sensor` | IlluminanceSensor | ✅ | ✅ [¹](#sources) | ✅ [²](#sources) | ❓ | ✅ |
| `sensor` | FlowSensor | ❓ | ✅ [¹](#sources) | ❌ [²](#sources) | ❓ | ❓ |
| `sensor` | AirQualitySensor | ✅ | ✅ [¹](#sources) | ✅ [²](#sources) | ✅ [⁴](#sources) | ❓ |
| `sensor` | ElectricalSensor | ❓ | ❓ | ❓ | ❓ | ❓ |
| `binary_sensor` | ContactSensor | ✅ | ✅ [¹](#sources) | ✅ [²](#sources) | ✅ [⁴](#sources) | ✅ |
| `binary_sensor` | OccupancySensor | ✅ | ✅ [¹](#sources) | ✅ [²](#sources) | ✅ [⁴](#sources) | ✅ |
| `binary_sensor` | SmokeCoAlarm | ✅ | ✅ | ✅ [²](#sources) | ✅ [⁴](#sources) | ✅ |
| `binary_sensor` (override) | WaterLeakDetector | ✅ [³](#sources) | ❌ [¹](#sources) | ⚠️ [²](#sources) | ✅ [⁴](#sources) | ❓ |
| `binary_sensor` (override) | WaterFreezeDetector | ❌ [³](#sources) | ❌ [¹](#sources) | ❌ [²](#sources) | ✅ [⁴](#sources) | ❓ |
| `media_player` | Speaker | ❓ | ✅ [¹](#sources) | ❌ [²](#sources) | ✅ [⁴](#sources) | ❓ |
| `media_player` | BasicVideoPlayer | ❓ | ❓ | ❓ | ✅ [⁴](#sources) | ❓ |
| `valve` | WaterValve | ✅ | ❌ [¹](#sources) | ❌ [²](#sources) | ✅ [⁴](#sources) | ❓ |
| `vacuum` | RoboticVacuumCleaner | ✅ [³](#sources) | ✅ [¹](#sources) | ✅* [²](#sources) | ✅ [⁴](#sources) | ❓ |
| `water_heater` | Thermostat | ✅ | ✅ | ✅ | ✅ [⁴](#sources) | ❓ |
| `alarm_control_panel` | ModeSelect | ❓ | ❓ | ❌** | ❓ | ❓ |
| `select` | ModeSelect | ❓ | ❌*** | ❌** | ❓ | ❓ |
| `event` | GenericSwitch | ✅ | ❓ | ✅ [²](#sources) | ❓ | ❓ |
| `humidifier` | Fan | ✅ | ✅ [¹](#sources) | ✅ [²](#sources) | ✅ [⁴](#sources) | ❓ |
| `dishwasher` (override) | Dishwasher | ❌ [³](#sources) | ✅ [¹](#sources) | ✅ [²](#sources) | ❓ | ✅ |
| `weather` | TemperatureSensor (+Humidity, +Pressure) | ⚠️**** | ⚠️**** | ⚠️**** | ❓ | ❓ |

:::note 누수 및 결빙 감지기는 옵인(opt-in)입니다
기본적으로 `moisture` 또는 `cold` 바이너리 센서는 모든 컨트롤러가 처리할 수 있는 일반 ContactSensor(Matter 1.3)로 노출됩니다. 위의 WaterLeakDetector와 WaterFreezeDetector 행은 Matter 1.4 유형으로, Entity Mapping 대화 상자에서 엔터티의 Matter 장치 유형을 수동으로 설정한 경우에만 사용됩니다. WaterLeakDetector를 설정하면 Apple Home(iOS 18.4+)에서 실제 누수/경보 타일을 표시하지만, Google은 이러한 유형을 목록화하지 않으며, Alexa는 누수를 아무 기능에도 매핑하지 않고, 1.4 감지기 유형을 노출하면 Alexa 브리지가 방해되어 해당 브리지의 모든 장치가 응답하지 않게 될 수 있습니다 ([#365](https://github.com/RiDDiX/home-assistant-matter-hub/issues/365)). Apple 전용이 아니라면 기본값을 유지하세요.
:::

### 범례

- ✅ = 작동 확인됨
- ⚠️ = 부분 지원 또는 알려진 문제 있음
- ❓ = 테스트되지 않았거나 알 수 없음
- ❌ = 컨트롤러에서 지원하지 않음

\* Alexa 청소기 지원은 `vacuumOnOff` 기능 플래그가 활성화되어 있어야 합니다.

\*\* Alexa는 독립 ModeSelect 장치 유형(0x0027)을 지원하지 않습니다. ModeSelect 클러스터는 Lamp나 Fan 같은 특정 장치 유형에서만 인식됩니다. [Alexa 지원 장치 카테고리](https://developer.amazon.com/en-US/docs/alexa/smarthome/supported-matter-device-categories.html)와 [#273](https://github.com/RiDDiX/home-assistant-matter-hub/issues/273)을 참조하세요.

\*\*\* Google Home은 독립 ModeSelect 장치 유형(0x0027)을 지원하지 않습니다: Google이 공개한 Matter 장치 유형에서 누락되어 있어 Google은 옵션 제어가 없는 일반 정보 화면을 표시합니다(#356). 옵션 레이블은 올바르게 전송되며, 이는 브리지 버그가 아닌 컨트롤러 측 장치 유형 공백입니다. Home Assistant Google Assistant 클라우드 통합은 이러한 엔터티를 Google "모드"로 노출하지만, 이는 HAMH 브리지가 아닌 별도의 비Matter 경로입니다. 해결 방법: 해당 클라우드 통합을 사용하거나 엔터티를 HA 템플릿 스위치 또는 스크립트로 노출하세요. [#356](https://github.com/RiDDiX/home-assistant-matter-hub/issues/356)과 [#296](https://github.com/RiDDiX/home-assistant-matter-hub/issues/296)을 참조하세요.

\*\*\*\* `weather` 엔터티는 Humidity와 Pressure 클러스터가 하나의 장치에 쌓인 TemperatureSensor로 노출됩니다. 온도와 습도는 독립 센서 행이 작동하는 곳에서 작동해야 합니다. 압력은 Google 전용입니다(PressureSensor 행 참조). 단일 장치에 클러스터를 쌓는 형태는 아직 커뮤니티 테스트가 이루어지지 않았으므로, 이러한 셀은 확인된 것이 아닌 예상되는 것으로 간주하세요.

### 출처

위의 ✅ / ❌ 셀에 대한 각주 참조:

1. Google Home, [지원 장치](https://developers.home.google.com/matter/supported-devices) (문서 일자 2024-12-20). Google에 ❌로 표시된 행은 해당 페이지에 나열되지 않은 장치 유형입니다. Google 문서는 약 16개월 되었으며, 나열되지 않은 셀은 단지 "아직 문서화되지 않음"을 의미할 수 있습니다.
2. Amazon Alexa, [지원 Matter 장치 카테고리 및 클러스터](https://developer.amazon.com/en-US/docs/alexa/smarthome/supported-matter-device-categories.html) (문서 일자 2026-04-08). Alexa에 ❌로 표시된 행은 해당 페이지에 없는 장치 유형입니다.
3. Apple Home, [Home 앱과 함께 Matter 액세서리 사용](https://support.apple.com/en-us/102135) (문서 일자 2025-12-12) 및 로봇 청소기 지원에 대한 iOS 18.4 릴리스 커버리지. Apple의 공개 문서는 식기세척기를 지원 카테고리로 나열하지 않습니다.
4. Aqara Home, [Everything Matter](https://www.aqara.com/en/explore/everything-matter/) 장치 목록(2026-06 가져옴) 및 [2025년 4월 Matter 컨트롤러 업데이트](https://www.businesswire.com/news/home/20250409001178/en). Aqara는 가장 넓은 장치 유형 범위 중 하나를 제공합니다. Aqara의 ❓는 해당 유형이 그 페이지에 명시되지 않았다는 의미이지, 실패한다고 알려진 것은 아닙니다.

Apple, Google, Alexa, Aqara, SmartThings는 각각 다른 주기로 움직입니다. 여기서 ❌는 공급업체가 현재 장치 유형 페이지에 지원을 공개하지 않았다는 의미이지, 장치가 실패한다고 알려진 것은 아닙니다. 공급업체가 카테고리를 추가하면 해당 셀을 변경하고 업데이트를 인용합니다.

## Aqara Home

Aqara Home은 컨트롤러로 인식됩니다. Aqara fabric이 커미셔닝되면 장치별 지원 칩과 경고가 위의 Aqara 열을 반영합니다. 이러한 경고는 브리지의 자체 페이지와 Health Dashboard에 표시됩니다. Aqara는 넓은 범위의 Matter 장치 유형을 제공하므로 경고가 드물게 발생합니다.

몇 가지 Aqara 특이사항이 자동으로 처리됩니다:

- 전력/에너지 클러스터는 조명 엔드포인트에서 제외됩니다. 그렇지 않으면 Aqara가 해당 엔드포인트를 누락시킵니다 ([#374](https://github.com/RiDDiX/home-assistant-matter-hub/discussions/374)).
- 루트 `softwareVersionString`이 숫자 버전과 일치하도록 조정되어 브리지 등록이 멈추지 않습니다 ([#316](https://github.com/RiDDiX/home-assistant-matter-hub/issues/316)).
- `productNameFromNodeLabel` 플래그가 켜져 있을 때 Aqara를 크래시하게 하는 문자가 `productName`에서 제거됩니다 ([#330](https://github.com/RiDDiX/home-assistant-matter-hub/issues/330)).

Aqara가 에어컨을 표시하지 않는 경우, 엔터티의 `disableClimateFanControl` 플래그를 설정하여 일반 Thermostat로 노출하세요 ([#318](https://github.com/RiDDiX/home-assistant-matter-hub/issues/318)). 이름 지정의 경우 `productNameFromNodeLabel` 브리지 플래그와 엔터티별 `customProductName` / `customVendorId` 재정의가 Aqara가 원하는 장치 이름을 표시하는 데 도움이 됩니다.

## 컨트롤러 프로파일

HAMH에는 최적의 호환성을 위해 기능 플래그를 미리 구성하는 내장 컨트롤러 프로파일이 포함되어 있습니다:

| 프로파일 | 주요 설정 |
|---|---|
| **Apple Home** | `autoForceSync: true`, `coverUseHomeAssistantPercentage: true` |
| **Google Home** | `autoForceSync: true` |
| **Alexa** | `autoForceSync: true`, `vacuumOnOff: true` |
| **Multi-Controller** | `autoForceSync: true`, `vacuumOnOff: true`, `coverUseHomeAssistantPercentage: true` |

프로파일 선택 방법에 대한 자세한 내용은 [브리지 구성](../getting-started/bridge-configuration.md)을 참조하세요.

## 공식 컨트롤러 문서

- **Alexa**: [Matter Support](https://developer.amazon.com/en-US/docs/alexa/smarthome/matter-support.html#device-categories-and-clusters)
- **Google Home**: [Supported Devices](https://developers.home.google.com/matter/supported-devices#device_type_and_control_support)
- **Apple Home**: [Matter Accessories](https://support.apple.com/en-us/102135)
- **Aqara Home**: [Everything Matter](https://www.aqara.com/en/explore/everything-matter/)
- **SmartThings**: [Supported Device Types](https://developer.smartthings.com/docs/devices/hub-connected/matter/matter-device-types)

## 기여하기

위에 표시되지 않은 컨트롤러로 장치 유형을 테스트한 경우, 결과를 담아 이슈나 PR을 열어 주세요. 다음을 포함하세요:
- 컨트롤러 이름과 펀웨어 버전
- 테스트한 장치 유형
- 작동 여부(정상 작동, 부분 작동, 또는 작동하지 않음)
- 발생한 특정 문제
