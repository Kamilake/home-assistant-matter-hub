# 네트워크 및 허브 연결 문제 해결

Matter Hub과 Apple Home, Google Home, Alexa 같은 음성 어시스턴트 간 연결 문제가 발생하는 경우,
이 가이드를 따라 일반적인 문제를 해결하세요.

## 1. 네트워크 구성 및 방화벽 설정

### IPv6

- 라우터, 호스트, docker, (사용하는 경우) 가상 머신 전반에 걸쳐 **IPv6**가 올바르게 구성되어 있는지 확인하세요.
  잘못 구성된 IPv6 설정은 연결 문제를 일으킬 수 있습니다.

:::warning VLAN 구성에는 ULA IPv6가 필요합니다

Matter는 장치 발견 및 통신을 위해 IPv6를 필요로 합니다. 여기에 관련된 IPv6 주소에는 두 가지 유형이 있습니다:

- **링크 로컬(Link-local)** (`fe80::/64`), 모든 인터페이스에 자동 할당됩니다. **VLAN이나 서브넷을 가로질러 라우팅될 수 없습니다.** 모든 장치가 동일한 Layer 2 세그먼트에 있을 때만 작동합니다.
- **ULA(Unique Local Address)** (`fd00::/8`), 로컬 네트워크 내 VLAN을 가로질러 라우팅됩니다. Home Assistant와 IoT 장치가 서로 다른 VLAN에 있는 경우 필요한 것이 바로 이것입니다.

VLAN 구성(예: "Server" VLAN의 Home Assistant와 "IoT" VLAN의 IoT 장치)을 운영하는 경우 라우터에 **ULA IPv6 주소를 구성해야 합니다**. 링크 로컬만으로는 VLAN을 가로질러 작동하지 않습니다.

**일반적인 라우터에서 ULA를 설정하는 방법:**

- **UniFi**: Settings → Networks → (해당 네트워크) → IPv6 → `fd00::/48` 접두사로 IPv6 활성화(WAN의 Prefix Delegation은 선택 사항이며 로컬 작동에는 필요하지 않음)
- **pfSense / OPNsense**: Interfaces → (해당 VLAN) → IPv6 Configuration Type → `fd00::/64` 접두사의 "Track Interface" 또는 "Static IPv6"
- **일반 라우터**: LAN/VLAN 설정에서 ULA 접두사로 IPv6를 활성화하세요. 라우터 설명서를 참조하세요.

**빠른 확인:**

```bash
# On your Home Assistant host, check for a ULA address (starts with fd):
ip -6 addr show | grep "fd"

# Ping a device on another VLAN using its ULA address:
ping6 fd10::30:xxxx:xxxx:xxxx:xxxx
```

`fe80::` 주소만 보이고 `fd` 접두사가 없다면 ULA가 구성되지 않은 것입니다.

라우터나 Home Assistant 호스트에서 **IPv6 설정을 변경한 후에는** (애드온만이 아닌) **HAOS를 재부팅하세요**. mDNS 서비스는 시작 시 네트워크 주소를 읽으며, Docker 컨테이너는 호스트가 재시작될 때까지 인터페이스 변경 사항을 인식하지 못할 수 있습니다.

