import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpLaravelService } from '../../../../../http.service';
import Swal from 'sweetalert2';

@Component({
 selector: 'vista-detallada-destino',
 standalone: false,
 templateUrl: './vista-detallada-destino.component.html',
 styleUrls: ['./vista-detallada-destino.component.scss']
})
export class VistaDetalladaDestinoComponent implements OnInit, OnDestroy {
 lugar: any; // Aquí guardaremos los datos del lugar
 direccion: any; // Aquí guardamos los datos de la dirección
 ultimoComentario: any = null; // Aquí guardamos el último comentario
 promedioValoracion: any = null; // Aquí guardamos el promedio de valoraciones
 totalComentarios: any = null; // Aquí guardamos el total de comentarios

 imagenes: any[] = [];
 currentImageIndex: number = 0;

 isLoading = true;
 
 id_usuario: string | null = null; // Aquí guardamos el ID del usuario
 id_destino: string | null = null; // Aquí guardamos el ID del destino

 categoriasOpciones: any[] = []; 

 // 🕒 Variables para el tracking de tiempo
 private tiempoInicio: number = 0;
 private tiempoTotal: number = 0;
 private intervaloPing: any;
 private ultimoPing: number = 0;
 private tiempoMinimo: number = 5; // Mínimo 5 segundos para registrar visita
 private intervaloGuardado: number = 30; // Guardar cada 30 segundos
 private visitaRegistrada: boolean = false;

 constructor(
   private router: Router,
   private route: ActivatedRoute,
   private httpLaravelService: HttpLaravelService,
 ) {}

 ngOnInit(): void {
  this.route.paramMap.subscribe(params => {
   this.id_destino = this.route.snapshot.paramMap.get('id_destino');
   this.id_usuario = this.route.snapshot.paramMap.get('id_usuario');
   
   if (this.id_destino) {
    this.obtenerLugar(+this.id_destino);
    this.obtenerValoraciones(); // Llamada para obtener las valoraciones del lugar
    this.obtenerImagenes(+this.id_destino);

    // Nueva llamada para verificar si es favorito
    this.verificarFavorito(+this.id_destino);
    
    // 🕒 Iniciar tracking de tiempo
    this.iniciarTrackingTiempo();
   }

    this.obtenerCategoriasDesdeAPI();
    this.logLoadTime();  // 👈 mide tiempo de carga
  });
 }

 ngOnDestroy(): void {
   // 🕒 Guardar tiempo al destruir el componente
   this.finalizarTrackingTiempo();
 }

 // 🕒 Detectar cuando el usuario sale de la página o cambia de pestaña
 @HostListener('window:beforeunload', ['$event'])
 onBeforeUnload(event: any): void {
   this.finalizarTrackingTiempo();
 }

 @HostListener('document:visibilitychange', ['$event'])
 onVisibilityChange(): void {
   if (document.hidden) {
     // Usuario cambió de pestaña - pausar contador
     this.pausarTrackingTiempo();
   } else {
     // Usuario regresó - reanudar contador
     this.reanudarTrackingTiempo();
   }
 }

 // 🕒 MÉTODOS DE TRACKING DE TIEMPO

 private iniciarTrackingTiempo(): void {
   console.log('🕒 Iniciando tracking de tiempo para destino:', this.id_destino);
   this.tiempoInicio = Date.now();
   this.ultimoPing = this.tiempoInicio;
   this.tiempoTotal = 0;
   this.visitaRegistrada = false;

   // Intervalo para guardar progreso periódicamente
   this.intervaloPing = setInterval(() => {
     this.actualizarTiempoVisita();
   }, this.intervaloGuardado * 1000);
 }

 private pausarTrackingTiempo(): void {
   if (this.ultimoPing > 0) {
     const tiempoTranscurrido = Date.now() - this.ultimoPing;
     this.tiempoTotal += tiempoTranscurrido;
     this.ultimoPing = 0; // Marcar como pausado
     console.log('⏸️ Tracking pausado. Tiempo acumulado:', Math.floor(this.tiempoTotal / 1000), 'segundos');
   }
 }

