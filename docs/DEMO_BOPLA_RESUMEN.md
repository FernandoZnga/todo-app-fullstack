# 🚨 OWASP API3:2023 - Broken Object Property Level Authorization (BOPLA)
## Resumen Ejecutivo de Demostración

---

## 🎯 **¿Qué es BOPLA?**

**Broken Object Property Level Authorization** (API3:2023) ocurre cuando las APIs:
- **Exponen propiedades sensibles** que los usuarios no deberían ver
- **Permiten modificar campos** que deberían ser solo-lectura
- **No controlan el acceso granular** a nivel de propiedad individual

### **Diferencia Clave con BOLA:**
- **BOLA (API1):** "¿Puede el usuario acceder a ESTE objeto?"
- **BOPLA (API3):** "¿Puede el usuario ver/modificar ESTA propiedad del objeto?"

---

## 🔴 **Vulnerabilidades Demostradas**

### 1. **🚨 Excessive Data Exposure**
- Perfil de usuario expone contraseña hasheada, tokens secretos
- Respuestas incluyen metadatos internos del sistema
- **Impacto:** Información sensible disponible para reconocimiento

### 2. **🚨 Mass Assignment en Usuario**
- Modificar `verificado`, `is_admin`, `role_level` via API
- Usuario normal se convierte en administrador
- **Impacto:** Escalación completa de privilegios

### 3. **🚨 System Information Disclosure**
- Estadísticas de base de datos expuestas
- Configuración del servidor visible
- **Impacto:** Información crítica para ataques dirigidos

### 4. **🚨 Database Schema Exposure**
- Estructura completa de tablas revelada
- Queries SQL utilizadas expuestas
- **Impacto:** Mapa completo del sistema interno

### 5. **🚨 Mass Assignment en Recursos**
- Cambiar `usuarioId` de tareas (cambio de propietario)
- Manipular fechas de creación y metadatos
- **Impacto:** Manipulación de datos e historial

### 6. **🚨 Administrative Property Assignment**
- Crear recursos con propiedades pre-establecidas
- Saltarse validaciones de lógica de negocio
- **Impacto:** Bypass de reglas operativas

---

## 📊 **Comandos de Demostración Rápida**

### Branch Vulnerable:
```bash
git checkout demo-vulnerable-bopla
sudo docker compose restart api
```

### Ataques Principales:
```bash
# 1. Excessive Data Exposure
curl -X GET http://localhost:3000/api/usuarios/perfil \
  -H "Authorization: Bearer $TOKEN" | jq '.'

# 2. Mass Assignment en Usuario
curl -X PUT http://localhost:3000/api/usuarios/actualizar-perfil \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"verificado": true, "is_admin": true}'

# 3. System Information Exposure
curl -X GET http://localhost:3000/api/usuarios/info-sistema | jq '.'

# 4. Mass Assignment en Tareas
curl -X PUT http://localhost:3000/api/tareas/1/actualizar-masivo \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"usuarioId": 999, "fechaCreacion": "2020-01-01T00:00:00Z"}'
```

### Verificación de Mitigación:
```bash
git checkout main
sudo docker compose restart api
# Repetir ataques - todos deberían fallar con 404
```

---

## 🛡️ **Comparación con Otras Vulnerabilidades OWASP**

| **Vulnerabilidad** | **Scope** | **Control** | **Ejemplo** |
|--------------------|-----------|-------------|-------------|
| **BOLA (API1)** | Objeto completo | Acceso al recurso | User A accede a perfil de User B |
| **Broken Auth (API2)** | Autenticación | Proceso de login | Bypass de autenticación |
| **BOPLA (API3)** | Propiedades individuales | Campos específicos | User A ve contraseña hash en su perfil |

---

## ⚡ **¿Por qué BOPLA es Crítico?**

### **Escalación Gradual:**
1. **Reconocimiento** → Obtener información interna
2. **Escalación** → Modificar roles y permisos
3. **Persistencia** → Manipular timestamps y auditoría
4. **Expansión** → Acceso a otros sistemas con información obtenida

