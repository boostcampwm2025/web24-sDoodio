# infra/dev

개발용 Postgres(pgvector)와 pgAdmin을 로컬에서 Docker Compose를 통해 구축합니다.

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
