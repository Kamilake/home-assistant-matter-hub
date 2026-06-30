# API 레퍼런스

별도로 명시되지 않는 한 모든 엔드포인트는 JSON을 반환합니다. 기본 포트: `8482`.

## 기본 URL

Home Assistant Ingress를 사용할 때 엔드포인트는 ingress URL을 기준으로 상대 경로입니다:
```
/api/hassio_ingress/<ingress_token>/api/...
```

독립 Docker 배포의 경우:
```
http://localhost:8482/api/...
```

## 인증

구성된 경우 API는 HTTP Basic 인증을 사용합니다. 설정 페이지 또는 환경 변수를 통해 자격 증명을 설정하세요.

---

## Health API

기본 경로: `/api/health`

### GET /api/health

기본 상태 정보를 반환합니다.

**응답:**
```json
{
  "status": "healthy",
  "version": "2.1.0-alpha.1",
  "uptime": 3600,
  "timestamp": "2026-01-27T12:00:00.000Z",
  "services": {
    "homeAssistant": { "connected": true },
    "bridges": { "total": 2, "running": 2, "stopped": 0, "failed": 0 }
  }
}
```

**상태 코드:** `200` healthy/degraded, `503` unhealthy.

### GET /api/health/detailed

브리지별 정보, fabric 세부 정보, 실패한 엔터티 진단 정보, 최근 시도 내역을 포함한 복구 상태 등 상세한 상태 정보를 반환합니다.

### GET /api/health/live

Kubernetes liveness probe입니다. `200 OK`를 반환합니다.

### GET /api/health/ready

Kubernetes readiness probe입니다. Home Assistant가 연결되면 `200`을, 그렇지 않으면 `503`을 반환합니다.

---

## Settings API

기본 경로: `/api/settings`

### GET /api/settings/recovery

자동 복구 설정을 반환합니다: `autoRecoveryEnabled`(boolean)과 `recoveryIntervalMs`(number).

### PUT /api/settings/recovery

자동 복구 설정을 업데이트합니다. 본문은 `autoRecoveryEnabled`와 `recoveryIntervalMs`(10000-3600000 ms)를 받습니다. 즉시 적용되며 재시작 후에도 유지됩니다.

---

## Matter / Bridge API

기본 경로: `/api/matter`

### GET /api/matter/bridges

구성된 모든 브리지를 나열합니다.

### POST /api/matter/bridges

새 브리지를 생성합니다.

**요청:**
```json
{
  "name": "New Bridge",
  "port": 5541,
  "filter": {
    "include": [{ "type": "domain", "value": "light" }],
    "exclude": []
  }
}
```

### GET /api/matter/bridges/:bridgeId

특정 브리지를 조회합니다. 찾을 수 없으면 `404`를 반환합니다.

### PUT /api/matter/bridges/:bridgeId

브리지 구성을 업데이트합니다.

### DELETE /api/matter/bridges/:bridgeId

브리지를 삭제합니다. `204 No Content`를 반환합니다.

### 브리지 액션

| 엔드포인트 | 메서드 | 설명 |
|----------|--------|-------------|
| `/api/matter/bridges/:bridgeId/actions/start` | POST | 중지된 브리지 시작 |
| `/api/matter/bridges/:bridgeId/actions/stop` | POST | 실행 중인 브리지 중지 |
| `/api/matter/bridges/:bridgeId/actions/restart` | POST | 브리지 재시작 |
| `/api/matter/bridges/:bridgeId/actions/refresh` | POST | 재시작 없이 장치 새로 고침 |
| `/api/matter/bridges/:bridgeId/actions/factory-reset` | POST | 공장 초기화(fabric 제거) |
| `/api/matter/bridges/:bridgeId/actions/force-sync` | POST | 현재 상태를 컨트롤러에 전송 |
| `/api/matter/bridges/:bridgeId/actions/open-commissioning-window` | POST | 멀티 fabric용 페어링 창 열기 |
| `/api/matter/bridges/actions/start-all` | POST | 모든 브리지 시작 |
| `/api/matter/bridges/actions/stop-all` | POST | 모든 브리지 중지 |
| `/api/matter/bridges/actions/restart-all` | POST | 모든 브리지 재시작 |

### PUT /api/matter/bridges/priorities

브리지 시작 우선순위를 업데이트합니다.

**요청:**
```json
{ "updates": [{ "id": "abc123", "priority": 1 }] }
```

### POST /api/matter/bridges/:bridgeId/clone

브리지 구성을 복제합니다(새 포트가 자동으로 할당됨).

### GET /api/matter/bridges/:bridgeId/devices

브리지가 노출하는 모든 Matter 장치를 조회합니다.

### GET /api/matter/next-port

새 브리지에 사용할 다음 가용 포트를 조회합니다.

### POST /api/matter/filter-preview

필터에 일치하는 엔터티를 미리 보기합니다.

### GET /api/matter/labels

Home Assistant 레이블을 조회합니다.

