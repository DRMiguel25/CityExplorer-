import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HttpLaravelService } from '../../../../../http.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'alerta-info-usuario',
  standalone: false,
  templateUrl: './alerta-info-usuario.component.html',
  styleUrls: ['./alerta-info-usuario.component.scss']
})
export class AlertaInfoUsuarioComponent implements OnInit {
  usuario: any = null; // Aquí vamos a guardar la info para mostrarla en el HTML
  
  constructor(
    private router: Router,
    private apiService: HttpLaravelService,
    private dialogRef: MatDialogRef<AlertaInfoUsuarioComponent>, // <- agregado
    @Inject(MAT_DIALOG_DATA) public data: { id_usuario: number, tipo_usuario: number } // aquí llega el id
  ) {}

  ngOnInit(): void {
    console.log('ID recibido desde el diálogo:', this.data.id_usuario);

    console.log('Tipo de usuario: ', this.data.tipo_usuario);

    this.apiService.Service_Get('usuario', this.data.id_usuario).subscribe(
      respuesta => {
        this.usuario = respuesta;
        console.log('Datos del usuario:', this.usuario);
      },
      error => {
        console.error('Error al obtener usuario:', error);
      }
    );

    this.logLoadTime();  // 👈 mide tiempo de carga

  }

  cerrarSesion(): void {
  console.log('Intentando cerrar sesión...');

  this.apiService.Service_Cerrar_seccion().subscribe({
    next: (resp: any) => {
      console.log('✅ Sesión cerrada correctamente:', resp);
      // Navegar a login y cerrar diálogo
      this.router.navigate(['/login']).then(() => {
        this.dialogRef.close();
      });
    },
    error: (err) => {
      console.error('❌ Error al cerrar sesión:', err);
      // Opcional: mostrar alerta al usuario
      Swal.fire('Error', 'No se pudo cerrar sesión, intenta de nuevo.', 'error');
    }
  });
}

  vistaInfoUsuario(): void {
    console.log('Navegando a modificar información del usuario ' + this.data.id_usuario + '...');
    this.router.navigate(['/modificar-info-usuario', this.data.id_usuario, this.data.tipo_usuario]).then(() => {
      this.dialogRef.close(); // Cierra el diálogo solo si la navegación fue exitosa
    }).catch(err => {
      console.error('Error al navegar a info-usuario:', err);
    });
  }

    politicasDePrivacidad(): void {
    console.log('Navegando a políticas de privacidad');
    this.router.navigate(['/politicas-de-privacidad', this.data.id_usuario, this.data.tipo_usuario]).then(() => {
      this.dialogRef.close(); // Cierra el diálogo solo si la navegación fue exitosa
    }).catch(err => {
      console.error('Error al navegar a políticas de privacidad:', err);
    });
  }

  terminosDelServicio(): void {
    console.log('Navegando a términos del servicio');
    this.router.navigate(['/terminos-del-servicio', this.data.id_usuario, this.data.tipo_usuario]).then(() => {
      this.dialogRef.close(); // Cierra el diálogo solo si la navegación fue exitosa
    }).catch(err => {
      console.error('Error al navegar a términos del servicio:', err);
    });
  }

  logLoadTime() {
  window.addEventListener('load', () => {
    const [navEntry] = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
    if (navEntry) {
      console.log('⏱️ Tiempo total de carga en alerta usuario (domComplete):', navEntry.domComplete.toFixed(2), 'ms');
      console.log('🧱 Tiempo de render en alerta usuario (domContentLoaded):', navEntry.domContentLoadedEventEnd.toFixed(2), 'ms');
      console.log('🌐 Tiempo de respuesta alerta usuario (responseEnd):', navEntry.responseEnd.toFixed(2), 'ms');
    } else {
      // Fallback para navegadores antiguos
      const timing = performance.timing;
      const totalLoadTime = timing.loadEventEnd - timing.navigationStart;
      console.log('⏱️ Tiempo total de carga (fallback):', totalLoadTime, 'ms');
    }
  });
}

}
