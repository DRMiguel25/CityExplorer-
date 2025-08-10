import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpLaravelService } from "../../../../../http.service";
import { Lugar } from './lugar.interface';
import { ActivatedRoute } from '@angular/router';
import { Injectable } from '@angular/core';

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

  estadisticasAnunciante: any = null;
  anuncioActualIndex = 0;
  filtroTiempo: 'dia' | 'semana' | 'mes' = 'dia';

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
      
    console.log('Cargando estadisticas...');
    this.cargarEstadisticas();
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
        console.log('✅ Lugares filtrados para el anunciante:', this.lugares);

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

cargarEstadisticas(): void {
  this.httpLaravelService.Service_Get_Estadisticas_Por_Anunciante(this.idUsuario).subscribe({
    next: (resp) => {
      console.log(`📊 Estadísticas del Anunciante ${this.idUsuario}:`, resp);
      this.estadisticasAnunciante = resp.data; // Guardamos solo "data"
    },
    error: (err) => {
      console.error("❌ Error al cargar estadísticas", err);
    }
  });
}

get anuncioActual() {
  return this.estadisticasAnunciante?.visitas_por_lugar?.[this.anuncioActualIndex] || null;
}

cambiarAnuncio(direccion: number) {
  const total = this.estadisticasAnunciante?.visitas_por_lugar?.length || 0;
  if (total > 0) {
    this.anuncioActualIndex = (this.anuncioActualIndex + direccion + total) % total;
    this.filtroTiempo = 'dia';  // reset filtro al cambiar anuncio
  }
}

get visitasActuales() {
  if (!this.anuncioActual) return [];
  switch (this.filtroTiempo) {
    case 'semana': return this.agruparPorSemana(this.anuncioActual.visitas_por_dia || []);
    case 'mes': return this.agruparPorMes(this.anuncioActual.visitas_por_dia || []);
    default: return this.anuncioActual.visitas_por_dia || [];
  }
}

cambiarFiltro(filtro: 'dia' | 'semana' | 'mes') {
  this.filtroTiempo = filtro;
}

agruparPorSemana(visitasPorDia: any[]) {
  const semanasMap = new Map<string, any>();

  visitasPorDia.forEach(v => {
    const fecha = new Date(v.fecha);
    const anio = fecha.getFullYear();
    // Obtener número de semana ISO simple (puedes mejorar)
    const semana = this.getSemanaISO(fecha);
    const key = `${anio}-W${semana}`;

    if (!semanasMap.has(key)) {
      semanasMap.set(key, { fecha: key, visitas: 0, tiempo_promedio: 0, total_tiempo: 0 });
    }
    const entry = semanasMap.get(key);
    entry.visitas += v.visitas;
    entry.total_tiempo += v.tiempo_promedio * v.visitas; // suma ponderada para promedio
  });

  const resultado = Array.from(semanasMap.values());
  resultado.forEach(e => {
    e.tiempo_promedio = (e.total_tiempo / e.visitas) || 0;
    delete e.total_tiempo;
  });

  return resultado;
}

agruparPorMes(visitasPorDia: any[]) {
  const mesesMap = new Map<string, any>();

  visitasPorDia.forEach(v => {
    const fecha = new Date(v.fecha);
    const anio = fecha.getFullYear();
    const mes = fecha.getMonth() + 1; // enero=0
    const key = `${anio}-${mes.toString().padStart(2, '0')}`;

    if (!mesesMap.has(key)) {
      mesesMap.set(key, { fecha: key, visitas: 0, tiempo_promedio: 0, total_tiempo: 0 });
    }
    const entry = mesesMap.get(key);
    entry.visitas += v.visitas;
    entry.total_tiempo += v.tiempo_promedio * v.visitas;
  });

  const resultado = Array.from(mesesMap.values());
  resultado.forEach(e => {
    e.tiempo_promedio = (e.total_tiempo / e.visitas) || 0;
    delete e.total_tiempo;
  });

  return resultado;
}

// ISO week number quick calc helper
getSemanaISO(fecha: Date) {
  const target = new Date(fecha.valueOf());
  const dayNr = (fecha.getDay() + 6) % 7;
  target.setDate(target.getDate() - dayNr + 3);
  const firstThursday = target.valueOf();
  target.setMonth(0, 1);
  if (target.getDay() !== 4) {
    target.setMonth(0, 1 + ((4 - target.getDay()) + 7) % 7);
  }
  return 1 + Math.ceil((firstThursday - target.valueOf()) / 604800000);
}

}