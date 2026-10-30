@echo off
chcp 65001 >nul
title Lotofacil Inteligente - Build APK Local

echo.
echo ============================================================
echo  LOTOFACIL INTELIGENTE - Build APK Local (Windows)
echo ============================================================
echo.

:: Verifica Node.js
echo [1/6] Verificando Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo ERRO: Node.js nao encontrado. Instale em https://nodejs.org
    pause
    exit /b 1
)
for /f "delims=" %%a in ('node --version') do set NODE_VERSION=%%a
echo OK: Node.js %NODE_VERSION%

:: Verifica npm
npm --version >nul 2>&1
if errorlevel 1 (
    echo ERRO: npm nao encontrado
    pause
    exit /b 1
)

:: Verifica Android SDK
echo.
echo [2/6] Verificando Android SDK...
if "%ANDROID_HOME%"=="" (
    echo AVISO: ANDROID_HOME nao configurado.
    echo Tentando localizacao padrao: %LOCALAPPDATA%\Android\Sdk
    set ANDROID_HOME=%LOCALAPPDATA%\Android\Sdk
)
if not exist "%ANDROID_HOME%\platform-tools\adb.exe" (
    echo ERRO: Android SDK nao encontrado em %ANDROID_HOME%
    echo.
    echo INSTALE O ANDROID STUDIO:
    echo 1. Baixe: https://developer.android.com/studio
    echo 2. Instale com opcoes padrao
    echo 3. Abra Android Studio > More Actions > SDK Manager
    echo 4. Marque: Android SDK Build-Tools, Android Emulator, Android SDK Command-line Tools
    echo 5. Execute este script novamente
    pause
    exit /b 1
)
echo OK: Android SDK em %ANDROID_HOME%

:: Adiciona ao PATH
set PATH=%PATH%;%ANDROID_HOME%\platform-tools;%ANDROID_HOME%\cmdline-tools\latest\bin

:: Entra na pasta do projeto
echo.
echo [3/6] Preparando projeto...
cd /d "%~dp0"
if not exist "package.json" (
    echo ERRO: package.json nao encontrado. Execute na pasta do projeto.
    pause
    exit /b 1
)

:: Instala dependencias
echo.
echo [4/6] Instalando dependencias (pode demorar 2-3 min)...
npm install
if errorlevel 1 (
    echo ERRO: Falha no npm install
    pause
    exit /b 1
)

:: Gera codigo nativo (prebuild)
echo.
echo [5/6] Gerando projeto Android nativo (prebuild)...
npx expo prebuild --platform android --clean
if errorlevel 1 (
    echo ERRO: Falha no prebuild
    pause
    exit /b 1
)

:: Compila APK Release
echo.
echo [6/6] Compilando APK Release (pode demorar 5-10 min)...
echo Esta etapa baixa o Gradle na primeira vez (~100MB)
cd android
.\gradlew.bat assembleRelease
if errorlevel 1 (
    echo.
    echo ERRO: Falha na compilacao
    echo Tente: .\gradlew.bat clean assembleRelease
    pause
    exit /b 1
)
cd ..

:: Copia APK para raiz do projeto
echo.
echo ============================================================
echo  BUILD CONCLUIDO COM SUCESSO!
echo ============================================================
echo.
set APK_PATH=android\app\build\outputs\apk\release\app-release.apk
if exist "%APK_PATH%" (
    copy "%APK_PATH%" "lotofacil-inteligente.apk" >nul
    echo APK gerado em: %CD%\lotofacil-inteligente.apk
    echo Tamanho:
    for %%A in ("lotofacil-inteligente.apk") do echo %%~zA bytes
    echo.
    echo PROXIMOS PASSOS:
    echo 1. Copie lotofacil-inteligente.apk para o celular (WhatsApp Web, USB, Drive)
    echo 2. No celular: abra o arquivo .apk > "Instalar"
    echo 3. Permita "Fontes desconhecidas" se solicitado
    echo 4. Abra "Lotofacil Inteligente" na gaveta de apps
) else (
    echo AVISO: APK nao encontrado no caminho esperado
    echo Verifique em: android\app\build\outputs\apk\release\
)

echo.
pause