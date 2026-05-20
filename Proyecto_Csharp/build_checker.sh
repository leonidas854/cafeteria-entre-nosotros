#!/bin/bash
cd /home/leonidas/develoment/cafeteria-entre-nosotros/Proyecto_Csharp/Cafeteria_back
env DOTNET_CLI_HOME=/tmp dotnet build --no-restore > build_output.txt 2>&1 || true
cat build_output.txt
