@echo off
start /MIN cmd /c "cd /d E:\resume ai parser\backend && npx tsx src/index.ts"
start /MIN cmd /c "cd /d E:\resume ai parser\resume-ai-frontend && npm run dev"
echo Started backend (port 4000) and frontend (port 3000)
