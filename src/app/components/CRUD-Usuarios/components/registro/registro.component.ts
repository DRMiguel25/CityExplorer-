import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpLaravelService } from '../../../../http.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-registro',
  standalone: false,
  templateUrl: './registro.component.html',
  styleUrls: ['./registro.component.scss']
})
export class RegistroComponent implements OnInit {
  registroForm: FormGroup;
  previewUrl: string | ArrayBuffer | null = null;

  // Estados de consentimiento
  terminosLeidos = false;
  privacidadLeida = false;

  roles = [
    { id: 1, nombre: 'Usuario' },
    { id: 2, nombre: 'Anunciante' },
    { id: 3, nombre: 'Administrador' },
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private service: HttpLaravelService
  ) {
    this.registroForm = this.fb.group({
      nombre: ['', Validators.required],
      apellidoP: ['', Validators.required],
      apellidoM: ['', Validators.required],
      correo: ['', [Validators.required, Validators.email]],
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/)
      ]],
      id_rol: ['', Validators.required],
      foto_perfil: [''],
      acceptTerms: [false, Validators.requiredTrue]
    });

    // 🔒 El checkbox arranca deshabilitado; lo palomeo y dejo deshabilitado cuando lean ambos.
    this.registroForm.get('acceptTerms')?.disable({ emitEvent: false });
  }

  ngOnInit(): void {
    this.logLoadTime();
  }

  onFileChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.registroForm.patchValue({ foto_perfil: file });
      this.registroForm.get('foto_perfil')?.markAsTouched();

      const reader = new FileReader();
      reader.onload = () => {
        this.previewUrl = reader.result;
      };
      reader.readAsDataURL(file);
    }
  }

  // ✅ Método central: si ya leyeron ambos, palomea y deshabilita; si no, despalomea y deshabilita.
  private verificarAceptacion() {
    const ctrl = this.registroForm.get('acceptTerms');
    if (this.terminosLeidos && this.privacidadLeida) {
      ctrl?.enable({ emitEvent: false });      // (habilito para poder cambiar valor)
      ctrl?.setValue(true, { emitEvent: false });
      ctrl?.disable({ emitEvent: false });     // y lo dejo bloqueado
    } else {
      ctrl?.enable({ emitEvent: false });
      ctrl?.setValue(false, { emitEvent: false });
      ctrl?.disable({ emitEvent: false });
    }
  }

  // --- TÉRMINOS Y CONDICIONES ---
