# 🚨 OWASP API1:2023 - Autorización Rota a Nivel de Objeto (BOLA) 
## Guía de Demostración de Vulnerabilidad

> **Presentador:** Fernando  
> **Tema:** Seguridad de APIs - Vulnerabilidad BOLA y Mitigación  
> **Audiencia:** Presentación en Clase  

---

## 🎯 **Resumen de la Demo**

Esta demostración muestra:
1. **Versión Vulnerable** - Cómo funcionan los ataques BOLA en la práctica
2. **Versión Segura** - Cómo la autorización adecuada previene el ataque
3. **Impacto Real** - Por qué esta vulnerabilidad es crítica

---

## 📋 **Prerrequisitos y Configuración**

### Antes de Iniciar la Demo:
```bash
# Asegurar que Docker esté ejecutándose
sudo docker compose down
sudo docker compose up -d

# Verificar que los servicios estén corriendo
sudo docker compose ps
```

### Entorno de Demo:
- **URL Base API:** `http://localhost:3000`
- **Base de Datos:** SQL Server (ToDoDB)
- **Herramientas:** curl, Docker, Git
- **Dos Ramas:** `main` (segura) vs `demo-vulnerable-bola` (vulnerable)

---

## 🔴 **PARTE 1: DEMOSTRACIÓN DE LA VULNERABILIDAD**

### Paso 1: Cambiar a la Rama Vulnerable
```bash
git checkout demo-vulnerable-bola
```

### Paso 2: Desplegar Versión Vulnerable
```bash
# Instalar procedimientos almacenados vulnerables
sudo docker cp database-scripts/SP_Completar_Tarea_Vulnerable.sql todo-sqlserver:/tmp/
sudo docker cp database-scripts/SP_Borrar_Tarea_Vulnerable.sql todo-sqlserver:/tmp/

sudo docker exec -it todo-sqlserver /opt/mssql-tools18/bin/sqlcmd -C -S localhost -U sa -P 'TodoApp2024!' -i /tmp/SP_Completar_Tarea_Vulnerable.sql

sudo docker exec -it todo-sqlserver /opt/mssql-tools18/bin/sqlcmd -C -S localhost -U sa -P 'TodoApp2024!' -i /tmp/SP_Borrar_Tarea_Vulnerable.sql

# Reiniciar API con código vulnerable
sudo docker compose restart api
```

### Paso 3: Crear Usuarios y Tareas de Prueba

#### Crear Usuario 1 (Alice):
```bash
curl -X POST http://localhost:3000/api/usuarios \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Alice",
    "correo": "alice@demo.com",
    "password": "Password123!"
  }'
```

#### Crear Usuario 2 (Bob):
```bash
curl -X POST http://localhost:3000/api/usuarios \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Bob", 
    "correo": "bob@demo.com",
    "password": "Password123!"
  }'
```

#### Iniciar Sesión como Alice:
```bash
ALICE_TOKEN=$(curl -X POST http://localhost:3000/api/usuarios/login \
  -H "Content-Type: application/json" \
  -d '{"correo": "alice@demo.com", "password": "Password123!"}' \
  | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

echo "Token de Alice: $ALICE_TOKEN"
```

#### Iniciar Sesión como Bob:
```bash
BOB_TOKEN=$(curl -X POST http://localhost:3000/api/usuarios/login \
  -H "Content-Type: application/json" \
  -d '{"correo": "bob@demo.com", "password": "Password123!"}' \
  | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

echo "Token de Bob: $BOB_TOKEN"
```

### Paso 4: Crear Tareas para Cada Usuario

#### Alice crea su tarea:
```bash
curl -X POST http://localhost:3000/api/tareas \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ALICE_TOKEN" \
  -d '{
    "titulo": "Alice: Completar Reporte del Proyecto",
    "descripcion": "Terminar el análisis trimestral del proyecto"
  }'
```

#### Bob crea su tarea:
```bash
curl -X POST http://localhost:3000/api/tareas \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $BOB_TOKEN" \
  -d '{
    "titulo": "Bob: Revisar Políticas de Seguridad", 
    "descripcion": "Revisar y actualizar las políticas de seguridad de la empresa"
  }'
```

### Paso 5: Ver Tareas para Obtener los IDs

