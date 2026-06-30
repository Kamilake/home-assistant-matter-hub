# Alpha 기능 가이드

이 가이드는 Home-Assistant-Matter-Hub의 Alpha 버전을 설치하고 사용하는 방법을 다룹니다.

> [!WARNING]
> Alpha 버전은 테스트 전용이며 버그가 포함되어 있을 수 있습니다. 사용에 따른 책임은 본인에게 있습니다!

## Alpha 버전 설치

### Home Assistant 애드온

1. 리포지토리를 추가합니다: `https://github.com/riddix/home-assistant-addons`
2. 애드온 스토어에서 **Home-Assistant-Matter-Hub (Alpha)**를 설치합니다
3. Alpha 애드온은 안정 버전과 독립적으로 실행됩니다

### Docker

`latest` 대신 `alpha` 태그를 사용합니다:

```bash
docker run -d \
  --name home-assistant-matter-hub-alpha \
  --network host \
  -v /path/to/data:/data \
  -e HAMH_HOME_ASSISTANT_URL=http://homeassistant.local:8123 \
  -e HAMH_HOME_ASSISTANT_ACCESS_TOKEN=your_token \
  ghcr.io/riddix/home-assistant-matter-hub:alpha
```

---

## 현재 Alpha 기능

- **독립 실행형 장치(Standalone Devices)**: 단일 Home Assistant 엔터티를 자체 페어링 코드를 가진 독립 Matter 장치로 노출하며, UI의 전용 페이지에서 관리합니다. 이제 로봇 청소기뿐만 아니라 지원되는 모든 장치 유형을 독립 실행형으로 실행할 수 있습니다. [독립 실행형 장치](../getting-started/standalone-devices.md)를 참조하세요.

지원되는 모든 기능과 장치 유형의 전체 목록은 [지원 장치 유형](../supported-device-types.md)을 참조하세요.

---

## Alpha 테스트 팁

### 데이터 백업

Alpha로 업그레이드하기 전에 구성을 백업하세요:

```bash
# Docker
cp -r /path/to/data /path/to/data-backup

# Home Assistant Add-on
# Data is stored in /config/home-assistant-matter-hub
```

### Alpha를 별도로 실행하기

안정 버전과 Alpha 버전을 동시에 실행할 수 있습니다:
- 서로 다른 포트를 사용합니다(예: 안정 버전은 8482, alpha는 8483)
- 서로 다른 데이터 디렉터리를 사용합니다
- 브리지에 서로 다른 Matter 포트를 사용합니다

### 문제 보고

Alpha 문제를 보고할 때는 다음을 포함해 주세요:
- Alpha 버전 번호
- 애드온/컨테이너의 로그
- 문제를 재현하는 단계
- 컨트롤러 유형(Google, Apple, Alexa)

### 일반적인 Alpha 문제

**브리지가 시작되지 않음:**
- 로그에서 구체적인 오류를 확인하세요
- 포트가 사용 중이 아닌지 확인하세요
- 브리지의 공장 초기화를 시도해 보세요

**엔터티가 표시되지 않음:**
- 필터 구성을 확인하세요
- 엔터티가 지원되는지 확인하세요
- 장치 생성 중 발생한 오류가 있는지 로그를 검토하세요

**컨트롤러가 연결되지 않음:**
- IPv6가 활성화되어 있는지 확인하세요
- mDNS/UDP 라우팅을 확인하세요
- 포트에 접근 가능한지 확인하세요

---

## 안정 버전으로 되돌리기

Alpha에서 문제가 발생하면:

1. Alpha 애드온/컨테이너를 중지합니다
2. 안정 버전을 설치합니다
3. 페어링된 장치는 자동으로 다시 연결됩니다
4. 일부 새 기능은 사용할 수 없을 수 있습니다

> [!NOTE]
> 구성 데이터는 버전 간 호환됩니다. 브리지와 설정은 그대로 유지됩니다.
