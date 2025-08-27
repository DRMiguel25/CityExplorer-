import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpLaravelService } from '../../../../../http.service';
import { AuthService } from '../../../../../auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'vista-detallada-anuncio',
  standalone: false,
  templateUrl: './vista-detallada-anuncio.component.html',
  styleUrls: ['./vista-detallada-anuncio.component.scss']
})
export class VistaDetalladaAnuncioComponent implements OnInit {
  lugar: any;
  direccion: any;
  isLoading = true;

  id_anuncio: number | null = null;
  id_usuario: string | null = null;

  imagenes: any[] = [];
  currentImageIndex: number = 0;

  categoriasOpciones: any[] = [];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private httpLaravelService: HttpLaravelService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.id_usuario = this.route.snapshot.paramMap.get('id_usuario');
    const id = this.route.snapshot.paramMap.get('id_anuncio');

    if (id) {
      this.id_anuncio = +id;
      this.obtenerLugar(+id);
      this.obtenerImagenes(this.id_anuncio);
    }

    this.obtenerCategoriasDesdeAPI();
    this.logLoadTime();
  }

  obtenerLugar(id: number): void {
    this.httpLaravelService.Service_Get(`lugar/${id}`, '').subscribe(
      (data) => {
        this.lugar = data;
        this.isLoading = false;
        this.obtenerDireccion(this.lugar.id_direccion);
      },
      (error) => {
        console.error('Error al cargar el lugar:', error);
        this.isLoading = false;
      }
    );
  }

  obtenerDireccion(idDireccion: number): void {
    this.httpLaravelService.Service_Get(`direccion/${idDireccion}`, '').subscribe(
      (data) => {
        this.direccion = data;
      },
      (error) => {
        console.error('Error al cargar la dirección:', error);
      }
    );
  }

  goBack() {
    if (!this.id_usuario) {
      console.error('ID de usuario no disponible');
      return;
    }
    this.router.navigate(['/home-anunciante', this.id_usuario]);
  }

  obtenerCategoriaNombre(idCategoria: number): string {
    const categoria = this.categoriasOpciones.find(cat => cat.id_categoria === idCategoria);
    return categoria ? categoria.nombre : 'Categoría desconocida';
  }

  modificarAnuncio(): void {
    if (this.id_anuncio && this.lugar.id_lugar) {
      this.router.navigate(['/crear-actualizar-anuncio', this.id_anuncio, this.id_usuario]);
    } else {
      console.error('Datos incompletos para modificar.');
    }
  }

  eliminarAnuncio(): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción eliminará el anuncio permanentemente.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6'
    }).then((result) => {
      if (result.isConfirmed && this.lugar?.id_lugar) {
        this.httpLaravelService.Service_Delete('lugar', this.lugar.id_lugar).subscribe({
          next: () => {
            Swal.fire('¡Eliminado!', 'El anuncio ha sido eliminado.', 'success').then(() => {
              if (!this.id_usuario) {
                console.error('ID de usuario no disponible para redirigir');
                return;
              }
              this.router.navigate(['/home-anunciante', this.id_usuario]);
            });
          },
          error: (error) => {
            console.error('Error al eliminar el lugar:', error);
            Swal.fire('Error', 'No se pudo eliminar el anuncio.', 'error');
          }
        });
      }
    });
  }

  confirmarPago(): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: '¿Quieres proceder con el pago del anuncio?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, pagar',
      cancelButtonText: 'No, cancelar',
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33'
    }).then((result) => {
      this.router.navigate(['/pagar-anuncio', this.lugar.id_lugar, this.id_usuario]);
    });
  }

  logLoadTime() {
    window.addEventListener('load', () => {
      const [navEntry] = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
      if (navEntry) {
        console.log('⏱️ Tiempo total de carga en vista detallada anuncio (domComplete):', navEntry.domComplete.toFixed(2), 'ms');
        console.log('🧱 Tiempo de render en vista detallada anuncio (domContentLoaded):', navEntry.domContentLoadedEventEnd.toFixed(2), 'ms');
        console.log('🌐 Tiempo de respuesta en vista detallada anuncio (responseEnd):', navEntry.responseEnd.toFixed(2), 'ms');
      } else {
        const timing = performance.timing;
        const totalLoadTime = timing.loadEventEnd - timing.navigationStart;
        console.log('⏱️ Tiempo total de carga (fallback):', totalLoadTime, 'ms');
      }
    });
  }

  obtenerImagenes(idLugar: number): void {
    this.httpLaravelService.Service_Get(`lugar/${idLugar}/imagenes`, '').subscribe({
      next: (data) => {
        if (Array.isArray(data)) {
          this.imagenes = data;
        }
      },
      error: (error) => {
        console.error('❌ Error al obtener imágenes:', error);
      }
    });
  }

  changeImage(direction: number): void {
    const total = this.imagenes.length;
    if (total === 0) return;
    this.currentImageIndex = (this.currentImageIndex + direction + total) % total;
  }

  obtenerCategoriasDesdeAPI(): void {
    this.httpLaravelService.Service_Get('categorias', '').subscribe({
      next: (resp: any) => {
        this.categoriasOpciones = resp.data;
      },
      error: (error) => {
        console.error('❌ Error al obtener categorías:', error);
      }
    });
  }
}
