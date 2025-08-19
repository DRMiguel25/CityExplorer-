import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpLaravelService } from "../../../../../http.service";
import { Lugar } from './lugar.interface';
import { ActivatedRoute } from '@angular/router';
import Swal from 'sweetalert2';

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
  idFiltrado: number = 0;

  imagenesPorLugar: { [idLugar: number]: any[] } = {};
  imagenActualIndexPorLugar: { [idLugar: number]: number } = {};

  filtroActivo: 'todos' | 'pagados' | 'noPagados' | 'ayuda' = 'todos';
  botonActivo: string = 'todos'; // Puedes iniciar con 'todos', 'pagados' o 'nopagados'
  
  todosLosLugares: Lugar[] = []; // <-- Aquí guardamos la data original


  usuario: any;

  // Sidebar control
  sidebarAbierto = true;

  constructor(
    private router: Router,
    private httpLaravelService: HttpLaravelService,
    private route: ActivatedRoute
  ) {}
irAEstadisticas() {
  this.router.navigate(['/estadisticas', this.idUsuario]);
}
  ngOnInit(): void {
    this.idUsuario = Number(this.route.snapshot.paramMap.get('id_usuario'));
    this.idFiltrado = Number(this.route.snapshot.paramMap.get('id_filtrado'));

    console.log("tipo de filtrado: "+this.idFiltrado);

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

        // 🧠 Aplica el filtro que vino en la URL
        if (this.idFiltrado === 1) {
          this.mostrarPagados();
        } else if (this.idFiltrado === 2) {
          this.mostrarNoPagados();
        } else {
          this.mostrarTodos();
        }

        // Cargar imágenes solo para los lugares mostrados
        this.lugares.forEach(lugar => this.cargarImagenesLugar(lugar));
        this.isLoading = false;
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

  cerrarSesion(): void {
    console.log('Intentando cerrar sesión...');
  
    this.httpLaravelService.Service_Cerrar_seccion().subscribe({
      next: (resp: any) => {
        console.log('✅ Sesión cerrada correctamente:', resp);
        // Navegar a login y cerrar diálogo
        this.router.navigate(['/login'])
      },
      error: (err) => {
        console.error('❌ Error al cerrar sesión:', err);
        // Opcional: mostrar alerta al usuario
        Swal.fire('Error', 'No se pudo cerrar sesión, intenta de nuevo.', 'error');
      }
    });
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
  this.lugares = [...this.todosLosLugares];
  this.botonActivo = 'todos';
  console.log('🌐 Mostrando todos los anuncios:', this.lugares);
}

mostrarPagados(): void {
  this.lugares = this.todosLosLugares.filter(lugar => lugar.activo);
  this.botonActivo = 'pagados';
  console.log('💰 Mostrando anuncios pagados:', this.lugares);
}

mostrarNoPagados(): void {
  this.lugares = this.todosLosLugares.filter(lugar => !lugar.activo);
  this.botonActivo = 'nopagados';
  console.log('❌ Mostrando anuncios no pagados:', this.lugares);
}

irAyuda(){
  this.router.navigate(['/ayuda-anunciante', this.idUsuario]);
}

AlertaModificarCuenta(){
  this.router.navigate(['/modificar-info-usuario', this.idUsuario, 1]);
}

}
  