### **Impacto Compuesto:**
- **Una propiedad expuesta** lleva a **múltiples compromisos**
- **Información aparentemente "inofensiva"** revela **arquitectura crítica**
- **Modificaciones "menores"** resultan en **bypass completo de seguridad**

---

## 🔧 **Mitigaciones Clave**

### ✅ **Control Granular de Propiedades:**
```javascript
// Definir claramente qué puede ver cada rol
const USER_VISIBLE_FIELDS = ['id', 'nombre', 'correo'];
const ADMIN_VISIBLE_FIELDS = [...USER_VISIBLE_FIELDS, 'fechaCreacion', 'verificado'];
const USER_MODIFIABLE_FIELDS = ['nombre'];
```

### ✅ **Serialización Segura:**
```javascript
// DTOs específicos por contexto
class UserPublicProfile {
  constructor(user) {
    this.id = user.id;
    this.nombre = user.nombre;
    // ¡Solo campos seguros!
  }
}
```

### ✅ **Validación de Mass Assignment:**
```javascript
// Lista blanca estricta
const allowedFields = ['nombre', 'correo']; // Solo campos seguros
const updateData = _.pick(req.body, allowedFields);
```

### ✅ **Principio de Menor Privilegio:**
- **Exponer** → Solo lo necesario para la funcionalidad
- **Modificar** → Solo campos apropiados para el rol
- **Auditar** → Todos los accesos a propiedades sensibles

---

## 📈 **Estadísticas Alarmantes**

- **78%** de APIs exponen más propiedades de las necesarias
- **56%** permiten mass assignment sin validación
- **34%** revelan información del sistema en respuestas de error
- **$3.2M** costo promedio por brecha de datos via BOPLA

---

## 🎓 **Para la Presentación**

### **Puntos Clave a Enfatizar:**
1. **BOPLA es granular** - Control a nivel de campo individual
2. **Escalación sutil** - Pequeñas exposiciones → grandes problemas  
3. **Información = Poder** - Cada campo expuesto ayuda al atacante
4. **Defense in Depth** - Múltiples capas de validación necesarias

### **Demostración Impactante:**
- Mostrar escalación de privilegios en 2 comandos
- Contrastar respuesta vulnerable vs. segura lado a lado
- Enfatizar que "solo datos" pueden comprometer todo el sistema

### **Mensaje Final:**
- No es solo sobre **acceso a objetos**
- Es sobre **control granular de propiedades** 
- **Cada campo importa** en la seguridad de APIs

---

## 🔍 **Detección de BOPLA**

### **Red Flags en APIs:**
- Respuestas con muchos campos "extras"
- Endpoints que aceptan JSON arbitrario
- Información de debugging en producción
- Mismos campos visibles para todos los roles

### **Testing Quick Check:**
```bash
# ¿Expone campos sensibles?
curl /api/profile | jq 'keys' | grep -E '(password|hash|token|secret|internal)'

# ¿Permite mass assignment?
curl -X PUT /api/profile -d '{"role":"admin","verified":true}' | grep -i "success"

# ¿Revela información del sistema?
curl /api/debug | jq '.server_info, .database_config, .internal_queries'
```

---

## 🚀 **Quick Start para Defenders**

### **Audit Checklist:**
- [ ] ¿Qué campos devuelve cada endpoint?
- [ ] ¿Son todos necesarios para el frontend?
- [ ] ¿Qué puede modificar cada rol de usuario?
- [ ] ¿Existen endpoints de debug/info en producción?
- [ ] ¿Se validan individualmente los campos en updates?

### **Implementación Inmediata:**
1. **Auditoria de Respuestas** - Revisar todos los JSON de salida
2. **Lista Blanca de Campos** - Definir explícitamente qué se puede ver/modificar
3. **DTOs por Contexto** - Diferentes vistas según usuario/rol
4. **Logging de Accesos** - Monitorear intentos de acceso a campos sensibles

---

**🎯 Mensaje Final:** *"En BOPLA, el diablo está en los detalles. Cada propiedad expuesta es una puerta de entrada potencial, y cada campo modificable sin validación es un riesgo de escalación. El control granular no es opcional - es fundamental."*
