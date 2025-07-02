import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpLaravelService } from '../../../../http.service';
import { Lugar } from '../../Vistas-Anuciante/home-anunciante/lugar.interface';

@Component({
  selector: 'categoria-vista',
  standalone: false,
  templateUrl: './categoria-vista.component.html',
  styleUrls: ['./categoria-vista.component.scss']
})
export class CategoriaVistaComponent implements OnInit {
  lugares: Lugar[] = [];
  categoriaSeleccionada = '';
  tituloCategoria = '';

  id_usuario: string | null = null; // Aquí guardamos el ID del usuario

  categoriasOpciones: any[] = [];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private httpLaravelService: HttpLaravelService
  ) {}

  ngOnInit(): void {
    this.id_usuario = this.route.snapshot.paramMap.get('id_usuario');

    this.obtenerCategoriasDesdeAPI();

    this.route.paramMap.subscribe(params => {
      const nombreCategoria = params.get('categoria');
      if (nombreCategoria) {
        this.categoriaSeleccionada = nombreCategoria;
        this.tituloCategoria = nombreCategoria.charAt(0).toUpperCase() + nombreCategoria.slice(1);

        this.filtrarLugaresPorCategoria(nombreCategoria);
      }
    });

    this.logLoadTime(); // 👈 mide tiempo de carga
  }

  obtenerCategoriasDesdeAPI(): void {
    this.httpLaravelService.Service_Get('categorias', '').subscribe({
      next: (resp: any) => {
        this.categoriasOpciones = resp.data;
        console.log('📦 Categorías obtenidas:', this.categoriasOpciones);

        // Si ya teníamos una categoría seleccionada, vuelve a filtrar
        if (this.categoriaSeleccionada) {
          this.filtrarLugaresPorCategoria(this.categoriaSeleccionada);
        }
      },
      error: (error) => {
        console.error('❌ Error al obtener categorías:', error);
      }
    });
  }

  filtrarLugaresPorCategoria(nombreCategoria: string): void {
    // Esperar a que la API haya cargado las categorías
    if (this.categoriasOpciones.length === 0) return;

    const categoriaEncontrada = this.categoriasOpciones.find(cat =>
      cat.nombre.toLowerCase().replace(/_/g, ' ') === nombreCategoria.toLowerCase().replace(/_/g, ' ')
    );

    if (!categoriaEncontrada) {
      console.warn('Categoría no encontrada en la API:', nombreCategoria);
      return;
    }

    const idCategoria = categoriaEncontrada.id_categoria;

    this.httpLaravelService.Service_Get_Lugares_Publico().subscribe({
      next: (data) => {
        this.lugares = data.filter(
          (l: Lugar) => l.id_categoria === idCategoria && l.activo
        );
        console.log(`Lugares activos para '${nombreCategoria}':`, this.lugares);
      },
      error: (err) => {
        console.error('Error al cargar lugares públicos:', err);
      }
    });
  }

  vistaDetalladaDestino(id: number | string) {
    const idEntero = parseInt(id.toString(), 10);
    if (isNaN(idEntero)) {
      console.error('ID inválido:', id);
      return;
    }
    console.log("navegando a vista-detallada-destino", idEntero, this.id_usuario);
    this.router.navigate(['/vista-detallada-destino', idEntero, this.id_usuario]);
  }

  logLoadTime() {
    window.addEventListener('load', () => {
      const [navEntry] = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
      if (navEntry) {
        console.log('⏱️ Tiempo total de carga en categoria vista (domComplete):', navEntry.domComplete.toFixed(2), 'ms');
        console.log('🧱 Tiempo de render en categoria vista (domContentLoaded):', navEntry.domContentLoadedEventEnd.toFixed(2), 'ms');
        console.log('🌐 Tiempo de respuesta categoria vista (responseEnd):', navEntry.responseEnd.toFixed(2), 'ms');
      } else {
        const timing = performance.timing;
        const totalLoadTime = timing.loadEventEnd - timing.navigationStart;
        console.log('⏱️ Tiempo total de carga (fallback):', totalLoadTime, 'ms');
      }
    });
  }
}