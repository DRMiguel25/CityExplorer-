
 🌍 CityExplorer

CityExplorer es una aplicación Angular diseñada para explorar lugares turísticos, gestionar usuarios y procesar pagos de manera eficiente. Este proyecto fue generado utilizando [Angular CLI](https://github.com/angular/angular-cli) versión 19.0.4.



 📦 Requisitos previos

Antes de comenzar, asegúrate de tener instalado lo siguiente en tu sistema:

- Node.js: Versión 18.x o superior. Puedes descargarlo desde [aquí](https://nodejs.org/).
  npm: Viene incluido con Node.js.
- Visual Studio Code: Un editor de código popular. Descárgalo desde [aquí](https://code.visualstudio.com/).

Además, este proyecto se conecta con una API RESTful desarrollada en Laravel. Para que la aplicación funcione correctamente, necesitarás descargar y configurar el backend correspondiente.



 🛠 Instalación

Sigue estos pasos para configurar el proyecto en tu entorno local:

 1. Clonar el repositorio frontend


https://github.com/DRMiguel25/CityExplorer-.git

 2. Clonar el repositorio backend

Este proyecto requiere un backend desarrollado en Laravel. Clona el repositorio backend ejecutando:


git clone https://github.com/IngOscar19/BackEnd-CityExplorer.git
cd BackEnd-CityExplorer


> Nota: Consulta el archivo `README` del repositorio backend para instrucciones detalladas sobre cómo configurar y ejecutar el servidor.

### 3. Instalar dependencias del frontend

Ejecuta los siguientes comandos para instalar las dependencias necesarias del frontend:


npm install
npm install sweetalert2
npm install @stripe/stripe-js
npm install bootstrap
npm install chart.js --save


> Nota: Asegúrate de que todas las dependencias se instalen correctamente antes de continuar.

### 4. Configurar la conexión con el backend

Edita el archivo de configuración del frontend (por ejemplo, `httpservice.ts`) para especificar la URL base del backend. 

export class HttpLaravelService {
  private _url = 'http://127.0.0.1:8000/api';


Asegúrate de que el backend esté en funcionamiento y accesible en la URL especificada.

### 5. Iniciar el servidor de desarrollo

Para iniciar el servidor de desarrollo localmente, ejecuta:

ng serve --ssl true --ssl-key ssl.key --ssl-cert ssl.crt


Una vez que el servidor esté en funcionamiento, abre tu navegador y navega a:


https://localhost:4200/proyecto-City-explorer-front-end

La aplicación se recargará automáticamente cada vez que modifiques alguno de los archivos fuente.

> Consejo: Si no necesitas HTTPS durante el desarrollo, puedes omitir las opciones `--ssl`, `--ssl-key` y `--ssl-cert`.


## 🏗 Construcción del proyecto

Para compilar el proyecto, ejecuta:


ng build


Los artefactos de compilación se almacenarán en el directorio `dist/`. Por defecto, la compilación de producción optimiza tu aplicación para mejorar el rendimiento y la velocidad.

> **Consejo:** Para una compilación de producción, utiliza:
>
> 
> ng build --configuration production
> 

---


> Nota: Angular CLI no incluye un framework de pruebas e2e por defecto. Puedes elegir uno como [Protractor](https://www.protractortest.org/) o [Cypress](https://www.cypress.io/) según tus necesidades.




## 📚 Recursos adicionales

- **SweetAlert2**: Una librería para mostrar alertas modernas y personalizadas. Documentación oficial [aquí](https://sweetalert2.github.io/).
- **Stripe.js**: Una librería para integrar pagos con Stripe. Documentación oficial [aquí](https://stripe.com/docs/js).
- **Bootstrap**: Un framework CSS para diseño responsivo. Documentación oficial [aquí](https://getbootstrap.com/).
- **Angular CLI Overview and Command Reference**: Para obtener más información sobre cómo usar Angular CLI, incluidas referencias detalladas de comandos, visita la [documentación oficial](https://angular.dev/tools/cli).

---

## 🔧 Configuración adicional

### Variables de entorno

Este proyecto utiliza variables de entorno para configuraciones específicas. Asegúrate de configurar correctamente los archivos `.env` o ajustar las variables directamente en el código si es necesario.

### Integración con APIs externas

Si tu aplicación se conecta a APIs externas (por ejemplo, Stripe para pagos o una API RESTful para gestión de lugares turísticos), asegúrate de configurar las claves de API en el archivo de entorno correspondiente.

El backend de este proyecto está disponible en [este repositorio](https://github.com/IngOscar19/BackEnd-CityExplorer.git). Asegúrate de descargarlo y configurarlo para que la aplicación funcione correctamente.

---


## 👨‍💻 Autor

Este proyecto fue desarrollado por:

- Equipo de City Explorer, conformado por:
Miguel Angel Díaz Rivera(Lider del proyecto),
Oscar Martin Espinosa Romero(Administrador de Base de Datos
Alexis Armando Peralta Ramírez(Diseñador),
José Manuel García Morales(Desarrollador)


Este es  un proyecto académico o personal diseñado para explorar las capacidades de Angular en combinación con tecnologías modernas como **Stripe** para pagos y APIs RESTful para la gestión de datos.

---

## 📄 Licencia

Este proyecto está bajo la licencia **MIT**.

---

## Se prohíbe estrictamente cualquier copia, modificación no autorizada de la Aplicación o de sus marcas, intentos de extraer el código fuente, traducir o crear versiones derivadas. El contenido y las marcas se proporcionan "TAL CUAL" para su información y uso personal, no comercial.

---

## 📄 Notas
Los datos proporcionados corresponden a información de prueba para simular transacciones en un entorno de desarrollo. El número de tarjeta de crédito de prueba es 4242 4242 4242 4242. Puede seleccionar cualquiera de las opciones de tarjetas disponibles. Para la fecha de vencimiento de la tarjeta, debe ser un valor posterior al año actual. El código de seguridad (CVV) y el código postal (CP) pueden ser establecidos con cualquier valor para fines de prueba.