#### Alice ve sus tareas:
```bash
curl -X GET http://localhost:3000/api/tareas \
  -H "Authorization: Bearer $ALICE_TOKEN" \
  | jq '.'
```

#### Bob ve sus tareas:
```bash
curl -X GET http://localhost:3000/api/tareas \
  -H "Authorization: Bearer $BOB_TOKEN" \
  | jq '.'
```

> **📝 ¡Anota los IDs de las tareas!** Los necesitarás para el ataque.

### Paso 6: 🚨 ¡DEMOSTRAR EL ATAQUE BOLA!

#### Escenario de Ataque: Bob intenta completar la tarea de Alice

```bash
# Bob intenta completar la tarea de Alice (ID de Tarea 1)
curl -X PUT http://localhost:3000/api/tareas/1/completar \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $BOB_TOKEN" \
  -d '{
    "comentario": "¡HACKEADO! Bob completó la tarea de Alice - ¡vulnerabilidad BOLA!"
  }'
```

**⚠️ Resultado Esperado (Vulnerable):** `{"mensaje":"Tarea completada exitosamente"}`

#### Escenario de Ataque: Bob intenta eliminar la tarea de Alice

```bash
# Bob intenta eliminar la tarea restante de Alice (ID de Tarea X)
curl -X DELETE http://localhost:3000/api/tareas/2/borrar \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $BOB_TOKEN" \
  -d '{
    "comentario": "¡HACKEADO! Bob eliminó la tarea de Alice - ¡vulnerabilidad BOLA!"
  }'
```

**⚠️ Resultado Esperado (Vulnerable):** `{"mensaje":"Tarea borrada exitosamente"}`

### Paso 7: Verificar que el Ataque Funcionó

```bash
# Alice revisa sus tareas - ¡deberían estar modificadas por Bob!
curl -X GET "http://localhost:3000/api/tareas?filter=all_including_deleted" \
  -H "Authorization: Bearer $ALICE_TOKEN" \
  | jq '.'
```

**🎯 Punto de Demo:** ¡Las tareas de Alice fueron modificadas por Bob! Esta es la vulnerabilidad BOLA en acción.

---

## 🟢 **PARTE 2: IMPLEMENTACIÓN SEGURA**

### Paso 8: Cambiar a la Rama Segura
```bash
git checkout main
```

### Paso 9: Desplegar Versión Segura
```bash
# Reiniciar API con código seguro
sudo docker compose restart api

# Los procedimientos almacenados seguros ya están desplegados
```

### Paso 10: Probar con el Mismo Ataque (Debería Fallar)

#### Intentar el mismo ataque - Bob completando la tarea de Alice:
```bash
curl -X PUT http://localhost:3000/api/tareas/1/completar \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $BOB_TOKEN" \
  -d '{
    "comentario": "¡Este ataque debería fallar ahora!"
  }'
```

**✅ Resultado Esperado (Seguro):** `{"error":"Tarea no encontrada o no pertenece al usuario"}`

#### Intentar ataque de eliminación:
```bash
curl -X DELETE http://localhost:3000/api/tareas/2/borrar \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $BOB_TOKEN" \
  -d '{
    "comentario": "¡Este ataque también debería fallar!"
  }'
```

**✅ Resultado Esperado (Seguro):** `{"error":"Tarea no encontrada o no pertenece al usuario"}`

---

## 📊 **PUNTOS CLAVE PARA DISCUTIR EN CLASE**

### ¿Qué es BOLA?
- **Definición:** Cuando las APIs fallan en validar que los usuarios solo pueden acceder a sus propios recursos
- **Ranking OWASP:** Riesgo de Seguridad API #1 en 2023
- **Nombres Alternativos:** IDOR (Referencia Directa a Objeto Insegura)

### La Vulnerabilidad en el Código

#### **Código Vulnerable:**
```javascript
// ❌ VULNERABLE: Sin validación de usuario
const { id } = req.params;
// Falta: const { usuario } = req;

await pool.request()
    .input("tareaId", sql.INT, parseInt(id))
    // Falta: .input("usuarioId", sql.INT, usuario.id)
    .execute("SP_Completar_Tarea_Vulnerable");
```

