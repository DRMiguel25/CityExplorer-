import { LocalstorageService } from '../../../../localstorage.service';
import { HttpLaravelService } from "../../../../http.service";
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { AuthService } from '../../../../auth.service';


import Swal from 'sweetalert2';

@Component({
  selector: 'app-inicio-sesion',
  standalone: false,
  templateUrl: './inicio-sesion.component.html',
  styleUrls: ['./inicio-sesion.component.scss'],
})
export class InicioSesionComponent implements OnInit {

  InicioSesionFormulario: FormGroup;
  listaUsuarios: any[] = [];  // 👈 Aquí se guardará la lista

  constructor(
    private fb: FormBuilder,
    private service: HttpLaravelService,
    private router: Router,
    private localStorage: LocalstorageService,
  ) {
    this.InicioSesionFormulario = this.fb.group({
      correo: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });


    // Solo limpiar si no hay sesión activa
    if (!this.localStorage.getItem('accessToken')) {
      this.localStorage.clean();
    }
  }

  ngOnInit(): void {

    this.logLoadTime();  // 👈 mide tiempo de carga

    this.service.Service_Get('usuarios', '').subscribe({
      next: (usuarios) => {
        this.listaUsuarios = usuarios;  // 👈 Guarda los usuarios en la variable global
        console.log('📦 Lista de usuarios:', this.listaUsuarios);
      },
      error: (err) => {
        console.error('❌ Error al obtener usuarios públicos:', err);
      }
    });
  }
  
onLoggedin() {
  if (this.InicioSesionFormulario.invalid) {
    this.InicioSesionFormulario.markAllAsTouched();
    return;
  }

  const startTime = Date.now();  // ⏱️ inicio del request

  this.service.Service_Post('user', 'login', this.InicioSesionFormulario.value).subscribe({
    next: (data: any) => {
      const duration = Date.now() - startTime;  // ⏱️ fin
      console.log('⚡ Tiempo de respuesta login:', duration, 'ms');

      if (data.estatus) {
        localStorage.setItem('access_token', data.access_token);
        console.log('✅ access token:', data.access_token);

        const userId = data.data?.id_usuario;
        const rolId = data.data?.id_rol;

        if (!userId || !rolId) {
          console.warn('⚠️ No se recibieron id_usuario o id_rol en la respuesta');
          return;
        }

        switch (rolId) {
          case 1:
            this.router.navigate([`/home-invitado-usuario/${userId}`]);
            break;
          case 2:
            this.router.navigate([`/home-anunciante/${userId}`]);
            break;
          case 3:
            this.router.navigate([`/home-administrador/${userId}`]);
            break;
          default:
            console.warn('⚠️ Rol desconocido, redirigiendo a login');
            this.router.navigate(['/login']);
            break;
        }
      }
    },
    error: (error) => {
      const duration = Date.now() - startTime;
      console.warn('⚠️ Tiempo fallido de respuesta login:', duration, 'ms');

      Swal.fire({
        icon: 'error',
        title: 'Error al inicio de sesión',
        text: 'Credenciales incorrectas',
        showConfirmButton: true,
      });
    }
  });
}



  isValid(field: string): boolean {
    return !!this.InicioSesionFormulario.get(field)?.invalid && !!this.InicioSesionFormulario.get(field)?.touched;
  }

  get f() {
    return this.InicioSesionFormulario.controls;
  }

  limpiarFormulario() {
    this.InicioSesionFormulario.reset({ correo: '', password: '' });
  }

  login() {
    console.log('inicio');
    this.router.navigate(['/login']);  // Redirige a la ruta de inicio-sesion
  }

  Restablecer() {
    console.log('restablecer contraseña');
    this.router.navigate(['/restablecer-contraseña']);  // Redirige a la ruta de restablecer-contraseña
  }
  
  logLoadTime() {
    window.addEventListener('load', () => {
      const [navEntry] = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
      if (navEntry) {
        console.log('⏱️ Tiempo total de carga en inicio de sesion (domComplete):', navEntry.domComplete.toFixed(2), 'ms');
        console.log('🧱 Tiempo de render en inicio de sesion (domContentLoaded):', navEntry.domContentLoadedEventEnd.toFixed(2), 'ms');
        console.log('🌐 Tiempo de respuesta inicial en inicio de sesion (responseEnd):', navEntry.responseEnd.toFixed(2), 'ms');
      } else {
        // Fallback para navegadores antiguos
        const timing = performance.timing;
        const totalLoadTime = timing.loadEventEnd - timing.navigationStart;
        console.log('⏱️ Tiempo total de carga (fallback):', totalLoadTime, 'ms');
      }
    });
  }

  logError(msg: string): boolean {
    console.log(msg);
    return true; // Para que el *ngIf no se rompa
  }

}