# 자주 묻는 질문

## 연결 문제가 있습니다. 어떻게 해야 하나요?

[문제 해결 가이드](./guides/connectivity-issues.md)를 따라주세요.

## Matter는 IPv6가 필요한데 왜 로그에 IPv4 주소가 보이나요?

페어링 로그에서 `udp://[10.0.40.151]:5541` 같은 IPv4 주소가 보이는 것은 **정상적이며 예상되는 일**입니다. Amazon Echo 같은 컨트롤러는 듀얼 스택 환경에서 실행되며, 발견 및 패브릭 통신에는 여전히 IPv6를 사용하면서 IPv4로 세션을 열 수 있습니다.

페어링이 작동하고 기기에 계속 도달할 수 있다면 모든 것이 올바르게 작동하는 것입니다. 로그에는 "IPv6 전용" 표시가 없습니다.

**VLAN 구성 시 중요:** Home Assistant와 IoT 기기가 서로 다른 VLAN에 있다면 라우터에 ULA IPv6 주소(`fd00::/8`)를 **반드시** 구성해야 합니다. 링크 로컬 IPv6(`fe80::`)는 VLAN 간 라우팅이 불가능합니다. 자세한 내용은 문제 해결 가이드의 [IPv6 섹션](./guides/connectivity-issues.md#ipv6)과 [Discussion #39](https://github.com/RiDDiX/home-assistant-matter-hub/discussions/39)를 참조하세요.

## 브리지를 여러 어시스턴트에 연결하고 싶습니다

[멀티 패브릭 가이드](./guides/connect-multiple-fabrics.md)를 따라주세요.

## HAMH를 Docker 이미지로 실행 중이며 리버스 프록시를 통해 접근하고 싶습니다

[리버스 프록시 가이드](./guides/reverse-proxy.md)를 따라주세요.

## Home Assistant에서 이름과 레이블을 변경했는데 HAMH에 반영되지 않습니다

레이블 추가/제거나 엔터티 이름 변경 등 엔터티를 변경할 때는 변경 사항이 적용되도록 해당 브리지를 재로드해야 합니다. 이는 30초마다 자동으로 이루어지지만, 브리지를 편집(변경 없이도)하거나 애드온 전체를 재시작하여 강제할 수 있습니다.

## 엔터티에 레이블을 추가했는데 HAMH가 아무 기기도 찾지 못합니다

- Home Assistant의 레이블과 영역(area)은 기술적으로 "slug"으로 표현됩니다.
- Slug은 백그라운드에서 사용되는 기술적 식별자입니다.
- Slug은 항상 소문자이며 a-z와 언더스코어만 허용하므로, 그 외의 모든 것은 언더스코어로 대체됩니다.
- 레이블이나 영역의 이름을 바꿔도 slug은 절대 바뀐지 않습니다.
  Home Assistant에서 다음 템플릿을 사용하여 slug을 조회할 수 있습니다:
- `{{ labels() }}` - 모든 레이블을 반환
- `{{ labels("light.my_entity") }}` - 특정 엔터티의 레이블을 반환
- `{{ areas() }}` - 모든 영역을 반환

레이블로 아무리 해도 작동하지 않는다면 레이블을 삭제하고 다시 생성해 보세요.

## Apple Home 앱에 로봇청소기가 나타나지 않습니다

1. **서버 모드 사용**: Apple Home은 로봇청소기를 독립형 기기로 요구합니다. 청소기만 포함한 전용 서버 모드 브리지를 생성하세요.
2. **모든 홈 허브 업데이트**: **모든** 홈 허브가 **iOS/tvOS/AudioOS 18.4** 이상으로 업데이트되었는지 확인하세요. **하나**라도 18.4 미만이면 청소기가 표시되지 않습니다.
3. **재페어링**: 서버 모드를 활성화한 후 이전 액세서리를 제거하고 새 브리지를 페어링하세요.

전체 설정 안내는 [로봇청소기 가이드](./devices/robot-vacuum.md)를 참조하세요.

## Health Dashboard에는 어떻게 접근하나요?

웹 UI의 상단 네비게이션 바에서 하트 아이콘(❤️)을 클릭하거나 `/health`로 직접 이동하세요.

## 브리지가 계속 실패하고 재시작됩니다

자동 복구(Auto recovery)는 시작에 실패한 브리지를 재시작합니다. 실패한 브리지만 다루며 정상적인 브리지는 건드리지 않고, 타이머와 Home Assistant 재연결 직후 모두 실행됩니다. **Settings → Auto recovery**에서 끄거나 간격을 변경할 수 있으며, 최근 시도는 Health Dashboard에서 확인할 수 있습니다.

브리지가 계속 실패한다면:

1. 로그에서 구체적인 오류 메시지를 확인하세요
2. 브리지의 기기 수를 줄이세요
3. 브리지의 모든 엔터티가 유효한지 확인하세요
4. 브리지를 공장 초기화해 보세요

## Bridge Wizard는 어떻게 사용하나요?

1. Bridges 페이지로 이동합니다
2. **Wizard** 버튼을 클릭합니다
3. 안내되는 단계를 따라 브리지를 생성합니다
4. 포트는 5540부터 시작하여 자동으로 할당됩니다

## 어떤 센서가 지원되나요?

현재 지원되는 센서 유형:

- 온도(자동 습도 및 압력 매핑 포함)
- 습도
- 압력
- 유량(Flow)
- 조도(Light)
- 공기질(AQI, PM2.5, PM10, CO2, TVOC)

온도, 습도, 압력, 배터리를 하나의 기기로 결합하는 자세한 내용은 [온도 & 습도 센서](./devices/temperature-humidity-sensor.md)를 참조하세요.

## HA Yellow / Raspberry Pi / VM에서 앱이 계속 충돌하거나 재시작됩니다

저사양 기기(1-2GB RAM)나 메모리 할당이 제한된 VM은 메모리가 부족해질 수 있습니다. v2.0.25부터 HAMH는 Node.js 힙을 시스템 RAM의 25%로 동적으로 조정합니다(256MB와 1024MB 사이로 제한). 시작 로그에 계산된 값이 표시됩니다: `System RAM: 2048MB → Node.js heap: 512MB`. 전체 프로세스 메모리(matter.js 클러스터 정의, SQLite, V8 오버헤드 포함)는 브리지가 시작되기 전에도 400-600MB에 달할 수 있습니다.

OOM kill의 결정적인 징후는 오류 메시지나 스택 트레이스 없이 로그에 `Killed`가 표시되는 것입니다. 이는 Linux 커널이 프로세스를 종료했음을 의미합니다.

충돌이 계속된다면:

1. 브리지당 기기 수를 줄이세요
2. 큰 브리지를 더 작은 브리지(예: 방별)로 분할하세요
3. 메모리를 많이 사용하는 다른 애드온(Frigate, Whisper, Piper, Music Assistant, Python Matter Server)을 중지하세요
4. VM(`qemux86-64`)의 경우: RAM 할당을 최소 4GB로 늘리세요
5. RAM이 더 많은 기기 사용을 고려하세요

자세한 설정 권장 사항은 [저사양 기기 가이드](./guides/low-resource-devices.md)를, 자세한 내용은 [#190](https://github.com/RiDDiX/home-assistant-matter-hub/issues/190)과 [#141](https://github.com/RiDDiX/home-assistant-matter-hub/issues/141)을 참조하세요.

## Alexa가 몇 시간 후 연결이 끊어집니다

이는 일반적으로 오래된 세션이 원인입니다. Alexa가 오프라인이 되어도 브리지가 이전 세션을 살려두어 새 구독을 차단합니다. 브리지에는 연결된 모든 컨트롤러에 주기적으로 상태 갱신을 푸시하는 자동 force-sync 메커니즘이 포함되어 있습니다. 그래도 이 문제가 발생한다면:

1. 최신 버전으로 업데이트하세요
2. Alexa 앱에서 브리지를 제거하고 재페어링하세요
3. 네트워크에서 멀티캐스트/mDNS 문제를 확인하세요([연결 문제](./guides/connectivity-issues.md) 참조)

자세한 내용은 [#105](https://github.com/RiDDiX/home-assistant-matter-hub/issues/105)를 참조하세요.

## 커버 / 블라인드의 열기 및 닫기 명령이 반대로 동작합니다

Matter와 Home Assistant는 커버 위치 백분율에 대해 서로 다른 규칙을 사용합니다. 브리지 기능 플래그를 사용하여 이를 수정하세요:

- **`coverSwapOpenClose`**: 열기/닫기 명령을 교체합니다(반대로 된 Alexa 명령 수정)
- **`coverDoNotInvertPercentage`**: 백분율 반전을 건너뜁니다
- **`coverUseHomeAssistantPercentage`**: HA 백분율을 직접 사용합니다

Bridge Settings → Feature Flags에서 이를 구성하세요. [#107](https://github.com/RiDDiX/home-assistant-matter-hub/issues/107), [#109](https://github.com/RiDDiX/home-assistant-matter-hub/issues/109)를 참조하세요.

## 배터리가 센서의 일부가 아닌 별도 기기로 표시됩니다

HAMH에는 동일한 HA 기기의 배터리 센서를 자동으로 찾아 기본 센서(온도, climate, fan, vacuum)와 결합하는 **Auto Battery Mapping**이 있습니다. 이 기능은 **기본적으로 비활성화**되어 있습니다. 배터리가 별도로 표시된다면:

1. 배터리 엔터티가 기본 엔터티와 동일한 HA _기기_에 속하는지 확인하세요
2. Bridge Settings → Feature Flags에서 `autoBatteryMapping`이 활성화되어 있는지 확인하세요
3. 또는 **Entity Mapping**을 사용하여 기본 센서에 `batteryEntity`를 수동으로 설정하세요

[#99](https://github.com/RiDDiX/home-assistant-matter-hub/issues/99)를 참조하세요.

## 온도조절기가 자동 모드에서 올바르게 작동하지 않습니다

Matter의 "Auto" 모드는 온도에 따라 난방과 냉방을 자동으로 전환하는 것을 의미합니다. 이는 `auto`가 _아니라_ HA의 `heat_cool` 모드에 매핑됩니다. v2.0.17부터:

- **난방 전용** 온도조절기(예: TRV)는 Heating 기능만 노출됩니다
- **냉방 전용** 온도조절기(예: 에어컨)는 Cooling 기능만 노출됩니다
- **완전 HVAC** 온도조절기는 Heating + Cooling + Auto 기능을 얻습니다

이는 단일 기능 온도조절기에서 Alexa가 명령을 거부하는 것을 방지합니다. [#143](https://github.com/RiDDiX/home-assistant-matter-hub/issues/143), [#136](https://github.com/RiDDiX/home-assistant-matter-hub/issues/136)를 참조하세요.

## 온수기 / 주전자 최대 온도가 50°C로 제한됩니다

이전에는 기본 Matter 온도조절기 제한이 온수기를 50°C로 제한했습니다. v2.0.17부터 HAMH는 HA 엔터티에서 실제 `min_temp`과 `max_temp`를 읽어 올바르게 전달합니다. 이를 해결하려면 최신 버전으로 업데이트하세요.

[#145](https://github.com/RiDDiX/home-assistant-matter-hub/issues/145), [#97](https://github.com/RiDDiX/home-assistant-matter-hub/issues/97)를 참조하세요.

## Matter hub가 Alexa에 여러 번 나타나거나 중복 연결됩니다

이는 브리지가 Alexa에 여전히 페어링된 상태에서 공장 초기화되거나 재생성될 때 발생할 수 있습니다. 해결 방법:

1. Alexa 앱에서 모든 중복 항목을 제거하세요
2. HAMH에서 브리지를 공장 초기화하세요(Bridge Settings → Factory Reset)
3. Alexa에서 브리지를 재페어링하세요

[#152](https://github.com/RiDDiX/home-assistant-matter-hub/issues/152)를 참조하세요.

## 바이너리 센서가 "On/Off" 대신 "Open/Closed"로 표시됩니다 (running, plug, power)

device_class가 `running`, `plug`, `power`, `battery_charging`, 또는 `light`인 바이너리 센서는 이제 ContactSensor(Open/Closed) 대신 **OnOffSensor**(On/Off)에 매핑됩니다. 이는 v2.0.17에서 수정되었습니다.

이전 버전을 사용 중이라면 올바른 매핑을 위해 업데이트하세요. [#154](https://github.com/RiDDiX/home-assistant-matter-hub/issues/154)를 참조하세요.

## 기기가 올바른 방에 할당되지 않습니다

HAMH는 FixedLabel 클러스터(`label: "room", value: "<area name>"`)를 사용하여 Home Assistant 영역 이름을 Matter 컨트롤러에 전송합니다. 하지만 현재 **주요 컨트롤러(Google Home, Apple Home, Alexa) 중 어느 것도** 자동 방 할당을 위해 이 레이블을 읽지 않습니다. 페어링 중이나 후에 각 컨트롤러 앱에서 방을 수동으로 할당해야 합니다.

FixedLabel 데이터는 향후 컨트롤러 지원을 위해 브리지에 유지됩니다. 방 이름은 Matter 사양에 따라 16자로 제한되며, 더 긴 HA 영역 이름은 자동으로 잘립니다.

## Media Player 재생은 어떻게 제어하나요?

미디어 플레이어는 이제 Matter를 통해 재생, 일시정지, 정지, 다음 트랙, 이전 트랙 제어를 지원합니다. 하지만 모든 컨트롤러가 아직 이 기능을 지원하는 것은 아닙니다. 볼륨 제어도 가능합니다.

## 청소기의 청소 모드(Vacuum / Mop / Vacuum & Mop)는 어떻게 제어하나요?

HAMH는 모드를 전환하기 위해 **청소 모드 선택 엔터티**가 필요합니다. Dreame와 Ecovacs 청소기는 하나가 자동 감지됩니다. Roborock 등 이를 노출하지 않는 경우, 올바른 팬 속도와 걸레 강도 설정을 적용하는 자동화와 함께 Home Assistant **템플릿 선택 엔터티**를 생성할 수 있습니다.

단계별 안내는 로봇청소기 가이드의 [청소 모드 헬퍼 만들기](./devices/robot-vacuum.md#creating-a-cleaning-mode-helper-roborock--others)를 참조하세요.

## 왜 Apple Home은 Vacuum 모드와 Mop 모드 모두에 동일한 강도 옵션(Quiet / Automatic / Max)을 표시하나요?

이는 Apple Home의 제한사항입니다. Apple은 Matter 모드 태그를 기반으로 강도 레이블을 렌더링하는데, 팬 속도와 걸레 강도 모두 동일한 태그(Quiet, Auto, Max)를 사용합니다. 레이블 뒤의 라우팅은 올바릅니다. Mop 모드에서 "Quiet"를 선택하면 걸레 강도가 설정되고, Vacuum 모드에서 "Quiet"는 팬 속도를 설정합니다.

## 청소기의 걸레 강도가 Apple Home에 표시되지 않습니다

걸레 강도는 **청소 모드 엔터티**가 구성되어야 합니다. 이것이 없으면 HAMH는 청소기가 언제 Mop 모드인지 판단할 수 없습니다. 통합이 청소 모드 엔터티를 기본적으로 제공하지 않는다면 [청소 모드 헬퍼](./devices/robot-vacuum.md#creating-a-cleaning-mode-helper-roborock--others) 방식으로 하나 생성하세요.

또한 청소기의 Entity Mapping에서 **Mop Intensity Entity**를 설정했는지 확인하세요.

## select / input_select 엔터티는 어디에 사용되나요?

v2.0.26부터 `select`과 `input_select` 엔터티는 Matter **ModeSelectDevice**에 자동으로 매핑됩니다. 각 옵션은 컨트롤러에서 선택 가능한 모드가 됩니다. 세탁기 프로그램, HVAC 모드, 관개 구역, 씬 선택기 등이 활용 사례입니다.

## 비상 제어 패널을 Matter에 어떻게 노출하나요?

v2.0.27부터 `alarm_control_panel` 엔터티는 Matter **ModeSelectDevice**로 자동 노출됩니다. 각 경보 상태(Disarmed, Armed Home, Armed Away 등)는 선택 가능한 모드가 됩니다. Apple Home 호환성을 위한 OnOff 폴백도 포함되며, "켬면" 경보가 설정되고 "끄면" 해제됩니다. [#209](https://github.com/RiDDiX/home-assistant-matter-hub/issues/209)를 참조하세요.

## Valetudo 청소기의 방(room)이 작동하지 않습니다

v2.0.27부터 HAMH는 네이티브 Valetudo 지원을 제공합니다. 방 청소는 `vacuum.send_command` 대신 `segment_cleanup`와 함께 `mqtt.publish`를 사용합니다. 요구 사항:

1. MQTT 자동 발견이 활성화된 Valetudo 펀웨어
2. Home Assistant MQTT 통합 구성
3. 방 데이터가 포함된 `segments` 속성을 노출하는 청소기 엔터티
4. Apple Home / Alexa를 위한 서버 모드 브리지

방이 여전히 나타나지 않으면 HAMH 로그에서 세그먼트 감지 메시지를 확인하세요. [#205](https://github.com/RiDDiX/home-assistant-matter-hub/issues/205)를 참조하세요.

## 온도조절기가 "CoolingAndHeating" 적합성 오류로 충돌합니다

v2.0.27에서 수정되었습니다. `auto` + `cool`을 가지지만 명시적인 `heat` 모드가 없는 기기(예: SmartIR 에어컨)는 제어 시퀀스로 `CoolingAndHeating`를 보고했는데, Matter.js는 이를 비 AutoMode 기기에 대해 거부했습니다. 이제 HAMH는 기기의 실제 기능에 따라 `CoolingOnly` 또는 `HeatingOnly`를 동적으로 설정합니다. [#28](https://github.com/RiDDiX/home-assistant-matter-hub/issues/28)를 참조하세요.

## 구역형 에어컨(heat_cool 전용)이 Apple Home에서 올바른 모드를 표시하지 않습니다

v2.0.27에서 수정되었습니다. `heat_cool` 모드만 있고(명시적인 `heat`나 `cool`이 없는) 기기는 이제 `hvac_action`에 따라 `CoolingOnly` 또는 `HeatingOnly`를 동적으로 보고하며, `systemMode`가 그에 따라 Heat와 Cool 사이를 전환합니다. [#207](https://github.com/RiDDiX/home-assistant-matter-hub/issues/207)를 참조하세요.

## HA 2026.4로 업데이트한 후 기기 이름이 바뀌고 음성 명령이 작동하지 않습니다

Home Assistant 2026.4는 `friendly_name`이 구성되는 방식을 변경했습니다. 엔터티 이름은 이제 항상 기기 이름을 접두사로 포함합니다(예: 단순히 "Temperature" 대신 "Motion Sensor Temperature"). Matter의 `nodeLabel`은 `friendly_name`에서 파생되기 때문에 이는 HAMH에 영향을 줍니다.

Matter에는 별칭(alias) 개념이 없으므로 `nodeLabel`은 단일 문자열(최대 32자)이며, HAMH가 컨트롤러에 여러 이름을 전달할 방법은 없습니다.

**해결 방법:** HAMH UI의 **Entity Mapping**을 사용하여 해당 엔터티에 `customName`을 설정하세요. `customName`은 항상 `friendly_name`보다 우선합니다. 브리지 상세 페이지 → Entity Mappings → 매핑 추가/편집 → 원하는 이름을 설정하세요.

HA의 자동 마이그레이션은 이전 이름을 Assist 음성 별칭으로 추가하지만, 이는 HA의 내장 음성 어시스턴트에서만 작동하며 Alexa, Google Home, Apple Home 같은 외부 컨트롤러에서는 작동하지 않습니다. 각 컨트롤러에는 대안으로 사용할 수 있는 자체 기기 이름 변경 UI가 있습니다.

토론은 [#276](https://github.com/RiDDiX/home-assistant-matter-hub/issues/276)를 참조하세요.

## Stable과 Alpha의 차이점은 무엇인가요?

- **Stable** (v2.0.46): 프로덕션용, 일상 사용에 권장
- **Alpha**: 현재 Stable과 동일 버전(v2.0.46). 다음 사전 배포가 여기에 먼저 등록되며 버그가 있을 수 있습니다

알파 기능에 대한 자세한 내용은 [알파 기능 가이드](./guides/alpha-features.md)를 참조하세요.

## Alpha에서 Stable로(또는 반대로) 전환했더니 모든 기기 / 커스텀 이름을 잃었습니다

Alpha와 Stable 애드온은 **서로 다른 애드온 slug**(`hamh-alpha` vs `hamh`)을 사용하므로 별도의 데이터 디렉터리를 가집니다. Home Assistant 시스템 백업은 데이터가 나온 동일한 애드온 slug에만 복원하며, Alpha와 Stable 간에 데이터를 전송하지 **않습니다**.

Alpha와 Stable 간에 구성(브리지, 엔터티 매핑, 커스텀 이름, Matter 신원)을 마이그레이션하려면:

1. **전환 전:** HAMH → Settings → Backup → 전체 백업을 **Download**합니다(신원 포함)
2. **다른 버전을 시작하기 전:** 애드온이 새롭게 시작되도록 이전 데이터 디렉터리를 삭제합니다(아래 참조)
3. **전환 후:** HAMH → Settings → Backup → 백업 파일을 **Upload**하고 복원합니다
4. 복원 후 애드온을 **재시작**합니다

내장 백업에는 Matter 신원 데이터(키쌍, 패브릭 자격 증명)가 포함되므로 컨트롤러(Google Home, Apple Home, Alexa)가 재커미셔닝 없이 기기를 인식합니다. 이 단계를 거치지 않으면 모든 기기가 새 기기로 나타나서 다시 설정해야 합니다.

### 이전 데이터 삭제가 중요한 이유

다른 애드온 버전을 시작하면 자체 데이터 디렉터리에 이미 존재하는 브리지 구성을 즉시 로드합니다. 이전 브리지가 있으면 백업을 복원하기 위해 WebUI에 접근하기 **전에** 이전 Matter 신원으로 시작됩니다. 이로 인해 컨트롤러가 "새" 기기로 인식하고 커스텀 이름과 방 할당을 잃게 됩니다.

데이터 디렉터리를 먼저 삭제하면 애드온이 브리지 없이 시작되어 깨끗한 상태에서 복원할 수 있습니다.

### SSH / CLI를 통한 이전 데이터 삭제

SSH(예: **Terminal & SSH** 애드온)를 통해 Home Assistant 호스트에 연결하고 대상 애드온의 데이터 디렉터리를 제거합니다:

```bash
# When switching from Alpha → Stable, clear the Stable data:
rm -rf /addon_configs/hamh/data

# When switching from Stable → Alpha, clear the Alpha data:
rm -rf /addon_configs/hamh-alpha/data
```

그런 다음 애드온을 시작하고 WebUI를 통해 백업을 복원한 뒤 재시작합니다.

자세한 내용은 [#280](https://github.com/RiDDiX/home-assistant-matter-hub/issues/280)를 참조하세요.

## 알파 버그는 어떻게 보고하나요?

알파 이슈를 보고할 때는 다음을 포함하세요:

- 알파 버전 번호(Health Dashboard에서 확인 가능)
- 애드온/컨테이너의 전체 로그
- 재현 단계
- 컨트롤러 유형(Google, Apple, Alexa)

## 온도를 설정해도 온도조절기가 켜지지 않습니다

v2.0.24부터 온도조절기는 **자동 재개(auto-resume)**를 지원합니다. 꺼진 상태에서 온도를 설정하면(동일한 온도라도) 자동으로 켜집니다. 이는 모든 음성 어시스턴트에서 작동합니다.

작동하지 않는다면:

- v2.0.36+로 업데이트하세요(현재 stable: v2.0.46)
- 단일 온도 모드에서만 작동합니다(범위/자동 아님)
- 온도조절기가 "Off" 상태여야 합니다

## 청소기가 "Docked" 대신 "Paused"로 표시됩니다

v2.0.24에서 수정되었습니다. 이전에는 일부 청소기(Ecovacs, 일부 Roborock)가 도킹된 상태에서 `idle`로 보고하여 "Paused"로 표시되었습니다. 이제 충전 중일 때 올바르게 "Docked"로 표시됩니다.

## "No battery entity found" 로그 메시지가 너무 많습니다

v2.0.24에서 수정되었습니다. 배터리 센서 자동 매핑은 이제 캐싱을 사용하고 로그 레벨을 낮추었습니다(debug만). 이전에는 배터리가 없는 모든 엔터티가 경고를 기록했습니다.

## 며칠이 지나면 브리지의 메모리가 부족해집니다

v2.0.24에서 수정되었습니다. `BridgeEndpointManager`와 `ServerModeEndpointManager`에서 엔드포인트 폐기가 개선되었습니다. 이전에는 재시작 중에 엔드포인트가 정리되지 않아 메모리 누수가 발생했습니다.

## Dashboard 랜딩 페이지는 어떻게 사용하나요?

v2.0.24부터 앱은 다음을 보여주는 **Dashboard**로 시작합니다:

- 브리지 수, 기기 수, 패브릭 연결
- 모든 페이지로의 빠른 네비게이션
- Bridge Wizard 및 Create Bridge 버튼
- 버전 및 가동 시간

15초마다 새로 고침됩니다.

## "Auto Composed Devices"란 무엇인가요?

**Auto Composed Devices**(`autoComposedDevices` 기능 플래그, v2.0.20부터)는 동일한 HA 기기의 관련 엔터티를 하나의 Matter 엔드포인트로 결합합니다:

- 온도 + 습도 + 압력 + 배터리 = 하나의 기기
- 전력/에너지 모니터링이 있는 스위치/조명은 소비량을 하나의 기기에 표시
- 올바른 컨트롤러 표시를 위해 서브 엔드포인트를 갖춘 실제 Matter Composed Devices를 사용

Bridge Settings → Feature Flags에서 활성화하세요.

## Entity Mapping에서 기기 타입을 변경했는데 아무 일도 일어나지 않습니다

v2.0.25부터 엔터티 매핑 변경(기기 타입, 커스텀 이름 또는 기타 필드)은 다음 새로 고침 주기(약 30초)에 자동으로 감지됩니다. 이전 엔드포인트가 삭제되고 새 구성으로 재생성됩니다. `Mapping changed for media_player.tv, recreating endpoint` 같은 로그 줄이 표시됩니다.

변경 사항이 여전히 적용되지 않으면 엔드포인트 재생성 중 오류가 있는지 로그를 확인하세요.

## 웹훅 이벤트 브리지(hamh_action)는 어떻게 사용하나요?

v2.0.26부터 HAMH는 컨트롤러가 노출된 기기와 상호작용할 때 HA 이벤트 버스에 `hamh_action` 이벤트를 발생시킵니다. HA 자동화에서 이를 사용할 수 있습니다:

```yaml
trigger:
  - platform: event
    event_type: hamh_action
    event_data:
      entity_id: event.doorbell_press
      action: press
```

이벤트 데이터에는 `entity_id`, `action`, `data`, 그리고 `source`(`matter_controller` 또는 `matter_bridge`)가 포함됩니다.
