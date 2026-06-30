# 저사양 장치에서 실행하기

이 가이드는 Raspberry Pi(특히 2-4 GB 모델), Home Assistant Yellow, 그리고 RAM이 제한된 VM에 대한 설정 권장 사항을 다룹니다.

## 메모리 요구 사항

HAMH는 시작 시 Matter.js 클러스터 정의, Home Assistant 엔터티 레지스트리, V8 런타임 오버헤드를 로드합니다. 일반적인 메모리 사용량:

| 단계 | 예상 사용량 |
|---|---|
| Node.js + Matter.js 클러스터 정의 | 200-300 MB |
| Home Assistant 레지스트리(엔터티, 장치, 상태) | 50-150 MB (엔터티 수에 따라 증가) |
| Matter 엔드포인트당 | 각 1-3 MB |
| **일반적인 안정 상태(중간 규모 설치)** | **400-600 MB** |

### 동적 힙 크기 조정

v2.0.25부터 HAMH는 Node.js 힙을 **사용 가능한 시스템 메모리의 25%**로 자동 조정하며, 256 MB와 1024 MB 사이로 제한합니다. 계산된 값은 시작 시 로그에 기록됩니다:

```
Memory: total=4096MB, available=3200MB, cgroup=noneMB -> heap: 800MB
```

2 GB 시스템에서는 약 512 MB의 힙이 할당되며, 이는 대규모 브리지 구성에는 븖븖합니다.

## RAM별 권장 구성

### 2 GB (Raspberry Pi 4 2GB, 소형 VM)

- 브리지를 **1-2개**로 제한하고 **총 엔터티를 50개 이하**로 유지하세요
- 필요하지 않으면 `autoComposedDevices`를 비활성화하세요
- 메모리를 많이 사용하는 다른 애드온을 중지하세요(아래 참조)
- swap을 활성화하세요([Swap 구성](#swap-configuration) 참조)

### 4 GB (Raspberry Pi 4/5 4GB, HA Yellow)

- **2-4개 브리지**와 **100-200개 엔터티**에서 잘 작동합니다
- 시작 로그에서 "Memory pressure detected" 경고를 모니터링하세요
- swap은 권장되지만 필수는 아닙니다

### 8 GB+

- 특별한 구성이 필요하지 않습니다

## 메모리 사용량 줄이기

### 1. 브리지당 엔터티 줄이기

각 Matter 엔드포인트는 1-3 MB의 메모리를 사용합니다. 엔터티가 적을수록 메모리가 적게 사용됩니다. 큰 브리지를 더 작은 브리지로 분할하세요(예: 방별 또는 도메인별).

### 2. 메모리를 많이 사용하는 애드온 중지

다음 애드온은 HAMH와 함께 상당한 RAM을 소비할 수 있습니다:

- **Frigate** (비디오 처리)
- **Whisper** (음성-텍스트 변환)
- **Piper** (텍스트-음성 변환)
- **Music Assistant**
- **Python Matter Server** (HAMH 사용 시 필요 없음)

### 3. 힙 크기 재정의

자동 25% 계산이 너무 낮거나 너무 높은 경우 재정의하세요:

**Home Assistant 애드온:** 직접 구성할 수 없으며, 엔트리포인트 스크립트가 자동으로 설정합니다.

**독립 Docker:**

```bash
docker run -e NODE_OPTIONS="--max-old-space-size=768" ghcr.io/riddix/home-assistant-matter-hub
```

**npm (직접 설치):**

```bash
NODE_OPTIONS="--max-old-space-size=768" home-assistant-matter-hub start
```

## Swap 구성

2-4 GB RAM 시스템에서 swap을 활성화하면 OOM kill에 대한 안전장치가 됩니다. swap은 RAM보다 느리지만 Linux 커널이 프로세스를 종료하는 것을 방지합니다.

### 현재 swap 확인

```bash
free -h
```

### Raspberry Pi OS에서 swap 추가

```bash
sudo dphys-swapfile swapoff
sudo sed -i 's/CONF_SWAPSIZE=.*/CONF_SWAPSIZE=1024/' /etc/dphys-swapfile
sudo dphys-swapfile setup
sudo dphys-swapfile swapon
```

### Home Assistant OS에서 swap 추가

Home Assistant OS는 swap을 자동으로 관리합니다. 메모리가 부족한 경우 RAM을 늘리는 것(하드웨어 업그레이드 또는 VM 설정을 통해)이 권장되는 방법입니다.

## OOM Kill 진단

### 증상

- 애드온/컨테이너가 오류 메시지나 스택 트레이스 없이 재시작됨
- 로그의 마지막 줄에 `Killed`이 표시됨
- `docker inspect`에 `OOMKilled: true` 또는 종료 코드 `137`이 표시됨

### OOM 이벤트 확인

```bash
# Check container status
docker inspect <container> | grep -A5 '"State"'

# Check kernel logs for OOM events
dmesg | grep -i "oom\|killed"
journalctl -k | grep -i "oom\|killed"
```

### 시작 메모리 가드

HAMH는 시작 시 시스템 메모리 정보를 로그에 기록합니다. 여유 메모리가 512 MB 미만이면 경고가 표시됩니다:

```
WARN: Low memory detected (384 MB free). HAMH typically needs 400-600 MB.
Consider reducing the number of entities per bridge, stopping memory-heavy
add-ons, or increasing available RAM.
```

## 메모리 사용량 모니터링

### 호스트에서

```bash
# Live container memory usage
docker stats <container>

# Peak memory since last restart
docker inspect <container> --format='{{.HostConfig.Memory}}'
```

### HAMH 로그에서

HAMH는 주요 작업 중 debug 레벨로 힙 사용량을 기록합니다. 이러한 항목을 보려면 로그 레벨을 일시적으로 `debug`로 설정하세요:

```
Memory [after HA registry load]: heap 180/256 MB, rss 320 MB
```

힙 사용량이 지속적으로 제한의 80%를 초과하면 엔터티를 줄이거나 힙 크기를 늘리는 것을 고려하세요.
