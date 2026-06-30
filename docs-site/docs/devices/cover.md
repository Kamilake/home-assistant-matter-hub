# Cover / Window Covering

Home Assistant `cover` 엔티티는 위치 및 틸트 제어가 가능한 Matter **WindowCovering** 디바이스에 매핑됩니다.

## 기능

| HA Feature | Matter Capability |
|------------|------------------|
| `open` / `close` | 열기/닫기 명령 |
| `set_position` | 리프트 백분율 (0-100%) |
| `set_tilt_position` | 틸트 백분율 (0-100%) |
| `stop` | 동작 정지 |

## 지원되는 디바이스 클래스

다음 `device_class` 값이 지원됩니다:

- `blind`
- `curtain`
- `shade`
- `shutter`
- `awning`
- `window` (Velux 스타일 전동 창문; 리프트 전용 Rollershade로 매핑됨)
- `garage` (제한적 지원)

디바이스 클래스가 없거나 지원되지 않는 클래스를 가진 커버도 일반 WindowCovering 디바이스로 노출됩니다.

## Feature Flags

이 플래그들은 **Bridge Settings**에서 구성되며 해당 브리지의 모든 커버에 적용됩니다:

| Flag | 설명 |
|------|-------------|
| `coverDoNotInvertPercentage` | 백분율 반전을 건너뜁니다. 기본적으로 HAMH는 Matter 사양(0% = 완전 열림, 100% = 완전 닫힘)에 맞추기 위해 백분율을 반전합니다. 커버가 이미 Matter 규칙을 사용하는 경우 이를 활성화하세요. 비활성화 시 **Matter 미준수**입니다. |
| `coverUseHomeAssistantPercentage` | 변환 없이 HA 백분율을 Matter에 직접 표시합니다. 그렇지 않으면 백분율 표시가 혼란스러울 수 있는 Alexa에 유용합니다. |
| `coverSwapOpenClose` | 열기 및 닫기 명령을 서로 바꿉니다. "open"이 커버를 닫고 그 반대도 마찬가지인 Alexa의 반전된 명령을 수정합니다. |

## 백분율 매핑

Matter와 Home Assistant는 반대되는 백분율 규칙을 사용합니다:

| 백분율 | HA 의미 | Matter 의미 |
|-----------|------------|----------------|
| 0% | 완전 닫힘 | 완전 열림 |
| 100% | 완전 열림 | 완전 닫힘 |

기본적으로 HAMH는 Matter 사양을 준수하기 위해 백분율을 반전합니다. 설정에서 다른 동작이 필요한 경우 위의 feature flag를 사용하세요.

## 호환성

| Controller | Open/Close | Position | Tilt | Stop |
|------------|-----------|----------|------|------|
| Apple Home | ✅ | ✅ | ✅ | ✅ |
| Google Home | ✅ | ✅ | ⚠️ | ✅ |
| Amazon Alexa | ✅ | ✅ | ⚠️ | ✅ |

> 틸트 지원은 컨트롤러에 따라 다릅니다. Apple Home이 가장 우수한 틸트 제어 지원을 제공합니다.

## 문제 해결

### Alexa 명령이 반전됨 (open → close)

브리지 설정에서 `coverSwapOpenClose` feature flag를 활성화하세요. 이는 Matter WindowCovering 디바이스에서 열기/닫기 방향이 반전되는 알려진 Alexa 동작입니다.

### Alexa에서 백분율이 잘못된 값을 표시함

브리지 설정에서 `coverUseHomeAssistantPercentage`를 활성화해 보세요. Alexa는 Matter 백분율을 다른 컨트롤러와 다르게 해석할 수 있습니다.

### Google Home 자동화에서 커버를 사용할 수 없음

Google Home은 자동화에서 WindowCovering 디바이스를 동작(action)으로 지원하지 않습니다. 커버를 선택하면 "사용 가능한 동작 없음"이 표시됩니다. 이는 네이티브 Matter 블라인드에도 영향을 미치는 Google Home의 제한 사항입니다.

**우회 방법:**
1. 음성 명령과 함께 Google Home Routines를 사용하세요 ("Hey Google, close [커버 이름]")
2. Home Assistant 스크립트를 만들고 HAMH를 통해 스위치로 노출하세요
3. 대신 Home Assistant 자동화를 사용하세요

### Alexa 루틴에서 커버를 사용할 수 없음

Alexa는 루틴 빌더에서 Matter WindowCovering 디바이스를 동작으로 노출하지 않습니다. 커버는 Alexa 디바이스 목록에 나타나며 수동 열기/닫기 및 음성 명령에 응답하지만, 루틴을 구성할 때는 제공되지 않습니다. 이는 브리지 문제가 아닌 Alexa의 제한 사항입니다: [Matter 에코시스템 표](https://github.com/project-chip/matter.js/blob/main/docs/ECOSYSTEMS.md)는 Window Covering (0x0202)을 Amazon에서 지원하지 않는 것으로 명시하며, Amazon은 해당 클러스터를 수동 열기/닫기 제어에만 매핑합니다. 어떤 `device_class`나 Matter 타입 변경도 커버를 루틴에서 선택 가능하게 만들지 않습니다.

**우회 방법:**
1. 커버를 Home Assistant 스크립트나 씬으로 감싸고 이를 Alexa에 노출하세요. 스크립트와 씬은 루틴 동작으로 표시됩니다.
2. Alexa 루틴 대신 Home Assistant 자동화를 사용하세요.
3. 음성 제어는 여전히 작동합니다 ("Alexa, close the blinds"). 루틴 빌더만 영향을 받습니다.

### `device_class`를 변경한 후에도 Alexa 루틴 선택기에 커버가 나타나지 않음

Matter `Type`과 `EndProductType`은 사양상 고정 속성으로 정의되어 있으며, 컨트롤러는 커미셔닝 시 이를 캐싱하고 이후 다시 읽지 않습니다. 따라서 HA에서 `device_class`를 변경해도 그것만으로는 커버가 다른 Alexa 하위 카테고리(`Tapparelle interne`, `Tendine`, `Tende`, `Tende da sole` 등)로 이동하지 않습니다. `device_class`를 수정한 후 HAMH를 재시작하고 Alexa 앱에서 브리지를 제거한 다음 다시 추가하여 Alexa가 새 타입을 인식하도록 하세요. 이렇게 하면 디바이스 목록 및 수동 제어를 위해 디바이스가 재분류됩니다. 단, 커버를 루틴 동작으로 사용할 수 있게 만들지는 않으며, 이는 별도의 Alexa 제한 사항입니다(위 참조).

### 위치가 업데이트되지 않음

Developer Tools → States에서 HA 엔티티가 `current_position`을 올바르게 보고하는지 확인하세요. 일부 커버 통합은 동작 중에 위치를 보고하지 않으며, 위치는 동작이 멈춘 후 업데이트됩니다.

### 차고문 제한 사항

Matter에는 전용 차고문 디바이스 타입이 없으므로 차고문은 WindowCovering 디바이스로 노출됩니다. 모든 컨트롤러가 이를 잘 처리하는 것은 아닙니다. 열기/닫기 제어만 필요한 경우 Entity Mapping 재정의를 통해 `switch` 엔티티를 사용하는 것을 고려하세요.
