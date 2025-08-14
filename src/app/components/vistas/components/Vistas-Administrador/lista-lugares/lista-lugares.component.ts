import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpLaravelService } from "../../../../../http.service";
import { ActivatedRoute } from '@angular/router';
import { Lugar } from './lugar.interface';
import Swal from 'sweetalert2';

@Component({
  selector: 'lista-lugares',
  standalone: false,
  templateUrl: './lista-lugares.component.html',
  styleUrls: ['./lista-lugares.component.scss']
})
export class ListaLugaresComponent implements OnInit{

  lugares: Lugar[] = [];

  totalLugares: number = 0;
  totalActivos: number = 0;
  totalBloqueados: number = 0;

  totalLugaresFiltrados: number = 0;

  listaCategorias: any[] = [];

  ultimoComentario: any = null;
  promedioValoracion: number = 0;
  totalComentarios: number = 0;

  // Si necesitas ID de un lugar específico
  idLugarSeleccionado: number | null = null;
  direccion: any; // Aquí guardamos los datos de la dirección

  usuario: any = null; // Aquí vamos a guardar la info para mostrarla en el HTML

  filteredLugares: Lugar[] = []; // 🔹 Para guardar la lista filtrada

  filtroActual: string = 'all'; // 'all' | 'active' | 'blocked'
  busquedaActual: string = '';  // Texto de búsqueda

  constructor(
    private service: HttpLaravelService,
    private router: Router,
    private route: ActivatedRoute,
  ){}
  ngOnInit(): void {
    this.logLoadTime();  // 👈 mide tiempo de carga
    this.loadLugares();

    this.obtenerCategoriasDesdeAPI();

    // 🔹 Escuchar cambios del select
    const filterSelect = document.getElementById('filterSelect') as HTMLSelectElement;
    filterSelect.addEventListener('change', (e) => {
      this.filtroActual = (e.target as HTMLSelectElement).value;
      this.aplicarFiltros();
    });

    // 🔹 Escuchar cambios del input de búsqueda
    const searchInput = document.getElementById('searchInput') as HTMLInputElement;
    searchInput.addEventListener('input', (e) => {
      this.busquedaActual = (e.target as HTMLInputElement).value.toLowerCase();
      this.aplicarFiltros();
    });
  }

  logLoadTime() {
    window.addEventListener('load', () => {
      const [navEntry] = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
      if (navEntry) {
        console.log('⏱️ Tiempo total de carga en Lista lugares (domComplete):', navEntry.domComplete.toFixed(2), 'ms');
        console.log('🧱 Tiempo de render en Lista lugares (domContentLoaded):', navEntry.domContentLoadedEventEnd.toFixed(2), 'ms');
        console.log('🌐 Tiempo de respuesta Lista lugares (responseEnd):', navEntry.responseEnd.toFixed(2), 'ms');
      } else {
        // Fallback para navegadores antiguos
        const timing = performance.timing;
        const totalLoadTime = timing.loadEventEnd - timing.navigationStart;
        console.log('⏱️ Tiempo total de carga (fallback):', totalLoadTime, 'ms');
      }
    });
  }

  loadLugares(): void {
  this.service.Service_Get('lugar', '').subscribe({
    next: (data: Lugar[]) => {
      this.lugares = data;
      this.totalLugares = data.length;
      this.totalActivos = data.filter(l => l.activo === true).length;
      this.totalBloqueados = data.filter(l => !l.activo).length;

      this.totalLugaresFiltrados = data.length;

      // Inicializamos filteredLugares
      this.filteredLugares = [...this.lugares];

      this.lugares.forEach(lugar => {
        this.obtenerValoracionesPorLugar(lugar);
        this.obtenerDireccion(lugar);
        this.cargarInfoUsuario(lugar);
      });
    },
    error: (error) => console.error('❌ Error al cargar lugares:', error)
  });
}

