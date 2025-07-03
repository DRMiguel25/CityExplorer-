import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpLaravelService } from '../../../../http.service';
import Swal from 'sweetalert2';
import { ChangeDetectorRef } from '@angular/core';

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

  imagenesPorLugar: { [key: number]: string[] } = {};
  indicesImagen: { [key: number]: number } = {};

  listaComentarios: any[] = [];
  promedioValoracionPorLugar: { [idLugar: number]: number } = {};

  listaCategorias: any[] = [];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private httpLaravelService: HttpLaravelService,
    private cdRef: ChangeDetectorRef
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

        this.favoritosFiltrados.forEach(fav => {
          this.cargarImagenesPorLugar(fav.lugar.id_lugar);
          this.obtenerComentarios(fav.lugar.id_lugar);  // <-- Aquí cargas las estrellas ⭐
        });

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

cargarImagenesPorLugar(idLugar: number): void {
  if (this.imagenesPorLugar[idLugar]) return;  // Ya cargado

  this.httpLaravelService.Service_GetImagenes(idLugar).subscribe({
    next: (data) => {
      console.log(`🖼️ Imágenes crudas para lugar ${idLugar}:`, data);
      // Extraemos solo la URL de cada objeto
      this.imagenesPorLugar[idLugar] = data.map(imgObj => imgObj.url);
      this.indicesImagen[idLugar] = 0;
    },
    error: (error) => {
      console.error(`❌ Error al cargar imágenes del lugar ${idLugar}:`, error);
      this.imagenesPorLugar[idLugar] = [];
      this.indicesImagen[idLugar] = 0;
    }
  });
}

cambiarImagen(idLugar: number, direccion: number): void {
  const imagenes = this.imagenesPorLugar[idLugar];
  if (!imagenes || imagenes.length === 0) return;

  const total = imagenes.length;
  let actual = this.indicesImagen[idLugar] ?? 0;

  actual = (actual + direccion + total) % total;
  this.indicesImagen[idLugar] = actual;
}

  obtenerComentarios(idLugar: number): void {
    const modelo = 'lugar';
    const dato = `${idLugar}/comentarios`;

    this.httpLaravelService.Service_Get(modelo, dato).subscribe({
      next: (respuesta: any) => {
        const comentarios = respuesta?.data || [];
        let promedio = 0;

        if (Array.isArray(comentarios) && comentarios.length > 0) {
          const suma = comentarios.reduce((acc, c) => acc + (c.valoracion || 0), 0);
          promedio = +(suma / comentarios.length).toFixed(1);
        }

        this.promedioValoracionPorLugar[idLugar] = promedio;
        this.cdRef.detectChanges();
      },
      error: (error) => {
        console.error('❌ Error obteniendo comentarios del lugar:', error);
        this.promedioValoracionPorLugar[idLugar] = 0;
      }
    });
  }

  getEstrellasVisuales(idLugar: number): string[] {
    const promedio = this.promedioValoracionPorLugar[idLugar] || 0;
    const estrellas: string[] = [];

    for (let i = 1; i <= 5; i++) {
      if (promedio >= i) {
        estrellas.push('fas fa-star');
      } else if (promedio >= i - 0.5) {
        estrellas.push('fas fa-star-half-alt');
      } else {
        estrellas.push('far fa-star');
      }
    }

    return estrellas;
  }


}