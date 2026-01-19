#!/bin/bash

echo "========================================"
echo "    ERP TEXTIL - Setup Frontend"
echo "========================================"
echo

echo "[1/3] Instalando dependencias..."
npm install
if [ $? -ne 0 ]; then
    echo "Error instalando dependencias"
    exit 1
fi

echo
echo "[2/3] Configuración completada!"
echo
echo "========================================"
echo "    INSTRUCCIONES DE USO"
echo "========================================"
echo
echo "1. Ejecuta 'npm run dev' para iniciar el servidor"
echo "2. Abre http://localhost:3000 en tu navegador"
echo "3. Usa las credenciales de demostración:"
echo
echo "   Admin: admin@textil.com / demo123"
echo "   Contabilidad: contabilidad@textil.com / demo123"
echo "   Gerencia: gerencia@textil.com / demo123"
echo "   Usuario: usuario@textil.com / demo123"
echo
echo "========================================"
echo