### GET /api/matter/areas

Home Assistant 영역(area)을 조회합니다.

### GET /api/matter/filter-values

사용 가능한 필터 값(도메인, 레이블, 영역)을 조회합니다.

---

## Home Assistant API

기본 경로: `/api/home-assistant`

### GET /api/home-assistant/stats

엔터티/장치 통계와 연결 상태를 조회합니다.

### GET /api/home-assistant/entities

페이지네이션 및 필터링과 함께 엔터티를 나열합니다.

**쿼리 매개변수:**
| 매개변수 | 타입 | 기본값 | 설명 |
|-----------|------|---------|-------------|
| `domain` | string | - | 도메인으로 필터링(예: `light`) |
| `search` | string | - | entity_id 및 friendly_name에서 검색 |
| `limit` | number | 100 | 최대 결과 수(1-500) |
| `offset` | number | 0 | 페이지네이션 오프셋 |

### GET /api/home-assistant/entities/:entityId

특정 엔터티를 조회합니다. 찾을 수 없으면 `404`를 반환합니다.

### GET /api/home-assistant/devices

페이지네이션 및 필터링과 함께 장치를 나열합니다.

### GET /api/home-assistant/devices/:deviceId

장치와 그에 속한 모든 엔터티를 조회합니다.

### GET /api/home-assistant/domains

엔터티 개수와 함께 모든 도메인을 조회합니다.

### POST /api/home-assistant/refresh

HA 엔터티 레지스트리를 강제로 새로 고침합니다.

### GET /api/home-assistant/related-buttons/:entityId

동일한 HA 장치에 속한 버튼 엔터티를 조회합니다(청소기 방별 청소에 유용).

---

## Entity Mapping API

기본 경로: `/api/entity-mappings`

### GET /api/entity-mappings/:bridgeId

브리지의 모든 엔터티 매핑을 조회합니다.

### PUT /api/entity-mappings/:bridgeId/:entityId

특정 엔터티의 매핑을 생성하거나 업데이트합니다.

**요청:**
```json
{
  "matterDeviceType": "DimmableLight",
  "customName": "Custom Name",
  "disabled": false
}
```

### DELETE /api/entity-mappings/:bridgeId/:entityId

특정 엔터티 매핑을 삭제합니다.

### DELETE /api/entity-mappings/:bridgeId

브리지의 모든 매핑을 삭제합니다.

---

## Bridge Export / Import API

기본 경로: `/api/bridges`

### GET /api/bridges/export

모든 브리지 구성을 JSON 다운로드로 내보냅니다.

### GET /api/bridges/export/:bridgeId

단일 브리지를 내보냅니다.

### POST /api/bridges/import/preview

변경 사항을 적용하지 않고 가져오기를 미리 보기합니다.

### POST /api/bridges/import

브리지 구성을 가져옵니다.

**요청:**
```json
{
  "data": { },
  "options": {
    "bridgeIds": ["abc123"],
    "overwriteExisting": true
  }
}
```

---

## Backup API

기본 경로: `/api/backup`

### GET /api/backup/download

전체 백업 ZIP(브리지 + 엔터티 매핑)을 다운로드합니다.

| 매개변수 | 타입 | 기본값 | 설명 |
|-----------|------|---------|-------------|
| `includeIdentity` | boolean | `false` | Matter 아이덴티티 파일 포함 |

### POST /api/backup/restore/preview

백업 복원을 미리 보기합니다. `file` 필드가 포함된 `multipart/form-data`로 업로드합니다.

### POST /api/backup/restore

백업에서 복원합니다. `file`과 `options` 필드가 포함된 `multipart/form-data`로 업로드합니다.

### POST /api/backup/restart

복원 후 애플리케이션을 재시작합니다.

---

## Plugin API

기본 경로: `/api/plugins`

### GET /api/plugins

설치된 플러그인 패키지와 브리지별 활성 플러그인을 나열합니다.

### POST /api/plugins/install

npm에서 플러그인을 설치합니다.

**요청:**
```json
{ "packageName": "hamh-plugin-example" }
```

### POST /api/plugins/upload

업로드한 `.tgz` 파일에서 플러그인을 설치합니다. `Content-Type: application/octet-stream`으로 원시 바이너리를 요청 본문으로 전송합니다.

### POST /api/plugins/install-local

로컬 플러그인 디렉터리를 연결합니다.

**요청:**
```json
{ "path": "/absolute/path/to/plugin" }
```

### POST /api/plugins/uninstall

플러그인 패키지를 제거합니다.

**요청:**
```json
{ "packageName": "hamh-plugin-example" }
```

### POST /api/plugins/:bridgeId/:pluginName/enable

브리지에서 플러그인을 활성화합니다.

### POST /api/plugins/:bridgeId/:pluginName/disable

브리지에서 플러그인을 비활성화합니다.

### POST /api/plugins/:bridgeId/:pluginName/reset

