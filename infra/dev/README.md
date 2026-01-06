# infra/dev

개발용 Postgres(pgvector)와 pgAdmin을 로컬에서 Docker Compose를 통해 구축합니다.

## 준비

``` zsh
chmod 600 infra/dev/.pgpass
```

`servers.json`과 `.pgpass`는 pgAdmin 컨테이너에 마운트되어 서버가 자동 등록되고 비밀번호 입력 없이 연결됩니다.

## 실행 (infra/dev 위치)

``` zsh
# 프로젝트 루트 경로
docker compose -f infra/dev/docker-compose.yml up -d

# infra/dev 경로
docker compose up -d
```

## 종료

``` zsh
docker compose down
```

## 접속

- Postgres: `localhost:5432` (DB: `doowelldevdb`, User: `devuser`, Password: `devpass`)
- pgAdmin: `http://localhost:8080` (Email: `admin@example.com`, Password: `adminpass`)
