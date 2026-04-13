# PicVaul - Galería de Imágenes

Galería de imágenes con sistema de usuarios, galerías y autenticación.

## Tecnologías

### Backend
- **Node.js** - Entorno de ejecución
- **Express** - Framework web
- **MongoDB** con **Mongoose** - Base de datos
- **JWT** - Autenticación con tokens
- **Zod** - Validación de esquemas
- **Multer** - Manejo de subida de archivos
- **Sharp** - Procesamiento y compresión de imágenes
- **Brevo (Sendinblue)** - Envío de correos electrónicos
- **Bcrypt** - Hash de contraseñas

### Frontend
- **React** - Librería de interfaces
- **Vite** - Bundler y servidor de desarrollo
- **React Router** - Navegación
- **CSS Variables** - Estilos (sin frameworks)

---

## Estructura del Proyecto

```
/Desktop/galeria/
├── API-Imagenes/          # Backend
│   ├── src/
│   │   ├── controllers/   # Controladores de rutas
│   │   ├── services/      # Lógica de negocio
│   │   ├── models/        # Modelos Mongoose
│   │   ├── routes/        # Definición de rutas
│   │   ├── middlewares/   # Middlewares (auth, upload, validation)
│   │   ├── schemas/       # Esquemas Zod
│   │   ├── utils/         # Utilidades
│   │   ├── libs/          # Clientes externos (Brevo, Translate)
│   │   └── config.js      # Configuración general
│   ├── uploads/           # Imágenes subidas
│   ├── seed.js            # Script para crear usuarios de prueba
│   └── package.json
│
└── frontend/              # Frontend React
    ├── src/
    │   ├── pages/         # Páginas de la aplicación
    │   ├── components/    # Componentes reutilizables
    │   ├── services/      # Llamadas a la API
    │   ├── context/       # Contextos React (Auth)
    │   └── App.jsx        # Router principal
    └── package.json
```

---

## Endpoints del Backend

### Autenticación

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| POST | `/api/login` | Iniciar sesión | No |
| POST | `/api/logout` | Cerrar sesión | No |
| POST | `/api/registro/usuario` | Registrar nuevo usuario | No |
| POST | `/api/forgot-password` | Solicitar recuperación de contraseña | No |
| POST | `/api/reset-password` | Restablecer contraseña con token | No |

### Usuarios

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/api/usuario/:nameUser` | Obtener datos del usuario | Sí |
| GET | `/api/usuario/aleatorio` | Obtener usuario aleatorio | No |
| GET | `/api/publico/usuario/:nameUser` | Perfil público de usuario | No |
| PUT | `/api/actualizar/usuario/:id` | Actualizar usuario | Sí |

### Galerías

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| POST | `/api/galeria` | Crear galería | Sí |
| PUT | `/api/actualizar/galeria/:id` | Actualizar galería | Sí |
| DELETE | `/api/eliminar/galeria/:id` | Eliminar galería | Sí |

### Imágenes

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| POST | `/api/upload/image` | Subir imagen | Sí |
| PUT | `/api/actualizar/imagen/:id` | Actualizar imagen (nombre, visibilidad) | Sí |
| DELETE | `/api/eliminar/imagen/:id` | Eliminar imagen | Sí |

---

## Modelos de Datos

### User
```javascript
{
  _id: ObjectId,
  nameUser: String,          // Único, identificador público
  email: String,             // Único
  password: String,          // Hash bcrypt
  profileImage: String,      // Ruta de imagen de perfil
  userInfo: {
    es: String,             // Descripción en español
    en: String              // Descripción en inglés
  },
  galleries: [ObjectId],     // Referencias a galerías
  images: [ObjectId],        // Referencias a imágenes
  resetTokenPassword: String,
  resetTokenExpires: Date,
  status: Boolean,           // true = activo, false = eliminado
  createdAt: Date,
  updatedAt: Date
}
```

### Gallery
```javascript
{
  _id: ObjectId,
  name: String,
  description: String,
  public: Boolean,          // Visibilidad de la galería
  user: ObjectId,           // Referencia al propietario
  images: [ObjectId],       // Referencias a imágenes
  createdAt: Date,
  updatedAt: Date
}
```

### Image
```javascript
{
  _id: ObjectId,
  name: String,
  path: String,             // Ruta del archivo
  public: Boolean,          // true = pública, false = privada
  user: ObjectId,           // Referencia al propietario
  galleries: [ObjectId],    // Referencias a galerías (puede estar vacío)
  createdAt: Date,
  updatedAt: Date
}
```

---

## Lógica de Visibilidad

### Imágenes Standalone (sin galería)
- `public: true` → Visible en perfil público y usuarios aleatorios
- `public: false` → Solo visible para el propietario

### Imágenes en Galerías
- Si la galería es `public: false` → No se muestran
- Si la galería es `public: true`:
  - `public: true` → Visible en perfil público
  - `public: false` → Solo visible para el propietario

### getRandomUser
- Retorna solo imágenes y galerías públicas
- Las imágenes en galerías se muestran dentro de su galería correspondiente
- Las imágenes standalone públicas se muestran por separado

---

## Configuración de Variables de Entorno

### Backend (`API-Imagenes/.env`)

```env
# Servidor
PORT=3000
HOST=http://localhost:3000