#### **Código Seguro:**
```javascript
// ✅ SEGURO: Validación adecuada de usuario
const { id } = req.params;
const { usuario } = req;        // Extraer usuario autenticado

await pool.request()
    .input("tareaId", sql.INT, parseInt(id))
    .input("usuarioId", sql.INT, usuario.id)  // Validar propiedad
    .execute("SP_Completar_Tarea");
```

### Protección a Nivel de Base de Datos

#### **SQL Vulnerable:**
```sql
-- ❌ VULNERABLE: Sin verificación de propiedad
UPDATE Gestion.Tarea 
SET completada = 1
WHERE id = @tareaId;  -- ¡Cualquier usuario puede modificar cualquier tarea!
```

#### **SQL Seguro:**
```sql
-- ✅ SEGURO: Validación de propiedad
UPDATE Gestion.Tarea 
SET completada = 1
WHERE id = @tareaId 
AND usuarioId = @usuarioId;  -- Solo el propietario puede modificar
```

### Impacto en el Mundo Real
- **Violaciones de Datos:** Usuarios accediendo a información sensible de otros
- **Manipulación de Datos:** Modificación no autorizada de recursos
- **Violaciones de Privacidad:** Exposición de datos personales
- **Elusión de Lógica de Negocio:** Eludir flujos de trabajo de la aplicación

---

## 🔧 **ESTRATEGIAS DE PREVENCIÓN BOLA**

### 1. **Implementar Autorización Adecuada**
- Siempre validar la propiedad del recurso
- Usar el contexto del usuario autenticado en cada solicitud
- Nunca confiar en identificadores de recursos proporcionados por el cliente

### 2. **Seguridad a Nivel de Base de Datos**
- Incluir validación de usuario/propietario en todas las consultas
- Usar procedimientos almacenados parametrizados
- Implementar seguridad a nivel de fila donde sea posible

### 3. **Defensa en Profundidad**
```
🛡️ Capa 1: Autenticación (¿Quién eres?)
🛡️ Capa 2: Autorización (¿Qué puedes acceder?)  
🛡️ Capa 3: Validación de Recursos (¿Eres propietario de esto?)
🛡️ Capa 4: Restricciones de Base de Datos (Hacer cumplir a nivel de BD)
```

### 4. **Pruebas y Validación**
- Probar con múltiples cuentas de usuario
- Escaneo automatizado de seguridad
- Pruebas manuales de penetración
- Revisiones de código enfocadas en autorización

---

## 🎓 **LIMPIEZA DE LA DEMO**

```bash
# Regresar a la rama principal
git checkout main

# Reiniciar datos de demo si es necesario
sudo docker compose down
sudo docker compose up -d

echo "¡Demo completada exitosamente!"
```

---

## 💡 **ESCENARIOS DE ATAQUE ADICIONALES** (Contenido Bonus)

### Ataque de Enumeración de ID:
```bash
# El atacante prueba IDs secuenciales
for i in {1..10}; do
  curl -X PUT http://localhost:3000/api/tareas/$i/completar \
    -H "Authorization: Bearer $BOB_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"comentario":"Ataque de enumeración"}' 2>/dev/null | grep "exitosamente" && echo "Tarea $i vulnerable"
done
```

### Extracción Masiva de Datos:
```bash
# Si los endpoints GET también fueran vulnerables (no en esta demo)
for i in {1..100}; do
  curl -X GET http://localhost:3000/api/tareas/$i \
    -H "Authorization: Bearer $BOB_TOKEN" 2>/dev/null | jq '.titulo' 2>/dev/null
done
```

---

## ✅ **LISTA DE VERIFICACIÓN DE LA DEMO**

- [ ] Rama vulnerable desplegada
- [ ] Usuarios de prueba creados (Alice y Bob)
- [ ] Tareas creadas para ambos usuarios
- [ ] Ataque BOLA demostrado exitosamente
- [ ] Cambiado a rama segura
- [ ] Ataque bloqueado en versión segura
- [ ] Detalles técnicos explicados
- [ ] Estrategias de prevención discutidas
- [ ] Preguntas de la audiencia respondidas

---

**🎯 Mensaje Clave:** BOLA es la vulnerabilidad de seguridad API #1, pero es completamente prevenible con verificaciones de autorización adecuadas en cada capa de tu aplicación.