 private reanudarTrackingTiempo(): void {
   this.ultimoPing = Date.now();
   console.log('▶️ Tracking reanudado');
 }

 private actualizarTiempoVisita(): void {
   if (this.ultimoPing > 0) {
     const tiempoTranscurrido = Date.now() - this.ultimoPing;
     this.tiempoTotal += tiempoTranscurrido;
     this.ultimoPing = Date.now();

     const segundosTotal = Math.floor(this.tiempoTotal / 1000);
     console.log('🕒 Tiempo de visita actualizado:', segundosTotal, 'segundos');

     // Guardar en BD si ha pasado suficiente tiempo
     if (segundosTotal >= this.tiempoMinimo) {
       this.guardarEstadisticaVisita(segundosTotal);
     }
   }
 }

 private finalizarTrackingTiempo(): void {
   if (this.intervaloPing) {
     clearInterval(this.intervaloPing);
   }

   // Calcular tiempo final
   if (this.ultimoPing > 0) {
     const tiempoFinal = Date.now() - this.ultimoPing;
     this.tiempoTotal += tiempoFinal;
   }

   const segundosTotal = Math.floor(this.tiempoTotal / 1000);
   console.log('🏁 Finalizando tracking. Tiempo total:', segundosTotal, 'segundos');

   // Guardar tiempo final si es significativo
   if (segundosTotal >= this.tiempoMinimo) {
     this.guardarEstadisticaVisita(segundosTotal, true);
   }
 }

 private guardarEstadisticaVisita(tiempoSegundos: number, esFinal: boolean = false): void {
   if (!this.id_destino) return;

   // Evitar múltiples registros, solo actualizar si es final o si no se ha registrado
   if (this.visitaRegistrada && !esFinal) return;

   const datosVisita = {
     id_lugar: +this.id_destino,
     id_usuario: this.id_usuario && this.id_usuario !== "0" ? +this.id_usuario : null,
     tiempo_visita: tiempoSegundos
   };

   console.log('💾 Guardando estadística de visita:', datosVisita);

   this.httpLaravelService.Service_Post('estadisticas-visitas', '', datosVisita).subscribe({
     next: (response) => {
       console.log('✅ Estadística de visita guardada:', response);
       this.visitaRegistrada = true;
     },
     error: (error) => {
       console.error('❌ Error al guardar estadística de visita:', error);
     }
   });
 }

 // MÉTODOS ORIGINALES (sin cambios)

 // Método para obtener la información del lugar
 obtenerLugar(id_destino: number): void {
   this.httpLaravelService.Service_Get(`lugar/${id_destino}`, '').subscribe(
     (data) => {
       this.lugar = data;
       this.isLoading = false;
       console.log('Lugar cargado:', this.lugar);
       this.obtenerDireccion(this.lugar.id_direccion); // Llamada para obtener la dirección
     },
     (error) => {
       console.log("id_destino:", id_destino);
       console.error('Error al cargar el lugar:', error);
       Swal.fire('Error', 'No se pudo cargar la información del lugar. Intenta más tarde.', 'error');
       this.isLoading = false;
     }
   );
 }

 // Método para obtener la dirección
 obtenerDireccion(idDireccion: number): void {
   this.httpLaravelService.Service_Get_Direccion_Publica(idDireccion).subscribe(
     (data) => {
       this.direccion = data;
       console.log('Dirección cargada (pública):', this.direccion);
     },
     (error) => {
       console.error('Error al cargar la dirección pública:', error);
       Swal.fire('Error', 'No se pudo cargar la dirección del lugar. Intenta más tarde.', 'error');
     }
   );
 }

 // Método de retroceso
 goBack() {
  console.log("navegardo a home-invitado-usuario", this.id_usuario);
   this.router.navigate(['/home-invitado-usuario', this.id_usuario]); // Navega a la página de inicio del usuario invitado
 }

