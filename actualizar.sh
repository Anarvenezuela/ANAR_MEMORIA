#!/bin/sh
echo "Actualizando Repositorio"
git checkout develop && git pull
echo "Descargando dependencias del lado del cliente"
cd app && bower install
echo "Descargando dependencias del lado del servidor"
cd ../anar_gameserver && npm install
echo "Corriendo servidor"
node .
