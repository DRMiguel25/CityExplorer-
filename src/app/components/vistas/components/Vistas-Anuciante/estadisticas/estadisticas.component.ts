import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { HttpLaravelService } from "../../../../../http.service";
import { Lugar } from './lugar.interface';
import { ActivatedRoute } from '@angular/router';
import Swal from 'sweetalert2';
import { Chart, ChartData, ChartOptions, registerables } from 'chart.js';

// Registrar todos los componentes de Chart.js
Chart.register(...registerables);

@Component({
  selector: 'estadisticas',
  standalone: false,
  templateUrl: 'estadisticas.component.html',
  styleUrls: ['./estadisticas.component.scss']
})

export class estadisticasComponent implements OnInit {
  @ViewChild('graficaVisitas', { static: false }) graficaVisitas!: ElementRef<HTMLCanvasElement>;
  
  chart!: Chart;
  private chartInitialized = false;

  lugares: Lugar[] = [];
  isLoading = true;
  errorMessage = '';
  idUsuario: number = 0;

  imagenesPorLugar: { [idLugar: number]: any[] } = {};
  imagenActualIndexPorLugar: { [idLugar: number]: number } = {};

  filtroActivo: 'estadisticas' | 'pagados' | 'noPagados' = 'estadisticas';
  botonActivo: string = 'estadisticas';
  
  todosLosLugares: Lugar[] = [];

  usuario: any;

  // Sidebar control
  sidebarAbierto = true;

  // Variables para estadísticas consolidadas
  estadisticasConsolidadas: EstadisticaLugar[] = [];
  estadisticasAnuncianteTiempoPromedioConData: any = null;
  estadisticasAnuncianteTiempoPromedioSinData: any = null;

  estadisticasAnuncianteCantidadVistasConData: any = null;
  estadisticasAnuncianteCantidadVistasSinData: any = null;

  anuncioActualIndex = 0;
  filtroTiempo: 'todas' | 'mes' | 'semana' | 'dia' = 'todas';

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