 // Método para obtener el nombre de la categoría basado en el ID
 obtenerCategoriaNombre(idCategoria: number): string {
  const categoria = this.categoriasOpciones.find(c => c.id_categoria === idCategoria);
  return categoria ? categoria.nombre : 'Categoría desconocida';
}

crearResenia(): void {
  if (this.id_usuario != "0") {
    console.log('🔎 Buscando si el usuario ya tiene reseña previa...');

    const modelo = 'lugar';
    const dato = `${this.id_destino}/comentarios`;

    this.httpLaravelService.Service_Get(modelo, dato).subscribe({
      next: (respuesta: any) => {
        const comentarios = respuesta?.data || [];

        // Buscar si el usuario ya tiene una reseña en ese lugar
        const comentarioDelUsuario = comentarios.find(
          (comentario: any) => comentario.id_usuario == this.id_usuario
        );

        const idResenia = comentarioDelUsuario ? comentarioDelUsuario.id_comentario : 0;

        console.log(`📝 Redirigiendo con id_resenia: ${idResenia}`);

        this.router.navigate(['/resenia-usuario', this.id_destino, this.id_usuario, idResenia]);
      },
      error: (error) => {
        console.error('❌ Error al verificar reseñas del usuario:', error);
        Swal.fire('Error', 'No se pudo verificar si ya tienes una reseña. Intenta más tarde.', 'error');
      }
    });

  } else {
    Swal.fire({
      icon: 'info',
      title: '¿Ya tienes una cuenta?',
      text: 'Para acceder a esta opción necesitas iniciar sesión o crear una cuenta. ¿Deseas ir a la página de inicio de sesión?',
      showCancelButton: true,
      confirmButtonText: 'Sí, quiero iniciar sesión',
      cancelButtonText: 'No, gracias',
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      background: '#f9f9f9',
      iconColor: '#3085d6'
    }).then((result) => {
      if (result.isConfirmed) {
        this.router.navigate(['/login']);
      }
    });
  }
}

obtenerValoraciones(): void {
  const modelo = 'lugar';
  const dato = `${this.id_destino}/comentarios`;

  console.log('📥 Consultando valoraciones para:', modelo, dato);

  this.httpLaravelService.Service_Get(modelo, dato).subscribe({
    next: (respuesta: any) => {
      console.log('✅ Respuesta recibida de valoraciones:', respuesta);

      const comentarios = respuesta?.data || [];
      console.log('📝 Total de comentarios recibidos:', comentarios.length);
      console.log('📃 Lista de comentarios:', comentarios);

      if (Array.isArray(comentarios) && comentarios.length > 0) {
        // Ordenar comentarios por fecha
        const ordenados = comentarios.sort((a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );

        console.log('📅 Comentarios ordenados por fecha descendente:', ordenados);

        // Obtener el último comentario
        this.ultimoComentario = ordenados[0];
        console.log('⭐ Último comentario seleccionado:', this.ultimoComentario);

        // Calcular promedio de valoraciones
        const suma = comentarios.reduce((acc, c) => acc + (c.valoracion || 0), 0);
        this.promedioValoracion = suma / comentarios.length;

        console.log('🔢 Suma total de valoraciones:', suma);
        console.log('📊 Promedio de valoraciones:', this.promedioValoracion);

        // Total de comentarios
        this.totalComentarios = comentarios.length;
        console.log('🔢 Total de comentarios:', this.totalComentarios);
      } else {
        console.warn('⚠️ No hay comentarios disponibles.');
        this.ultimoComentario = 0;
        this.promedioValoracion = 0;
        this.totalComentarios = 0;
      }
    },
    error: (error) => {
      console.error('❌ Error al obtener los comentarios:', error);
      this.ultimoComentario = 0;
      this.promedioValoracion = 0;
      this.totalComentarios = 0;
    }
  });
}

getEstrellas(valoracion: number): string {
  const estrellasLlenas = '★'.repeat(valoracion);
  const estrellasVacias = '☆'.repeat(5 - valoracion);
  return estrellasLlenas + estrellasVacias;
}

listarComentarios(): void {
  if (this.id_usuario != "0") {
    console.log('Navegando a la lista de comentarios para el lugar con ID:', this.id_destino);
    this.router.navigate(['/vista-lista-comentarios', this.id_destino, this.id_usuario]);
  }
  else {
    Swal.fire({
      icon: 'info',
      title: '¿Ya tienes una cuenta?',
      text: 'Para acceder a esta opción necesitas iniciar sesión o crear una cuenta. ¿Deseas ir a la página de inicio de sesión?',
      showCancelButton: true,
      confirmButtonText: 'Sí, quiero iniciar sesión',
      cancelButtonText: 'No, gracias',
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    background: '#f9f9f9',
    iconColor: '#3085d6'
  }).then((result) => {
    if (result.isConfirmed) {
      this.router.navigate(['/login']);
    }
  });
  }
}

toggleFavorito(): void {
  if (!this.id_usuario || this.id_usuario === "0") {
    Swal.fire({
      icon: 'info',
      title: '¿Ya tienes una cuenta?',
      text: 'Debes iniciar sesión para agregar favoritos. ¿Deseas ir al login?',
      showCancelButton: true,
      confirmButtonText: 'Sí, iniciar sesión',
      cancelButtonText: 'No, gracias',
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      background: '#f9f9f9',
      iconColor: '#3085d6'
    }).then((result) => {
      if (result.isConfirmed) {
        this.router.navigate(['/login']);
      }
    });
    return;
  }

  const body = { id_lugar: +this.id_destino! };

  this.httpLaravelService.Service_Post('favoritos', 'toggle', body).subscribe({
    next: (res) => {
      console.log('✅ Favorito toggle:', res);
      const fueAgregado = res.action === 'added';
      this.lugar.esFavorito = fueAgregado; // opcional, puedes marcar esto en tu objeto para cambiar el icono

      Swal.fire({
        icon: 'success',
        title: fueAgregado ? 'Agregado a Favoritos' : 'Eliminado de Favoritos',
        text: res.message,
        timer: 2000,
        showConfirmButton: false,
      });
    },
    error: (err) => {
      console.error('❌ Error al hacer toggle favorito:', err);
      Swal.fire('Error', 'No se pudo actualizar el favorito.', 'error');
    }
  });
}

logLoadTime() {
  window.addEventListener('load', () => {
    const [navEntry] = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
    if (navEntry) {
      console.log('⏱️ Tiempo total de carga en vista detallada destino (domComplete):', navEntry.domComplete.toFixed(2), 'ms');
      console.log('🧱 Tiempo de render en vista detallada destino (domContentLoaded):', navEntry.domContentLoadedEventEnd.toFixed(2), 'ms');
      console.log('🌐 Tiempo de respuesta vista detallada destino (responseEnd):', navEntry.responseEnd.toFixed(2), 'ms');
    } else {
      // Fallback para navegadores antiguos
      const timing = performance.timing;
      const totalLoadTime = timing.loadEventEnd - timing.navigationStart;
      console.log('⏱️ Tiempo total de carga (fallback):', totalLoadTime, 'ms');
    }
  });
}

obtenerImagenes(idLugar: number): void {
  this.httpLaravelService.Service_Get(`lugar/${idLugar}`, 'imagenes').subscribe({
    next: (data) => {
      if (Array.isArray(data)) {
        console.log('🖼️ Imágenes del lugar:', data);
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
  this.currentImageIndex = (this.currentImageIndex + direction + total) % total;
}

obtenerCategoriasDesdeAPI(): void {
    this.httpLaravelService.Service_Get('categorias', '').subscribe({
      next: (resp: any) => {
        this.categoriasOpciones = resp.data;
        console.log('📦 Categorías obtenidas:', this.categoriasOpciones);
      },
      error: (error) => {
        console.error('❌ Error al obtener categorías:', error);
      }
    });
  }

  verificarFavorito(idLugar: number): void {
  if (!this.id_usuario || this.id_usuario === "0") {
    // Usuario no logueado, no hace falta checar favorito
    return;
  }

  this.httpLaravelService.Service_Get(`favoritos/check/${idLugar}`, '').subscribe({
    next: (resp: any) => {
      if (resp && resp.success) {
        this.lugar = this.lugar || {}; // aseguramos que lugar exista
        this.lugar.esFavorito = resp.es_favorito;
        console.log('Estado favorito cargado:', resp.es_favorito);
      }
    },
    error: (err) => {
      console.error('Error al verificar favorito:', err);
    }
  });
}
}