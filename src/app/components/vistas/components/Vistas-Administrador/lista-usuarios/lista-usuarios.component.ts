import { Component, OnInit } from '@angular/core';
import { HttpLaravelService } from '../../../../../http.service';

@Component({
  selector: 'lista-usuarios',
  standalone: false,
  templateUrl: './lista-usuarios.component.html',
  styleUrls: ['./lista-usuarios.component.scss']
})
export class ListaUsuariosComponent implements OnInit {
  usuarios: any[] = [];
  usuariosfiltrados: any[] = [];

  totalUsuarios: number = 0;
  usuariosActivos: number = 0; // 👈 aquí guardamos la cuenta de los activos
  usuariosBloqueados: number = 0; // 👈 aquí guardamos la cuenta de los activos

  constructor(private httpLaravel: HttpLaravelService) {}

  ngOnInit(): void {
    this.cargarUsuarios();
  }

  cargarUsuarios(): void {
    this.httpLaravel.Service_Get_Usuarios_Admin().subscribe({
      next: (respuesta) => {
        console.log('📦 Usuarios recibidos:', respuesta);
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
      console.log('✅ Usuario actualizado:', response);

      // Alternar el estado localmente para reflejar el cambio
      usuario.bloqueado = !usuario.bloqueado;
      this.cargarUsuarios();
    },
    error: (error) => {
      console.error('❌ Error al cambiar el estado del usuario:', error);
    }
  });
}

}