  // NUEVO: Implementar AfterViewInit
  ngAfterViewInit(): void {
    console.log('🎯 AfterViewInit - Canvas disponible:', !!this.graficaVisitas);
    // Esperar un tick para asegurar que el DOM esté completamente renderizado
    setTimeout(() => {
      if (this.estadisticasConsolidadas && this.estadisticasConsolidadas.length > 0) {
        this.renderizarGrafica();
      }
    }, 100);
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
        this.lugares = [...filtrados];

        this.lugares.forEach(lugar => this.cargarImagenesLugar(lugar));

        // Cargar estadísticas para todos los lugares
        this.cargarEstadisticasConsolidadas();

        this.isLoading = false;
        console.log('✅ Lugares filtrados para el anunciante:', this.lugares);

      },
      (error) => {
        this.isLoading = false;
        this.errorMessage = 'Error al cargar los lugares, por favor intente nuevamente.';
        console.error('❌ Error al cargar los lugares:', error);
      }
    );
  }

  // Nueva función para cargar estadísticas consolidadas
  cargarEstadisticasConsolidadas(): void {
    const promesasEstadisticas = this.lugares.map(lugar => 
      this.httpLaravelService.Service_Get_Estadisticas_tiempo_promedio(lugar.id_lugar).toPromise()
        .then(resp => ({
          id_lugar: lugar.id_lugar,
          nombre_lugar: lugar.nombre,
          datos: resp
        }))
        .catch(err => ({
          id_lugar: lugar.id_lugar,
          nombre_lugar: lugar.nombre,
          datos: { success: false, message: 'Error de conexión' },
          error: err
        }))
    );

    Promise.all(promesasEstadisticas).then(resultados => {
      console.log('📊 Estadísticas consolidadas:', resultados);
      this.procesarEstadisticasConsolidadas(resultados);
      
      // IMPORTANTE: Solo renderizar si el canvas está disponible
      if (this.graficaVisitas && this.graficaVisitas.nativeElement) {
        this.renderizarGrafica();
      } else {
        console.warn('⚠️ Canvas no disponible, esperando...');
        setTimeout(() => {
          if (this.graficaVisitas && this.graficaVisitas.nativeElement) {
            this.renderizarGrafica();
          }
        }, 500);
      }
    });
  }

  procesarEstadisticasConsolidadas(resultados: any[]): void {
    this.estadisticasConsolidadas = [];
    
    resultados.forEach((resultado: any) => {
      if (resultado.datos && resultado.datos.success && resultado.datos.data) {
        const data = resultado.datos.data;
        this.estadisticasConsolidadas.push({
          nombre_lugar: resultado.nombre_lugar,
          id_lugar: resultado.id_lugar,
          tiempo_promedio: parseFloat(data.tiempo_promedio) || 0,
          total_visitas: parseInt(data.total_visitas_consideradas) || 0,
          tiempo_total: parseFloat(data.tiempo_total_acumulado) || 0
        });
      }
    });

    console.log('📈 Datos consolidados procesados:', this.estadisticasConsolidadas);
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
        this.router.navigate(['/login'])
      },
      error: (err) => {
        console.error('❌ Error al cerrar sesión:', err);
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

  cargarEstadisticasTiempoPromedio(id_lugar: number): void {  
    this.httpLaravelService.Service_Get_Estadisticas_tiempo_promedio(id_lugar).subscribe({
      next: (resp) => {
        if (resp.success) {
          console.log(`📊 Estadísticas (Tiempo promedio) del lugar con el id = ${id_lugar}:`, resp);
          this.estadisticasAnuncianteTiempoPromedioConData = resp.data;
        } else {
          console.warn(`❌ No hay estadísticas para el lugar con id = ${id_lugar}`);
          this.estadisticasAnuncianteTiempoPromedioSinData = { id_lugar, mensaje: resp.message };
        }
      },
      error: (err) => {
        console.error("⚠️ Error al cargar estadísticas (Tiempo promedio)", err);
        this.estadisticasAnuncianteTiempoPromedioSinData = { id_lugar, mensaje: 'Error de conexión con el servidor' };
      }
    });
  }

  cargarEstadisticasCantidadVistas(id_lugar: number): void {  
    this.httpLaravelService.Service_Get_Estadisticas_Cantidad_Vistas(id_lugar).subscribe({
      next: (resp) => {
        console.log(`📊 Estadísticas (Cantidad vistas) del lugar con el id = ${id_lugar}:`, resp);
        this.estadisticasAnuncianteCantidadVistasConData = resp.data;
      },
      error: (err) => {
        console.error("❌ Error al cargar estadísticas (Cantidad vistas)", err);
      }
    });
  }

  // Función para filtrar datos consolidados según el filtro de tiempo
  get visitasFiltradas(): EstadisticaLugar[] {
    if (!this.estadisticasConsolidadas || this.estadisticasConsolidadas.length === 0) {
      return [];
    }

    // Para el gráfico de pastel, no necesitamos filtrar por tiempo
    // Solo devolvemos los datos consolidados
    return this.estadisticasConsolidadas;
  }

  // Método para obtener el total de visitas
  getTotalVisitas(): number {
    if (!this.estadisticasConsolidadas || this.estadisticasConsolidadas.length === 0) {
      return 0;
    }
    return this.estadisticasConsolidadas.reduce((total: number, lugar: EstadisticaLugar) => total + lugar.total_visitas, 0);
  }

  // Método para obtener el tiempo promedio general
  getPromedioTiempo(): number {
    if (!this.estadisticasConsolidadas || this.estadisticasConsolidadas.length === 0) {
      return 0;
    }
    
    let tiempoTotal = 0;
    let visitasTotal = 0;
    
    this.estadisticasConsolidadas.forEach((lugar: EstadisticaLugar) => {
      tiempoTotal += lugar.tiempo_total;
      visitasTotal += lugar.total_visitas;
    });
    
    return visitasTotal > 0 ? tiempoTotal / visitasTotal : 0;
  }

  // Método para generar colores dinámicamente
  generarColores(cantidad: number): string[] {
    const coloresBase = [
      '#4a90e2', // Azul
      '#e24a86', // Rosa
      '#50c0a8', // Verde
      '#e2a84a', // Naranja
      '#9b59b6', // Púrpura
      '#1abc9c', // Turquesa
      '#f39c12', // Amarillo
      '#e74c3c', // Rojo
      '#34495e', // Gris azulado
      '#16a085'  // Verde oscuro
    ];
    
    const colores = [];
    for (let i = 0; i < cantidad; i++) {
      colores.push(coloresBase[i % coloresBase.length]);
    }
    return colores;
  }

  cambiarFiltro(filtro: 'todas' | 'mes' | 'semana' | 'dia') {
    this.filtroTiempo = filtro;
    this.renderizarGrafica(); // Re-renderizar gráfica al cambiar filtro
  }

  irAyuda(){
    this.router.navigate(['/ayuda-anunciante', this.idUsuario]);
  }

  // MEJORAR: renderizarGrafica con más validaciones
  private renderizarGrafica(): void {
    console.log('🎨 Intentando renderizar gráfica...');
    
    // Validación completa del canvas
    if (!this.graficaVisitas || !this.graficaVisitas.nativeElement) {
      console.error('❌ Canvas no disponible');
      return;
    }

    const canvas = this.graficaVisitas.nativeElement;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      console.error('❌ No se pudo obtener contexto 2D del canvas');
      return;
    }

    console.log('✅ Canvas y contexto disponibles');

    // Destruir gráfico anterior si existe
    if (this.chart) {
      console.log('🗑️ Destruyendo gráfico anterior');
      this.chart.destroy();
    }

    const datosParaGrafica = this.visitasFiltradas;
    
    if (!datosParaGrafica || datosParaGrafica.length === 0) {
      console.warn('⚠️ No hay datos para mostrar en la gráfica');
      this.mostrarGraficaVacia();
      return;
    }

    console.log('📊 Datos para gráfica:', datosParaGrafica);

    // Preparar datos para el gráfico de pastel
    const labels = datosParaGrafica.map(lugar => lugar.nombre_lugar);
    const dataVisitas = datosParaGrafica.map(lugar => lugar.total_visitas);
    const colores = this.generarColores(datosParaGrafica.length);

    console.log('🏷️ Labels:', labels);
    console.log('📈 Data:', dataVisitas);

    try {
      this.chart = new Chart(ctx, {
        type: 'pie',
        data: {
          labels,
          datasets: [{
            label: 'Visitas por Lugar',
            data: dataVisitas,
            backgroundColor: colores,
            borderColor: '#ffffff',
            borderWidth: 2,
            hoverOffset: 10
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            title: {
              display: true,
              text: '',
              font: {
                size: 18,
                weight: 'bold'
              },
              padding: {
                top: 10,
                bottom: 30
              }
            },
            legend: {
              display: true,
              position: 'right' as const,
              labels: {
                padding: 15,
                font: {
                  size: 12
                },
                generateLabels: (chart: Chart) => {
                  const data = chart.data;
                  if (data.labels?.length && data.datasets.length) {
                    return (data.labels as string[]).map((label: string, i: number) => {
                      const dataset = data.datasets[0];
                      const visitas = dataset.data[i] as number;
                      const tiempo = datosParaGrafica[i]?.tiempo_promedio || 0;
                      const backgroundColor = Array.isArray(dataset.backgroundColor) 
                        ? dataset.backgroundColor[i] as string
                        : dataset.backgroundColor as string;
                      return {
                        text: `${label}`,
                        fillStyle: backgroundColor,
                        strokeStyle: dataset.borderColor as string,
                        lineWidth: dataset.borderWidth as number,
                        index: i
                      };
                    });
                  }
                  return [];
                }
              }
            },
            tooltip: {
              callbacks: {
                label: function(context: any) {
                  const lugar = datosParaGrafica[context.dataIndex];
                  const total = (context.dataset.data as number[]).reduce((a: number, b: number) => a + b, 0);
                  const porcentaje = ((context.parsed / total) * 100).toFixed(1);
                  return [
                  ];
                }
              }
            }
          },
          layout: {
            padding: {
              left: 20,
              right: 20,
              top: 20,
              bottom: 20
            }
          }
        }
      });

      this.chartInitialized = true;
      console.log('✅ Gráfico de pastel renderizado exitosamente');
      
    } catch (error) {
      console.error('❌ Error al crear el gráfico:', error);
      this.mostrarGraficaVacia();
    }
  }

    private mostrarGraficaVacia(): void {
    if (!this.graficaVisitas || !this.graficaVisitas.nativeElement) {
      return;
    }
    
    const ctx = this.graficaVisitas.nativeElement.getContext('2d');
    if (!ctx) return;

    if (this.chart) {
      this.chart.destroy();
    }

    this.chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Sin datos'],
        datasets: [{
          label: 'No hay datos disponibles',
          data: [0],
          backgroundColor: '#cccccc'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'No hay datos disponibles para mostrar',
            font: { size: 14 }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 1
          }
        }
      }
    });
  }

    // AGREGAR: Método para forzar re-renderizado
  public forzarRenderizadoGrafica(): void {
    setTimeout(() => {
      if (this.estadisticasConsolidadas && this.estadisticasConsolidadas.length > 0) {
        this.renderizarGrafica();
      }
    }, 100);
  }

  // MODIFICAR: Destruir gráfico en OnDestroy
  ngOnDestroy(): void {
    if (this.chart) {
      this.chart.destroy();
    }
  }


irTerminosEelServicio(){
  this.router.navigate(['/terminos-del-servicio-anunciante', this.idUsuario]);
}

irPoliticasDePrivacidad(){
  this.router.navigate(['/politicas-de-privacidad-anunciante', this.idUsuario]);
}

}

// Interfaces
interface VisitaPorDia {
  fecha: string;
  visitas: number;
  tiempo_promedio: string | number;
  id_lugar?: number;
}

interface EstadisticaLugar {
  nombre_lugar: string;
  id_lugar: number;
  tiempo_promedio: number;
  total_visitas: number;
  tiempo_total: number;
}