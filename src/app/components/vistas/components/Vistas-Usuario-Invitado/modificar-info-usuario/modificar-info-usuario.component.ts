import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpLaravelService } from '../../../../../http.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'modificar-info-usuario',
  standalone: false,
  templateUrl: './modificar-info-usuario.component.html',
  styleUrls: ['./modificar-info-usuario.component.scss']
})
export class ModificarInfoUsuarioComponent implements OnInit {

  usuario: any = { data: {} };
  ID: number = 0;

  constructor(
    private route: ActivatedRoute,
    private httpLaravelService: HttpLaravelService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id_usuario');
    const idNum = Number(id);
    if (!isNaN(idNum) && idNum !== 0) {
      this.ID = idNum;
      this.cargarUsuario(this.ID);
    } else {
      console.error('ID de usuario no válido:', idNum);
    }

    this.logLoadTime();  // 👈 mide tiempo de carga

  }

  cargarUsuario(id: number): void {
    this.httpLaravelService.Service_Get('usuario', id).subscribe(
      respuesta => {
        this.usuario = respuesta;
        console.log('Datos del usuario:', this.usuario);
      },
      error => {
        console.error('Error al obtener usuario:', error);
      }
    );
  }

  guardarPerfil(): void {
    const formData = new FormData();

    formData.append('nombre', this.usuario.data.nombre);
    formData.append('apellidoP', this.usuario.data.apellidoP);
    formData.append('apellidoM', this.usuario.data.apellidoM);
    formData.append('correo', this.usuario.data.correo);

    if (this.usuario.data.password) {
      formData.append('password', this.usuario.data.password);
    }

    formData.append('id_rol', this.usuario.data.id_rol?.toString() || '1');

    if (this.usuario.foto) {
      formData.append('foto_perfil', this.usuario.foto);
    }

    this.httpLaravelService
      .Service_Post('usuario', `${this.ID}/update`, formData)
      .subscribe({
        next: () => {
          Swal.close();
          Swal.fire({
            icon: 'success',
            title: 'Usuario actualizado',
            text: 'Usuario actualizado correctamente...',
            confirmButtonText: 'Aceptar'
          }).then(() => {
            this.router.navigate(['/home-invitado-usuario', this.ID]);
          });
          console.log('Perfil actualizado correctamente');
        },
        error: (error) => {
          console.error('Error al actualizar perfil:', error);
          Swal.close();
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Hubo un problema al actualizar el perfil',
            confirmButtonText: 'Aceptar'
          });
        }
      });
  }

  cancelar(): void {
    this.router.navigate(['/home-invitado-usuario', this.ID]);
  }

  seleccionarFoto(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.usuario.foto = file;
      console.log('Foto seleccionada:', file);
    }
  }

  logLoadTime() {
  window.addEventListener('load', () => {
    const [navEntry] = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
    if (navEntry) {
      console.log('⏱️ Tiempo total de carga en modificar informacion usuario (domComplete):', navEntry.domComplete.toFixed(2), 'ms');
      console.log('🧱 Tiempo de render en modificar informacion usuario (domContentLoaded):', navEntry.domContentLoadedEventEnd.toFixed(2), 'ms');
      console.log('🌐 Tiempo de respuesta modificar informacion usuario (responseEnd):', navEntry.responseEnd.toFixed(2), 'ms');
    } else {
      // Fallback para navegadores antiguos
      const timing = performance.timing;
      const totalLoadTime = timing.loadEventEnd - timing.navigationStart;
      console.log('⏱️ Tiempo total de carga (fallback):', totalLoadTime, 'ms');
    }
  });
}

}
