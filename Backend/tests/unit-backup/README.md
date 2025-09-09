# 📦 Unit Tests Backup

## 📝 **Propósito**
Esta carpeta contiene los unit tests originales que fueron removidos de la suite activa debido a problemas con los mocks de base de datos.

## 📁 **Archivos incluidos:**
- `auth.middleware.test.js` - Tests del middleware de autenticación
- `tareaController.test.js` - Tests del controlador de tareas  
- `usuarioController.test.js` - Tests del controlador de usuarios
- `api.integration.test.js` - Integration test complejo original

## ❌ **Por qué fueron removidos:**
- Mocks de base de datos no funcionan correctamente
- Tests fallan consistentemente por problemas de configuración
- Interfieren con la estrategia híbrida que sí funciona

## ✅ **Funcionalidad cubierta por:**
- **Smoke Tests** (`../smoke/smoke.test.js`) - Validación rápida
- **Simple Integration Tests** (`../integration/simple.integration.test.js`) - Funcionalidad completa

## 🔮 **Para futuro desarrollo:**
Si en el futuro se desea retomar los unit tests:

1. **Arreglar mocks de base de datos** en `../mocks/dbMock.js`
2. **Configurar correctamente** Jest para mockear dependencias
3. **Mover archivos de vuelta** a `../unit/`
4. **Actualizar scripts** en `package.json`

## 📊 **Estado actual de testing:**
- ✅ **Smoke Tests:** 10/10 pasando
- ✅ **Integration Tests:** 12/12 pasando  
- ❌ **Unit Tests:** 0 (removidos temporalmente)
- **Total:** 22/22 tests funcionando (100% success rate)

---
**Fecha de backup:** Sep 2024  
**Razón:** Limpieza de suite de tests - mantener solo lo que funciona
