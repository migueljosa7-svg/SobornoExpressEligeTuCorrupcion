@echo off
rem Delega en el wrapper de Gradle del proyecto Android
call "%~dp0android\gradlew.bat" -p "%~dp0android" %*
exit /b %ERRORLEVEL%
