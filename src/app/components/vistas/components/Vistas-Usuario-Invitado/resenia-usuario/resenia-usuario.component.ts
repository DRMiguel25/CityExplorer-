import { Component, Inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HttpLaravelService } from '../../../../../http.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'resenia-usuario',
  standalone: false,
  templateUrl: './resenia-usuario.component.html',
  styleUrl: './resenia-usuario.component.scss'
})
export class ReseniaUsuarioComponent implements OnInit{
  id_usuario: number | null = null; // Aquí guardamos el ID del usuario
  id_destino: number | null = null; // Aquí guardamos el ID del destino
  id_resenia: number | null = null; // Aquí guardamos el ID de la reseña
  pagina_regreso: number | null = null;

  contenido: string = '';
  valoracion: number = 0;
  charCount: number = 0;

  tituloResenia: string = 'Crear una reseña';


  private icons: { [key: string]: number } = {
    'restaurant': 1,
    'park': 2,
    'church': 3,
    'Mercados': 6,
    'shopping_cart': 7,
    'local_mall': 4,
    'store': 8,
    'Antros': 5,
    'nightlife': 9
  };

  lugar: any = null;


 constructor(
   private router: Router,
   private route: ActivatedRoute,
   private httpLaravelService: HttpLaravelService,
   private dialogRef: MatDialogRef<ReseniaUsuarioComponent>, // <- agregado
  @Inject(MAT_DIALOG_DATA) public data: { id_destino: number, id_usuario: number, id_resenia: number, pagina_regreso: number } // aquí llega el id
 ) {}

  ngOnInit(): void {
    this.id_destino = this.data.id_destino
    this.id_usuario = this.data.id_usuario
    this.id_resenia = this.data.id_resenia
    this.pagina_regreso = this.data.pagina_regreso;

    console.log('ID Usuario:', this.id_usuario);
    console.log('ID Destino:', this.id_destino);
    console.log('ID Reseña:', this.id_resenia);

    // Cambiar el título dependiendo si es creación o edición
    if (this.id_resenia === 0) {
      this.tituloResenia = "Crear una reseña";
    } else {
      this.tituloResenia = "Modificar tu reseña";
    }

    if (this.id_destino) {
      this.obtenerLugar();
    } else {
      Swal.fire('Error', 'ID de destino no proporcionado', 'error');
    }

    this.logLoadTime();  // 👈 mide tiempo de carga
  }


  obtenerLugar(): void {
    if (!this.id_destino) return;

    const id = Number(this.id_destino); // Asegúrate de que sea número

    this.httpLaravelService.Service_Get_Lugar_Publico(id).subscribe({
      next: (data) => {
        this.lugar = data;
        console.log('Lugar:', this.lugar);
      },
      error: (err) => {
        console.error('Error al obtener lugar:', err);
        Swal.fire('Error', 'No se pudo cargar la información del lugar', 'error');
      }
    });
  }

  getIconoCategoria(): string {
    if (!this.lugar) return 'help';
    
    const id = this.lugar.id_categoria;
    console.log('ID de categoría:', id);
    // Busca la clave (icono) correspondiente al ID
    const icono = Object.entries(this.icons).find(([_, valor]) => valor === id);
    console.log('Icono encontrado:', icono);
    return icono ? icono[0] : 'help';
  }

enviarResenia(): void {
  // Validaciones básicas
  if (this.valoracion <= 0) {
    Swal.fire('Atención', 'Por favor, asigna una calificación.', 'warning');
    return;
  }

  if (!this.contenido || this.contenido.trim().length < 30) {
    Swal.fire('Atención', 'Tu reseña debe tener al menos 30 caracteres.', 'warning');
    return;
  }

  const comentario = {
    contenido: this.contenido.trim(),
    valoracion: this.valoracion,
    id_lugar: Number(this.id_destino)
  };

  if (this.id_resenia && this.id_resenia !== 0) {
    // Actualizar reseña existente
    this.httpLaravelService.Service_Put('comentarios', this.id_resenia, comentario).subscribe({
      next: (respuesta) => {
        console.log('Reseña actualizada correctamente:', respuesta);
        Swal.fire({
          icon: 'success',
          title: '¡Reseña modificada!',
          text: 'Tu opinión fue actualizada exitosamente.',
          confirmButtonColor: '#3085d6'
        }).then(() => {
          this.dialogRef.close();
          this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
            this.router.navigate(['/vista-detallada-destino', this.id_destino, this.id_usuario, this.pagina_regreso]);
          });
          console.log('vista del usuario reseña cerrada y redirigiendo a vista detallada del destino');
        });
      },
      error: (error) => {
        console.error('Error al actualizar la reseña:', error);
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'Ocurrió un error al actualizar tu reseña. Intenta de nuevo.',
          confirmButtonColor: '#d33'
        });
      }
    });
  } else {
    // Crear nueva reseña
    this.httpLaravelService.Service_Post('comentarios', '', comentario).subscribe({
      next: (respuesta) => {
        console.log('Reseña enviada correctamente:', respuesta);
        Swal.fire({
          icon: 'success',
          title: '¡Reseña enviada!',
          text: 'Gracias por compartir tu opinión.',
          confirmButtonColor: '#3085d6'
        }).then(() => {
          this.dialogRef.close();
          this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
            this.router.navigate(['/vista-detallada-destino', this.id_destino, this.id_usuario, this.pagina_regreso]);
          });
          console.log('vista del usuario reseña cerrada y redirigiendo a vista detallada del destino');
        });
      },
      error: (error) => {
        console.error('Error al enviar la reseña:', error);
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'Ocurrió un error al enviar tu reseña. Intenta de nuevo.',
          confirmButtonColor: '#d33'
        });
      }
    });
  }
}



  closeModal(): void {
    this.dialogRef.close();
    console.log('vista del usuario reseña cerrada y redirigiendo a vista detallada del destino');
  }

    logLoadTime() {
  window.addEventListener('load', () => {
    const [navEntry] = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
    if (navEntry) {
      console.log('⏱️ Tiempo total de carga en reseña usuario (domComplete):', navEntry.domComplete.toFixed(2), 'ms');
      console.log('🧱 Tiempo de render en reseña usuario (domContentLoaded):', navEntry.domContentLoadedEventEnd.toFixed(2), 'ms');
      console.log('🌐 Tiempo de respuesta reseña usuario (responseEnd):', navEntry.responseEnd.toFixed(2), 'ms');
    } else {
      // Fallback para navegadores antiguos
      const timing = performance.timing;
      const totalLoadTime = timing.loadEventEnd - timing.navigationStart;
      console.log('⏱️ Tiempo total de carga (fallback):', totalLoadTime, 'ms');
    }
  });
}

}