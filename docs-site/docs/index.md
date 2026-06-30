# Home-Assistant-Matter-Hub

!["Home-Assistant-Matter-Hub"](/img/hamh-logo-small.png)

---

> **커뮤니티 포크** - 이것은 2026년 1월에 중단된 원본 [t0bst4r/home-assistant-matter-hub](https://github.com/t0bst4r/home-assistant-matter-hub)의 포크입니다. 저희는 버그 수정, 새 기능, 커뮤니티 지원을 통해 활발히 개발을 이어가고 있습니다.
>
> 저희는 원본 프로젝트의 오래된 이슈를 적극적으로 해결하고 있으며 새로운 기능 요청을 환영합니다. 이것은 커뮤니티가 유지보수하는 살아 있는 프로젝트입니다!

---

이 프로젝트는 브리지를 시뮬레이션하여 Home Assistant의 엔티티를 Alexa, Apple Home, Google Home과 같은
Matter 호환 컨트롤러에 게시합니다. Matter를 사용하면 포트 포워딩 등 없이 로컬 통신을 통해 이들을 쉽게
연결할 수 있습니다.

---

## 알려진 문제 및 제한 사항

### 기기 유형 지원

이 프로젝트는 아직 Matter 사양의 모든 기기 유형을 지원하지는 않습니다.
또한 Alexa나 Google Home와 같은 컨트롤러도 모든 기기 유형을 지원하지는 않습니다.

어떤 유형이 지원되는지 확인하려면 [지원 기기 유형 목록](./supported-device-types.md)을 확인하세요.

### Alexa

- Alexa는 너무 많은 기기가 연결된 브리지와는 페어링할 수 없습니다. 약 80~100개의 기기 제한이
  있는 것으로 보입니다
- Alexa가 Matter 기기와 페어링하려면 Matter를 지원하는 Amazon 기기가 최소 하나 필요합니다.
  Alexa를 지원하는 타사 스마트 스피커만 있다면 충분하지 않습니다.

### Google Home

- Google Home이 Matter 기기를 연결하려면 실제 Google Hub가 필요합니다. GH 앱만 사용해서는 충분하지 않습니다.
- Google Home은 인증된 Matter 기기가 아니면 특정 조건에서 Matter 기기를 거부할 수 있습니다.
  허브를 등록하려면
  [이 가이드](https://github.com/project-chip/matter.js/blob/main/docs/ECOSYSTEMS.md#google-home-ecosystem)를
  따라야 합니다.

### 네트워크 설정

Matter 프로토콜은 로컬 네트워크 내에서 UDP와 IPv6로 가장 잘 작동하도록 설계되었습니다. 현재 일부
제조사는 컨트롤러를 IPv4와도 호환되도록 만들었지만, 이는 어떤 업데이트에서든 언제든지 중단될 수 있습니다.

많은 사용자가 HAMH와 어시스턴트 기기(Alexa, Google Home 등)가 같은 네트워크 세그먼트에 있지 않은
VLAN이나 방화벽을 사용할 때 연결 문제를 보고합니다. 반드시
[일반적인 연결 문제](./guides/connectivity-issues.md)를 확인하세요.

## 새로운 기능(What's New)

<details>
<summary><strong>📦 Stable (v2.0.46) - Current</strong></summary>

**v2.0.46 신규:**

- ❄️ 냉방 에어컨용 옵션(opt-in) **동반 팬(companion fan)**: 엔티티별 토글로 에어컨의 팬을 자체 Matter 팬 엔드포인트로 노출하며, 설정이 유지되고 팬 속도 프리셋이 이제 낮은순→높은순으로 정렬됩니다 ([#309](https://github.com/RiDDiX/home-assistant-matter-hub/issues/309))
- 🌦️ **Weather 도메인 지원**: `weather.*` 엔티티가 엔티티 속성에서 읽은 온도 + 습도 + 압력 복합 센서로 노출됩니다(압력은 hPa로 변환되어 Google Home에 표시)
- 🤖 **청소기 서비스 영역 편집**: Entity Mapping에서 영역 데이터를 인라인으로 편집하고 방 청소를 일괄로 디스패치할 수 있으며, 일괄 방 데이터 수정도 포함됩니다 ([#291](https://github.com/RiDDiX/home-assistant-matter-hub/issues/291))
- 🔒 **도어 잠금 자격 증명 강화**: 더 안전한 액세스 코드 처리와 잠금 클러스터의 fabric-index 캐스팅 ([#313](https://github.com/RiDDiX/home-assistant-matter-hub/issues/313))
- ⚡ **HA 업데이트 시 변경되지 않은 엔드포인트 건너뛰기**: 엔티티 또는 매핑된 하위 엔티티가 실제로 변경된 엔드포인트만 새로고침되므로, CPU 사용량이 더 이상 엔티티 수 × 이벤트 빈도에 비례해 증가하지 않습니다 ([#351](https://github.com/RiDDiX/home-assistant-matter-hub/issues/351))
- 🔌 **HA 연결이 끊겨도 레지스트리가 탄력적으로 유지**: 초기 리로드 실패가 불안정한 HA 부팅 시 애드온을 재시작 루프에 빠뜨리지 않으며, 진행 중 "Connection lost"는 한 번 재시도합니다 ([#352](https://github.com/RiDDiX/home-assistant-matter-hub/issues/352))
- 🔁 **RVC 세션이 안전하게 갱신**되어 청소기 리액터가 오래되지 않습니다 ([#287](https://github.com/RiDDiX/home-assistant-matter-hub/issues/287))
- 🪟 **틸트 전용 커버**는 리프트 명령에 틸트 채널을 사용합니다 ([#350](https://github.com/RiDDiX/home-assistant-matter-hub/issues/350))
- 🔋 **배터리 자동 매핑 범위 축소**로 잘못된 매칭을 방지하고, enum 배터리 상태를 지원합니다 ([#359](https://github.com/RiDDiX/home-assistant-matter-hub/issues/359))
- 🔘 **`automation` 엔티티는 순간적(momentary)입니다**: 켜면 트리거되고 다시 꺼짐으로 돌아옵니다 ([#364](https://github.com/RiDDiX/home-assistant-matter-hub/issues/364))
- 🌀 **냉방 스윙 모드 처리 수정**
- 🚨 **5540 이외 포트 Alexa 브리지 경고**: Alexa는 포트 5540에서만 페어링되므로, 다른 포트의 브리지는 이제 경고를 표시합니다
- 🧵 **matter.js 0.17.0**: 0.16.11에서 업그레이드되었으며, 업스트림이 이제 21옥텟 운영 인증서 시리얼을 허용하므로 로컬 LG-TV NOC-serial 패치가 제거되었습니다 ([#305](https://github.com/RiDDiX/home-assistant-matter-hub/issues/305))
- 🧰 빌드/런타임 수정: esbuild 번들이 matter.js 0.17.0에서 빌드되도록 `bun:sqlite`의 `constants` export를 스텁 처리하고, 애드온 힙 플래그가 유지됩니다 ([#358](https://github.com/RiDDiX/home-assistant-matter-hub/issues/358))
- ⬆️ 의존성 취약점 해결
- 📝 문서: Auto 실행 상태 표시를 위한 `hvac_action` 요구 사항 ([#309](https://github.com/RiDDiX/home-assistant-matter-hub/issues/309)), Google Home ModeSelect 레이블 공백 ([#356](https://github.com/RiDDiX/home-assistant-matter-hub/issues/356)), Alexa 커버 루틴 제한 ([#312](https://github.com/RiDDiX/home-assistant-matter-hub/issues/312)), 그리고 새 weather 도메인

**이전 v2.0.45 (핫픽스 릴리스):**

- ⌨️ 입력한 텍스트가 이제 엔티티 id 자동 완성에 바인딩되어, 제안을 선택할 때 부분 엔티티 id가 사라지지 않습니다 ([#348](https://github.com/RiDDiX/home-assistant-matter-hub/issues/348))

**이전 v2.0.44:**

- 🪟 커버 안정성 개편: Matter 상태/목표/현재 보고가 분리되고 올바르게 정렬되며, 지연된 목표 쓰기가 중복 제거되고, 레거시 위치 속성이 업데이트에서 제외되며, 클러스터 프로필이 인증된 Eve 블라인드에 맞춰지고, 외부 동작 중 현재 위치가 유지됩니다 ([#328](https://github.com/RiDDiX/home-assistant-matter-hub/issues/328))
- 🎚️ 브리지별 및 엔티티별 커버 슬라이더 디바운스, 더 부드러운 슬라이더 제어를 위해 윈도우가 300ms로 확대되었습니다 ([#331](https://github.com/RiDDiX/home-assistant-matter-hub/issues/331))
- 🤖 청소기 서비스 영역 처리: 동적 `RvcRunMode` 지원 모드에서 `customServiceAreas` 유지, 사용자 지정 영역 순차 디스패치, 도크 복귀 시 `currentArea` 초기화 및 재시작 간 오래된 값 미상속, 모든 청소 이벤트에 `observedCleaning` 설정 ([#335](https://github.com/RiDDiX/home-assistant-matter-hub/issues/335))
- 🔋 도크에 있는 청소기는 배터리가 가득 차면 충전 보고를 중지합니다 ([#334](https://github.com/RiDDiX/home-assistant-matter-hub/issues/334))
- ❄️ 꺼짐+유휴 에어컨을 위한 엔티티별 `climateKeepModeOnIdle`; cool→off 전환 동안 모드 유지, 꺼짐 시 즉시 동결 적용 및 `action=off`에서 해제 ([#340](https://github.com/RiDDiX/home-assistant-matter-hub/issues/340))
- 🔁 Matter 세션 순환: 브리지별 옵션 설정, 오래된 세션 순환, RVC 청소 모드 리액터가 올바르게 오프라인 전환, 생성 시 `pushKeepalive` 보호 ([#287](https://github.com/RiDDiX/home-assistant-matter-hub/issues/287))
- 🧠 메모리 압박을 줄이기 위한 힙 여유 공간 및 force-sync 압박 보호 ([#347](https://github.com/RiDDiX/home-assistant-matter-hub/issues/347))
- 🏷️ Home Assistant 기기 레지스트리 시리얼 폴백을 갖춘 엔티티별 `customVendorId` ([#290](https://github.com/RiDDiX/home-assistant-matter-hub/issues/290))
- 🔢 `serialNumberSuffix`가 이제 브리지 편집 시 로드되며 시리얼이 32자로 잘릴 때 유지됩니다 ([#330](https://github.com/RiDDiX/home-assistant-matter-hub/issues/330))
- 🔍 엔티티 및 기기 레이블에 대한 정규식 필터와, 그룹화된 AND/OR 필터 규칙을 위한 `any_field_regex` 매처 ([#337](https://github.com/RiDDiX/home-assistant-matter-hub/issues/337))
- ⌨️ 필터 규칙 편집기의 엔티티 id 자동 완성 ([#338](https://github.com/RiDDiX/home-assistant-matter-hub/issues/338))
- ⚡ 에너지 센서 엔드포인트의 `activePower` 기본값이 0으로 설정되고 `PowerTopology` + `cumulativeEnergyImported` 기본값이 추가됩니다 ([#343](https://github.com/RiDDiX/home-assistant-matter-hub/issues/343))
- ⏱️ Home Assistant WebSocket 메시지 타임아웃을 이제 구성할 수 있으며 기본값이 60초로 상향되었습니다 ([#341](https://github.com/RiDDiX/home-assistant-matter-hub/issues/341))
- 🪟 `device_class=window` 커버가 더 이상 `EndProductType.Unknown`을 내보내지 않습니다 ([#312](https://github.com/RiDDiX/home-assistant-matter-hub/issues/312))
- 🖼️ 브리지 아이콘 존재 확인이 이제 HEAD 프로브 대신 `/exists` 엔드포인트를 사용합니다 ([#336](https://github.com/RiDDiX/home-assistant-matter-hub/issues/336))
- 🌍 폴란드어 번역 업데이트, [@MStankiewiczOfficial](https://github.com/MStankiewiczOfficial) 제공 ([#329](https://github.com/RiDDiX/home-assistant-matter-hub/pull/329))

**이전 v2.0.43:**

- 🤖 HAMH 외부에서 청소가 시작되면 청소기 `currentArea`가 업데이트됩니다 ([#281](https://github.com/RiDDiX/home-assistant-matter-hub/issues/281))
- 📡 센서 리액터가 HA 연결이 끊기면 스스로를 오프라인으로 표시하여, 재연결 시 업데이트가 컨트롤러에 도달합니다 ([#327](https://github.com/RiDDiX/home-assistant-matter-hub/issues/327))
- 🪟 리프트+틸트 창문 커버링이 유효한 Matter Type을 선택합니다 ([#323](https://github.com/RiDDiX/home-assistant-matter-hub/issues/323))
- 🪟 커버 `device_class=window`가 Rollershade로 매핑됩니다 ([#312](https://github.com/RiDDiX/home-assistant-matter-hub/issues/312))
- 🧹 UWANT 및 Xiaomi의 쓸기/걸레질 레이블이 인식되며, 걸레질 사용이 `mode.vacuum_mop`을 통해 라우팅됩니다 ([#322](https://github.com/RiDDiX/home-assistant-matter-hub/issues/322))
- 🤖 `vacuum.locate`가 지원되지 않을 때 청소기 식별이 형제 식별 버튼으로 폴백됩니다 ([#320](https://github.com/RiDDiX/home-assistant-matter-hub/issues/320))
- ❄️ `hvac_action`이 유휴일 때 HA-auto 에어컨의 `systemMode`가 유지되며, ha-auto 전용 에어컨은 더 이상 Matter Auto를 노출하지 않습니다 ([#309](https://github.com/RiDDiX/home-assistant-matter-hub/issues/309))
- 🌡️ 냉난방 설정값이 엔티티 `target_temp_step`에 맞춰 스냅됩니다 ([#321](https://github.com/RiDDiX/home-assistant-matter-hub/issues/321))
- 🛰️ matter.js 컨트롤러 트래픽이 `/api/logs`에 기록됩니다
- 🇯🇵 [@kimera257](https://github.com/kimera257)의 일본어 번역 ([#325](https://github.com/RiDDiX/home-assistant-matter-hub/pull/325))
- 📝 iPhone 전용 "업데이트 중" 멈춤 청소기 우회 방법에 대한 문서 노트 ([#287](https://github.com/RiDDiX/home-assistant-matter-hub/issues/287))

**이전 v2.0.42 (핫픽스 릴리스):**

- 🇯🇵 Aqara 브리지 등록이 더 이상 멈추지 않으며, 루트 `softwareVersionString`이 이제 숫자 `softwareVersion`과 일치합니다 ([#316](https://github.com/RiDDiX/home-assistant-matter-hub/issues/316))
- ❄️ `AutoMode` 베이스가 없는 기기에서 냉난방 `auto` 모드가 `heat`/`cool`로 고정됩니다 ([#319](https://github.com/RiDDiX/home-assistant-matter-hub/issues/319))
- 🌀 엔티티별 `disableClimateFanControl` 매핑 플래그, Aqara 같은 컨트롤러가 `RoomAirConditioner`(`0x0072`)를 인식하지 못할 때 `ThermostatDevice`로 폴백합니다 ([#318](https://github.com/RiDDiX/home-assistant-matter-hub/issues/318))
- 🗺️ 청소기 서비스 영역 `selectedAreas`가 디스패치 후 초기화되지 않고 유지됩니다

**이전 v2.0.41:**

| 기능 | 설명 |
|---------|-------------|
| 🌡️ Google Home 에어컨 오프라인 수정 | 냉난방 OnOff 클러스터에 `DeadFrontBehavior`를 적용해 RoomAirConditioner가 Google Home에서 오프라인으로 표시되지 않습니다 ([#302](https://github.com/RiDDiX/home-assistant-matter-hub/issues/302)) |
| 🪟 커버 device_class 매핑 | HA `garage`/`gate`/`window`/`awning`/등을 일치하는 Matter WindowCovering 유형으로 매핑하여 음성 명령이 올바른 기기 유형에 도달합니다 ([#304](https://github.com/RiDDiX/home-assistant-matter-hub/issues/304)) |
| 📺 LG TV 커미셔닝 패치 | 긴 NOC 운영 인증서 시리얼을 허용하기 위한 matter.js 0.16.11의 로컬 패치 ([#305](https://github.com/RiDDiX/home-assistant-matter-hub/issues/305)) |
| 💡 플래그 뒤로 옮긴 Alexa 밝기 재설정 | 기존 Alexa 밝기 재설정 휴리스틱이 `alexaPreserveBrightnessOnTurnOn` 뒤로 이동(기본 꺼짐), Apple Home "방을 100%로 설정"이 다시 작동합니다 ([#306](https://github.com/RiDDiX/home-assistant-matter-hub/issues/306)) |
| 🌀 Google Home 팬 속도 | `fan.set_percentage`를 사용해 이미 켜진 팬이 Google Home의 속도 변경을 반영합니다 ([#308](https://github.com/RiDDiX/home-assistant-matter-hub/issues/308)) |
| ❄️ 냉난방 auto 모드 | HA가 `hvac_modes`에 `auto`를 보고할 때 Matter Auto 모드를 노출합니다 ([#309](https://github.com/RiDDiX/home-assistant-matter-hub/issues/309)) |
| 🆔 서버 모드 루트 ID | 루트 ID가 이제 단일 트랜잭션으로 적용되어, 컨트롤러가 교체 중 기기를 떨어뜨리지 않습니다 ([#311](https://github.com/RiDDiX/home-assistant-matter-hub/issues/311)) |
| 🪟 리프트 전용 블라인드 | 틸트가 없는 커버에 더 이상 `TiltBlindTiltOnly`를 적용하지 않아 롤러 블라인드의 Alexa 루틴이 수정됩니다 ([#312](https://github.com/RiDDiX/home-assistant-matter-hub/issues/312)) |
| 🏷️ 엔티티별 `disableClimateOnOff` | 모드 전용 제어를 선호하는 컨트롤러를 위해 엔티티별로 냉난방 엔드포인트의 OnOff 클러스터를 끕니다 |
| 🔢 브리지별 `serialNumberSuffix` | 모든 엔티티 시리얼에 접미사를 추가합니다. Aqara 같은 컨트롤러가 오래된 기기 데이터를 캐시할 때 유용합니다 |
| 📝 `protocolLogLevel` 옵션 | 앱 로그 레벨과 독립적으로 matter.js 로그를 조용하게 만듭니다 |
| 🖥️ 브리지 HW/SW 버전 문자열 | HA 기기 레지스트리의 `hw_version`/`sw_version`이 이제 서버 모드 엔드포인트의 Matter BasicInformation에 표시됩니다 |
| 🎨 확장 컬러 조명: XY + enhancedColorMode | XY 기능이 필수로 추가되고, `enhancedColorMode`가 `colorMode`를 미러링합니다 |
| 🎭 Groups + Scenes | 조명, 플러그, 팬 엔드포인트에 Scenes 및 Groups 클러스터가 추가되었습니다 |
| 💧 Boolean state 구성 | 누수, 결빙, 비, 접촉 센서에 클러스터가 추가되었습니다 |
| 🌍 스페인어 번역 | 새 `es` 로케일 ([#314](https://github.com/RiDDiX/home-assistant-matter-hub/pull/314), [@Yllelder](https://github.com/Yllelder) 감사) |
| 🧵 Matter.js 0.16.11 (고정) | 고정 유지, 로컬 NOC 시리얼 패치 적용 |
| ⬆️ 의존성 업그레이드 | Vite 8, jsdom 29, MUI x-tree-view 9, i18next 26, react-i18next 17, TypeScript 6.0.3, biome 2.4.3 고정, 전이 CVE에 대한 pnpm 오버라이드 |

**안정성 및 복원력:** `stopAll`/`restartAll`에서 병렬 브리지 중지, 병렬 HA 레지스트리 가져오기, 직렬화된 브리지 시작/중지 라이프사이클, 플러그인 리스너 분리를 포함한 직렬화된 `updateStates`, 일시적 네트워크 오류 시 HA 재연결 재시도, `sendMessagePromise`에 30초 타임아웃, web-api 시작 시 포트 충돌 거부, `/api/backup/restart`에서 정상 종료, SIGINT 시 `AppEnvironment` 정리, 오래된 낙관적 상태 정리, 대기 중인 디바운서 정리, 기본 인증에서 헬스체크 401 수정, 엔티티 속성 깊은 비교(deep-equal), 자동 새로고침 중복 보호, 더 안전한 mireds 변환, 정렬된 `colorMode` 게시, 브리지 가져오기 오류 표면화, 알 수 없는 모드 + 건조에 대한 온도조절기 실행 상태 수정, Dockerfile 전반의 Node 버전 통일, npm tarball에서 소스맵 제외, 사용되지 않는 의존성 제거(rxjs, strip-color, lodash), 사용되지 않는 `config-validator` 유틸리티 제거.

**이전 v2.0.39 & v2.0.40 (핫픽스 릴리스):**
- Node 22 네이티브 WebSocket이 연결을 끊어 발생하는 시작 시 크래시 루프 수정 ([#297](https://github.com/RiDDiX/home-assistant-matter-hub/issues/297), [#299](https://github.com/RiDDiX/home-assistant-matter-hub/issues/299)), aarch64(RPi)와 amd64 모두에 영향
- 서비스 초기화 오류가 조용히 삼켜져 프로세스가 종료되지 않고 멈추던 문제 수정
- 레지스트리 가져오기가 이제 재시도 사이에 WebSocket 재연결을 기다리며 재시도 허용치가 늘어났습니다
- 필터 미리보기에서 `select`, `input_select`, `siren` 도메인이 지원되지 않음으로 표시되던 문제 수정 ([#298](https://github.com/RiDDiX/home-assistant-matter-hub/issues/298))

**이전 v2.0.38:**

| 기능 | 설명 |
|---------|-------------|
| **🏷️ 엔티티별 ID 재정의** | 엔티티 매핑별 `customProductName`, `customVendorName`, `customSerialNumber` ([#277](https://github.com/RiDDiX/home-assistant-matter-hub/issues/277), [#290](https://github.com/RiDDiX/home-assistant-matter-hub/issues/290)) |
| **🪟 차고 & 게이트 열기/닫기** | 차고 및 게이트 커버를 위한 개별 열기/닫기 모드 ([#55](https://github.com/RiDDiX/home-assistant-matter-hub/issues/55)) |
| **🚿 식기세척기 기기 유형** | 스위치 엔티티에 대한 식기세척기 재정의 |
| **🚨 사이렌 지원** | 사이렌 도메인을 OnOff Plug-in Unit으로 지원 |
| **🏷️ productNameFromNodeLabel 플래그** | Aqara 컨트롤러를 위해 노드 레이블을 Matter productName으로 보고 |
| **🤖 청소기 방 진행 상황** | `currentRoomEntity` 센서를 통한 동적 방 진행 상황 추적 |
| **⚡ 시작 시 강제 동기화** | 오래된 Alexa 큐를 앞지르기 위해 시작 시 즉시 강제 동기화 ([#282](https://github.com/RiDDiX/home-assistant-matter-hub/pull/282)) |
| **🌐 네트워크 진단 API** | 대시보드 카드를 갖춘 mDNS/네트워크 진단 엔드포인트 |
| **🔌 복합 기기의 에너지** | 복합 엔드포인트의 에너지/전력 측정 클러스터 |
| **🩺 다중 관리자 패브릭 진단** | 헬스 API의 패브릭별 세션 정보 |
| **🩺 Docker HEALTHCHECK** | 독립형 및 애드온 이미지의 네이티브 헬스체크 |
| **🔒 관리자 비밀번호 해싱** | 관리자 비밀번호를 해시로 저장, 잠금 PIN 검증을 위한 `timingSafeEqual` |
| **🧵 Matter.js 0.16.11** | 업데이트된 Matter 스택 |
| **🌍 폴란드어 + 번체 중국어** | 새 `pl` 및 `zh-tw` 로케일 |

**주요 수정:** Apple Home "Updating…"을 위한 청소기 keepalive ([#287](https://github.com/RiDDiX/home-assistant-matter-hub/issues/287)), 다단계 청소 진행 상황 ([#281](https://github.com/RiDDiX/home-assistant-matter-hub/issues/281)), Apple Home 버튼을 위한 GenericSwitch 단일/다중 분리 ([#289](https://github.com/RiDDiX/home-assistant-matter-hub/issues/289)), HA 재시작 속성 보호 ([#286](https://github.com/RiDDiX/home-assistant-matter-hub/issues/286)), 켤 때 팬 속도 복원 ([#275](https://github.com/RiDDiX/home-assistant-matter-hub/issues/275)), 습기 센서 HumiditySensor 자동 매핑 ([#273](https://github.com/RiDDiX/home-assistant-matter-hub/issues/273)), TV 스피커 재정의 ([#293](https://github.com/RiDDiX/home-assistant-matter-hub/issues/293)), 비 + 라돈 센서 자동 매핑, 복합 하위 엔드포인트 정리.

**이전 v2.0.36:**

| 기능 | 설명 |
|---------|-------------|
| **🏗️ 사용자 정의 복합 기기** | composedEntities 매핑을 통한 사용자 지정 복합 기기 생성 ([#220](https://github.com/RiDDiX/home-assistant-matter-hub/issues/220)) |
| **🔌 플러그인 도메인 매핑** | cloud-mock 예제를 갖춘 플러그인 API의 도메인 매핑 지원 |
| **🔋 밸브 & 펌프 배터리** | 밸브 및 펌프 엔드포인트의 배터리 지원 |
| **🌐 독일어 + 러시아어 번역** | 완전한 독일어 번역 및 새 러시아어 |
| **📡 세션 복구** | 정상적인 세션 종료, 죽은 세션 정리, mDNS 재공지 ([#266](https://github.com/RiDDiX/home-assistant-matter-hub/issues/266)) |
| **🔗 실패한 기기로 바로 가기** | 대시보드에서 실패한 기기로 바로 가는 링크 ([#270](https://github.com/RiDDiX/home-assistant-matter-hub/issues/270)) |
| **🌡️ 온도조절기 수정** | 이미 켜져 있을 때 climate.turn_on 건너뛰기 ([#269](https://github.com/RiDDiX/home-assistant-matter-hub/issues/269)) |
| **🪟 커버 수정** | 외부 이동 중 오래된 targetPosition 수정 ([#268](https://github.com/RiDDiX/home-assistant-matter-hub/issues/268)) |
| **🌬️ 공기청정기 수정** | 복합 공기청정기를 위한 하위 엔드포인트, 수동 온도/습도 매핑 ([#265](https://github.com/RiDDiX/home-assistant-matter-hub/issues/265)) |
| **🔥 냉방 전용 온도조절기 수정** | 냉방 전용 온도조절기에서 HeatingOnly 방지 ([#264](https://github.com/RiDDiX/home-assistant-matter-hub/issues/264)) |
| **↔️ 엔티티별 커버 스왑** | 커버별 개별 coverSwapOpenClose ([#263](https://github.com/RiDDiX/home-assistant-matter-hub/issues/263)) |

</details>

<details>
<summary><strong>🧪 Alpha (v2.1.0-alpha.x)</strong></summary>

**현재 Alpha는 Stable(v2.0.46)과 동일한 수준입니다.** 최신 사전 릴리스까지의 모든 알파 작업이 v2.0.46으로 승격되었습니다. 새로운 알파 작업은 다음 사전 릴리스 태그부터 이어지며 개발이 진행됨에 따라 여기에 표시됩니다. 설치 방법은 [Alpha 기능 가이드](./guides/alpha-features.md)를 참조하세요.

</details>

<details>
<summary><strong>📋 이전 버전</strong></summary>

### v2.0.40
필터 미리보기 도메인 수정, `select`, `input_select`, `siren`이 이제 지원됨으로 표시됩니다 ([#298](https://github.com/RiDDiX/home-assistant-matter-hub/issues/298))

### v2.0.39
Node 22 WebSocket 크래시 루프 수정 ([#297](https://github.com/RiDDiX/home-assistant-matter-hub/issues/297), [#299](https://github.com/RiDDiX/home-assistant-matter-hub/issues/299)), 서비스 초기화 오류 표면화, 레지스트리 재시도 강화, 지원 링크 추가

### v2.0.37
Aqara productNameFromNodeLabel 플래그, Matter.js 0.16.11, 스웨덴어 로케일 업데이트

### v2.0.35
HA 2026.3 Clean Area 지원, Valetudo 식별자 매핑, 플러그인 시스템 강화, 레지스트리 핑거프린트 수정, Roomba 배터리 수정, 접촉 센서 수정, 스크립트 순간(momentary) 수정, Docusaurus 문서

### v2.0.34
자동 백업, 청소기 배터리 자동 매핑, 사용 중단된 기능 플래그 수정

### v2.0.33
엔드포인트 번호 보존, 바이너리 센서 배터리 자동 매핑

### v2.0.32
다국어 지원, 플러그인 시스템, 새 기기 유형(PIR, 비, 전기, AQ 센서), 클러스터 진단, 대시보드 개선, 매핑 프로필 내보내기/가져오기, 팬 & 공기청정기 수정, 오래된 세션 정리, KNX 커버 수정

### v2.0.31
컨트롤러 프로필 & 영역 설정, 팬 속도/프리셋 수정, 낙관적 상태 수정, 커버 목표 수정, 습도 자동 매핑 기본값

### v2.0.30
매핑된 엔티티 전파 수정, API 오류 표면화

### v2.0.29
조명 currentLevel 수정, 브리지 구성 저장 수정, 팬 기기 기능 수정, 습도 자동 매핑 수정

### v2.0.28
기기 이미지 지원, 사용자 지정 팬 속도 매핑, TV 소스 선택, 리버스 프록시 기본 경로, On/Off 전용 팬, 조명 밝기 수정, 팬 속도 수정, 복합 공기청정기 수정, Dreame 다층 수정, 낙관적 상태 업데이트, 프런트엔드 개선

### v2.0.27
Valetudo 지원, 사용자 지정 서비스 영역, ServiceArea 맵, 청소기 식별/위치 찾기/충전, 경보 제어 패널, 복합 공기청정기, 대시보드 제어, 벤더 브랜드 아이콘, 온도조절기 수정, 공기청정기 회전/바람

### v2.0.26
인증 UI, Select 엔티티 지원, 웹훅 이벤트 브리지, 클러스터 진단, Matter.js 0.16.10, Docker Node 22, 청소기 청소 모드 폴백, 청소기 엔티티 필터 수정

### v2.0.25
청소기 걸레질 강도, 청소기 자동 감지, Roborock 방 자동 감지, 실시간 엔티티 매핑, 동적 힙 크기 조정, 다중 패브릭 커미셔닝, 팬 속도 레이블 수정

### v2.0.24
대시보드 랜딩 페이지, 복합 기기, 브리지 마법사 기능 플래그, 엔티티 자동 완성, 조명 전환, 실시간 진단, 청소기 흡입 레벨, 온도조절기 자동 재개, 청소기 도크 상태, 메모리 누수 수정

### v2.0.19-v2.0.23
브리지 템플릿, 실시간 필터 미리보기, 엔티티 진단, 다중 브리지 일괄 작업, 엔티티 상태 표시기, 진단 내보내기, EntityLabel/DeviceLabel 필터, 전력 & 에너지 측정, 이벤트 도메인(GenericSwitch)

### v2.0.17 / v2.0.18
방 레이블(FixedLabel), 온도조절기 개편, 잠금 unlatch/unbolt, 바이너리 센서 수정, 자동 압력 매핑, 청소기 수정, 죽은 세션 복구, 네트워크 맵, 모바일 UI, Labels & Areas 페이지, 크래시 복원력, 메모리 제한

### v2.0.16
강제 동기화, 잠금 PIN, 커버/블라인드 개선, Roborock 방, 자동 엔티티 그룹화, 온수기, 청소기 서버 모드, OOM 수정

### v1.10.4
냉난방/온도조절기 수정, 커버 위치 수정, 청소기 배터리, 가습기 개선, 엔티티 매핑, Alexa 밝기 유지

### v1.9.0
사용자 지정 브리지 아이콘, 기본 비디오 플레이어(TV), Alexa 중복 제거, Auto 전용 온도조절기, 헬스 체크 API, WebSocket, 전체 백업/복원

### v1.8.x
정상 크래시 핸들러, PM2.5/PM10 센서, 워터 밸브, 연기/CO 감지기, 압력/유량 센서, 공기청정기, 펌프 기기

### v1.7.x
다크 모드 토글, 기기 목록 정렬

### v1.5.x
Matter 브리지, 다중 패브릭 지원, 상태 모니터링, 브리지 마법사, AirQuality 센서, 팬 제어, 미디어 재생

</details>

## 시작하기

설정을 진행하려면 [설치 가이드](./getting-started/installation.md)를 따르세요.

## 추가 자료

이 주제에 대해 더 많은 도움이 필요하면 다음 외부 자료를 참조하세요:

### 동영상

#### "HA Matter HUB/BRIDGE 😲 👉 Das ändert alles für ALEXA und GOOGLE Nutzer" YouTube 동영상 (🇩🇪)

[![HA Matter HUB/BRIDGE 😲 👉 Das ändert alles für ALEXA und GOOGLE Nutzer](https://img.youtube.com/vi/yOkPzEzuVhM/mqdefault.jpg)](https://www.youtube.com/watch?v=yOkPzEzuVhM)

#### "Alexa et Google Home dans Home Assistant GRATUITEMENT grâce à Matter" YouTube 동영상 (🇫🇷)

[![Alexa et Google Home dans Home Assistant GRATUITEMENT grâce à Matter](https://img.youtube.com/vi/-TMzuHFo_-g/mqdefault.jpg)](https://www.youtube.com/watch?v=-TMzuHFo_-g)

## 프로젝트 후원하기

> **이것은 전적으로 선택 사항입니다!** 이 프로젝트는 후원 여부와 관계없이 계속됩니다.
> 저는 오픈소스와 커뮤니티에 기여하는 것을 믿기에 여가 시간에 이 프로젝트를 유지보수합니다.

이 프로젝트가 유용하다고 생각하고 개발을 지원하고 싶다면, 커피 한 잔 사주시는 것을 고려해 주세요! ☕

[![PayPal](https://img.shields.io/badge/PayPal-Donate-blue?logo=paypal)](https://www.paypal.me/RiDDiX93)

이 프로젝트를 유지보수하는 데는 버그 수정, 새 기능 추가부터 이슈에서 사용자를 돕는 것까지 시간과 노력이 듭니다.
여러분의 후원은 감사하지만 결코 당연한 것으로 여기지 않습니다. Home-Assistant-Matter-Hub를 사용해 주셔서 감사합니다! ❤️
