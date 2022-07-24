# CJ-Server-DB-Docker

## Quick Start
- [Docker Homepage](https://www.docker.com/)에서 Docker Desktop 설치
- `git clone https://github.com/Elegant-siblings/CJ-Server-DB-Docker/`으로 Docker 파일 저장
- `cd CJ-Server-DB-Docker`로 working directory 변경
- `docker-compose up -d --build` 명령어 실행
  - 이후에는 `docker-compose up -d` 까지만 실행 해도됨
  - 계속 `--build` 하는 경우에는 더미 image가 추가로 생성되어서 용량이 부족해 질 수 있음
- 최초 실행시 시간 소요 가능 이후부터 1분 이내에 완료
- 완료 시 인터넷 주소창에 `localhost:3000/` 입력 시 API 수신 확인
