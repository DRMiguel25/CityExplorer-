import { Component, OnInit } from '@angular/core';
import { HttpLaravelService } from '../../../../../http.service';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'lista-usuarios',
  standalone: false,
  templateUrl: './lista-usuarios.component.html',
  styleUrls: ['./lista-usuarios.component.scss']
})
export class ListaUsuariosComponent implements OnInit {

  idUsuario: number = 0;

  usuarios: any[] = [];
  usuariosfiltrados: any[] = [];

  totalUsuarios: number = 0;
  usuariosActivos: number = 0; // 👈 aquí guardamos la cuenta de los activos
  usuariosBloqueados: number = 0; // 👈 aquí guardamos la cuenta de los activos

  constructor(
    private httpLaravel: HttpLaravelService,
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.idUsuario = Number(this.route.snapshot.paramMap.get('id_usuario'));

    this.cargarUsuarios();

    this.logLoadTime();
  }

  cargarUsuarios(): void {
    this.httpLaravel.Service_Get_Usuarios_Admin().subscribe({
      next: (respuesta) => {
        this.usuarios = respuesta.data; // 👈 solo la lista de usuarios

        this.usuariosfiltrados = respuesta.data; // 👈 solo la lista de usuarios filtrados

        this.totalUsuarios = respuesta.total; // 👈 total del paginador
        this.usuariosActivos = this.usuarios.filter(u => u.activo === true).length;
        this.usuariosBloqueados = this.usuarios.filter(u => u.bloqueado === true).length;

      },
      error: (error) => {
        console.error('❌ Error al cargar usuarios:', error);
      }
    });
  }

  calcularTiempo(fecha: string): string {
  const ahora = new Date();
  const login = new Date(fecha);
  const diffMs = ahora.getTime() - login.getTime();
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 60) return `Hace ${diffMin} minuto(s)`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `Hace ${diffHr} hora(s)`;
  const diffDias = Math.floor(diffHr / 24);
  return `Hace ${diffDias} día(s)`;
}

filtrarUsuarios(filtro: string): void {
  switch (filtro) {
    case 'active':
      this.usuariosfiltrados = this.usuarios.filter(u => u.activo);
      break;
    case 'blocked':
      this.usuariosfiltrados = this.usuarios.filter(u => u.bloqueado);
      break;
    default:
      this.usuariosfiltrados = [...this.usuarios];
  }
}

buscarUsuarios(event: Event): void {
  const input = event.target as HTMLInputElement;
  const termino = input.value.toLowerCase().trim();

  this.usuariosfiltrados = this.usuarios.filter(usuario => {
    const nombreCompleto = `${usuario.nombre} ${usuario.apellidoP} ${usuario.apellidoM}`.toLowerCase();
    const correo = usuario.correo.toLowerCase();

    return (
      nombreCompleto.includes(termino) ||
      correo.includes(termino)
    );
  });
}

bloquearDesbloquearUsuario(usuario: any): void {
  this.httpLaravel.toggleEstadoUsuario(usuario.id_usuario).subscribe({
    next: (response) => {

      // Alternar el estado localmente para reflejar el cambio
      usuario.bloqueado = !usuario.bloqueado;
      this.cargarUsuarios();
    },
    error: (error) => {
      console.error('❌ Error al cambiar el estado del usuario:', error);
    }
  });
}

goBack(){
  this.router.navigate([`/home-administrador`,this.idUsuario]);
}

logLoadTime() {
    window.addEventListener('load', () => {
      const [navEntry] = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
      if (navEntry) {
        console.log('⏱️ Tiempo total de carga en lista usuarios (domComplete):', navEntry.domComplete.toFixed(2), 'ms');
        console.log('🧱 Tiempo de render en lista usuarios (domContentLoaded):', navEntry.domContentLoadedEventEnd.toFixed(2), 'ms');
        console.log('🌐 Tiempo de respuesta lista usuarios (responseEnd):', navEntry.responseEnd.toFixed(2), 'ms');
      } else {
        // Fallback para navegadores antiguos
        const timing = performance.timing;
        const totalLoadTime = timing.loadEventEnd - timing.navigationStart;
        console.log('⏱️ Tiempo total de carga (fallback):', totalLoadTime, 'ms');
      }
    });
  }
}
