import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpLaravelService } from '../../../../../http.service';
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

  listaCategorias: any[] = [];

  id_usuario: string | null = null; // Aquí guardamos el ID del usuario

  categoriasOpciones: any[] = [];

  imagenesPorLugar: { [key: number]: string[] } = {};
  indicesImagen: { [key: number]: number } = {};

  promedioValoracionPorLugar: { [idLugar: number]: number } = [];

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
        this.listaCategorias = resp.data;

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

        // 👉 Aquí cargamos las imágenes por cada lugar
        this.lugares.forEach(lugar => {
          this.cargarImagenesPorLugar(lugar.id_lugar);
          this.obtenerComentarios(lugar.id_lugar);   // 👈 Aquí llamamos el cálculo de estrellas
        });
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
    this.router.navigate(['/vista-detallada-destino', idEntero, this.id_usuario, 2]);
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
    if (!imagenes || imagenes.length === 0) {
      this.cargarImagenesPorLugar(idLugar);
      return;
    }

    const total = imagenes.length;
    const actual = this.indicesImagen[idLugar] ?? 0;
    this.indicesImagen[idLugar] = (actual + direccion + total) % total;
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


  getNombreCategoria(idCategoria: number): string {
    const categoria = this.listaCategorias.find(cat => cat.id_categoria === idCategoria);
    return categoria ? categoria.nombre : 'Sin Categoría';
  }

}