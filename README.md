# 🐣 뚜웰 (DooWell)
> 전부 채우지 않아도 괜찮아, 쌓이는 것만 기억해.
<img width="700" alt="배너" src="https://github.com/user-attachments/assets/365cae8f-35a8-4b00-8942-cb12a3c22a1a" />



---

## 📌 프로젝트 소개

**뚜웰**은 행동을 시작하지 못하게 만드는 심리적 부담을 줄이고,  
아주 작은 행동이라도 **“했다”는 경험을 차곡차곡 쌓을 수 있도록 돕는** 행동 기록 서비스입니다.  
날짜 연속 체크나 목표 달성률 대신, 행동이 **누적되는 경험 자체**에 집중합니다.

---

## 🛠 기술 스택

### Frontend

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)  
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Swiper](https://img.shields.io/badge/Swiper-6332F6?style=for-the-badge&logo=swiper&logoColor=white)
![Zustand](https://img.shields.io/badge/Zustand-orange?style=for-the-badge)
![React Router](https://img.shields.io/badge/React_Router-CA4245?style=for-the-badge&logo=react-router&logoColor=white)  
![Vitest](https://img.shields.io/badge/Vitest-6E9F18?style=for-the-badge&logo=vitest&logoColor=white)
![React Testing Library](https://img.shields.io/badge/React_Testing_Library-E33332?style=for-the-badge&logo=testing-library&logoColor=white)
![Playwright](https://img.shields.io/badge/Playwright-2EAD33?style=for-the-badge&logo=playwright&logoColor=white)
![Zod](https://img.shields.io/badge/Zod-3E67B1?style=for-the-badge&logo=zod&logoColor=white)

### Backend

![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![TypeORM](https://img.shields.io/badge/TypeORM-FE0C05?style=for-the-badge&logo=typeorm&logoColor=white)
![Swagger](https://img.shields.io/badge/Swagger-85EA2D?style=for-the-badge&logo=swagger&logoColor=black)
![Zod](https://img.shields.io/badge/Zod-3E67B1?style=for-the-badge&logo=zod&logoColor=white)
![Jest](https://img.shields.io/badge/Jest-C21325?style=for-the-badge&logo=jest&logoColor=white)

### Infra

![Naver Cloud Platform](https://img.shields.io/badge/Naver_Cloud_Platform-03C75A?style=for-the-badge&logo=naver&logoColor=white)
![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white)
![GitHub Actions](https://img.shields.io/badge/github%20actions-%232671E5.svg?style=for-the-badge&logo=githubactions&logoColor=white)
![Nginx](https://img.shields.io/badge/Nginx-009639?style=for-the-badge&logo=nginx&logoColor=white)
![SonarQube](https://img.shields.io/badge/SonarQube-4E9BCD?style=for-the-badge&logo=SonarQube&logoColor=white)

### Package Manager

![pnpm](https://img.shields.io/badge/pnpm-F69220?style=for-the-badge&logo=pnpm&logoColor=white)

---

## 📂 프로젝트 구조

이 프로젝트는 **Monorepo** 구조로 구성되어 있습니다.

```txt
📦 web24-sDoodio
 ┣ 📂 apps
 ┃ ┣ 📂 backend            # NestJS 백엔드 서버
 ┃ ┃ ┣ 📂 common          # 공통 모듈 (Database, Swagger 등)
 ┃ ┃ ┗ 📂 features        # 핵심 기능 모듈 (Goal, Behavior, User)
 ┃ ┗ 📂 frontend           # React 프론트엔드 애플리케이션
 ┃ ┃ ┣ 📂 features        # 기능별 컴포넌트 (Goal, Behavior, DodoRoom)
 ┃ ┃ ┣ 📂 pages           # 페이지 컴포넌트
 ┃ ┃ ┣ 📂 stores          # Zustand 전역 상태 관리
 ┃ ┃ ┗ 📂 shared          # 공용 UI 컴포넌트 및 유틸리티
 ┣ 📂 packages
 ┃ ┗ 📂 shared             # 공용 라이브러리 (Type, Schema, Constants)
 ┗ 📄 package.json
```

---

## 🧰 Prerequisites

이 프로젝트를 실행하기 위해 다음 도구들이 먼저 필요합니다.

- **Node.js**: `v24.12.0` 이상
- **pnpm**: `v10.23.0` 이상

---

## 🚀 실행 방법

### 1. 개발 환경 설정 (DB)

로컬 개발을 위해 Docker를 사용하여 Database를 실행해야 합니다.  
자세한 내용은 [infra/dev/README.md](./infra/dev/README.md) 문서를 참고해주세요.

```bash
docker-compose -f infra/dev/docker-compose.yml up -d
```

### 2. 프로젝트 설치

```bash
pnpm install
```

### 3. 개발 서버 실행

Frontend, Backend, Shared 패키지를 동시에 실행합니다.

```bash
pnpm dev
```

각각 따로 실행하고 싶다면 아래 명령어들을 사용할 수 있습니다.

- `pnpm dev:fe` (Frontend)
- `pnpm dev:be` (Backend)
- `pnpm dev:shared` (Shared)

### 4. 기타 명령어

```bash
# 전체 빌드
pnpm build

# 린트 검사
pnpm lint

# 포맷팅
pnpm format

# 테스트 실행
pnpm test
```

---

## ⚙️ 환경 변수 설정

각 앱 폴더 내에 `.env` 파일을 생성해야 합니다.  
`.env.template` 파일을 참고하여 작성하세요.

### Frontend (`apps/frontend/.env.development.local`)

```ini
VITE_API_BASE_URL=http://localhost:3000
```

### Backend (`apps/backend/.env.development.local`)

```ini
NODE_ENV=development
PORT=3000
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=your_db_username
DB_PASS=your_db_password
DB_NAME=your_db_name
# Session
SESSION_SECRET=session secret key
SESSION_MAX_AGE_MS=session cookie max age in ms, 예: 604800000 -> 7일
# CLOVA Studio API Key
CLOVA_API_KEY=clova api
# VAPID Key
VAPID_PUBLIC_KEY=pnpm dlx web-push generate-vapid-keys
VAPID_PRIVATE_KEY=pnpm dlx web-push generate-vapid-keys
VAPID_SUBJECT=mailto:admin-example@web24.app
```
---
## 🏗️ 배포 구조

```mermaid
flowchart TD
  User["User (Browser)"]

  subgraph AppServer["App Instance"]
    Gateway["Central Nginx Gateway
    (Port 80/443)"]
    Certbot["Certbot (Auto Renewal)"]
    
    subgraph WebNetwork["Docker Shared Network"]
      subgraph StagingEnv["Staging"]
        FE_S["Frontend Staging
        (Port 8080)"]
        BE_S["Backend Staging
        (Port 3000)"]
      end

      subgraph ProductionEnv["Production"]
        FE_P["Frontend Production
        (Port 8080)"]
        BE_P["Backend Production
        (Port 3000)"]
      end
    end
    
    Gateway <-->|"Challenge"| Certbot
    Gateway ---->|"staging.doowell.n-e.kr"| StagingEnv
    Gateway ---->|"doowell.n-e.kr"| ProductionEnv
  end

  subgraph DBServer["DB Instance"]
    DB1["doowell_staging"]
    DB2["doowell_prod"]
  end

  User --"HTTPS (443)"--> Gateway
  BE_S -->|"TCP:5432"| DB1
  BE_P -->|"TCP:5432"| DB2

```

---

## 👥 팀원

> 프로젝트는 FE/BE 구분 없이 협업하여 진행했으며,  
> 포지션 표기는 각 팀원이 가장 깊이 고민하고 주도적으로 기여한 영역을 기준으로 표기했습니다.

<div align="center">
<table role="table">
<thead>
<tr>
<td align="center"><strong>J001_강내원</strong></td>
<td align="center"><strong>J039_김민우</strong></td>
<td align="center"><strong>J165_유태근</strong></td>
<td align="center"><strong>J200_이예은</strong></td>
</tr>
</thead>
<tbody>
<tr>
<th align="center"><a href="https://github.com/KangNaewon"><img src="https://avatars.githubusercontent.com/u/81740350?v=4" width="150" height="150"></a></th>
<th align="center"><a href="https://github.com/philosophy-engineer"><img src="https://avatars.githubusercontent.com/u/137793034?v=4" width="150" height="150"></a></th>
<th align="center"><a href="https://github.com/tgy1201"><img src="https://avatars.githubusercontent.com/u/154293542?v=4" width="150" height="150"></a></th>
<th align="center"><a href="https://github.com/iyeeun"><img src="https://avatars.githubusercontent.com/u/82192913?v=4" width="150" height="150"></a></th>
</tr>
<tr>
<th align="center">BE<br/>PM, 인프라</th>
<th align="center">BE<br/>DB</th>
<th align="center">FE<br/>UI/UX</th>
<th align="center">FE<br/>기획</th>
</tr>
</tbody>
</table>
</div>

---

## 📝 관련 문서 링크

- [프로젝트 기획서](https://github.com/boostcampwm2025/web24-sDoodio/wiki/%ED%94%84%EB%A1%9C%EC%A0%9D%ED%8A%B8-%EA%B8%B0%ED%9A%8D%EC%84%9C)
- [Wiki](https://github.com/boostcampwm2025/web14-B4/wiki) : 회의록 관리
- [Github Project](https://github.com/orgs/boostcampwm2025/projects/248) : 백로그 관리
- [Figma](https://www.figma.com/board/KqIFdt238rXGkAsR9u2Uiq/%E1%84%87%E1%85%AE%E1%84%89%E1%85%B3%E1%84%90%E1%85%B3%E1%84%8F%E1%85%A2%E1%86%B7%E1%84%91%E1%85%B3---%E1%84%90%E1%85%A6%E1%84%8B%E1%85%A9%E1%84%8B%E1%85%B4-%E1%84%89%E1%85%B3%E1%84%91%E1%85%B3%E1%84%85%E1%85%B5%E1%86%AB%E1%84%90%E1%85%B3-%E1%84%90%E1%85%A6%E1%86%B7%E1%84%91%E1%85%B3%E1%86%AF%E1%84%85%E1%85%B5%E1%86%BA?node-id=0-1&p=f&t=UnaLlFlbZVc2UvsU-0) : 회의 중 기록을 위한 화이트보드
