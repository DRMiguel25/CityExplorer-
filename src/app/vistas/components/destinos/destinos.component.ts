import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { HttpLaravelService } from '../../../http.service';
import { Lugar } from '../home-anunciante/lugar.interface';

@Component({
  selector: 'destino-vista',
  standalone: false,
  templateUrl: './destinos.component.html',
  styleUrls: ['./destinos.component.scss']
})
export class DestinosVistaComponent implements OnInit, OnDestroy {
  lugares: Lugar[] = [];
  private slideshowInterval: any;

  // Lista de imágenes para el fondo animado
  images = [
    'https://a.travel-assets.com/findyours-php/viewfinder/images/res60/200000/200753-Guanajuato.jpg',
    'https://a.travel-assets.com/findyours-php/viewfinder/images/res60/201000/201316-El-Charco-Del-Ingenio.jpg',
    'https://a.travel-assets.com/findyours-php/viewfinder/images/res60/200000/200736-Guanajuato.jpg',
    'https://a.travel-assets.com/findyours-php/viewfinder/images/res60/201000/201398-Juarez-Park.jpg'
  ];

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private router: Router,
    private httpLaravelService: HttpLaravelService
  ) {}

  ngOnInit(): void {
    this.httpLaravelService.Service_Get_Lugares_Publico().subscribe({
      next: (data) => {
        this.lugares = data.filter((lugar: any) => lugar.activo);
        console.log('Lugares activos cargados:', this.lugares);
      },
      error: (err) => {
        console.error('Error al cargar lugares públicos:', err);
      }
    });

    // Inicializar el cambio de imágenes SOLO en el navegador
    if (isPlatformBrowser(this.platformId)) {
      this.initBackgroundChange();
    }
  }

  ngOnDestroy(): void {
    // Limpiar el intervalo cuando el componente se destruye
    if (this.slideshowInterval) {
      clearInterval(this.slideshowInterval);
    }
  }

  vistaDetalladaDestino(id: number | string) {
    console.log('ID del destino:', id);
    const idEntero = parseInt(id.toString(), 10);

    if (isNaN(idEntero)) {
      console.error('ID inválido:', id);
      return;
    }

    this.router.navigate(['/vista-detallada-destino', idEntero]);
  }

  private initBackgroundChange(): void {
    const slideshow = document.querySelector('.background-slideshow') as HTMLElement;

    if (slideshow) {
      let index = 0;

      // Establecer la primera imagen inmediatamente al cargar
      slideshow.style.backgroundImage = `url('${this.images[index]}')`;
      slideshow.style.opacity = '1'; // Asegurarse de que la opacidad sea visible

      // Esperar 2 segundos antes de iniciar el ciclo de animación
      setTimeout(() => {
        this.slideshowInterval = setInterval(() => {
          // Aplicar efecto de desvanecimiento
          slideshow.style.opacity = '0';

          setTimeout(() => {
            // Cambiar la imagen de fondo
            index = (index + 1) % this.images.length;
            slideshow.style.backgroundImage = `url('${this.images[index]}')`;

            // Restaurar la opacidad después de cambiar la imagen
            setTimeout(() => {
              slideshow.style.opacity = '1';
            }, 50); // Retraso mínimo para sincronizar la transición
          }, 500); // Duración del efecto de desvanecimiento
        }, 8000); // Cambio cada 8 segundos
      }, 2000); // Esperar 2 segundos antes de iniciar la animación
    } else {
      console.warn('Elemento de slideshow no encontrado.');
    }
  }
}