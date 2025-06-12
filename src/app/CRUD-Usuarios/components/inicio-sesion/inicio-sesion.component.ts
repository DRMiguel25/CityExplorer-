import { LocalstorageService } from '../../../localstorage.service';
import { HttpLaravelService } from "../../../http.service";
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { AuthService } from '../../../auth.service';


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
    private authService: AuthService  // ← Aquí
  ) {
    this.InicioSesionFormulario = this.fb.group({
      correo: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
    });

    // Solo limpiar si no hay sesión activa
    if (!this.localStorage.getItem('accessToken')) {
      this.localStorage.clean();
    }
  }

  ngOnInit(): void {
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

  this.service.Service_Post('user', 'login', this.InicioSesionFormulario.value).subscribe({
    next: (data: any) => {
      if (data.estatus) {
        localStorage.setItem('access_token', data.access_token);
        console.log('✅ access token:', data.access_token);

        const userId = data.data?.id_usuario;
        const rolId = data.data?.id_rol;  // Asegúrate que este campo venga en la respuesta

        if (!userId || !rolId) {
          console.warn('⚠️ No se recibieron id_usuario o id_rol en la respuesta');
          return;
        }

        switch (rolId) {
          case 1: // Usuario
            this.router.navigate([`/home-invitado-usuario/${userId}`]);
            break;
          case 2: // Anunciante
            this.router.navigate([`/home-anunciante/${userId}`]);
            break;
          case 3: // Administrador
            this.router.navigate([`/home-administrador/${userId}`]);
            break;
          default:
            console.warn('⚠️ Rol desconocido, redirigiendo a login');
            this.router.navigate(['/login']);
            break;
        }
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error en el inicio de sesión',
          text: data.mensaje || 'Credenciales incorrectas',
          showConfirmButton: true,
        });
      }
    },
    error: (error) => {
      Swal.fire({
        icon: 'error',
        title: 'Error de conexión',
        text: 'No se pudo conectar con el servidor',
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

  mostrarAlertaOlvido() {
    Swal.fire({
      icon: 'info',
      title: 'Función no disponible',
      text: 'Esta función estará disponible en una futura versión. ¡Gracias por tu paciencia!',
      footer: '<i>Estamos trabajando en ello</i>',
      confirmButtonText: 'Entendido',
      confirmButtonColor: '#3085d6'
    });
  }
  
}