-- Script SQL para actualizar el dashboard_path de gerencia
UPDATE roles 
SET dashboard_path = '/gerencia/production' 
WHERE nombre = 'gerencia';

-- Verificar el cambio
SELECT nombre, dashboard_path FROM roles WHERE nombre = 'gerencia';

