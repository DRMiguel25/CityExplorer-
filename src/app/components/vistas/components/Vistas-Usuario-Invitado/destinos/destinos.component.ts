import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpLaravelService } from '../../../../../http.service';
import { Lugar } from '../../Vistas-Anuciante/home-anunciante/lugar.interface';
import { ActivatedRoute, Router } from '@angular/router';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'destino-vista',
  standalone: false,
  templateUrl: './destinos.component.html',
  styleUrls: ['./destinos.component.scss']
})
export class DestinosVistaComponent implements OnInit, OnDestroy {
  lugares: Lugar[] = [];
  imagenesPorLugar: { [idLugar: number]: any[] } = {};
  imagenActualIndexPorLugar: { [idLugar: number]: number } = {};

  listaCategorias: any[] = [];

  private slideshowInterval: any;

  id_usuario: string | null = null;

  listaComentarios: any[] = [];
  promedioValoracionPorLugar: { [idLugar: number]: number } = {};

  filtroEstrellas: number | null = null;

  searchTerm: string = '';

  images = [
    'https://a.travel-assets.com/findyours-php/viewfinder/images/res60/200000/200753-Guanajuato.jpg',
    'https://a.travel-assets.com/findyours-php/viewfinder/images/res60/201000/201316-El-Charco-Del-Ingenio.jpg',
    'https://a.travel-assets.com/findyours-php/viewfinder/images/res60/200000/200736-Guanajuato.jpg',
    'https://a.travel-assets.com/findyours-php/viewfinder/images/res60/201000/201398-Juarez-Park.jpg'
  ];

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private router: Router,
    private route: ActivatedRoute,
    private httpLaravelService: HttpLaravelService,
    private cdRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.id_usuario = this.route.snapshot.paramMap.get('id_usuario');
    console.log('ID del usuario:', this.id_usuario);

    this.obtenerCategoriasDesdeAPI();
    this.loadLugares();

    if (isPlatformBrowser(this.platformId)) {
      this.initBackgroundChange();
    }

    this.logLoadTime();
  }

  ngOnDestroy(): void {
    if (this.slideshowInterval) {
      clearInterval(this.slideshowInterval);
    }
  }

  vistaDetalladaDestino(id: number | string) {
    const idEntero = parseInt(id.toString(), 10);
    if (isNaN(idEntero)) {
      console.error('ID inválido:', id);
      return;
    }
    this.router.navigate(['/vista-detallada-destino', idEntero, this.id_usuario]);
  }

  private initBackgroundChange(): void {
    const slideshow = document.querySelector('.background-slideshow') as HTMLElement;

    if (slideshow) {
      let index = 0;
      slideshow.style.backgroundImage = `url('${this.images[index]}')`;
      slideshow.style.opacity = '1';

      setTimeout(() => {
        this.slideshowInterval = setInterval(() => {
          slideshow.style.opacity = '0';
          setTimeout(() => {
            index = (index + 1) % this.images.length;
            slideshow.style.backgroundImage = `url('${this.images[index]}')`;
            setTimeout(() => {
              slideshow.style.opacity = '1';
            }, 50);
          }, 500);
        }, 8000);
      }, 2000);
    } else {
      console.warn('Elemento de slideshow no encontrado.');
    }
  }

  logLoadTime() {
    window.addEventListener('load', () => {
      const [navEntry] = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
      if (navEntry) {
        console.log('⏱️ Tiempo total de carga:', navEntry.domComplete.toFixed(2), 'ms');
      } else {
        const timing = performance.timing;
        const totalLoadTime = timing.loadEventEnd - timing.navigationStart;
        console.log('⏱️ Tiempo total de carga (fallback):', totalLoadTime, 'ms');
      }
    });
  }

  loadLugares(): void {
    this.httpLaravelService.Service_Get('lugar', '').subscribe({
      next: (data: Lugar[]) => {
        this.lugares = data.filter(lugar => lugar.activo === true);
        console.log('✅ Lugares activos:', this.lugares);

        this.lugares.forEach(lugar => {
          this.cargarImagenesLugar(lugar);
          this.obtenerComentarios(lugar.id_lugar);
        });
      },
      error: (error) => {
        console.error('❌ Error al cargar lugares:', error);
      }
    });
  }

  cargarImagenesLugar(lugar: Lugar): void {
    this.httpLaravelService.Service_GetImagenes(lugar.id_lugar).subscribe({
      next: (imagenes: any[]) => {
        if (imagenes && imagenes.length > 0) {
          this.imagenesPorLugar[lugar.id_lugar] = imagenes;
          this.imagenActualIndexPorLugar[lugar.id_lugar] = 0;
          lugar.url = imagenes[0].url;
        } else {
          lugar.url = 'assets/img/placeholder.png';
        }
      },
      error: (error) => {
        console.error(`❌ Error cargando imágenes para lugar ${lugar.id_lugar}:`, error);
        lugar.url = 'assets/img/placeholder.png';
      }
    });
  }

  cambiarImagen(lugar: Lugar, direccion: number): void {
    const id = lugar.id_lugar;
    const imgs = this.imagenesPorLugar[id];
    if (!imgs || imgs.length === 0) return;

    let index = this.imagenActualIndexPorLugar[id] ?? 0;
    const total = imgs.length;

    index = (index + direccion + total) % total;
    this.imagenActualIndexPorLugar[id] = index;
    lugar.url = imgs[index].url;
  }

  obtenerCategoriasDesdeAPI(): void {
    this.httpLaravelService.Service_Get('categorias', '').subscribe({
      next: (resp: any) => {
        this.listaCategorias = resp.data;
        console.log('📦 Categorías:', this.listaCategorias);
      },
      error: (error) => {
        console.error('❌ Error al obtener categorías:', error);
      }
    });
  }

  getNombreCategoria(idCategoria: number): string {
    const categoria = this.listaCategorias.find(cat => cat.id_categoria === idCategoria);
    return categoria ? categoria.nombre : 'Sin Categoría';
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

  setFiltroEstrellas(estrellas: number | null): void {
    this.filtroEstrellas = estrellas;
  }

getLugaresFiltrados(): Lugar[] {
  let lugaresFiltrados = this.lugares;

  // Filtrar por estrellas si aplica
  if (this.filtroEstrellas !== null) {
    lugaresFiltrados = lugaresFiltrados.filter(lugar => 
      Math.round(this.promedioValoracionPorLugar[lugar.id_lugar] ?? 0) === this.filtroEstrellas
    );
  }

  // Filtrar por el texto de búsqueda en el nombre del lugar
  if (this.searchTerm.trim() !== '') {
    const term = this.searchTerm.toLowerCase();
    lugaresFiltrados = lugaresFiltrados.filter(lugar =>
      lugar.nombre.toLowerCase().includes(term)
    );
  }

  return lugaresFiltrados;
}
}
