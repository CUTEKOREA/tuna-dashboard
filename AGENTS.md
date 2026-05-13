<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Deployment Protocol
- 모든 수정 사항은 먼저 로컬 서버(`npm run dev`) 환경에만 우선 반영합니다.
- 임의로 프로덕션/라이브 채널에 배포하지 않습니다.
- 여러 수정 사항을 로컬에서 확인한 후, 사용자의 "배포", "라이브 배포" 등 명시적인 요청이 있을 때만 수정 사항을 모아서 Vercel 등의 라이브 채널에 반영합니다.
