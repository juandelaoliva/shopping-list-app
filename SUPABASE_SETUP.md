# 🔒 CONFIGURACIÓN SEGURA DE SUPABASE

## ⚠️ IMPORTANTE: Configurar Variables de Entorno

Para proteger tus claves de Supabase, necesitas configurar variables de entorno:

### 📝 1. Crear archivos .env locales

**A) En la raíz del proyecto** crea `.env` con:

```env
REACT_APP_SUPABASE_URL=https://slsievdsczoiajafklay.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNsc2lldmRzY3pvaWFqYWZrbGF5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM0NTI2NzYsImV4cCI6MjA2OTAyODY3Nn0.jeJ7Pxy9Spo3e7fOAn0zuZPgGUkFMZ206NWAs-XLvu0
```

**B) En `frontend/`** crea otro `.env` con:

```env
REACT_APP_SUPABASE_URL=https://slsievdsczoiajafklay.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNsc2lldmRzY3pvaWFqYWZrbGF5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM0NTI2NzYsImV4cCI6MjA2OTAyODY3Nn0.jeJ7Pxy9Spo3e7fOAn0zuZPgGUkFMZ206NWAs-XLvu0
```

### 🌐 2. Para Vercel (Producción)

En tu dashboard de Vercel, ve a:
- **Settings** → **Environment Variables**
- Agrega:
  - `REACT_APP_SUPABASE_URL` = `https://slsievdsczoiajafklay.supabase.co`
  - `REACT_APP_SUPABASE_ANON_KEY` = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### 🧪 3. Para ejecutar tests CRUD

```bash
REACT_APP_SUPABASE_URL=tu_url REACT_APP_SUPABASE_ANON_KEY=tu_key node test-crud-fixed.js
```

### ✅ 4. El archivo .gitignore ya está configurado

Los archivos `.env*` están ignorados por Git, por lo que no se subirán al repositorio.

## 🚨 Seguridad

- ✅ Las claves han sido removidas del código
- ✅ Solo se usan variables de entorno
- ✅ `.env` está en `.gitignore`
- ✅ No se expondrán en Git 