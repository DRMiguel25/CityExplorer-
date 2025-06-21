import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpLaravelService } from '../../../../http.service';
import Swal from 'sweetalert2';

@Component({
 selector: 'vista-detallada-destino',
 standalone: false,
 templateUrl: './vista-detallada-destino.component.html',
 styleUrls: ['./vista-detallada-destino.component.scss']
})
export class VistaDetalladaDestinoComponent implements OnInit {
 lugar: any; // Aquí guardaremos los datos del lugar
 direccion: any; // Aquí guardamos los datos de la dirección
 ultimoComentario: any = null; // Aquí guardamos el último comentario
 promedioValoracion: any = null; // Aquí guardamos el promedio de valoraciones
 totalComentarios: any = null; // Aquí guardamos el total de comentarios

 isLoading = true;
 
 id_usuario: string | null = null; // Aquí guardamos el ID del usuario
 id_destino: string | null = null; // Aquí guardamos el ID del destino
 

 private categoriaMap: { [key: string]: number } = {
  'Restaurantes': 1,
   'Parques': 2,
   'Iglesias': 3,
   'Mercados': 6,
   'Supermercados': 7,
   'Plazas': 4,
   'Tiendas': 8,
   'Antros': 5,
   'Puestos_Locales': 9
 };


 constructor(
   private router: Router,
   private route: ActivatedRoute,
   private httpLaravelService: HttpLaravelService,
 ) {}


 ngOnInit(): void {
   this.id_destino = this.route.snapshot.paramMap.get('id_destino');
   this.id_usuario = this.route.snapshot.paramMap.get('id_usuario');
   if (this.id_destino) {
     this.obtenerLugar(+this.id_destino);
     this.obtenerValoraciones(); // Llamada para obtener las valoraciones del lugar
   }

    this.logLoadTime();  // 👈 mide tiempo de carga

 }


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
   this.router.navigate(['/home-invitado-usuario', this.id_usuario]); // Navega a la página de inicio del usuario invitado
 }


 // Método para obtener el nombre de la categoría basado en el ID
 obtenerCategoriaNombre(idCategoria: number): string {
   for (const categoria in this.categoriaMap) {
     if (this.categoriaMap[categoria] === idCategoria) {
       return categoria.charAt(0).toUpperCase() + categoria.slice(1).replace('_', ' '); // Capitaliza la primera letra y reemplaza _ por espacios
     }
   }
   return 'Categoría desconocida'; // Si no encuentra la categoría, muestra este texto
 }

crearResenia(): void {
  if (this.id_usuario != "0") {
    console.log('Navegando a la reseña del usuario para el lugar con ID:', this.id_destino, 'y usuario con ID:', this.id_usuario);
    this.router.navigate(['/resenia-usuario', this.id_destino, this.id_usuario]);
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

obtenerValoraciones(): void {
  const modelo = 'lugar';
  const dato = `${this.id_destino}/comentarios`;

  this.httpLaravelService.Service_Get(modelo, dato).subscribe({
    next: (respuesta: any) => {
      const comentarios = respuesta?.data || [];

      if (Array.isArray(comentarios) && comentarios.length > 0) {
        const ordenados = comentarios.sort((a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        this.ultimoComentario = ordenados[0];

        const suma = comentarios.reduce((acc, c) => acc + (c.valoracion || 0), 0);
        this.promedioValoracion = suma / comentarios.length;

        this.totalComentarios = comentarios.length; // Aquí guardas el total
      } else {
        this.ultimoComentario = null;
        this.promedioValoracion = null;
        this.totalComentarios = 0;
      }
    },
    error: (error) => {
      console.error('❌ Error al obtener los comentarios:', error);
      this.ultimoComentario = null;
      this.promedioValoracion = null;
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
    this.router.navigate(['/vista-lista-comentarios', this.id_destino]);
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
}