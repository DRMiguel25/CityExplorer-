import { Component } from '@angular/core';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { AlertaInfoUsuarioComponent } from '../alerta-info-usuario/alerta-info-usuario.component';
import { HttpLaravelService } from '../../../../http.service';

@Component({
  selector: 'navbar-invitado-usuario',
  standalone: false,
  templateUrl: './navbar-invitado-usuario.component.html',
  styleUrls: ['./navbar-invitado-usuario.component.scss']
})
export class navbarInvitadoUsuarioComponent {
  id_usuario: number = 0;
  usuario: any = null; // Aquí vamos a guardar la info para mostrarla en el HTML

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private apiService: HttpLaravelService,
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id_usuario');
      this.id_usuario = id ? Number(id) : 0;
      console.log('👤 ID de usuario desde la URL:', this.id_usuario);
      if (this.id_usuario != 0){
        this.cargarInfoUsuario();
      }
    });

    this.logLoadTime();  // 👈 mide tiempo de carga

  }

  goHome(): void {
    console.log('Navegando a home-invitado-usuario', this.id_usuario);
    this.router.navigate(['/home-invitado-usuario', this.id_usuario]);
  }



  mostrarAlertaCrearCuenta(): void {
    if (this.id_usuario === 0) {
      Swal.fire({
        icon: 'info',
        title: '¿Ya tienes una cuenta?',
        text: 'Para acceder a esta opción necesitas iniciar sesión o crear una cuenta. ¿Deseas ir a la página de inicio de sesión?',
        showCancelButton: true,
        confirmButtonText: 'Sí, quiero iniciar sesión',
        cancelButtonText: 'No, gracias',
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        background: '#f9f9f9',
        iconColor: '#3085d6'
      }).then((result) => {
        if (result.isConfirmed) {
          this.router.navigate(['/login']);
        }
      });
    } else {
      this.dialog.open(AlertaInfoUsuarioComponent, {
            width: '400px',
            data: { id_usuario: this.id_usuario },
            autoFocus: true // opcional: enfoca al abrir
      });
    }
  }

  toggleMenu(): void {
    console.log('Toggling menu...'); // Para depuración
    const navMenu = document.querySelector('.nav-menu');
    const hamburger = document.querySelector('.hamburger');
    if (navMenu && hamburger) {
      navMenu.classList.toggle('active');
      hamburger.classList.toggle('active');
      console.log('Classes toggled:', navMenu.classList, hamburger.classList); // Para depuración
    } else {
      console.error('No se encontraron los elementos .nav-menu o .hamburger');
    }
  }

  logLoadTime() {
    window.addEventListener('load', () => {
      const [navEntry] = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
      if (navEntry) {
        console.log('⏱️ Tiempo total de carga en navbar invitado usuario (domComplete):', navEntry.domComplete.toFixed(2), 'ms');
        console.log('🧱 Tiempo de render en navbar invitado usuario (domContentLoaded):', navEntry.domContentLoadedEventEnd.toFixed(2), 'ms');
        console.log('🌐 Tiempo de respuesta navbar invitado usuario (responseEnd):', navEntry.responseEnd.toFixed(2), 'ms');
      } else {
        // Fallback para navegadores antiguos
        const timing = performance.timing;
        const totalLoadTime = timing.loadEventEnd - timing.navigationStart;
        console.log('⏱️ Tiempo total de carga (fallback):', totalLoadTime, 'ms');
      }
    });
  }

  cargarInfoUsuario() {
  this.apiService.Service_Get('usuario', this.id_usuario).subscribe(
    (respuesta: any) => {  // 👈 Cast a any aquí, no tocamos el servicio
      if (respuesta.estatus === 1) {
        this.usuario = respuesta.data;
        console.log('✅ Usuario:', this.usuario);
      } else {
        console.warn('⚠️ La API respondió sin éxito:', respuesta);
      }
    },
    error => {
      console.error('❌ Error al obtener usuario:', error);
    }
  );
}

}