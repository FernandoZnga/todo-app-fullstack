# Modo Desarrollo vs Producción

Este proyecto incluye una funcionalidad que permite mostrar la URL de confirmación de cuenta directamente en el frontend durante el desarrollo, evitando la necesidad de configurar un servidor de email.

## 🔧 Configuración

### Modo Desarrollo (`DEVELOPMENT=true`)
En modo desarrollo:
- **Backend**: Retorna la URL de confirmación en la respuesta del registro
- **Frontend**: Muestra una página especial con la URL de confirmación después del registro
- **Comportamiento**: El usuario ve la URL y puede hacer clic para confirmar su cuenta inmediatamente

### Modo Producción (`DEVELOPMENT=false`)
En modo producción:
- **Backend**: Solo retorna el mensaje de éxito estándar (sin URL)
- **Frontend**: Muestra el mensaje tradicional y redirige al login
- **Comportamiento**: El flujo normal donde se esperaría un email de confirmación

## 🚀 Cómo Cambiar de Modo

### Para Docker (Recomendado)

1. **Editar `docker-compose.yml`**:
   ```yaml
   # Para API
   api:
     environment:
       - DEVELOPMENT=true    # Cambiar a false para producción

   # Para Frontend  
   frontend:
     environment:
       - VITE_DEVELOPMENT=true  # Cambiar a false para producción
   ```

2. **Reiniciar servicios**:
   ```bash
   sudo docker compose restart api frontend
   # O para cambios completos:
   sudo docker compose down && sudo docker compose up -d
   ```

### Para Desarrollo Manual

1. **Backend** (`.env`):
   ```env
   DEVELOPMENT=true   # o false
   ```

2. **Frontend** (`Frontend/.env`):
   ```env
   VITE_DEVELOPMENT=true   # o false
   ```

3. **Reiniciar los servidores**:
   ```bash
   # Backend
   cd Backend && npm run dev

   # Frontend 
   cd Frontend && npm run dev
   ```

## 📝 Ejemplo de Respuestas

### Modo Desarrollo
```json
{
  "mensaje": "Usuario Creado correctamente",
  "confirmacionUrl": "http://localhost:4000/confirm-account/token123"
}
```

### Modo Producción
```json
{
  "mensaje": "Usuario Creado correctamente"
}
```

## 💡 Casos de Uso

- **Desarrollo/Testing**: `DEVELOPMENT=true` para pruebas rápidas
- **Staging/QA**: `DEVELOPMENT=true` para facilitar testing
- **Producción**: `DEVELOPMENT=false` para comportamiento estándar
- **Demo**: `DEVELOPMENT=true` para mostrar funcionalidades sin email

## ⚠️ Importante

- En producción **siempre** usar `DEVELOPMENT=false`
- La URL de confirmación solo se muestra cuando ambas variables (backend y frontend) están en `true`
- Los cambios requieren reinicio de los servicios para tomar efecto
