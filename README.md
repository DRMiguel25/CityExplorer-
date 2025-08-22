# 🌍 CityExplorer

Una aplicación Angular moderna para explorar lugares turísticos, gestionar usuarios y procesar pagos de manera eficiente.

![Angular](https://img.shields.io/badge/Angular-19.0.4-red?style=for-the-badge&logo=angular)
![TypeScript](https://img.shields.io/badge/TypeScript-Latest-blue?style=for-the-badge&logo=typescript)
![Bootstrap](https://img.shields.io/badge/Bootstrap-5-purple?style=for-the-badge&logo=bootstrap)
![Stripe](https://img.shields.io/badge/Stripe-Payment-00d4aa?style=for-the-badge&logo=stripe)

## 📋 Tabla de Contenidos

- [Descripción](#-descripción)
- [Características](#-características)
- [Requisitos Previos](#-requisitos-previos)
- [Instalación](#-instalación)
- [Configuración](#-configuración)
- [Uso](#-uso)
- [Construcción](#-construcción)
- [Recursos Adicionales](#-recursos-adicionales)
- [Equipo](#-equipo)
- [Licencia](#-licencia)

## 🎯 Descripción

CityExplorer es una aplicación web desarrollada con **Angular CLI 19.0.4** que permite a los usuarios explorar destinos turísticos, gestionar perfiles de usuario y realizar transacciones de pago de forma segura. La aplicación se conecta con una API RESTful desarrollada en Laravel para proporcionar una experiencia completa.

## ✨ Características

- 🗺️ **Exploración de lugares turísticos** - Descubre destinos increíbles
- 👥 **Gestión de usuarios** - Perfiles personalizados y autenticación
- 💳 **Procesamiento de pagos** - Integración segura con Stripe
- 📱 **Diseño responsivo** - Compatible con dispositivos móviles
- 🎨 **Interfaz moderna** - Diseño intuitivo con Bootstrap
- 🔒 **Seguridad robusta** - Autenticación y validación de datos

## 📦 Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:

| Herramienta | Versión | Descripción |
|-------------|---------|-------------|
| **Node.js** | 18.x o superior | [Descargar aquí](https://nodejs.org/) |
| **npm** | Incluido con Node.js | Gestor de paquetes |
| **Angular CLI** | 19.0.4 | `npm install -g @angular/cli` |
| **VS Code** | Última versión | [Descargar aquí](https://code.visualstudio.com/) |

> ⚠️ **Importante**: Este proyecto requiere el backend de Laravel. Consulta la sección de [Configuración](#-configuración) para más detalles.

## 🛠 Instalación

### 1️⃣ Clonar el repositorio frontend

```bash
git clone https://github.com/DRMiguel25/CityExplorer-.git
cd CityExplorer-
```

### 2️⃣ Clonar el repositorio backend

```bash
git clone https://github.com/IngOscar19/BackEnd-CityExplorer.git
cd BackEnd-CityExplorer
```

> 📚 **Nota**: Consulta el README del repositorio backend para instrucciones de configuración detalladas.

### 3️⃣ Instalar dependencias del frontend

```bash
# Dependencias principales
npm install

# Dependencias adicionales
npm install sweetalert2
npm install @stripe/stripe-js
npm install bootstrap
npm install chart.js
npm install ng2-charts
```

## ⚙️ Configuración

### Configurar conexión con el backend

Edita el archivo `httpservice.ts` para especificar la URL del backend:

```typescript
export class HttpLaravelService {
  private _url = 'http://127.0.0.1:8000/api';
  // Asegúrate de que el backend esté ejecutándose en esta URL
}
```

### Variables de entorno

Configura las variables necesarias para:
- 🔑 **Claves de API de Stripe**
- 🌐 **URLs del backend**
- 🔧 **Configuraciones específicas del entorno**

## 🚀 Uso

### Servidor de desarrollo

```bash
# Con HTTPS (recomendado para Stripe)
ng serve --ssl true --ssl-key ssl.key --ssl-cert ssl.crt

# Sin HTTPS (desarrollo básico)
ng serve
```

La aplicación estará disponible en:
- **HTTPS**: `https://localhost:4200/proyecto-City-explorer-front-end`
- **HTTP**: `http://localhost:4200/proyecto-City-explorer-front-end`

## 🏗 Construcción

### Compilación de desarrollo
```bash
ng build
```

### Compilación de producción
```bash
ng build --configuration production
```

Los archivos compilados se guardarán en el directorio `dist/`.

## 📚 Recursos Adicionales

| Tecnología | Documentación | Propósito |
|------------|---------------|-----------|
| **SweetAlert2** | [Documentación](https://sweetalert2.github.io/) | Alertas modernas y personalizadas |
| **Stripe.js** | [Documentación](https://stripe.com/docs/js) | Integración de pagos |
| **Bootstrap** | [Documentación](https://getbootstrap.com/) | Framework CSS responsivo |
| **Angular CLI** | [Documentación](https://angular.dev/tools/cli) | Herramientas de desarrollo |

## 💳 Datos de Prueba

Para testing de pagos con Stripe:

```
Número de tarjeta: 4242 4242 4242 4242
Fecha de vencimiento: Cualquier fecha futura (ej: 12/25)
CVV: Cualquier valor (ej: 123)
Código Postal: Cualquier valor (ej: 12345)
```

## 👨‍💻 Equipo

Este proyecto fue desarrollado por el **Equipo City Explorer**:

| Rol | Nombre |
|-----|--------|
| 👑 **Líder del Proyecto** | Miguel Angel Díaz Rivera |
| 🗄️ **Administrador de BD** | Oscar Martin Espinosa Romero |
| 🎨 **Diseñador** | Alexis Armando Peralta Ramírez |
| 💻 **Desarrollador** | José Manuel García Morales |

## 🔗 Enlaces Importantes

- **Frontend**: [GitHub Repository](https://github.com/DRMiguel25/CityExplorer-.git)
- **Backend**: [GitHub Repository](https://github.com/IngOscar19/BackEnd-CityExplorer.git)

## 📄 Licencia

Este proyecto está bajo la **Licencia MIT**.

## ⚖️ Términos de Uso

> ⚠️ **AVISO IMPORTANTE**: Se prohíbe estrictamente cualquier copia, modificación no autorizada de la aplicación o de sus marcas, intentos de extraer el código fuente, traducir o crear versiones derivadas. El contenido y las marcas se proporcionan "TAL CUAL" para su información y uso personal, no comercial.

---

<div align="center">

**¿Te gusta el proyecto? ¡Dale una ⭐ en GitHub!**

[🐛 Reportar Bug](../../issues) • [✨ Solicitar Feature](../../issues) • [📖 Documentación](../../wiki)

</div>
