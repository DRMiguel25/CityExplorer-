import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'home-invitado-usuario',
  standalone: false,
  templateUrl: './home-invitado-usuario.component.html',
  styleUrls: ['./home-invitado-usuario.component.scss']
})
export class HomeInvitadoUsuarioComponent implements OnInit, OnDestroy {
  images = [
    'https://a.travel-assets.com/findyours-php/viewfinder/images/res60/200000/200753-Guanajuato.jpg',
    'https://a.travel-assets.com/findyours-php/viewfinder/images/res60/201000/201316-El-Charco-Del-Ingenio.jpg',
    'https://a.travel-assets.com/findyours-php/viewfinder/images/res60/200000/200736-Guanajuato.jpg',
    'https://a.travel-assets.com/findyours-php/viewfinder/images/res60/201000/201398-Juarez-Park.jpg',
    'https://a.travel-assets.com/findyours-php/viewfinder/images/res60/201000/201392-Juarez-Park.jpg',
    'https://a.travel-assets.com/findyours-php/viewfinder/images/res60/201000/201659-Sanctuary-Of-Atotonilco.jpg',
    'https://a.travel-assets.com/findyours-php/viewfinder/images/res60/201000/201734-La-Esquina-Mexican-Folk-Toy-Museum.jpg',
    'https://a.travel-assets.com/findyours-php/viewfinder/images/res60/201000/201310-El-Charco-Del-Ingenio.jpg'
  ];
  
  private slideshowInterval: any;
  
  constructor(private router: Router) {}

  ngOnInit(): void {
    this.logLoadTime();  // 👈 mide tiempo de carga

    this.initSlideshow();
  }
  
  ngOnDestroy(): void {
    // Limpia el intervalo cuando el componente se destruye
    if (this.slideshowInterval) {
      clearInterval(this.slideshowInterval);
    }
  }
  
  home() {
    this.router.navigate(['/login']);
  }
  
  private initSlideshow(): void {
    let index = 0;
    const slideshow = document.getElementById('slideshow');
    const overlay = document.getElementById('overlay');
    
    if (slideshow && overlay) {
      // Inicializa
      slideshow.style.backgroundImage = `url('${this.images[0]}')`;
      
      // Configura el intervalo
      this.slideshowInterval = setInterval(() => {
        // Fade out con overlay
        overlay.style.opacity = '0.5';
        slideshow.style.opacity = '0';
        
        setTimeout(() => {
          slideshow.style.backgroundImage = `url('${this.images[index]}')`;
          slideshow.style.opacity = '1';
          overlay.style.opacity = '0.3'; // Vuelve a opacidad normal
          index = (index + 1) % this.images.length;
        }, 1000); // Tiempo para el fade out
      }, 8000); // Cambia cada 8 segundos
    }
  }

    logLoadTime() {
  window.addEventListener('load', () => {
    const [navEntry] = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
    if (navEntry) {
      console.log('⏱️ Tiempo total de carga en home invitado usuario (domComplete):', navEntry.domComplete.toFixed(2), 'ms');
      console.log('🧱 Tiempo de render en home invitado usuario (domContentLoaded):', navEntry.domContentLoadedEventEnd.toFixed(2), 'ms');
      console.log('🌐 Tiempo de respuesta home invitado usuario (responseEnd):', navEntry.responseEnd.toFixed(2), 'ms');
    } else {
      // Fallback para navegadores antiguos
      const timing = performance.timing;
      const totalLoadTime = timing.loadEventEnd - timing.navigationStart;
      console.log('⏱️ Tiempo total de carga (fallback):', totalLoadTime, 'ms');
    }
  });
}

}