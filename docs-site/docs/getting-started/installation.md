# 설치

이 애플리케이션은 여러 가지 방법으로 설치할 수 있습니다:

1. Home Assistant OS용 Home-Assistant 애드온 (권장)
2. 수동 배포
   1. 바로 사용 가능한 Docker 이미지
   2. `npm`을 사용한 수동 설치
   3. 구성 옵션

> [!WARNING]
> 이 애플리케이션을 성공적으로 사용하려면 IPv6가 제대로 활성화되어 있는지 확인해야 합니다.
> 또한 Matter 프로토콜은 mDNS와 UDP에 의존합니다. VLAN을 사용하는 경우
> UDP(특히 mDNS) 패킷이 올바르게 라우팅되도록 해야 합니다.
>
> 문제가 발생하면 [문제 해결 가이드](../guides/connectivity-issues.md)를 확인하세요.

## 1. 네이티브 Home-Assistant 애드온

> [!WARNING]
> Home Assistant 애드온은 Home Assistant OS에서만 사용할 수 있습니다.

다음 GitHub 저장소 URL을 Home Assistant 애드온 스토어에 추가하기만 하면 됩니다.

> https://github.com/riddix/home-assistant-addons

1. Home Assistant 인스턴스의 UI를 엽니다
2. `Settings` -> `Add-Ons` -> `Add-On Store`로 이동합니다
3. 우측 상단의 점 세 개를 클릭하고 `Repositories`를 선택합니다
4. 텍스트 필드에 저장소 URL을 붙여넣고 "Add"를 클릭합니다
5. 애드온 스토어를 새로고침하고 애드온을 설치합니다
6. 애드온 구성 페이지에서 로그 레벨을 설정할 수 있습니다
7. "Start"를 클릭해 애드온을 시작합니다
8. [브리지 구성 가이드](./bridge-configuration.md)를 따릅니다

## 2. 수동 배포

### 2.1 Docker 이미지

> [!WARNING]
> Docker 설치에서도 IPv6가 활성화되어 있는지 확인하세요.
> 자세한 내용은 [이 가이드](https://fariszr.com/docker-ipv6-setup-with-propagation/)를 참조하세요.

이 저장소는 릴리스마다 Docker 이미지를 빌드합니다. `docker-compose`를 사용해 간단히 실행할 수 있습니다:

```yaml
services:
  matter-hub:
    image: ghcr.io/riddix/home-assistant-matter-hub:latest
    restart: unless-stopped
    network_mode: host
    environment: # more options can be found in the configuration section
      - HAMH_HOME_ASSISTANT_URL=http://192.168.178.123:8123/
      - HAMH_HOME_ASSISTANT_ACCESS_TOKEN=ey...ZI
      - HAMH_LOG_LEVEL=info
      - HAMH_HTTP_PORT=8482
    volumes:
      - $PWD/home-assistant-matter-hub:/data
```

그런 다음 `docker compose up -d`를 실행하면 컨테이너가 시작됩니다.

Docker 이미지의 경우 데이터는 `/data`에 저장되므로, 영속성을 위해 해당 위치에 볼륨을 마운트할 수 있습니다.

또는 다음과 같이 컨테이너를 실행할 수도 있습니다:

```bash
docker run -d \
  # more options can be found in the configuration section
  # required: the address of your home assistant instance
  -e HAMH_HOME_ASSISTANT_URL="http://192.168.178.123:8123/" \
  # required: a long lived access token for your home assistant instance
  -e HAMH_HOME_ASSISTANT_ACCESS_TOKEN="eyJ.....dlc" \
  # optional: debug | info | warn | error
  # default: info
  -e HAMH_LOG_LEVEL="info" \
  # optional: the port to use for the web ui
  # default: 8482
  -e HAMH_HTTP_PORT=8482 \
  # recommended: persist the configuration and application data
  -v $PWD/home-assistant-matter-hub:/data \
  # required due to restrictions in matter
  --network=host \
  ghcr.io/riddix/home-assistant-matter-hub:latest
```

추가 구성 옵션은 2.3을 참조하세요.

이제 [브리지 구성 가이드](./bridge-configuration.md)를 계속 진행하면 됩니다.

### 2.2 `npm`을 사용한 수동 설치

이 애플리케이션을 수동으로 설치하려면 다음을 실행하기만 하면 됩니다

```bash
npm install -g home-assistant-matter-hub
```

애플리케이션을 시작하려면 다음을 실행합니다

```bash
home-assistant-matter-hub start \
  # required: the address of your home assistant instance
  # can be replaced with an environment variable: HAMH_HOME_ASSISTANT_URL
  --home-assistant-url="http://192.168.178.123:8123/" \
  # required: a long lived access token for your home assistant instance
  # can be replaced with an environment variable: HAMH_HOME_ASSISTANT_ACCESS_TOKEN
  --home-assistant-access-token="eyJ.....dlc" \
  # optional: debug | info | warn | error
  # default: info
  # can be replaced with an environment variable: HAMH_LOG_LEVEL
  --log-level=info \
  # optional: the port to use for the web ui
  # default: 8482
  # can be replaced with an environment variable: HAMH_WEB_PORT
  --http-port=8482
```

애플리케이션은 데이터를 `$HOME/.home-assistant-matter-hub`에 저장합니다. `--storage-location=/path/to/storage` 옵션이나
`HAMH_STORAGE_LOCATION` 환경 변수를 사용해 저장 경로를 구성할 수 있습니다.

추가 구성 옵션은 2.3을 참조하세요.

이제 [브리지 구성 가이드](./bridge-configuration.md)를 계속 진행하면 됩니다.

### 2.3 구성 옵션

일반적인 앱 구성은 명령줄 인터페이스 또는 환경 변수를 사용해 수행합니다. 사용 가능한 매개변수는
다음과 같습니다:

```
home-assistant-matter-hub start

start the application

Options:
  --help                         Show help                                                                                         [boolean]
  --config                       Provide the path to a configuration JSON file, which can include all the other command options. You can use
                                  kebabcase ("log-level") or camelcase ("logLevel").
  --log-level                                                [string] [choices: "silly", "debug", "info", "warn", "error"] [default: "info"]
  --disable-log-colors                                                                                            [boolean] [default: false]
  --storage-location             Path to a directory where the application should store its data. Defaults to $HOME/.home-assistant-matter-h
                                 ub                                                                                                 [string]
  --http-port, --web-port        Port used by the web application. 'http-port' is recommended, 'web-port' is deprecated and will be removed
                                 in the future.                                                                     [number] [default: 8482]
  --http-auth-username           Username for HTTP basic authentication                                                             [string]
  --http-auth-password           Password for HTTP basic authentication                                                             [string]
  --http-ip-whitelist            Only allow the specified IPv4, IPv6 or CIDR. You can specify this option multiple times. When configured vi
                                 a ENV variables, you can only specify ONE value. Defaults to allow every IP address.                [array]
  --mdns-network-interface       Limit mDNS to this network interface                                                               [string]
  --home-assistant-url           The HTTP-URL of your Home Assistant URL                                                 [string] [required]
  --home-assistant-access-token  A long-lived access token for your Home Assistant Instance                              [string] [required]
```

이러한 구성 옵션은 모두 환경 변수로도 구성할 수 있습니다. 접두사로 `HAMH_`를 붙이고
밑줄을 사용해 대문자로 작성하면 됩니다(예: `HAMH_MDNS_NETWORK_INTERFACE`).

**이러한 구성 옵션은 Home Assistant 애드온 설치 유형에서는 필요하지 않습니다.**
