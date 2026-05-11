@echo off
echo ============================================
echo   FreelanceHub - Full Restart
echo ============================================
echo.
echo Killing any existing Node processes...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 2 /nobreak >nul
echo.
echo Cleaning corrupted Next.js cache...
if exist "frontend\.next" rmdir /s /q "frontend\.next"
echo.
echo Creating uploads directory...
if not exist "backend\uploads" mkdir "backend\uploads"
echo.
echo Starting Backend (port 5000)...
start "FreelanceHub-Backend" cmd /c "cd backend && npm run start:express"
echo.
echo Starting Frontend (port 3000)...
start "FreelanceHub-Frontend" cmd /c "cd frontend && npm run dev"
echo.
echo ============================================
echo   Servers starting in separate windows!
echo   Backend:  http://localhost:5000
echo   Frontend: http://localhost:3000
echo ============================================
echo.
pause
