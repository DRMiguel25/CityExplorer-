import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpLaravelService } from '../../../../http.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'favoritos-usuarios',
  standalone: false,
  templateUrl: './favoritos-usuarios.component.html',
  styleUrls: ['./favoritos-usuarios.component.scss']
})
export class FavoritosUsuariosComponent implements OnInit {
  id_usuario: string | null = null;

  favoritos: any[] = [];
  favoritosFiltrados: any[] = [];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private httpLaravelService: HttpLaravelService
  ) {}

  ngOnInit(): void {
    this.id_usuario = this.route.snapshot.paramMap.get('id_usuario');
    console.log('ID de usuario:', this.id_usuario);

    if (this.id_usuario) {
      this.obtenerFavoritos();
    }

    this.logLoadTime();  // 👈 mide tiempo de carga

  }

  obtenerFavoritos(): void {
    this.httpLaravelService.Service_Get('favoritos', '').subscribe({
      next: (respuesta: any) => {
        this.favoritos = respuesta.data || [];

        // 🔍 Filtrar solo los del usuario actual
        this.favoritosFiltrados = this.favoritos.filter(fav =>
          fav.id_usuario == this.id_usuario
        );

        console.log('✅ Favoritos filtrados:', this.favoritosFiltrados);
      },
      error: (error) => {
        console.error('❌ Error al obtener los favoritos:', error);
        Swal.fire('Error', 'No se pudieron cargar los favoritos. Intenta más tarde.', 'error');
      }
    });
  }

  toggleFavorito(id_lugar: number): void {
    const body = { id_lugar };
    this.httpLaravelService.Service_Post('favoritos', 'toggle', body).subscribe({
      next: (respuesta) => {
        Swal.fire({
          icon: 'success',
          title: respuesta.message,
          timer: 1500,
          showConfirmButton: false
        });
        // Recargar lista para actualizar el estado
        this.obtenerFavoritos();
      },
      error: (error) => {
        console.error('❌ Error al alternar favorito:', error);
        Swal.fire('Error', 'No se pudo actualizar el estado del favorito.', 'error');
      }
    });
  }

  vistaDetalladaDestino(id: number | string): void {
  console.log('ID del destino:', id);
  const idEntero = parseInt(id.toString(), 10);

  if (isNaN(idEntero)) {
    console.error('ID inválido:', id);
    return;
  }

  this.router.navigate(['/vista-detallada-destino', idEntero, this.id_usuario]);
}

logLoadTime() {
  window.addEventListener('load', () => {
    const [navEntry] = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
    if (navEntry) {
      console.log('⏱️ Tiempo total de carga en favoritos usuarios (domComplete):', navEntry.domComplete.toFixed(2), 'ms');
      console.log('🧱 Tiempo de render en favoritos usuarios (domContentLoaded):', navEntry.domContentLoadedEventEnd.toFixed(2), 'ms');
      console.log('🌐 Tiempo de respuesta favoritos usuarios (responseEnd):', navEntry.responseEnd.toFixed(2), 'ms');
    } else {
      // Fallback para navegadores antiguos
      const timing = performance.timing;
      const totalLoadTime = timing.loadEventEnd - timing.navigationStart;
      console.log('⏱️ Tiempo total de carga (fallback):', totalLoadTime, 'ms');
    }
  });
}

}
