# Light

Home Assistant 조명은 엔티티의 `supported_color_modes` 속성을 기준으로 적절한 Matter 조명 타입에 자동으로 매핑됩니다.

## 디바이스 타입 선택

| HA Color Modes | Matter Device Type |
|----------------|-------------------|
| None / `onoff` 전용 | OnOffLight |
| `brightness` (색상/색온도 없음) | DimmableLight |
| `color_temp` (HS/RGB/XY 없음) | ExtendedColorLight (ColorTemperature feature) |
| `hs`, `rgb`, `xy`, `rgbw`, `rgbww` | ExtendedColorLight (HueSaturation feature) |
| `color_temp` + 임의의 색상 모드 | ExtendedColorLight (두 feature 모두) |

> **참고:** 색온도 전용 조명은 Matter.js 초기화 문제를 피하기 위해 내부적으로 `ColorTemperatureLightDevice`가 아닌 `ExtendedColorLight`를 사용합니다. 동작은 동일하며, 컨트롤러에는 여전히 색온도 슬라이더가 표시됩니다.

## 기능

- **On/Off**, `light.turn_on` / `light.turn_off`를 통한 전원 제어
- **밝기(Brightness)**, HA 밝기(0-255)가 Matter Level(0-254)에 매핑됨
- **색온도(Color Temperature)**, HA mireds/Kelvin이 Matter Color Temperature에 매핑됨. 최소/최대 범위는 `min_color_temp_kelvin` / `max_color_temp_kelvin` 속성에서 가져옴
- **색상(Hue/Saturation)**, HA `hs_color`, `rgb_color`, `xy_color`, `rgbw_color`, 또는 `rgbww_color`가 Matter Hue/Saturation으로 변환됨
- **배터리(Battery)**, 엔티티 속성 또는 매핑된 센서에서 가져오는 선택적 배터리 잔량
- **적응형 조명(Adaptive Lighting)**, 조명이 꺼져 있는 동안의 색상 변경은 보류되었다가 켜질 때 병합됨 (`executeIfOff` + `pendingColorStaging`)

## 전력 및 에너지 측정

조명은 Matter 클러스터를 통해 선택적으로 전력 및 에너지 소비량을 보고할 수 있습니다:

- Entity Mapping UI를 통한 **수동 매핑**: `powerEntity`, `energyEntity`

조명은 더 이상 전력/에너지 센서를 자동으로 가져오지 않습니다. 조명 엔드포인트의 전기 클러스터는 Aqara를 손상시키므로, 이전에 에너지 수치를 표시하던 조명이 업그레이드 후 이를 잃을 수 있습니다. Entity Mapping 대화상자에서 해당 조명에 `powerEntity` / `energyEntity`를 명시적으로 설정하여 다시 추가하세요 (#374).

## Entity Mapping 옵션

| Option | 설명 |
|--------|-------------|
| `batteryEntity` | 배터리 센서 엔티티 ID (자동 감지 또는 수동) |
| `powerEntity` | 전력 측정 센서 엔티티 ID (수동 전용, 조명에 대해 자동 매핑되지 않음, #374 참조) |
| `energyEntity` | 에너지 측정 센서 엔티티 ID (수동 전용, 조명에 대해 자동 매핑되지 않음, #374 참조) |

## 색상 변환

브리지는 HA와 Matter 색상 형식 간에 변환합니다:

| HA Attribute | 변환 |
|-------------|------------|
| `hs_color` | 직접 HS → Matter Hue/Saturation |
| `rgb_color` | RGB → HS → Matter |
| `xy_color` | XY → HS → Matter |
| `rgbw_color` | RGBW → HS → Matter |
| `rgbww_color` | RGBWW → HS → Matter |

컨트롤러에서 색상을 설정하면 Matter Hue/Saturation이 다시 HA `hs_color` 형식으로 변환됩니다.

## 호환성

| Controller | On/Off | Brightness | Color Temp | Full Color |
|------------|--------|------------|------------|------------|
| Apple Home | ✅ | ✅ | ✅ | ✅ |
| Google Home | ✅ | ✅ | ✅ | ✅ |
| Amazon Alexa | ✅ | ✅ | ✅ | ✅ |

## 문제 해결

### 조명이 100% 밝기로 켜짐 (Google Home)

구독 갱신(약 5분) 후, Google Home이 조명을 켤 때 밝기를 100%로 설정할 수 있습니다. 이는 브리지 문제가 아닌 Google Home의 동작입니다. Home Assistant Blueprint 우회 방법은 [Supported Device Types](../supported-device-types.md#light-brightness-reset-after-extended-off-period)를 참조하세요.

### 조명이 100% 밝기로 켜짐 (Alexa)

Alexa는 구독 갱신 후 조명을 켠 뒤 명시적인 `moveToLevel(254)`를 보낼 수 있습니다. 현재 이 Alexa 동작에 대한 브리지 측 우회 방법은 없습니다.

### 색온도 범위가 다름

Matter와 HA는 서로 다른 최소/최대 색온도 범위를 가질 수 있습니다. 브리지는 엔티티의 `min_color_temp_kelvin` 및 `max_color_temp_kelvin` 속성을 사용합니다. 컨트롤러에 다른 범위가 표시되면 HA Developer Tools에서 이러한 속성을 확인하세요.

### 배터리 잔량이 표시되지 않음

1. 엔티티에 `battery` 또는 `battery_level` 속성이 있는지 확인하거나, Entity Mapping에서 `batteryEntity`를 구성하세요
2. 배터리 센서는 0-100의 숫자 값을 반환해야 합니다
3. 배터리 지원을 활성화한 후 컨트롤러에서 디바이스를 제거하고 다시 추가해야 할 수 있습니다
