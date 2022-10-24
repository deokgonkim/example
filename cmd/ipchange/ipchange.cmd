@setlocal enableextensions enabledelayedexpansion
@echo off
@rem change below configurable parameters.
set INTERFACE="eth0"
set DHCPKEY=DHCP
set IPADDRESSKEY=IPADDRESS
set NETMASKKEY=NETMASK
set GATEWAYKEY=GATEWAY
set PRIDNSKEY=PRIDNS
set SECDNSKEY=SECDNS

set IPADDRESS=
set NETMASK=
set GATEWAY=
set DHCP=
rem set PRIDNS=168.126.63.1
rem set SECDNS=168.126.63.2
rem set PRIDNS=208.67.222.222
rem set SECDNS=208.67.220.220
set PRIDNS=8.8.8.8
set SECDNS=8.8.4.4

set currarea=
set i=0
for /f "delims=" %%a in ('cat IPConfig.txt') do (
    set ln=%%a
    if "x!ln:~0,1!"=="x[" (
        set /a i=!i!+1
        set currarea=!ln!
        echo !i!. !currarea!
    )
)

set /a i=0

set /p choose=Choose profile : 

for /f "delims=" %%a in ('cat IPConfig.txt') do (
    set ln=%%a
    if "x!ln:~0,1!"=="x[" (
        set /a i=!i!+1
    ) else (
        for /f "tokens=1,2 delims==" %%b in ("!ln!") do (
            set currkey=%%b
            set currval=%%c
            if "x!choose!"=="x!i!" (
                if "x!currkey!"=="x!DHCPKEY!" (
                    set DHCP=!currval!
                )
                if "x!currkey!"=="x!IPADDRESSKEY!" (
                    set IPADDRESS=!currval!
                )
                if "x!currkey!"=="x!NETMASKKEY!" (
                    set NETMASK=!currval!
                )
                if "x!currkey!"=="x!GATEWAYKEY!" (
                    set GATEWAY=!currval!
                )
                if "x!currkey!"=="x!PRIDNSKEY!" (
                    set PRIDNS=!currval!
                )
                if "x!currkey!"=="x!SECDNSKEY!" (
                    set SECDNS=!currval!
                )
            )
        )
    )
)

if "x!DHCP!"=="x" ( 
    netsh ^
    interface ip ^
    set address ^
    name=%INTERFACE% ^
    source=static ^
    addr=%IPADDRESS% ^
    mask=%NETMASK% ^
    gateway=%GATEWAY% ^
    gwmetric=0
) else (
    netsh ^
    interface ip ^
    set address ^
    name=%INTERFACE% ^
    source=dhcp
)

netsh ^
interface ip ^
set dns name=%INTERFACE% ^
source=static ^
addr=%PRIDNS% ^
register=NONE

netsh ^
interface ip ^
add dns ^
name=%INTERFACE% ^
addr=%SECDNS% ^
index=2

netsh interface ip show config name=%INTERFACE%

pause

endlocal