openTerms() {
  this.terminosLeidos = true;
  this.verificarAceptacion();

  Swal.fire({
    title: '<strong>Términos y Condiciones - City Explorer</strong>',
    icon: 'info',
    html: `
      <div style="text-align: left; font-family: 'Segoe UI', sans-serif; line-height: 1.7; color: #333; max-height: 80vh; overflow-y: auto; padding-right: 10px;">
        
        <div style="background-color: #e8f4fd; padding: 12px; border-radius: 6px; margin-bottom: 15px; border-left: 4px solid #007bff;">
          <p style="margin: 0; color: #0056b3; font-weight: 500;">
            📱 Aplicación web interactiva para atractivos turísticos de <strong>San Miguel de Allende</strong>, desarrollada por <strong>ExploreTech</strong>
          </p>
        </div>

        <h4 style="color: #003366; margin: 18px 0 8px 0; font-size: 1.1em; font-weight: 600;">
          ✅ 1. Aceptación de las Condiciones
        </h4>
        <p>
          Al acceder o utilizar la <strong>Aplicación Web City Explorer</strong>, usted declara haber leído, comprendido y aceptado estos Términos y Condiciones. <span style="color: #dc3545; font-weight: 600;">Si no está de acuerdo, se le prohíbe expresamente utilizar la aplicación y debe interrumpir su uso inmediatamente.</span>
        </p>

        <h4 style="color: #003366; margin: 18px 0 8px 0; font-size: 1.1em; font-weight: 600;">
          🎯 2. Objeto de la Aplicación
        </h4>
        <p>
          La Aplicación ha sido diseñada para <strong>centralizar y actualizar la información turística de San Miguel de Allende</strong>, mejorando la experiencia del visitante y fomentando el desarrollo económico local y sostenible. Busca solucionar la fragmentación de información turística dispersa en múltiples plataformas.
        </p>
        <ul style="padding-left: 20px;">
          <li><strong>Categorías detalladas:</strong> comida, fiesta, bebidas, relax, sitios históricos</li>
          <li><strong>Comunidad activa:</strong> comentarios y valoraciones</li>
          <li><strong>Personalización:</strong> guardado de lugares favoritos</li>
          <li><strong>Sitios históricos:</strong> información cultural detallada</li>
          <li><strong>Gestión y moderación:</strong> administrador responsable de la calidad del contenido</li>
        </ul>

        <h4 style="color: #003366; margin: 18px 0 8px 0; font-size: 1.1em; font-weight: 600;">
          🔒 3. Derechos de Propiedad Intelectual
        </h4>
        <p>
          La aplicación, código fuente, funcionalidad, diseño, contenido, logotipos y marcas son <strong>propiedad exclusiva de ExploreTech</strong> o están licenciados. Se prohíbe estrictamente:
        </p>
        <ul style="padding-left: 20px;">
          <li>Copiar, modificar o extraer el código fuente</li>
          <li>Crear versiones derivadas sin autorización</li>
          <li>Traducir o realizar ingeniería inversa</li>
          <li>Usar contenido para fines comerciales sin permiso</li>
        </ul>
        <p style="color: #856404; font-style: italic;">El contenido se proporciona "TAL CUAL" para uso personal, no comercial.</p>

        <h4 style="color: #003366; margin: 18px 0 8px 0; font-size: 1.1em; font-weight: 600;">
          👤 4. Obligaciones del Usuario
        </h4>
        <ul style="padding-left: 20px;">
          <li>Mantener la seguridad de su dispositivo y acceso</li>
          <li>No usar la app para fines ilegales o no autorizados</li>
          <li>No recopilar sistemáticamente datos sin autorización</li>
          <li>No usar bots, scripts o sistemas automatizados</li>
          <li>No interferir con las funciones de seguridad</li>
          <li>Participar con respeto y veracidad en comentarios</li>
        </ul>

        <h4 style="color: #003366; margin: 18px 0 8px 0; font-size: 1.1em; font-weight: 600;">
          💬 5. Contenido Generado por Usuarios
        </h4>
        <p>
          Al publicar comentarios, valoraciones o sugerencias, garantiza que son <strong>verdaderos, precisos, no engañosos</strong> y no infringen derechos de terceros. El contenido no debe ser obsceno, difamatorio, ilegal o inapropiado.
        </p>
        <p style="color: #dc3545; font-weight: 600; font-style: italic; margin-top: 8px;">
          ⚡ ExploreTech se reserva el derecho de editar, eliminar o cambiar la categoría de cualquier contribución sin previo aviso.
        </p>

        <h4 style="color: #003366; margin: 18px 0 8px 0; font-size: 1.1em; font-weight: 600;">
          📢 6. Publicidad para Negocios Locales
        </h4>
        
        <div style="background-color: #f8f9fa; padding: 12px; border-radius: 6px; margin: 10px 0;">
          <p><strong>💰 Precios con IVA incluido:</strong></p>
          <ul style="padding-left: 20px;">
            <li><span style="background-color: #e3f2fd; color: #0056b3; padding: 2px 8px; border-radius: 4px; font-weight: 500;">Mensual: $580 MXN</span> (base $500 + IVA $80)</li>
            <li><span style="background-color: #c8e6c9; color: #2e7d32; padding: 2px 8px; border-radius: 4px; font-weight: 500;">Anual: $5,800 MXN</span> (base $5,000 + IVA $800)</li>
          </ul>
          <p style="color: #28a745; font-weight: 600; margin: 5px 0 0 0;">
            💡 Ahorro anual: $1,160 MXN (16.7% descuento)
          </p>
        </div>

        <div style="background-color: #fff3cd; padding: 10px; border-radius: 6px; margin: 10px 0;">
          <p style="margin: 0; color: #856404; font-size: 0.95em;">
            <strong>📋 Facturación:</strong> No emitimos facturas fiscales, pero proporcionamos comprobante de transacción conforme a NMX-COE-001-SCFI-2018. Los anunciantes son responsables de sus obligaciones fiscales y deben garantizar que sus anuncios cumplen con la normativa, sean veraces y estén en español con precios en moneda nacional.
          </p>
        </div>

        <h4 style="color: #003366; margin: 18px 0 8px 0; font-size: 1.1em; font-weight: 600;">
          ⚠️ 7. Limitaciones de Responsabilidad
        </h4>
        <ul style="padding-left: 20px;">
          <li><strong>📶 Internet:</strong> No somos responsables por falta de conexión Wi-Fi o datos móviles</li>
          <li><strong>💳 Datos:</strong> Usted es responsable de cargos por datos móviles y roaming</li>
          <li><strong>🔋 Batería:</strong> No asumimos responsabilidad si su dispositivo se agota</li>
          <li><strong>📊 Terceros:</strong> No garantizamos precisión total de información de terceros</li>
          <li><strong>⚡ Interrupciones:</strong> No respondemos por fallas técnicas, fuerza mayor o actos de terceros</li>
        </ul>

        <h4 style="color: #003366; margin: 18px 0 8px 0; font-size: 1.1em; font-weight: 600;">
          🛡️ 8. Seguridad y Protección de Datos
        </h4>
        <p>
          Garantizamos protección transparente y efectiva conforme a estándares de seguridad de la industria. La información personal se almacena y procesa para fines del servicio, cumpliendo con la <strong>Ley Federal de Protección de Datos Personales en Posesión de los Particulares</strong>. Consulte nuestro Aviso de Privacidad para más detalles.
        </p>

        <h4 style="color: #003366; margin: 18px 0 8px 0; font-size: 1.1em; font-weight: 600;">
          🔄 9. Actualizaciones y Terminación
        </h4>
        <p>
          Podemos actualizar la aplicación en cualquier momento. Es su responsabilidad descargar actualizaciones para seguir utilizándola. No garantizamos compatibilidad con todas las versiones de navegadores. <strong>Podemos cesar la provisión del servicio en cualquier momento sin previo aviso.</strong>
        </p>

        <h4 style="color: #003366; margin: 18px 0 8px 0; font-size: 1.1em; font-weight: 600;">
          📝 10. Cambios en estos Términos
        </h4>
        <p>
          Podemos actualizar estos términos periódicamente. <strong>Se recomienda revisar esta página regularmente.</strong> Los cambios se notificarán publicando los nuevos términos en esta página.
        </p>

        <h4 style="color: #003366; margin: 18px 0 8px 0; font-size: 1.1em; font-weight: 600;">
          ⚖️ 11. Legislación Aplicable
        </h4>
        <p>
          Estos términos se rigen por las <strong>leyes aplicables en México</strong>. Las partes se someten a la jurisdicción de tribunales competentes en México, renunciando a cualquier otro fuero.
        </p>

        <div style="background-color: #f8f9fa; padding: 12px; border-radius: 6px; margin: 15px 0;">
          <p style="margin: 0; text-align: center;">
            <strong>📞 Contacto:</strong><br>
            <strong>ExploreTech</strong><br>
            📧 <a href="mailto:exploreTechSupport@gmail.com" style="color: #007bff; text-decoration: underline;">exploreTechSupport@gmail.com</a>
          </p>
        </div>

        <p style="font-size: 0.9em; color: #666; margin-top: 20px; border-top: 1px solid #eee; padding-top: 10px; text-align: center;">
          © 2025 ExploreTech. Todos los derechos reservados.<br>
          Contacto: <a href="mailto:exploreTechSupport@gmail.com" style="color: #007bff; text-decoration: underline;">exploreTechSupport@gmail.com</a>
        </p>
      </div>
    `,
    confirmButtonText: 'Cerrar',
    width: '80%',
    backdrop: true,
    allowOutsideClick: false
  });
}
// --- AVISO DE PRIVACIDAD ---
openPrivacy() {
  this.privacidadLeida = true;
  this.verificarAceptacion();

    Swal.fire({
      title: '<strong>Aviso de Privacidad - ExploreTech</strong>',
      icon: 'info',
      html: `
        <div style="text-align: left; font-family: 'Segoe UI', sans-serif; line-height: 1.7; color: #333; max-height: 80vh; overflow-y: auto; padding-right: 10px;">
          
          <h4 style="color: #003366; margin: 18px 0 8px 0; font-size: 1.1em; font-weight: 600;">
            📋 Información del Responsable
          </h4>
          <div style="background-color: #f8f9fa; padding: 12px; border-radius: 6px; margin-bottom: 15px;">
            <p><strong>Empresa:</strong> ExploreTech</p>
            <p><strong>Domicilio:</strong> Calle Cardón 70, Palmita de Landeta, San Miguel De Allende, Guanajuato, México</p>
            <p><strong>Correo de Soporte:</strong> <a href="mailto:exploretech.support@gmail.com" style="color: #007bff;">exploretech.support@gmail.com</a></p>
            <p><strong>Teléfono:</strong> 4151123646</p>
          </div>

          <h4 style="color: #003366; margin: 18px 0 8px 0; font-size: 1.1em; font-weight: 600;">
            🎯 Finalidades del Tratamiento de Datos
          </h4>
          <p>Los datos personales que recabamos tienen las siguientes finalidades:</p>
          <ul style="padding-left: 20px;">
            <li>Crear una cuenta en nuestro software</li>
            <li>Acceder a las funcionalidades del sistema según el tipo de usuario</li>
            <li>Utilizar el sistema de promoción de negocios</li>
            <li>Procesar pagos con tarjeta de crédito o débito</li>
          </ul>

          <h4 style="color: #003366; margin: 18px 0 8px 0; font-size: 1.1em; font-weight: 600;">
            🔐 Datos Personales que Recabamos
          </h4>
          
          <h5 style="color: #0056b3; margin: 12px 0 6px 0; font-size: 1em; font-weight: 500;">
            1. Datos Recabados de Forma Directa
          </h5>
          <ul style="padding-left: 20px;">
            <li><strong>Nombre completo:</strong> Identificación personal</li>
            <li><strong>Teléfono:</strong> Contacto directo</li>
            <li><strong>Correo electrónico:</strong> Comunicación y notificaciones</li>
            <li><strong>Dirección completa:</strong> Calle, colonia, número, código postal</li>
            <li><strong>Datos de tarjeta:</strong> Número, fecha de expiración, nombre del titular, CVV</li>
          </ul>

          <h5 style="color: #0056b3; margin: 12px 0 6px 0; font-size: 1em; font-weight: 500;">
            2. Datos Recabados en Línea
          </h5>
          <ul style="padding-left: 20px;">
            <li><strong>Nombre completo:</strong> Identificación en plataforma</li>
            <li><strong>Teléfono:</strong> Verificación de cuenta</li>
            <li><strong>Correo electrónico:</strong> Acceso y comunicaciones</li>
            <li><strong>Dirección completa:</strong> Información de perfil</li>
            <li><strong>Datos de tarjeta:</strong> Información financiera completa</li>
          </ul>

          <h5 style="color: #0056b3; margin: 12px 0 6px 0; font-size: 1em; font-weight: 500;">
            3. Datos de Otras Fuentes Legales
          </h5>
          <ul style="padding-left: 20px;">
            <li><strong>Directorios telefónicos:</strong> Información de contacto</li>
            <li><strong>Directorios laborales:</strong> Datos profesionales</li>
            <li><strong>Instituciones financieras:</strong> Datos de tarjetas (cuando sea legal)</li>
          </ul>

          <div style="background-color: #e8f4fd; padding: 12px; border-radius: 6px; margin: 15px 0; border-left: 4px solid #007bff;">
            <p style="margin: 0; font-weight: 600; color: #0056b3;">
              ⚠️ NOTA IMPORTANTE: Este proyecto NO recaba datos sensibles
            </p>
          </div>

          <h4 style="color: #003366; margin: 18px 0 8px 0; font-size: 1.1em; font-weight: 600;">
            📞 Contactos para Ejercer sus Derechos
          </h4>
          <div style="background-color: #f8f9fa; padding: 12px; border-radius: 6px; margin-bottom: 15px;">
            <p><strong>Soporte General:</strong> <a href="mailto:exploretech.support@gmail.com" style="color: #007bff;">exploretech.support@gmail.com</a></p>
            <p><strong>Ejercer Derechos ARCO:</strong> <a href="mailto:exploretech.heltp@gmail.com" style="color: #007bff;">exploretech.heltp@gmail.com</a></p>
            <p><strong>Atención al Cliente:</strong> <a href="mailto:exploretech.atencionalcliente@gmail.com" style="color: #007bff;">exploretech.atencionalcliente@gmail.com</a></p>
            <p><strong>Revocar Consentimiento:</strong> <a href="mailto:exploretech.atencionalcliente@gmail.com" style="color: #007bff;">exploretech.atencionalcliente@gmail.com</a></p>
          </div>

          <h4 style="color: #003366; margin: 18px 0 8px 0; font-size: 1.1em; font-weight: 600;">
            🚫 Cómo Limitar el Uso de sus Datos
          </h4>
          <h5 style="color: #0056b3; margin: 12px 0 6px 0; font-size: 1em; font-weight: 500;">
            Para dejar de recibir promociones:
          </h5>
          <ul style="padding-left: 20px;">
            <li><strong>Correo Electrónico:</strong> Desactivar notificaciones desde el último correo recibido</li>
            <li><strong>Correo Postal:</strong> Seguir instrucciones en el material publicitario</li>
            <li><strong>Solicitud Directa:</strong> Enviar petición a <a href="mailto:exploretech.heltp@gmail.com" style="color: #007bff;">exploretech.heltp@gmail.com</a></li>
          </ul>

          <h4 style="color: #003366; margin: 18px 0 8px 0; font-size: 1.1em; font-weight: 600;">
            ⚖️ Derechos ARCO (Acceso, Rectificación, Cancelación, Oposición)
          </h4>
          <h5 style="color: #0056b3; margin: 12px 0 6px 0; font-size: 1em; font-weight: 500;">
            📝 Información requerida para solicitudes:
          </h5>
          <ul style="padding-left: 20px;">
            <li><strong>Nombre del solicitante:</strong> Identificación completa</li>
            <li><strong>Teléfono de contacto:</strong> Para seguimiento</li>
            <li><strong>Asunto:</strong> Tipo de derecho que desea ejercer (Acceso, Rectificación, Cancelación u Oposición)</li>
            <li><strong>Descripción del problema:</strong> Detalle específico de su solicitud</li>
            <li><strong>Fecha:</strong> Fecha de la solicitud</li>
            <li><strong>Correo adicional:</strong> Contacto alternativo (opcional)</li>
          </ul>

          <h5 style="color: #0056b3; margin: 12px 0 6px 0; font-size: 1em; font-weight: 500;">
            ⏱️ Tiempos de Respuesta:
          </h5>
          <ul style="padding-left: 20px;">
            <li><strong>Confirmación:</strong> A la brevedad posible (máximo 24 horas hábiles)</li>
            <li><strong>Resolución Final:</strong> 7 a 21 días hábiles</li>
            <li><strong>Medio de Respuesta:</strong> <a href="mailto:exploretech.heltp@gmail.com" style="color: #007bff;">exploretech.heltp@gmail.com</a></li>
            <li><strong>Seguimiento:</strong> Número de ticket proporcionado para rastreo</li>
          </ul>

          <h5 style="color: #0056b3; margin: 12px 0 6px 0; font-size: 1em; font-weight: 500;">
            📋 Procedimiento paso a paso:
          </h5>
          <ol style="padding-left: 20px;">
            <li><strong>Enviar solicitud</strong> a: <a href="mailto:exploretech.heltp@gmail.com" style="color: #007bff;">exploretech.heltp@gmail.com</a></li>
            <li><strong>Incluir toda la información</strong> requerida mencionada arriba</li>
            <li><strong>Recibir confirmación</strong> con número de ticket</li>
            <li><strong>Esperar resolución</strong> en el plazo establecido</li>
            <li><strong>Recibir respuesta final</strong> por correo electrónico</li>
          </ol>

          <h4 style="color: #003366; margin: 18px 0 8px 0; font-size: 1.1em; font-weight: 600;">
            🔄 Revocación de Consentimiento
          </h4>
          <p><strong>Proceso de Revocación:</strong></p>
          <ol style="padding-left: 20px;">
            <li><strong>Enviar solicitud</strong> a: <a href="mailto:exploretech.atencionalcliente@gmail.com" style="color: #007bff;">exploretech.atencionalcliente@gmail.com</a></li>
            <li><strong>Incluir información requerida</strong> (usar misma tabla de información que derechos ARCO)</li>
            <li><strong>Tiempo de procesamiento:</strong> 7 a 21 días hábiles</li>
            <li><strong>Confirmación:</strong> Por correo electrónico</li>
            <li><strong>Efectos:</strong> Se suspenderá el tratamiento de datos según lo solicitado</li>
          </ol>

          <h4 style="color: #003366; margin: 18px 0 8px 0; font-size: 1.1em; font-weight: 600;">
            🔔 Modificaciones al Aviso
          </h4>
          <p><strong>Medios de Notificación:</strong></p>
          <ul style="padding-left: 20px;">
            <li><strong>Físico:</strong> Anuncios en establecimientos afiliados</li>
            <li><strong>Material Impreso:</strong> Trípticos y folletos informativos</li>
            <li><strong>Digital:</strong> Página web (sección aviso de privacidad)</li>
            <li><strong>Correo Electrónico:</strong> Al último correo proporcionado</li>
            <li><strong>Notificación en App:</strong> Mensaje emergente al iniciar sesión</li>
          </ul>

          <h4 style="color: #003366; margin: 18px 0 8px 0; font-size: 1.1em; font-weight: 600;">
            🍪 Cookies y Web Beacons
          </h4>
          <h5 style="color: #0056b3; margin: 12px 0 6px 0; font-size: 1em; font-weight: 500;">
            Información que recopilamos:
          </h5>
          <ul style="padding-left: 20px;">
            <li><strong>Tipo de navegador y SO:</strong> Optimización de experiencia</li>
            <li><strong>Páginas visitadas:</strong> Análisis de navegación</li>
            <li><strong>Vínculos seguidos:</strong> Mejora de contenido</li>
            <li><strong>Dirección IP:</strong> Seguridad y ubicación</li>
            <li><strong>Sitio de origen:</strong> Análisis de tráfico</li>
            <li><strong>Tiempo de permanencia:</strong> Estadísticas de uso</li>
            <li><strong>Preferencias de usuario:</strong> Personalización de interfaz</li>
          </ul>
          <p><strong>Deshabilitación:</strong> Para información sobre cómo deshabilitar cookies, contacte: <a href="mailto:exploretech.atencionalcliente@gmail.com" style="color: #007bff;">exploretech.atencionalcliente@gmail.com</a></p>

          <h4 style="color: #003366; margin: 18px 0 8px 0; font-size: 1.1em; font-weight: 600;">
            📢 Quejas y Denuncias ante Autoridades
          </h4>
          <div style="background-color: #fff3cd; padding: 12px; border-radius: 6px; border-left: 4px solid #ffc107; margin: 15px 0;">
            <p><strong>Autoridad Competente:</strong></p>
            <p><strong>Transparencia para el Pueblo</strong> (órgano desconcentrado de la Secretaría Anticorrupción y Buen Gobierno)</p>
            <p><strong>Página web:</strong> <a href="https://transparenciaparaelpueblo.gob.mx" target="_blank" style="color: #007bff;">https://transparenciaparaelpueblo.gob.mx</a></p>
            <p style="font-size: 0.9em; color: #856404; font-style: italic;"></p>
            <p><strong>Teléfono:</strong> 55 5004 2400 <span style="font-size: 0.9em; color: #856404; font-style: italic;">*(el número puede seguir operando temporalmente; verifica si hay uno nuevo oficialmente asignado)*</span></p>
            <p><strong>Motivos de denuncia:</strong> Violaciones a la Ley Federal de Protección de Datos Personales en Posesión de los Particulares</p>
          </div>

          <div style="background-color: #ffeaa7; padding: 10px; border-radius: 6px; border-left: 4px solid #fdcb6e; margin: 15px 0;">
            <p style="margin: 0; color: #2d3436; font-size: 0.9em;">
              <strong>⚠️ Nota importante:</strong> Aunque el sitio web <code>inai.org.mx</code> podría permanecer activo temporalmente para redirección o consulta de trámites anteriores, ya no es la autoridad vigente. Se recomienda verificar en la página oficial de la <strong>Secretaría Anticorrupción y Buen Gobierno</strong> la información más actualizada sobre presentación de quejas.
            </p>
          </div>

          <div style="background-color: #ddd6fe; padding: 10px; border-radius: 6px; border-left: 4px solid #8b5cf6; margin: 15px 0;">
            <p style="margin: 0; color: #581c87; font-size: 0.9em; font-weight: 500;">
              📋 <strong>Cambio de autoridad:</strong> La presente autoridad sustituye al Instituto Nacional de Transparencia, Acceso a la Información y Protección de Datos Personales (INAI), desaparecido el 9 de mayo de 2025 conforme a la Ley de Simplificación Administrativa.
            </p>
          </div>

          <div style="background-color: #f8f9fa; padding: 12px; border-radius: 6px; margin: 15px 0;">
            <p style="margin: 0; text-align: center;">
              <strong>📞 Contacto Principal:</strong><br>
              <strong>ExploreTech</strong><br>
              📧 <a href="mailto:exploretech.support@gmail.com" style="color: #007bff; text-decoration: underline;">exploretech.support@gmail.com</a><br>
              📧 <strong>Derechos ARCO:</strong> <a href="mailto:exploretech.heltp@gmail.com" style="color: #007bff; text-decoration: underline;">exploretech.heltp@gmail.com</a>
            </p>
          </div>

          <p style="font-size: 0.9em; color: #666; margin-top: 20px; border-top: 1px solid #eee; padding-top: 10px; text-align: center;">
            <strong>Última actualización: 15/08/2025</strong><br>
            © 2025 ExploreTech. Todos los derechos reservados.<br>
            Contacto: <a href="mailto:exploretech.support@gmail.com" style="color: #007bff; text-decoration: underline;">exploretech.support@gmail.com</a>
          </p>
        </div>
      `,
    confirmButtonText: 'Cerrar',
    width: '85%',
    backdrop: true,
    allowOutsideClick: false,
    customClass: {
      container: 'privacy-modal-container'
    }
  });
}

  registrar() {
    const fotoControl = this.registroForm.get('foto_perfil');

    // Mantengo validaciones del form
    if (this.registroForm.invalid) {
      this.registroForm.markAllAsTouched();
      return;
    }
    // 🔎 Validación explícita: deben haber abierto ambos documentos
    if (!this.terminosLeidos) {
      Swal.fire('Atención', 'Debes abrir y leer los Términos y Condiciones antes de aceptar.', 'warning');
      return;
    }
    if (!this.privacidadLeida) {
      Swal.fire('Atención', 'Debes abrir y leer el Aviso de Privacidad antes de aceptar.', 'warning');
      return;
    }
    if (!fotoControl?.value) {
      Swal.fire({
        icon: 'warning',
        title: '¡Oops!',
        text: 'No puedes crear una cuenta sin foto de perfil',
        confirmButtonText: 'Aceptar'
      });
      return;
    }

    // Envío
    const formData = new FormData();
    formData.append('nombre', this.f['nombre'].value);
    formData.append('apellidoP', this.f['apellidoP'].value);
    formData.append('apellidoM', this.f['apellidoM'].value);
    formData.append('correo', this.f['correo'].value);
    formData.append('password', this.f['password'].value);
    formData.append('id_rol', this.f['id_rol'].value);

    const archivo = this.f['foto_perfil'].value;
    if (archivo instanceof File) {
      formData.append('foto_perfil', archivo);
    }

    this.service.Service_Post_FormData('user', 'register', formData).subscribe({
      next: (data: any) => {
        if (data.estatus) {
          Swal.fire('¡Éxito!', 'Usuario registrado correctamente', 'success');
          this.router.navigate(['/inicio-sesion']);
        } else {
          Swal.fire('Error', data.mensaje || 'No se pudo registrar el usuario', 'error');
        }
      },
      error: (err) => {
        console.error('Error en registro:', err);
        Swal.fire('Error', err.error?.mensaje || 'Ocurrió un error en la conexión con el servidor', 'error');
      }
    });
  }

  login() {
    this.router.navigate(['/inicio-sesion']);
  }

  get f() {
    return this.registroForm.controls;
  }

  isInvalid(field: string): boolean {
    return this.f[field].invalid && this.f[field].touched;
  }

  logLoadTime() {
    window.addEventListener('load', () => {
      const [navEntry] = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
      if (navEntry) {
        console.log('⏱️ Tiempo total de carga (domComplete):', navEntry.domComplete.toFixed(2), 'ms');
        console.log('🧱 Tiempo de render (domContentLoaded):', navEntry.domContentLoadedEventEnd.toFixed(2), 'ms');
        console.log('🌐 Tiempo de respuesta (responseEnd):', navEntry.responseEnd.toFixed(2), 'ms');
      } else {
        const timing = performance.timing;
        const loadTime = timing.loadEventEnd - timing.navigationStart;
        console.log('⏱️ Tiempo de carga (fallback):', loadTime, 'ms');
      }
    });
  }

  mostrarPassword: boolean = false;
  togglePassword(): void {
    this.mostrarPassword = !this.mostrarPassword;
  }
}
