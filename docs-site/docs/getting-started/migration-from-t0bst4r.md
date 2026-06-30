# t0bst4r에서 RiDDiX 포크로 마이그레이션

이 가이드는 원본 `t0bst4r/home-assistant-matter-hub`에서 `riddix/home-assistant-matter-hub` 포크로 **Matter 패브릭 연결을 잃지 않고** 마이그레이션하는 방법을 설명합니다.

:::warning
저장소 형식은 두 버전 간에 완전히 호환됩니다. Matter 패브릭 데이터(Apple Home, Google Home, Alexa 등과의 연결)는 그대로 유지됩니다.
:::

## 사전 준비 사항

- 시작하기 전에 현재 구성을 백업하세요
- 현재 브리지 설정(포트, 필터 등)을 메모해 두세요

## 마이그레이션 방법

### 방법 1: Home Assistant 애드온 (권장)

#### 1단계: 저장소 데이터 백업

1. SSH 또는 터미널을 통해 Home Assistant에 접속합니다
2. 저장소 디렉터리를 복사합니다:
   ```bash
   cp -r /addon_configs/*_hamh /config/hamh-backup
   # Verify the backup was copied correctly
   ls /config/hamh-backup
   ```

#### 2단계: 기존 애드온 제거

1. **Settings → Add-ons → Home Assistant Matter Hub**로 이동합니다
2. **Uninstall**을 클릭합니다
3. 기존 폴더가 제거되었는지 확인합니다:
   ```bash
   rm -rf /addon_configs/*_hamh
   ```

#### 3단계: RiDDiX 저장소 추가

1. **Settings → Add-ons → Add-on Store**로 이동합니다
2. 점 세 개(⋮) → **Repositories**를 클릭합니다
3. 다음을 추가합니다: `https://github.com/riddix/home-assistant-addons`
4. **Add** → **Close**를 클릭합니다

#### 4단계: 새 애드온 설치

1. 스토어에서 **Home-Assistant-Matter-Hub**(RiDDiX 제작)를 찾습니다
2. **Install**을 클릭합니다
3. 새 데이터 폴더를 생성하기 위해 **애드온을 한 번 시작**한 다음 **중지**합니다
4. 새 폴더를 비우고 백업을 복원합니다:
   ```bash
   rm -rf /addon_configs/*_hamh/*
   cp -r /config/hamh-backup/* /addon_configs/*_hamh/
   ```

#### 5단계: 구성 및 시작

1. 이전 구성 설정을 복사합니다
2. 애드온을 시작합니다
3. Matter 패브릭이 자동으로 재연결됩니다

---

### 방법 2: Docker

#### 1단계: 현재 컨테이너 중지

```bash
docker stop home-assistant-matter-hub
```

#### 2단계: 저장소 백업

```bash
# Default location
cp -r ~/.home-assistant-matter-hub ~/.home-assistant-matter-hub-backup

# Or your custom storage location
cp -r /path/to/storage /path/to/storage-backup
```

#### 3단계: 컨테이너 이미지 업데이트

```bash
# Remove old container (keeps volumes)
docker rm home-assistant-matter-hub

# Pull new image
docker pull ghcr.io/riddix/home-assistant-matter-hub:latest

# Start with same configuration
docker run -d \
  --name home-assistant-matter-hub \
  --network host \
  -v ~/.home-assistant-matter-hub:/data \
  -e HAMH_HOME_ASSISTANT_URL="http://homeassistant.local:8123" \
  -e HAMH_HOME_ASSISTANT_ACCESS_TOKEN="your-token" \
  ghcr.io/riddix/home-assistant-matter-hub:latest
```

#### 4단계: 확인

Matter 연결이 재커미셔닝 없이 즉시 작동해야 합니다.

---

### 방법 3: Docker Compose

#### 1단계: `docker-compose.yml` 업데이트

이미지를 다음에서:
```yaml
image: ghcr.io/t0bst4r/home-assistant-matter-hub:latest
```

다음으로 변경합니다:
```yaml
image: ghcr.io/riddix/home-assistant-matter-hub:latest
```

#### 2단계: 재시작

```bash
docker compose down
docker compose pull
docker compose up -d
```

---

## 문제 해결

### 패브릭이 재연결되지 않는 경우

Matter 컨트롤러가 재연결되지 않는 경우:

1. **2~3분 기다리세요** - Matter 기기가 연결을 다시 설정하는 데 시간이 필요할 수 있습니다
2. 오류가 있는지 **로그를 확인**합니다:
   ```bash
   # Add-on
   ha addon logs hamh

   # Docker
   docker logs home-assistant-matter-hub
   ```
3. **Matter 컨트롤러를 재시작**합니다(Apple Home, Google Home 앱 등).

### 저장소 권한 문제

권한 오류가 보이는 경우:

```bash
# Fix permissions (adjust path as needed)
sudo chown -R $(whoami):$(whoami) ~/.home-assistant-matter-hub
```

### 구성 차이

RiDDiX 포크는 t0bst4r 구성과 완전히 하위 호환됩니다. 새로운 기능(예: `--json-logs`)은 선택 사항입니다.

---

## RiDDiX 포크에서 달라진 점은 무엇인가요?

| 기능 | t0bst4r | RiDDiX |
|---------|---------|--------|
| 압력 센서 | ❌ | ✅ |
| 유량 센서 | ❌ | ✅ |
| 공기질 센서 | ❌ | ✅ |
| 밸브 지원 | ❌ | ✅ |
| 경보 제어 패널 | ❌ | ✅ |
| 구조화된 JSON 로깅 | ❌ | ✅ |
| 개선된 UI | ❌ | ✅ |

전체 변경 내역은 [README](https://github.com/riddix/home-assistant-matter-hub#releases)를 참조하세요.

---

## 롤백(Rollback)

t0bst4r로 롤백해야 하는 경우:

1. RiDDiX 버전을 중지합니다
2. 백업을 복원합니다
3. 원본 애드온/컨테이너를 재설치합니다
4. 패브릭은 계속 작동해야 합니다(저장소 형식이 동일함).
