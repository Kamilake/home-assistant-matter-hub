# 테스팅 기능 가이드

> [!CAUTION]
> 테스팅 버전은 **매우 불안정**하며 개발자와 테스터를 위한 것입니다!
> 기능이 불완전하거나, 손상되었거나, 예고 없이 제거될 수 있습니다.

이 가이드는 Home-Assistant-Matter-Hub의 테스팅 브랜치(`testing`)에서 사용할 수 있는 기능을 다룹니다.

---

## ⚠️ 중요 경고

- **프로덕션 환경에서 사용하지 마세요** - 테스팅 버전은 언제든 손상될 수 있습니다
- **데이터 손실 가능** - 테스트 전에 항상 백업하세요
- **지원 보장 없음** - 문제 해결에 더 오래 걸릴 수 있습니다
- **기능이 제거될 수 있음** - Alpha에 도달하기 전까지는 확정된 것이 없습니다

---

## 테스팅 버전 설치

### Home Assistant 애드온

현재 전용 테스팅 애드온은 없습니다. 테스트하려면:

1. Alpha 애드온 리포지토리를 사용하세요: `https://github.com/riddix/home-assistant-addons`
2. 사용 가능한 경우 testing Docker 태그로 수동 업데이트하세요
3. 또는 `testing` 브랜치를 사용하여 소스에서 빌드하세요

### Docker

`testing` 태그를 사용하세요:

```bash
docker run -d \
  --name home-assistant-matter-hub-testing \
  --network host \
  -v /path/to/data:/data \
  -e HAMH_HOME_ASSISTANT_URL=http://homeassistant.local:8123 \
  -e HAMH_HOME_ASSISTANT_ACCESS_TOKEN=your_token \
  ghcr.io/riddix/home-assistant-matter-hub:testing
```

### 소스에서 빌드

```bash
git clone https://github.com/RiDDiX/home-assistant-matter-hub.git
cd home-assistant-matter-hub
git checkout testing
pnpm install
pnpm run build
```

---

## 현재 테스팅 기능

테스팅에는 모든 Alpha 기능과 활발히 개발 중인 실험적 변경 사항이 포함됩니다.

### 현재 테스팅 중인 기능

| 기능 | 상태 | 설명 |
|---------|--------|-------------|
| 모든 Alpha 기능 | ✅ 포함됨 | Alpha 브랜치의 모든 것 |
| 실험적 수정 | 🧪 테스팅 | Alpha 전에 검증 중인 버그 수정 |
| 새 장치 유형 | 🧪 테스팅 | 평가 중인 장치 유형 |

---

## 테스팅 문제 보고

테스팅 브랜치의 문제를 보고할 때:

1. GitHub 이슈에 **`testing` 레이블을 사용**하세요
2. **정확한 버전을 포함**하세요(예: `v2.0.0-testing.6`)
3. **전체 로그를 제공**하세요 - 테스팅 문제는 더 많은 컨텍스트가 필요합니다
4. **예상 동작과 실제 동작을 설명**하세요
5. **Alpha/Stable에서 작동했는지 명시**하세요

### 테스팅용 이슈 템플릿

```markdown
**Testing Version:** v2.0.0-testing.X
**Previous Working Version:** (if applicable)
**Controller:** Apple Home / Google Home / Alexa

**Steps to Reproduce:**
1. ...
2. ...

**Expected Behavior:**
...

**Actual Behavior:**
...

**Logs:**
```
(paste relevant logs here)
```
```

---

## 버전 진행 단계

기능은 다음과 같이 브랜치를 거쳐 흐릅니다:

```
Testing → Alpha → Stable (Main)
   ↓        ↓         ↓
Unstable  Testing   Production
```

1. **Testing** - 초기 구현, 손상될 수 있음
2. **Alpha** - 안정화됨, 더 넓은 테스트 준비 완료
3. **Stable** - 프로덕션 준비 완료, 철저히 테스트됨

---

## 테스팅에서 되돌리기

심각한 문제가 발생한 경우:

1. 테스팅 컨테이너/애드온을 중지합니다
2. Alpha 또는 Stable 버전으로 전환합니다
3. 구성은 호환되어야 합니다
4. 자세한 내용과 함께 GitHub에 문제를 보고하세요

```bash
# Docker - switch to alpha
docker pull ghcr.io/riddix/home-assistant-matter-hub:alpha

# Or switch to stable
docker pull ghcr.io/riddix/home-assistant-matter-hub:latest
```

---

## 테스팅 기여하기

새 기능 테스트를 도와주고 싶으신가요?

1. **토론에 참여** - 테스팅 요청이 있는지 GitHub 이슈를 확인하세요
2. **문제 보고** - 자세한 버그 보고는 매우 소중합니다
3. **로그 제공** - 문제 디버깅을 도와주세요
4. **다양한 컨트롤러 테스트** - 모든 에코시스템의 피드백이 필요합니다

### 테스팅 체크리스트

새 기능을 테스트할 때 다음을 확인하세요:

- [ ] 기능이 설명대로 작동함
- [ ] 로그에 오류가 없음
- [ ] Apple Home과 작동함
- [ ] Google Home과 작동함
- [ ] Alexa와 작동함
- [ ] 기존 기능에 영향 없음
- [ ] UI가 올바르게 표시됨
- [ ] 재시작 후에도 구성이 유지됨

---

## 변경 내역(Changelog)

### v2.0.0-testing.7 (최신)
- pre-commit reactor를 사용한 온도조절기 모드 변경 수정
- 스크립트의 숨겨진 엔터티 필터 수정
- README 문서 업데이트

### v2.0.0-testing.6
- Matter 아이덴티티 파일을 포함한 전체 백업
- UI의 알파벳 순 브리지 정렬

### v2.0.0-testing.1-5
- 초기 테스팅 브랜치 설정
- Alpha 기능에서 마이그레이션

---

## 감사의 말

불안정한 버전을 테스트하고 피드백을 제공해 주신 모든 분께 감사드립니다! 여러분의 기여는 안정 릴리스를 모두에게 더 나은 것으로 만드는 데 도움이 됩니다.

헌신적인 테스터들께 특별히 감사드립니다:
- [@codyc1515](https://github.com/codyc1515) - 광범위한 온도조절기 테스트 및 피드백