Matter와의 IPv6 동작에 대한 자세한 설명은 [Discussion #39](https://github.com/RiDDiX/home-assistant-matter-hub/discussions/39)를 참조하세요.

:::

### 방화벽 및 VLAN

mDNS를 포함한 UDP는 일반적으로 분할된 네트워크를 가로질러 라우팅되지 않습니다. 올바른 작동을 위해 UDP 트래픽이
모든 네트워크 세그먼트 간에 자유롭게 흐러야 하며, IPv6가 네트워크 전반에서 완전히 작동해야 합니다.

- 네트워크를 분할하여 장치를 서로 고립시킬 수 있는 VLAN 구성은 피하세요. 페어링 과정 중의 모바일 장치를 포함한 모든
  장치가 원활한 통신을 위해 동일한 네트워크 세그먼트에 있도록 하세요.
- VLAN 분할을 피할 수 없는 경우:
  - **포트**: 필요한 포트(예: **5353, 5540, 5541** - TCP & UDP)가 열려 있고 올바르게 라우팅되는지 확인하세요.
  - **mDNS 포워딩**: 서로 다른 네트워크 세그먼트의 장치 간 통신을 허용하도록 mDNS 포워딩을 활성화하세요.
  - **방화벽**: 방화벽이 필요한 포트를 허용하는지 확인하세요. 방화벽이 연결 문제를 일으키는지 판단하기 위해
    일시적으로 방화벽을 비활성화해 보세요.

### IGMP Snooping

올바르게 구성되지 않으면 IGMP Snooping이 mDNS 메시지를 억제할 수 있습니다.
이러한 이유로 스위치와 같은 네트워크 장치, 그리고 해당되는 경우 하이퍼바이저 및 액세스 포인트에서 비활성화하는 것이 권장됩니다.

## 2. mDNS/멀티캐스트를 차단하는 네트워크 장비

많은 라우터, 액세스 포인트, 관리형 스위치에는 **기본적으로 멀티캐스트 트래픽을 필터링, 제한 또는 차단하는** 기능이 있으며, 이는 조용히 Matter 통신을 중단시킵니다. 이는 간헐적인 "응답 없음" 또는 연결 끊김의 가장 흔한 원인 중 하나입니다.

> **💡 커뮤니티 발견:** 이는 [@omerfaruk-aran](https://github.com/omerfaruk-aran)이 [#129](https://github.com/RiDDiX/home-assistant-matter-hub/issues/129)에서 체계적인 테스트를 통해 확인했습니다. 이 문제는 TP-Link Archer AX50(AP 모드)이 시간이 지남에 따라 mDNS/Bonjour 트래픽을 차단하여, Alexa는 계속 잘 작동하는 동안 Apple Home이 도달 가능성을 잃은 것으로 추적되었습니다.

### 증상

- 일정 시간(몇 분에서 몇 시간) 후 Apple Home에서 장치가 **"응답 없음"**으로 표시됨
- 장애 중에도 다른 컨트롤러(예: Alexa)는 **계속 작동함**
- HAMH 브리지 UI는 온라인 상태를 유지하며 "Running"으로 표시됨
- Home Hub(HomePod/Apple TV)를 제거하거나 재부팅하면 일시적으로 해결됨
- 유휴 기간 후 문제가 다시 발생함

### 확인할 사항

| 설정 | 조치 | 이유 |
|---------|--------|-----|
| **IGMP Snooping** | 비활성화하거나 mDNS 그룹(`224.0.0.251` / `ff02::fb`) 허용 | mDNS 멀티캐스트를 조용히 필터링할 수 있음 |
| **멀티캐스트 최적화** | 비활성화("Airtime Fairness" 또는 "Multicast to Unicast"라고도 함) | 멀티캐스트를 유니캐스트로 변환하여 mDNS를 중단시킴 |
| **AP 격리 / 클라이언트 격리** | 반드시 **비활성화** 해야 함 | 동일 네트워크의 장치 간 통신을 차단함 |
| **mDNS / Bonjour 포워딩** | 가능하면 활성화 | 일부 엔터프라이즈 AP는 명시적인 mDNS 포워딩이 필요함 |
| **AP의 DHCP 서버** | 메인 라우터를 제외한 모든 장치에서 비활성화 | 여러 DHCP 서버는 IP 충돌과 라우팅 문제를 일으킴 |
| **펀웨어** | 최신 버전으로 업데이트 | 멀티캐스트 처리는 펀웨어 업데이트에서 자주 개선됨 |

### 알려진 영향 장비

| 장치 | 문제 | 해결 |
|--------|-------|-----|
| **TP-Link Archer AX50** (AP 모드) | 시간이 지남에 따라 mDNS 트래픽이 차단/제한됨 | 펀웨어 업데이트 + AP에서 DHCP 비활성화 ([#129](https://github.com/RiDDiX/home-assistant-matter-hub/issues/129)) |
| **Ubiquiti UniFi AP** | IGMP Snooping이 mDNS를 필터링할 수 있음 | IGMP Snooping 비활성화 또는 mDNS Reflector 활성화 |
| **관리형 스위치** (다양) | 기본적으로 멀티캐스트 필터링이 활성화됨 | mDNS 멀티캐스트 그룹 허용 |
| **메쉬 Wi-Fi 시스템** | 일부 구현은 노드 간 멀티캐스트를 격리함 | 멀티캐스트/mDNS 설정을 확인하고 유선 백홀 고려 |

### mDNS 네트워크 인터페이스 바인딩

여러 네트워크 인터페이스가 있는 호스트(`docker0` / `hassio` / `veth*` 같은 Docker 브리지, `172.16.x`의 `eth0` 같은 컨테이너 자체 브리지, 그리고 실제 LAN NIC)에서 Matter는 그 **모든** 인터페이스에 운영 레코드를 광고하고 모든 인터페이스 주소를 해당 레코드에 기록합니다. 그러면 컨트롤러가 Docker 내부 또는 도달할 수 없는 주소에 고착되어 페어링이 성공했더라도 장치를 **"응답 없음"**(Apple Home) 또는 **"오프라인"**(Google Home)으로 표시할 수 있습니다. 정전이나 재부팅이 인터페이스나 주소를 재배치하여 이 문제를 유발할 수 있습니다.

HAMH는 시작 시 이를 감지하며, Docker 내부 인터페이스가 있을 때 예상되는 LAN 인터페이스 이름을 명시한 경고를 기록합니다. 직접 해당 LAN 인터페이스에 mDNS를 바인딩하세요(Docker 인터페이스가 **아님**):

- **HA OS 애드온:** `mdns_network_interface` 옵션을 `docker0`, `hassio`, 또는 `veth*`가 아닌 LAN NIC(예: `end0`, `eth0`, `enp0s18`)로 설정하세요.
- **일반 컨테이너:** Docker 브리지(예: `172.16.x`의 `eth0`)가 아닌 `--mdns-network-interface eth1`(`192.168.x`의 LAN NIC)을 전달하거나, `--network=host`로 컨테이너를 실행하세요(Matter에 권장).

`ip addr`로 이름과 주소를 확인하세요. 애드온에서 변경한 후에는 mDNS가 주소를 다시 읽도록 (애드온만이 아닌) **HAOS를 재부팅**한 다음 컨트롤러에서 브리지를 다시 커미셔닝하세요.

### 네트워크 토폴로지 모범 사례

- **경로를 단순하게 유지**: Matter 브리지(Home Assistant)와 Home Hub(HomePod/Apple TV) 사이에 액세스 포인트나 관리형 스위치를 배치하지 마세요
- Home Hub와 Home Assistant 호스트는 가능한 곳에서 **유선 연결**을 사용하세요
- **동일 서브넷**: 모든 Matter 장치, 컨트롤러, 브리지는 반드시 동일한 Layer 2 네트워크 / 서브넷에 있어야 합니다
- **IPv6 활성화**: Matter는 IPv6를 필요로 하므로 비활성화하지 마세요. VLAN 구성에서는 링크 로컬(`fe80::`)만이 아닌 **ULA 주소**(`fd00::/8`)를 구성하세요. 위의 [IPv6 섹션](#ipv6)을 참조하세요.

## 3. 에코시스템 및 장치 호환성 / 요구 사항

### Apple Home

- **Home Hub 필수**: Apple Home은 지속적인 Matter 연결을 유지하기 위해 Home Hub로 **HomePod**(mini) 또는 **Apple TV**가 필요합니다. 허브가 없으면 iPhone은 Home 앱이 활성화된 동안에만 연결을 유지합니다.
- **Home Hub 추가 후 "응답 없음"**: HomePod나 Apple TV를 추가한 후 장치가 응답하지 않으면 거의 항상 네트워크 문제입니다. 위의 [섹션 2](#2-network-equipment-blocking-mdnsmulticast)를 참조하세요.
- **로봇 청소기의 "업데이트 중" 상태**: Apple Home은 로봇 청소기가 브리지되지 않고 독립 장치로 노출되도록 요구합니다. **서버 모드**를 활성화하세요. [로봇 청소기 문서](../devices/robot-vacuum.md)를 참조하세요.
- **폰 재부팅을 통한 빠른 해결**: Apple Home은 "응답 없음"을 표시하지만 Alexa는 잘 작동한다면, iPhone/iPad를 재부팅하면 Apple Home이 구독을 다시 설정하도록 강제할 수 있으며, 이는 임시 해결책입니다.
- **Apple TV vs. HomePod mini**: Apple TV(4K)는 더 많은 CPU/RAM 덕분에 일반적으로 HomePod mini보다 큰 브리지를 더 잘 처리합니다. 장치가 많은 경우 Apple TV를 기본 Home Hub로 사용하는 것이 좋습니다.

### Alexa

- **IPv6 주소 유형(GUA vs ULA)**: Alexa는 로컬에서 도달 가능한 IPv6 주소가 필요합니다. Home Assistant 호스트에 **GUA**(Global Unicast, `2xxx::/3`)와 **ULA**(`fd00::/8`) IPv6 주소가 모두 있으면 mDNS가 Alexa가 로컬 네트워크에서 도달할 수 없는 GUA를 광고할 수 있습니다. 인터페이스에서 GUA를 제거하거나 ULA가 구성되어 있는지 확인한 다음, mDNS 서비스가 올바른 주소를 인식하도록 (애드온만이 아닌) **HAOS를 재부팅**하세요. [#283](https://github.com/RiDDiX/home-assistant-matter-hub/issues/283)을 참조하세요.
- **장치 제한**: 너무 많은 장치(약 80-100개)가 이미 연결되어 있으면 Alexa는 브리지와 페어링할 수 없습니다.
  사용하지 않는 장치를 제거하여 이 제한을 해결하세요.
- **Amazon 장치 요구 사항**: Matter를 지원하는 Amazon 장치가 최소 하나 연결되어 있는지 확인하세요. 서드파티
  Alexa 지원 장치(예: Sonos)는 Matter 장치와의 페어링에 충분하지 않습니다.

### Google Home

- **Matter 허브 요구 사항**: Google Home은 Matter 통합을 위해 **Google Nest** 또는 **Google Mini** 같은
  전용 Matter 허브가 필요합니다.
- **오프라인 장치**: Google Home이 장치를 "오프라인"으로 표시하는 경우:
  - 호환되는 Google Home 장치(예: Google Home Mini)가 로컬 네트워크에 연결되어 있는지 확인하세요.
  - **IPv6**가 올바르게 설정되어 있는지 확인하세요. IPv6 문제는 오프라인 장치 표시를 일으킬 수 있습니다.
- **인증된 Matter 장치**: Google Home은 인증되지 않은 Matter 장치를 거부할 수 있습니다.
  허브를 Google Home에 올바르게 등록하려면 [이 가이드](https://github.com/project-chip/matter.js/blob/main/docs/ECOSYSTEMS.md#google-home-ecosystem)를
  따르세요.

## 4. 추가 문제 해결 팁

- **로그**: 구성 문제를 식별하고 해결하기 위해 로그에서 구체적인 오류 메시지를 검토하세요.
- **리소스 참조**: matter.js 프로젝트의
  [문제 해결 가이드](https://github.com/project-chip/matter.js/blob/main/docs/TROUBLESHOOTING.md)와
  [알려진 문제](https://github.com/project-chip/matter.js/blob/main/docs/KNOWN_ISSUES.md)를 참조하세요.

### 자동 복구

HAMH는 시작에 실패한 브리지를 자체적으로 재시작합니다. 실패한 브리지만 처리되며, 실행 중인 브리지는 절대 중단되지 않습니다. 복구는 타이머로 실행되고 Home Assistant가 다시 연결된 직후에도 다시 실행되므로, 짧은 HA 중단은 브리지를 멈춰 두지 않습니다. **Settings → Auto recovery**에서 끄거나 간격을 변경할 수 있으며, 최근 시도 내역은 Health Dashboard에 나열됩니다.

### 정상 종료

중지 또는 재시작 시 HAMH는 종료하기 전에 Matter 세션을 닫습니다. 따라서 각 컨트롤러는 오래된 세션을 유지하는 대신 이전 세션을 즉시 끊습니다. 이는 재시작 후 컨트롤러가 한동안 브리지를 응답하지 않는 것으로 표시하는 것을 방지합니다.
