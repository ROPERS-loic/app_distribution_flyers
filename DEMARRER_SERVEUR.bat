@echo off
echo ================================================
echo   Nougaterie Distribution - Serveur local
echo ================================================
echo.

:: Verifier si Python est installe
python --version >nul 2>&1
if %errorlevel% == 0 (
    echo Python trouve - demarrage du serveur...
    echo.
    echo L'appli va s'ouvrir sur : http://localhost:8080/admin.html
    echo Pour arreter le serveur : fermez cette fenetre
    echo.
    start "" "http://localhost:8080/admin.html"
    python -m http.server 8080
) else (
    py --version >nul 2>&1
    if %errorlevel% == 0 (
        echo Python trouve - demarrage du serveur...
        echo.
        echo L'appli va s'ouvrir sur : http://localhost:8080/admin.html
        echo Pour arreter le serveur : fermez cette fenetre
        echo.
        start "" "http://localhost:8080/admin.html"
        py -m http.server 8080
    ) else (
        echo.
        echo ERREUR : Python n'est pas installe sur ce PC.
        echo.
        echo Solution alternative :
        echo Ouvrez ce lien dans votre navigateur apres avoir
        echo installe Python depuis https://www.python.org/downloads/
        echo.
        pause
    )
)
