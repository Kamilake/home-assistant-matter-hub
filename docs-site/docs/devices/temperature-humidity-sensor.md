# Temperature, Humidity & Pressure Sensor

많은 Zigbee 기반 센서(예: Xiaomi Aqara WSDCGQ11LM, Sonoff SNZB-02 등)는 온도, 습도, 기압, 배터리 잔량을 Home Assistant에서 **별도의 엔티티**로 보고합니다. 이로 인해 하나의 통합된 디바이스 대신 여러 개의 개별 디바이스가 Matter 컨트롤러에 나타날 수 있습니다.

**Auto Sensor Grouping**과 **Entity Mapping**을 사용하면 이러한 항목을 온도, 습도, 기압, 배터리 상태를 함께 표시하는 **단일 Matter 디바이스**로 결합할 수 있습니다.

## 기능

- **결합된 디바이스** - 3-4개의 개별 디바이스 대신 Apple Home, Google Home, Alexa에서 단일 디바이스로 표시
- **온도** - 온도 센서의 기본 측정값
- **습도** - 별도의 습도 센서 엔티티에서 연결됨
- **기압** - 별도의 기압 센서 엔티티에서 연결됨
- **배터리 잔량** - 별도의 배터리 센서 엔티티에서 가져오는 선택적 배터리 상태
- **자동 그룹화** - HAMH가 동일한 HA 디바이스의 센서를 자동으로 결합함 (수동 구성 불필요)
- **디바이스 이름** - Home Assistant 엔티티 이름 사용 (예: "H&T Bad")

## 작동 방식

### 자동 그룹화 (권장)

v2.0.17부터, HAMH는 동일한 HA 디바이스의 관련 센서를 자동으로 감지하고 결합합니다. 이는 Bridge Settings의 세 가지 feature flag로 제어됩니다:

| Feature Flag | 기본값 | 설명 |
|--------------|---------|-------------|
| `autoHumidityMapping` | 활성화 | 습도를 온도와 결합 |
| `autoPressureMapping` | 활성화 | 기압을 온도와 결합 |
| `autoBatteryMapping` | 활성화 | 모든 기본 센서에 배터리 추가 |

자동 그룹화를 사용하면 수동으로 구성할 필요가 없습니다. 센서는 HA 디바이스 할당에 따라 자동으로 결합됩니다.

### 수동 매핑

Entity Mapping을 사용하여 결합할 센서를 수동으로 구성할 수도 있습니다.

각 센서 엔티티를 개별적으로 노출하는 대신:

| 매핑 없음 | 매핑 있음 |
|-----------------|------------|
| H&T Bad Temperature | **H&T Bad** (결합됨) |
| H&T Bad Humidity |, (여전히 자체 독립 엔드포인트를 가짐) |
| H&T Bad Pressure |, (온도에 자동 할당됨) |
| H&T Bad Battery |, (온도에 자동 할당됨) |

결합된 디바이스는 모든 값을 한 곳에서 보고합니다.

> **참고:** Apple Home은 전용 HumiditySensor 엔드포인트에만 습도를 표시하기 때문에, 습도 엔티티는 온도 센서에 자동 할당되더라도 여전히 자체 독립 엔드포인트를 생성합니다.

## 구성

### 1단계: 엔티티 식별

Home Assistant에서 관련 센서 엔티티를 찾습니다. 예를 들어, 일반적인 Zigbee H&T 센서는 다음을 생성합니다:

- `sensor.h_t_bad_temperature` - 온도 측정
- `sensor.h_t_bad_humidity` - 습도 측정  
- `sensor.h_t_bad_pressure` - 기압 측정
- `sensor.h_t_bad_battery` - 배터리 백분율

### 2단계: Entity Mapping 구성

1. Dashboard에서 **브리지**로 이동합니다
2. **온도** 센서 엔티티를 찾습니다 (예: `sensor.h_t_bad_temperature`)
3. **Edit Mapping**을 클릭합니다
4. 선택적 필드를 입력합니다:
   - **Humidity Sensor**: `sensor.h_t_bad_humidity`
   - **Pressure Sensor**: `sensor.h_t_bad_pressure`
   - **Battery Sensor**: `sensor.h_t_bad_battery`
5. **Save**를 클릭합니다

> **팁:** 자동 그룹화가 활성화되어 있으면(기본값) 일반적으로 이 작업을 수동으로 할 필요가 없습니다. 센서가 서로 다른 HA 디바이스에 있거나 자동 그룹화가 올바르게 감지하지 못하는 경우에만 수동 매핑을 사용하세요.