플러그인의 서킷 브레이커를 재설정합니다(장애로 인한 자동 비활성화 후 다시 활성화).

### GET /api/plugins/:bridgeId/:pluginName/config-schema

플러그인의 JSON 구성 스키마를 조회합니다(플러그인이 제공하는 경우).

### POST /api/plugins/:bridgeId/:pluginName/config

플러그인의 구성을 업데이트합니다.

**요청:**
```json
{ "config": { "pollingInterval": 30000 } }
```

---

## Lock Credentials API

기본 경로: `/api/lock-credentials`

### GET /api/lock-credentials

모든 잠금장치 자격 증명을 조회합니다.

### GET /api/lock-credentials/:entityId

특정 잠금장치 엔터티의 자격 증명을 조회합니다.

### PUT /api/lock-credentials/:entityId

잠금장치 자격 증명(PIN 코드)을 생성하거나 업데이트합니다.

### PATCH /api/lock-credentials/:entityId/enabled

잠금장치 자격 증명을 활성화 또는 비활성화합니다.

### DELETE /api/lock-credentials/:entityId

잠금장치 자격 증명을 삭제합니다.

---

## Logs API

기본 경로: `/api/logs`

### GET /api/logs

선택적 필터링과 함께 로그를 검색합니다.

| 매개변수 | 타입 | 기본값 | 설명 |
|-----------|------|---------|-------------|
| `level` | string | - | 쉼표로 구분된 레벨(예: `error,warn`) |
| `search` | string | - | 로그 메시지에서 검색 |
| `limit` | number | 100 | 최대 항목 수(1-500) |

### GET /api/logs/levels

레벨별 로그 개수를 조회합니다.

### DELETE /api/logs

저장된 모든 로그를 삭제합니다.

### GET /api/logs/stream

실시간 로그 스트리밍을 위한 Server-Sent Events(SSE) 엔드포인트입니다.

```javascript
const eventSource = new EventSource('api/logs/stream');
eventSource.onmessage = (event) => {
  const log = JSON.parse(event.data);
  console.log(log);
};
```

---

## Metrics API

기본 경로: `/api/metrics`

### GET /api/metrics

시스템 메트릭을 **JSON** 형식으로 반환합니다(메모리, 브리지, HA 연결 상태).

### GET /api/metrics/prometheus

스크래이핑을 위해 메트릭을 **Prometheus** 텍스트 형식으로 반환합니다.

```
# HELP hamh_uptime_seconds Application uptime in seconds
# TYPE hamh_uptime_seconds gauge
hamh_uptime_seconds 3600

# HELP hamh_bridges_total Total number of bridges
# TYPE hamh_bridges_total gauge
hamh_bridges_total 2

# HELP hamh_bridge_status Bridge status (1=running, 0=not running)
# TYPE hamh_bridge_status gauge
hamh_bridge_status{bridge_id="abc123",bridge_name="My_Bridge"} 1
```

---

## System API

기본 경로: `/api/system`

### GET /api/system/info

시스템 정보(호스트명, 플랫폼, 메모리, 네트워크 인터페이스, 저장소)를 반환합니다.

---

## WebSocket API

**엔드포인트:** `ws://<host>:<port>/api/ws`

브리지 상태와 진단 정보에 대한 실시간 업데이트를 제공합니다.

### 클라이언트 → 서버 메시지

| 타입 | 설명 |
|------|-------------|
| `ping` | 클라이언트 ping; 서버가 `pong`으로 응답 |
| `subscribe_diagnostics` | 실시간 진단 이벤트 구독 |
| `unsubscribe_diagnostics` | 진단 구독 해제 |

### 서버 → 클라이언트 메시지

| 타입 | 설명 |
|------|-------------|
| `bridges_update` | 모든 브리지가 업데이트됨(연결 시 + 변경 시 전송) |
| `bridge_update` | 단일 브리지 업데이트; `bridgeId` 필드 포함 |
| `diagnostic_event` | 실시간 진단 이벤트(구독 필요) |
| `diagnostic_snapshot` | 진단 구독 후 전송되는 초기 스냅샷 |
| `ping` | 서버 keepalive(30초마다) |
| `pong` | 클라이언트 ping에 대한 응답 |

### 예시

```javascript
const ws = new WebSocket('ws://localhost:8482/api/ws');

ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  switch (message.type) {
    case 'bridges_update':
      console.log('All bridges:', message.data);
      break;
    case 'bridge_update':
      console.log(`Bridge ${message.bridgeId}:`, message.data);
      break;
    case 'ping':
      ws.send(JSON.stringify({ type: 'pong' }));
      break;
  }
};

// 실시간 진단 구독
ws.send(JSON.stringify({ type: 'subscribe_diagnostics' }));
```

---

## 오류 응답

모든 엔드포인트는 다음 형식으로 오류를 반환합니다:
```json
{ "error": "Error message description" }
```

일반적인 상태 코드: `400` Bad Request, `404` Not Found, `500` Internal Server Error, `503` Service Unavailable.
