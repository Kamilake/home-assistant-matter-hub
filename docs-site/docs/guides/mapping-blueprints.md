# 매핑 블루프린트

이 페이지는 복잡한 장치 설정을 위한 바로 사용 가능한 매핑 예제를 제공합니다. HAMH UI에서 엔터티 매핑을 구성하거나 가져올 매핑 프로파일을 생성할 때 참고 자료로 사용할 수 있습니다.

---

## 합성 온도 + 습도 + 압력 센서

온도 센서를 관련 습도 및 압력 센서와 결합하여 하나의 Matter 합성 장치로 만듭니다. 각 센서는 Apple Home, Google Home, Alexa에서 적절한 하위 장치로 표시됩니다.

**요구 사항:** 브리지에서 `autoComposedDevices` 기능 플래그를 활성화하세요.

```json
{
  "entityId": "sensor.living_room_temperature",
  "humidityEntity": "sensor.living_room_humidity",
  "pressureEntity": "sensor.living_room_pressure",
  "batteryEntity": "sensor.living_room_battery"
}
```

### 전력 모니터링 포함

센서 허브가 전력 소비도 보고하는 경우:

```json
{
  "entityId": "sensor.living_room_temperature",
  "humidityEntity": "sensor.living_room_humidity",
  "pressureEntity": "sensor.living_room_pressure",
  "batteryEntity": "sensor.living_room_battery",
  "powerEntity": "sensor.living_room_power",
  "energyEntity": "sensor.living_room_energy"
}
```

---

## 센서가 있는 공기청정기

fan 엔터티를 온도, 습도, HEPA 필터 모니터링이 있는 공기청정기로 매핑합니다.

**요구 사항:** `autoComposedDevices` 기능 플래그를 활성화하세요. `matterDeviceType`을 `air_purifier`로 설정하세요.

```json
{
  "entityId": "fan.air_purifier",
  "matterDeviceType": "air_purifier",
  "temperatureEntity": "sensor.air_purifier_temperature",
  "humidityEntity": "sensor.air_purifier_humidity",
  "filterLifeEntity": "sensor.air_purifier_filter_life",
  "powerEntity": "sensor.air_purifier_power",
  "energyEntity": "sensor.air_purifier_energy"
}
```

---

## 에너지 모니터링이 있는 스마트 플러그

실시간 전력과 누적 에너지 측정이 있는 스위치입니다.

```json
{
  "entityId": "switch.smart_plug",
  "powerEntity": "sensor.smart_plug_power",
  "energyEntity": "sensor.smart_plug_energy"
}
```

---

## 에너지 모니터링이 있는 디머 가능 조명

```json
{
  "entityId": "light.kitchen_ceiling",
  "powerEntity": "sensor.kitchen_ceiling_power",
  "energyEntity": "sensor.kitchen_ceiling_energy"
}
```

---

## 방별 청소가 있는 Roborock 청소기

방별 청소 버튼과 청소 모드 선택기가 있는 청소기를 매핑합니다.

```json
{
  "entityId": "vacuum.roborock_s7",
  "cleaningModeEntity": "select.roborock_s7_cleaning_mode",
  "suctionLevelEntity": "select.roborock_s7_suction_level",
  "mopIntensityEntity": "select.roborock_s7_mop_intensity",
  "roomEntities": [
    "button.roborock_s7_clean_kitchen",
    "button.roborock_s7_clean_living_room",
    "button.roborock_s7_clean_bedroom"
  ]
}
```

### Dreame 청소기 변형

```json
{
  "entityId": "vacuum.dreame_l20",
  "cleaningModeEntity": "select.dreame_l20_cleaning_mode",
  "suctionLevelEntity": "select.dreame_l20_suction_level",
  "mopIntensityEntity": "select.dreame_l20_water_volume",
  "roomEntities": [
    "button.dreame_l20_clean_kitchen",
    "button.dreame_l20_clean_bathroom"
  ]
}
```

### Valetudo 청소기

```json
{
  "entityId": "vacuum.valetudo_robot",
  "valetudoIdentifier": "valetudo_robot",
  "customServiceAreas": [
    { "areaId": 1, "label": "Kitchen" },
    { "areaId": 2, "label": "Living Room" }
  ]
}
```

---

## PIN이 비활성화된 도어락

여러 잠금장치가 있고 일부에만 PIN 보호를 적용하려는 경우에 유용합니다.

```json
{
  "entityId": "lock.front_door",
  "disableLockPin": true
}
```

---

## 열기/닫기가 바뀜 커버

Home Assistant가 반전된 위치 값을 보고하는 커버용입니다.

```json
{
  "entityId": "cover.garage_door",
  "coverSwapOpenClose": true
}
```

---

## 매핑 프로파일 사용

HAMH UI 또는 API를 통해 매핑 구성을 프로파일로 내보내고 가져올 수 있습니다:

1. **내보내기:** Bridge Settings → Export Mapping Profile로 이동
2. **가져오기:** Bridge Settings → Import Mapping Profile → 적용할 엔터티 선택

매핑 프로파일은 여러 엔터티 매핑을 설치 간에 공유할 수 있는 단일 JSON 파일로 번들로 묶습니다.

### 프로파일 형식

```json
{
  "version": 1,
  "name": "My Home Setup",
  "description": "Mappings for all devices",
  "author": "username",
  "createdAt": "2025-01-01T00:00:00Z",
  "domains": ["sensor", "fan", "vacuum", "switch"],
  "entryCount": 4,
  "entries": [
    {
      "domain": "sensor",
      "entityIdPattern": "sensor.*_temperature",
      "humidityEntity": "sensor.*_humidity",
      "pressureEntity": "sensor.*_pressure"
    },
    {
      "domain": "fan",
      "entityIdPattern": "fan.air_purifier*",
      "matterDeviceType": "air_purifier",
      "temperatureEntity": "sensor.air_purifier_temperature"
    }
  ]
}
```

:::tip
프로파일의 엔터티 ID 패턴은 glob 스타일 매칭을 사용합니다. 엔터티 ID 내의 임의 문자와 일치시키려면 `*`를 사용하세요.
:::
