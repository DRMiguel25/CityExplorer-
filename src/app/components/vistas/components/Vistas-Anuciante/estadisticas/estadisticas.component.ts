import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpLaravelService } from "../../../../../http.service";
import { Lugar } from './lugar.interface';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'estadisticas',
  standalone: false,
  templateUrl: 'estadisticas.component.html',
  styleUrls: ['./estadisticas.component.scss']
})
export class estadisticasComponent implements OnInit {
  lugares: Lugar[] = [];
  isLoading = true;
  errorMessage = '';
  idUsuario: number = 0;

  imagenesPorLugar: { [idLugar: number]: any[] } = {};
  imagenActualIndexPorLugar: { [idLugar: number]: number } = {};

  filtroActivo: 'estadisticas' | 'pagados' | 'noPagados' = 'estadisticas';
  botonActivo: string = 'estadisticas'; // Puedes iniciar con 'todos', 'pagados' o 'nopagados'
  
  todosLosLugares: Lugar[] = []; // <-- Aquí guardamos la data original


  usuario: any;

  // Sidebar control
  sidebarAbierto = true;

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
    this.cargarInfoUsuario(this.idUsuario);
  }

  toggleSidebar(): void {
    this.sidebarAbierto = !this.sidebarAbierto;
  }

  loadLugares(): void {
    console.log('🔄 Iniciando carga de lugares...');
    this.httpLaravelService.Service_Get('lugar', '').subscribe(
      (data: Lugar[]) => {
        console.log('📦 Datos recibidos desde el backend:', data);
        
        const filtrados = data.filter(lugar => lugar.id_usuario === this.idUsuario);
        this.todosLosLugares = filtrados;
        this.lugares = [...filtrados]; // Usamos spread para evitar mutar la referencia

        this.lugares.forEach(lugar => this.cargarImagenesLugar(lugar));
        this.isLoading = false;
        console.log('✅ Lugares filtrados para el usuario:', this.lugares);
      },
      (error) => {
        this.isLoading = false;
        this.errorMessage = 'Error al cargar los lugares, por favor intente nuevamente.';
        console.error('❌ Error al cargar los lugares:', error);
      }
    );
  }



  crearAnuncio() {
    console.log('/crear-actualizar-anuncio', this.idUsuario)
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
          lugar.url = imagenes[0].url;
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

cargarInfoUsuario(idUsuario: Number) {
  this.httpLaravelService.Service_Get('usuario', this.idUsuario).subscribe(
    (respuesta: any) => {
      if (respuesta.estatus === 1) {
        this.usuario = respuesta.data;
        console.log('✅ Usuario:', this.usuario);
      }
    }
  );
}

mostrarTodos(): void {
    this.router.navigate(['home-anunciante', this.idUsuario]);
}

mostrarPagados(): void {
    this.router.navigate(['home-anunciante', this.idUsuario, 1]);
}

mostrarNoPagados(): void {
    this.router.navigate(['home-anunciante', this.idUsuario, 2]);
}


AlertaModificarCuenta(){
  this.router.navigate(['/modificar-info-usuario', this.idUsuario, 1]);
}

}
  