### 3단계: 개별 엔티티 제외

Matter 컨트롤러에서 중복 디바이스를 방지하려면:

1. 습도 엔티티(`sensor.h_t_bad_humidity`)를 찾습니다
2. **Edit Mapping**을 클릭 → **"Disable this entity"**를 활성화합니다
3. 배터리 엔티티(`sensor.h_t_bad_battery`)에 대해 반복합니다

또는 단순히 브리지의 엔티티 필터에 포함하지 마세요.

### 4단계: 재페어링 (필요한 경우)

디바이스가 이미 페어링되어 있는 경우, 디바이스 기능이 변경되었으므로 Matter 컨트롤러에서 제거하고 다시 추가해야 할 수 있습니다.

## 예시 구성

다음 엔티티를 가진 "H&T Bad"라는 센서의 경우:

| Entity | 매핑 |
|--------|--------|
| `sensor.h_t_bad_temperature` | **기본(Primary)** - `humidityEntity`, `pressureEntity`, `batteryEntity` 설정 |
| `sensor.h_t_bad_humidity` | 자체 엔드포인트 유지 (Apple Home은 독립 HumiditySensor가 필요함) |
| `sensor.h_t_bad_pressure` | 자동 할당 또는 **비활성화** / 브리지에서 제외 |
| `sensor.h_t_bad_battery` | 자동 할당 또는 **비활성화** / 브리지에서 제외 |

결과: 온도, 습도, 기압, 배터리를 표시하는 하나의 결합된 디바이스 "H&T Bad".

## 호환성

| Controller | Temperature | Humidity | Pressure | Battery |
|------------|-------------|----------|----------|----------|
| Apple Home | ✅ | ✅ | ✅ | ✅ |
| Google Home | ✅ | ✅ | ✅ | ✅ |
| Amazon Alexa | ✅ | ✅ | ✅ | ⚠️ 제한적 |

## 기술 세부 정보

결합된 센서는 다음 Matter 클러스터를 사용합니다:

- **TemperatureMeasurement** - 기본 온도 엔티티에서
- **RelativeHumidityMeasurement** - 연결된 습도 엔티티에서
- **PressureMeasurement** - 연결된 기압 엔티티에서 (dPa 단위)
- **PowerSource** - 연결된 배터리 엔티티의 배터리 잔량

기압 값은 Matter를 위해 데시파스칼(dPa)로 변환됩니다. 지원되는 HA 단위: hPa, mbar, kPa, Pa.

## 문제 해결

### 습도/배터리가 표시되지 않음

1. 엔티티 ID가 올바른지 확인하세요 (철자, 대소문자 구분 확인)
2. 연결된 센서가 숫자 값을 제공하는지 확인하세요
3. Matter 컨트롤러에서 디바이스를 제거하고 다시 추가하세요

### 디바이스에 잘못된 이름이 표시됨

Matter 디바이스 이름은 Home Assistant의 기본 온도 엔티티의 `friendly_name`에서 가져옵니다. 거기서 사용자 정의하거나 Entity Mapping의 **Custom Name** 필드를 사용하세요.

### 이전 개별 디바이스가 여전히 나타남

결합된 센서를 구성한 후:

1. 개별 습도/배터리 엔티티를 비활성화하거나 제외하세요
2. Matter 컨트롤러에서 이전 디바이스를 제거하세요
3. 필요한 경우 브리지를 재페어링하세요

## 예시 Home Assistant 엔티티

일반적인 Zigbee H&T 센서 엔티티:

```yaml
# Temperature sensor
sensor.h_t_bad_temperature:
  state: "21.5"
  attributes:
    device_class: temperature
    unit_of_measurement: "°C"
    friendly_name: "H&T Bad"

# Humidity sensor  
sensor.h_t_bad_humidity:
  state: "58"
  attributes:
    device_class: humidity
    unit_of_measurement: "%"
    friendly_name: "H&T Bad Humidity"

# Pressure sensor
sensor.h_t_bad_pressure:
  state: "1013.25"
  attributes:
    device_class: atmospheric_pressure
    unit_of_measurement: "hPa"
    friendly_name: "H&T Bad Pressure"

# Battery sensor
sensor.h_t_bad_battery:
  state: "87"
  attributes:
    device_class: battery
    unit_of_measurement: "%"
    friendly_name: "H&T Bad Battery"
```
