@echo off
setlocal enabledelayedexpansion
set /A nodeCheck=0
set /A fileCheck=0
 
echo Hi welcome by this autorunner
echo The first time this installer will run some checks and if needed the installation of nodejs and download the files
echo If this is not the first time you ran the installer feel free to press enter, otherwise your bot will start within a few seconds
timeout 15
cls

:runScript
set /A readyToRun=%nodeCheck%+%fileCheck%
if %readyToRun%==2 goto :startBot
if %nodeCheck%==0 goto :checkRequirements
if %fileCheck%==0 goto :startUpCheckA

::=============
::checks
::=============

:startUpCheckA
if EXIST wos-voicechat-counter/ (
	set fileCheck=1
	cd ./wos-voicechat-counter
	goto :runScript
		) else (
		goto :firstRun
		)

REM if EXIST index.js (
    REM set fileCheck=1
	REM goto :runScript
		REM ) else (
		REM goto :firstRun
	REM )

:checkRequirements
node --version 22>NUL
if errorlevel 1 (
    goto :freshInstall
) else (
    set nodeCheck=1
    goto :runScript
)

::=============
::helpers
::=============

:firstRun
winget install -e --id Git.Git
git clone https://github.com/Bj0rD/wos-voicechat-counter.git
cd ./wos-voicechat-counter
set fileCheck=1


:freshInstall
winget install -e --id OpenJS.NodeJS.LTS
set nodeCheck=1
:: refresh PATH so npm is available immediately
set "PATH=%ProgramFiles%\nodejs;%PATH%"
goto :runScript

::=============
::runners
::=============
:startBot
cd ./wos-voicechat-counter
npm start
pause

:runInstall

call npm install >npm_full.log 2>npm_errors.log
if errorlevel 1 (
    echo npm install failed, see npm_errors.log for more info.
) else (
    echo npm install succeeded.
)

cls 

echo Your bot has now been installed. Please modify config.json manually.
echo Rerun the autorun after editing config.json, press enter to close this window.
pause
exit