  getInitials(nombre?: string): string {
    if (!nombre) return '?';
    const parts = nombre.trim().split(' ');
    const first = parts[0]?.charAt(0) || '';
    const second = parts[1]?.charAt(0) || '';
    return `${first}${second}`;
  }

  obtenerCategoriasDesdeAPI(): void {
    this.service.Service_Get('categorias', '').subscribe({
      next: (resp: any) => {
        this.listaCategorias = resp.data; // <- solo tomamos el array
        console.log('📦 Lista de categorías obtenidas:', this.listaCategorias);
      },
      error: (error) => {
        console.error('❌ Error al obtener categorías:', error);
      }
    });
  }

  getCategoriaNombre(id_categoria: number): string {
    const categoria = this.listaCategorias?.find(cat => cat.id_categoria === id_categoria);
    return categoria ? categoria.nombre : 'Sin categoría';
  }

  obtenerValoracionesPorLugar(lugar: Lugar): void {
  const modelo = 'lugar';
  const dato = `${lugar.id_lugar}/comentarios`;

  this.service.Service_Get(modelo, dato).subscribe({
    next: (respuesta: any) => {
      const comentarios = respuesta?.data || [];

      if (Array.isArray(comentarios) && comentarios.length > 0) {
        const suma = comentarios.reduce((acc, c) => acc + (c.valoracion || 0), 0);
        const promedio = suma / comentarios.length;

        // Guardamos en el mismo objeto lugar
        lugar.promedioValoracion = promedio.toFixed(1); // opcional: 1 decimal
        lugar.totalComentarios = comentarios.length;
      } else {
        lugar.promedioValoracion = 0;
        lugar.totalComentarios = 0;
      }
    },
    error: () => {
      lugar.promedioValoracion = 0;
      lugar.totalComentarios = 0;
    }
  });
}

 obtenerDireccion(lugar: Lugar): void {
  const idDireccion = lugar.id_direccion;

  this.service.Service_Get_Direccion_Publica(idDireccion).subscribe(
    (data) => {
      lugar.direccion = data; // 👈 guardamos la dirección directamente en el lugar
      console.log(`Dirección cargada para ${lugar.nombre}:`, lugar.direccion);
    },
    (error) => {
      console.error('Error al cargar la dirección pública:', error);
      Swal.fire('Error', 'No se pudo cargar la dirección del lugar. Intenta más tarde.', 'error');
      lugar.direccion = undefined;
    }
  );
}

cargarInfoUsuario(lugar: Lugar) {
  const id_usuario = lugar.id_usuario;

  this.service.Service_Get('usuario', id_usuario).subscribe(
    (respuesta: any) => {
      if (respuesta.estatus === 1) {
        lugar.usuario = respuesta.data;  // 👈 guardamos directamente en el lugar
        console.log(`✅ Usuario cargado para ${lugar.nombre}:`, lugar.usuario);
      } else {
        console.warn('⚠️ La API respondió sin éxito:', respuesta);
      }
    },
    error => {
      console.error('❌ Error al obtener usuario:', error);
      lugar.usuario = undefined;
    }
  );
}

aplicarFiltros(): void {
  this.filteredLugares = this.lugares.filter(lugar => {
    // Filtro activo/bloqueado
    if (this.filtroActual === 'active' && !lugar.activo) return false;
    if (this.filtroActual === 'blocked' && lugar.activo) return false;

    // Filtro de búsqueda
    const nombre = lugar.nombre?.toLowerCase() || '';
    const categoria = this.getCategoriaNombre(lugar.id_categoria)?.toLowerCase() || '';
    const creador = `${lugar.usuario?.nombre || ''} ${lugar.usuario?.apellidoP || ''} ${lugar.usuario?.apellidoM || ''}`.toLowerCase();

    return nombre.includes(this.busquedaActual) ||
           categoria.includes(this.busquedaActual) ||
           creador.includes(this.busquedaActual);
  });
  // 🔹 Actualizamos el total de lugares filtrados
  this.totalLugaresFiltrados = this.filteredLugares.length;
}

}