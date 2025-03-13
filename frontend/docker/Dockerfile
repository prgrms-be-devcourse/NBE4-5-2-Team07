# 1단계: 빌드 단계
FROM node:18-alpine AS builder

WORKDIR /app

# package.json, package-lock.json, .env 복사
COPY package*.json ./
COPY .env ./

# 의존성 설치 (devDependencies 포함)
RUN npm install

# 소스 전체 복사 (global.d.ts 파일 포함되어 있어야 함)
COPY . .

# Next.js 빌드 실행 (ESLint 검사 건너뛰기: next.config.js에서 ignoreDuringBuilds 옵션 적용)
RUN npm run build

# 2단계: 실행 단계
FROM node:18-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# 빌드 단계에서 생성된 파일들 복사
COPY --from=builder /app/package.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

# 프로덕션 의존성만 설치
RUN npm install --only=production

EXPOSE 3000

CMD ["npm", "start"]
