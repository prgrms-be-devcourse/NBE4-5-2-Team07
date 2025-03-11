## 로컬 MySQL 환경 설정
application.yml 파일에서 DB 설정을 할 때 필요한 url, id, pw 필드는 application-secret.yml 파일을 참조합니다.  
프로젝트에서 각자의 로컬 환경에서 MySQL을 사용하기 위해 아래 과정을 진행해 주세요.

- 로컬 환경에 맞춰 아래 내용을 가진 `application-secret.yml` 파일 생성
```
db:
  url: jdbc:mysql://localhost:"포트번호"/"데이터베이스명"?serverTimezone=UTC&useSSL=false
  username: "사용자 이름"
  password: "비밀번호"
security:
  kakao:
    client-id: 슬랙 캔버스 확인
  jwt:
    secret-key: 슬랙 캔버스 확인
openai:
  api:
    key: 슬랙 캔버스 확인
```
## 커밋 컨벤션
| 커밋 유형 | 코드 | 사용 설명 |
| --- | --- | --- |
| **feat:** | `:sparkles:` | 신기능 추가 |
| **fix:** | `:bug:` | 버그 수정 |
| **docs:** | `:books:` | 문서 업데이트 |
| **style**: | `:lipstick:` | 코드 포맷팅/코스메틱 변경 |
| **refactor**: | `:recycle:` | 코드 리팩토링 |
| **test:** | `:white_check_mark:` | 테스트 코드 추가 |
| **chore:** | `:wrench:` | 빌드/설정 변경 |

#### 좋은 예
git commit -m "feat: 사용자 프로필 편집 기능 추가"

#### 나쁜 예
git commit -m "기능 추가"  # 유형 명시 누락
