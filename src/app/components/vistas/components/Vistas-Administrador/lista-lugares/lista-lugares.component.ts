import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpLaravelService } from "../../../../../http.service";
import { ActivatedRoute } from '@angular/router';
import { LugarAdministrador } from './lugar_administrador.interface';
import Swal from 'sweetalert2';

@Component({
  selector: 'lista-lugares',
  standalone: false,
  templateUrl: './lista-lugares.component.html',
  styleUrls: ['./lista-lugares.component.scss']
})
export class ListaLugaresComponent implements OnInit{

  idUsuario: number = 0;

  lugares: LugarAdministrador[] = [];

  totalLugares: number = 0;
  totalActivos: number = 0;
  totalBloqueados: number = 0;
  totalDisponibles: number = 0;

  totalLugaresFiltrados: number = 0;

  listaCategorias: any[] = [];

  ultimoComentario: any = null;
  promedioValoracion: number = 0;
  totalComentarios: number = 0;

  // Si necesitas ID de un lugar específico
  idLugarSeleccionado: number | null = null;
  direccion: any; // Aquí guardamos los datos de la dirección

  usuario: any = null; // Aquí vamos a guardar la info para mostrarla en el HTML

  filteredLugares: LugarAdministrador[] = []; // 🔹 Para guardar la lista filtrada

  filtroActual: string = 'all'; // 'all' | 'active' | 'blocked'
  busquedaActual: string = '';  // Texto de búsqueda

  constructor(
    private service: HttpLaravelService,
    private router: Router,
    private route: ActivatedRoute,
  ){}
  ngOnInit(): void {
    this.idUsuario = Number(this.route.snapshot.paramMap.get('id_usuario'));
    console.log("id del usuario: "+this.idUsuario);

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
    next: (lugares: any[]) => {
      console.log('📩 Respuesta cruda de lugares:', lugares);

      // Adaptar a LugarAdministrador
      const adaptados: LugarAdministrador[] = lugares.map(l => ({
        id_lugar: l.id_lugar,
        id_usuario: l.id_usuario,
        id_categoria: l.id_categoria,
        id_direccion: l.id_direccion,
        nombre: l.nombre,
        descripcion: l.descripcion,
        paginaWeb: l.paginaWeb,
        num_telefonico: l.num_telefonico,
        activo: l.activo,
        bloqueado: l.bloqueado,
        bloqueado_por: l.bloqueado_por ?? null,
        desbloqueado_por: l.desbloqueado_por ?? null,
        motivo_bloqueo: l.motivo_bloqueo ?? null,
        fecha_activacion: l.fecha_activacion ?? null,
        fecha_bloqueo: l.fecha_bloqueo ?? null,
        fecha_desbloqueo: l.fecha_desbloqueo ?? null,
        activado_por_pago_id: l.activado_por_pago_id ?? null,
        horario_apertura: l.horario_apertura,
        horario_cierre: l.horario_cierre,
        dias_servicio: l.dias_servicio || [],
        imagenes: l.imagenes || [],
        created_at: l.created_at,
        updated_at: l.updated_at,
        last_login: l.last_login ?? null,
        
        // Opcionales
        promedioValoracion: l.promedioValoracion ?? 0,
        totalComentarios: l.totalComentarios ?? 0,
        direccion: l.direccion ?? undefined,
        usuario: l.usuario ?? undefined
      }));

      console.log('📦 Lugares procesados:', adaptados);

      this.lugares = adaptados;
      this.totalLugares = adaptados.length;
      this.totalDisponibles = adaptados.filter(l => l.activo && !l.bloqueado).length;
      this.totalBloqueados = this.totalLugares - this.totalDisponibles;
      // Si quieres que la tabla se muestre de una vez
      this.aplicarFiltros();

      this.lugares.forEach(lugar => {
        // Cargar dirección
        this.obtenerDireccion(lugar);
        // Cargar info de usuario
        this.cargarInfoUsuario(lugar);
        // Cargar info de valoraciones
        this.obtenerValoracionesPorLugar(lugar);
      });
    },
    error: (error) => {
      console.error('❌ Error al cargar lugares:', error);
    }
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

  obtenerValoracionesPorLugar(lugar: LugarAdministrador): void {
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

 obtenerDireccion(lugar: LugarAdministrador): void {
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

cargarInfoUsuario(lugar: LugarAdministrador) {
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

goBack(){
  this.router.navigate([`/home-administrador`,this.idUsuario]);
}

getTiempoTranscurrido(fecha: string | null): string {
  if (!fecha) return 'Fecha no disponible';
  
  const fechaActual = new Date();
  const fechaLugar = new Date(fecha);
  const diffMs = fechaActual.getTime() - fechaLugar.getTime();
  const diffDias = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDias < 1) return 'Hoy';
  if (diffDias === 1) return 'Hace 1 día';
  if (diffDias < 30) return `Hace ${diffDias} días`;
  
  const diffMeses = Math.floor(diffDias / 30);
  if (diffMeses === 1) return 'Hace 1 mes';
  
  return `Hace ${diffMeses} meses`;
}

}