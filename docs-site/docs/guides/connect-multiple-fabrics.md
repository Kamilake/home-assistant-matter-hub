# 여러 어시스턴트를 하나의 브리지에 연결하기

단일 브리지를 여러 fabric에 연결할 수 있지만, 동일한 QR 코드는 두 번 사용할 수 없다는 점에 유의하세요.
이 과정은 제공된 QR 코드를 사용하여 첫 번째 컨트롤러로 브리지를 커미셔닝하는 것으로 시작합니다.
그런 다음 첫 번째 컨트롤러를 사용하여 브리지를 추가 컨트롤러에 연결할 수 있습니다.

첫 번째 컨트롤러(예: Apple Home)를 성공적으로 연결한 후 앱에서 허브 장치를 찾으세요. Alexa에서는 독립
장치로 표시되며, Apple Home에서는 홈 설정 내에 중첩되어 나타납니다. 장치 설정에서 페어링 모드를
활성화하여 수동 페어링 코드를 생성합니다. 그런 다음 이 코드를 사용하여 브리지를 후속 컨트롤러에 연결할 수
있습니다.

---

## 예시: Apple Home와 페어링하고 Alexa에 추가하기

1. **Apple Home에서 "더보기" 설정 접근**
   Apple Home 앱을 열고 홈 화면 오른쪽 상단의 "더보기" 버튼을 탭합니다:

   ![Apple Home의 더보기 설정 메뉴](/img/ConnectMultipleFabrics/multiple-fabrics-01-apple-home-more.png)

2. **허브 및 브리지 찾기**
   연결된 모든 브리지를 보려면 "홈 허브 및 브리지"로 이동합니다:

   ![Apple Home의 홈 허브 및 브리지](/img/ConnectMultipleFabrics/multiple-fabrics-02-apple-home-settings.png)

3. **브리지 선택**
   허브 목록에서 Matter 허브를 선택합니다:

   ![Apple Home의 허브 및 브리지 목록](/img/ConnectMultipleFabrics/multiple-fabrics-03-apple-home-connected-hubs.png)

4. **페어링 모드 활성화**
   허브 세부 정보의 맨 아래로 스크롤하여 "페어링 모드 켜기"를 선택합니다:

   ![Apple Home의 페어링 모드 켜기](/img/ConnectMultipleFabrics/multiple-fabrics-04-apple-home-bridge-details.png)

5. **페어링 코드 확인**
   수동 페어링 코드가 표시됩니다. 나중에 사용하기 위해 이 코드를 메모해 두세요:

   ![Apple Home의 수동 페어링 코드](/img/ConnectMultipleFabrics/multiple-fabrics-05-apple-home-pairing-code.png)

6. **Alexa에 장치 추가**
   Alexa 앱을 열고 "장치 추가"를 선택합니다:

   ![Alexa에서 새 장치 추가](/img/ConnectMultipleFabrics/multiple-fabrics-06-alexa-add-device.png)

7. **장치 유형 선택**
   장치 유형으로 "Matter"를 선택합니다:

   ![Alexa에서 Matter 장치 선택](/img/ConnectMultipleFabrics/multiple-fabrics-07-alexa-new-matter-device.png)

8. **페어링 방식 선택**
   메시지가 표시되면 QR 코드 스캔 대신 "숫자 코드 입력"을 선택합니다:

   ![Alexa에서 숫자 코드 선택](/img/ConnectMultipleFabrics/multiple-fabrics-08-alexa-try-numeric-code.png)

9. **페어링 코드 입력**
   Apple Home에서 확인한 수동 페어링 코드를 입력합니다:

   ![Alexa에서 숫자 코드 입력](/img/ConnectMultipleFabrics/multiple-fabrics-09-alexa-enter-numeric-code.png)

10. **연결 완료**
    Alexa가 브리지와의 연결을 확립하도록 허용합니다:

    ![Alexa의 연결 화면](/img/ConnectMultipleFabrics/multiple-fabrics-10-alexa-connecting.png)