# MongoDB
MONGO_URI=mongodb://localhost:27017/nombre_base_datos

# JWT
JWT_SECRET=tu_secret_muy_largo_y_seguro

# Cookies
COOKIE_SECRET=cookie_secret
COOKIE_DOMAIN=localhost        # Para desarrollo
# COOKIE_DOMAIN=imageshub-api.ddns.net  # Para producción

# Imágenes
IMAGES_DIR=./uploads

# Brevo (Sendinblue)
API_KEY_BREVO=tu_api_key
EMAIL=tu@email.com

# Traducción (Google Translate via DeepL u otro)
TRANSLATE_API_KEY=tu_api_key
```

### Frontend (`frontend/.env`)

```env
VITE_API_URL=http://localhost:3000/api
```

---

## Instalación y Ejecución

### Requisitos Previos
- Node.js 18+
- MongoDB instalado y ejecutándose
- npm o yarn

### Backend

```bash
cd API-Imagenes
npm install
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Crear Usuarios de Prueba

```bash
cd API-Imagenes
node seed.js
```

Esto crea 10 usuarios de prueba con galerías e imágenes.

---

## Usuarios de Prueba (Seed)

| nameUser | Contraseña |
|----------|------------|
| artista_foto | Password123 |
| fotografo_pro | Password123 |
| naturaleza_photo | Password123 |
| urbano_visor | Password123 |
| portrait_master | Password123 |
| macro_photos | Password123 |
| viajes_explora | Password123 |
| minimal_design | Password123 |
| street_photog | Password123 |
| abstract_art | Password123 |

---

## Flujo de Autenticación

1. **Registro**: `POST /api/registro/usuario` con FormData (incluye imagen de perfil opcional)
2. **Login**: `POST /api/login` devuelve cookie HTTPOnly con token JWT
3. **Acceso autenticado**: Cookie se envía automáticamente en cada request
4. **Logout**: `POST /api/logout` elimina la cookie

### Recuperación de Contraseña
1. `POST /api/forgot-password` con email → Envía correo con link
2. Link: `/reset-password?email=...&token=...`
3. `POST /api/reset-password` con email, token y nueva contraseña

---

## API de Imágenes

### Subir Imagen
```javascript
// Frontend
const formData = new FormData();
formData.append('name', 'nombre-imagen');
formData.append('public', 'true');
formData.append('image', archivo);
formData.append('galleryId', 'id-galeria-opcional');

await fetch('/api/upload/image', {
  method: 'POST',
  credentials: 'include',
  body: formData
});
```

### Actualizar Imagen
```javascript
// Cambiar visibilidad
await fetch('/api/actualizar/imagen/id-imagen', {
  method: 'PUT',
  credentials: 'include',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name: 'nuevo-nombre', public: false })
});
```

---

## Middlewares

| Middleware | Descripción |
|------------|-------------|
| `authMiddleware` | Verifica token JWT y usuario autenticado |
| `checkUserOwnership` | Verifica que el usuario sea dueño del recurso |
| `uploadImage` | Procesa upload de Multer |
| `processImage` | Comprime y optimiza imágenes con Sharp |
| `validateSchema` | Valida body con Zod |
| `convertHeicHeif` | Convierte HEIC/HEIF a JPEG |

---

## Estados de Respuesta

| Código | Significado |
|--------|-------------|
| 200 | Éxito |
| 201 | Creado |
| 204 | Sin contenido |
| 400 | Error de validación/solicitud |
| 401 | No autenticado |
| 403 | Sin permisos |
| 404 | No encontrado |
| 500 | Error interno |

### Formato de Respuesta
```javascript
{
  status: 'success',
  data: { ... },        // Datos de la respuesta
  message: '...'        // Mensaje descriptivo
}
```

### Formato de Error
```javascript
{
  error: 'Mensaje de error'
}
```

---

## Próximos Pasos / Mejoras Pendientes

- [ ] Corregir checkbox de visibilidad de imágenes en Dashboard
- [ ] Implementar paginación en listados
- [ ] Agregar búsqueda de usuarios
- [ ] Implementar likes/favoritos en imágenes
- [ ] Agregar comentarios en imágenes
- [ ] Optimizar carga de imágenes con lazy loading
- [ ] Implementar rate limiting
- [ ] Agregar tests unitarios y de integración
