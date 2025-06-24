import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpLaravelService } from "../../../../http.service";

@Component({
  selector: 'categorias',
  standalone: false,
  templateUrl: './categorias.component.html',
  styleUrls: ['./categorias.component.scss']
})
export class CategoriasComponent implements OnInit, OnDestroy {
  private slideshowInterval: any;
  private id: string | null = null; // Variable para almacenar el ID de la ruta

  listaCategorias: any[] = [];

  images = [
    'https://a.travel-assets.com/findyours-php/viewfinder/images/res60/200000/200753-Guanajuato.jpg',
    'https://a.travel-assets.com/findyours-php/viewfinder/images/res60/201000/201316-El-Charco-Del-Ingenio.jpg',
    'https://a.travel-assets.com/findyours-php/viewfinder/images/res60/200000/200736-Guanajuato.jpg',
    'https://a.travel-assets.com/findyours-php/viewfinder/images/res60/201000/201398-Juarez-Park.jpg'
  ];

  constructor(private router: Router, private route: ActivatedRoute, private service: HttpLaravelService,) {}

  ngOnInit(): void {
    this.obtenerCategoriasDesdeAPI();
    this.initBackgroundChange();
    this.id = this.route.snapshot.paramMap.get('id_usuario');

    this.logLoadTime();  // 👈 mide tiempo de carga
  }

  ngOnDestroy(): void {
    if (this.slideshowInterval) {
      clearInterval(this.slideshowInterval);
    }
  }

  vistaCategorias(categorias: string) {
    if (categorias === 'Ayuda') {
      this.router.navigate(['/ayuda']);
    } else {
      console.log('Navegando a la vista de categorías:', categorias, 'con ID de usuario:', this.id);
      this.router.navigate(['/categoria-vista', categorias, this.id]);
    }
  }


  private initBackgroundChange(): void {
    const slideshow = document.querySelector('.background-slideshow') as HTMLElement;

    if (slideshow) {
      let index = 0;

      slideshow.style.backgroundImage = `url('${this.images[index]}')`;
      slideshow.style.opacity = '1';

      this.slideshowInterval = setInterval(() => {
        slideshow.style.opacity = '0';

        setTimeout(() => {
          index = (index + 1) % this.images.length;
          slideshow.style.backgroundImage = `url('${this.images[index]}')`;

          setTimeout(() => {
            slideshow.style.opacity = '1';
          }, 50);
        }, 500);
      }, 8000);
    } else {
      console.warn('Elemento de slideshow no encontrado.');
    }
  }

  logLoadTime() {
    window.addEventListener('load', () => {
      const [navEntry] = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
      if (navEntry) {
        console.log('⏱️ Tiempo total de carga en categorias (domComplete):', navEntry.domComplete.toFixed(2), 'ms');
        console.log('🧱 Tiempo de render en categorias (domContentLoaded):', navEntry.domContentLoadedEventEnd.toFixed(2), 'ms');
        console.log('🌐 Tiempo de respuesta categorias (responseEnd):', navEntry.responseEnd.toFixed(2), 'ms');
      } else {
        // Fallback para navegadores antiguos
        const timing = performance.timing;
        const totalLoadTime = timing.loadEventEnd - timing.navigationStart;
        console.log('⏱️ Tiempo total de carga (fallback):', totalLoadTime, 'ms');
      }
    });
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
}
