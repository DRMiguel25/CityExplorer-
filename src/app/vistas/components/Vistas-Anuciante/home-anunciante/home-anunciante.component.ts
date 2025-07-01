import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpLaravelService } from "../../../../http.service";
import { Lugar } from './lugar.interface';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'home-anunciante',
  standalone: false,
  templateUrl: './home-anunciante.component.html',
  styleUrls: ['./home-anunciante.component.scss']
})
export class HomeAnuncianteComponent implements OnInit {
  lugares: Lugar[] = [];
  isLoading = true;
  errorMessage = '';
  idUsuario: number = 0;

  // Nuevo: para manejar imágenes por lugar
  imagenesPorLugar: { [idLugar: number]: any[] } = {};
  imagenActualIndexPorLugar: { [idLugar: number]: number } = {};

  constructor(
    private router: Router,
    private httpLaravelService: HttpLaravelService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.idUsuario = Number(this.route.snapshot.paramMap.get('id_usuario'));
    if (isNaN(this.idUsuario)) {
      console.error('ID de usuario inválido en la URL');
      return;
    }
    this.loadLugares();
    this.logLoadTime();
  }
  
loadLugares(): void {
  this.httpLaravelService.Service_Get('lugar', '').subscribe(
    (data: Lugar[]) => {
      console.log('📍 Data de lugares recibida:', data);

      this.lugares = data.filter(lugar => lugar.id_usuario === this.idUsuario);

      console.log('✅ Lugares filtrados por usuario:', this.lugares);

      // Cargar imágenes para cada lugar
      this.lugares.forEach(lugar => {
        this.cargarImagenesLugar(lugar);
      });

      this.isLoading = false;
    },
    (error) => {
      this.isLoading = false;
      this.errorMessage = 'Error al cargar los lugares, por favor intente nuevamente.';
      console.error('❌ Error en Service_Get(lugar):', error);
    }
  );
}

  crearAnuncio() {
    this.router.navigate(['/crear-actualizar-anuncio', this.idUsuario]);
  }

  cerrarSesion() {
    this.router.navigate(['/login']);
  }

  vistaDetalladaAnuncio(id: number | string) {
    const idEntero = parseInt(id.toString(), 10);
  
    if (isNaN(idEntero)) {
      console.error('ID inválido:', id);
      return;
    }
  
    this.router.navigate(['/vista-detallada-anuncio', idEntero, this.idUsuario]);
  }

  logLoadTime() {
  window.addEventListener('load', () => {
    const [navEntry] = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
    if (navEntry) {
      console.log('⏱️ Tiempo total de carga en home anunciante (domComplete):', navEntry.domComplete.toFixed(2), 'ms');
      console.log('🧱 Tiempo de render en home anunciante (domContentLoaded):', navEntry.domContentLoadedEventEnd.toFixed(2), 'ms');
      console.log('🌐 Tiempo de respuesta home anunciante (responseEnd):', navEntry.responseEnd.toFixed(2), 'ms');
    } else {
      // Fallback para navegadores antiguos
      const timing = performance.timing;
      const totalLoadTime = timing.loadEventEnd - timing.navigationStart;
      console.log('⏱️ Tiempo total de carga (fallback):', totalLoadTime, 'ms');
    }
  });
}


  cargarImagenesLugar(lugar: Lugar): void {
    this.httpLaravelService.Service_GetImagenes(lugar.id_lugar).subscribe({
      next: (imagenes: any[]) => {
        if (imagenes && imagenes.length > 0) {
          this.imagenesPorLugar[lugar.id_lugar] = imagenes;
          this.imagenActualIndexPorLugar[lugar.id_lugar] = 0;
          lugar.url = imagenes[0].url; // muestra la primera imagen por defecto
        } else {
          lugar.url = 'assets/img/placeholder.png';
        }
      },
      error: (error) => {
        console.error(`Error cargando imágenes para lugar ${lugar.id_lugar}`, error);
        lugar.url = 'assets/img/placeholder.png';
      }
    });
  }

  cambiarImagen(lugar: Lugar, direccion: number) {
    const id = lugar.id_lugar;
    const imgs = this.imagenesPorLugar[id];
    if (!imgs || imgs.length === 0) return;

    let currentIndex = this.imagenActualIndexPorLugar[id] ?? 0;
    const total = imgs.length;

    currentIndex = (currentIndex + direccion + total) % total;
    this.imagenActualIndexPorLugar[id] = currentIndex;
    lugar.url = imgs[currentIndex].url;
  }

}
