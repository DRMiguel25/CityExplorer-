import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'categorias',
  standalone: false,
  templateUrl: './categorias.component.html',
  styleUrls: ['./categorias.component.scss']
})
export class CategoriasComponent implements OnInit, OnDestroy {
  private slideshowInterval: any;
  private id: string | null = null; // Variable para almacenar el ID de la ruta

  images = [
    'https://a.travel-assets.com/findyours-php/viewfinder/images/res60/200000/200753-Guanajuato.jpg',
    'https://a.travel-assets.com/findyours-php/viewfinder/images/res60/201000/201316-El-Charco-Del-Ingenio.jpg',
    'https://a.travel-assets.com/findyours-php/viewfinder/images/res60/200000/200736-Guanajuato.jpg',
    'https://a.travel-assets.com/findyours-php/viewfinder/images/res60/201000/201398-Juarez-Park.jpg'
  ];

  constructor(private router: Router, private route: ActivatedRoute,) {}

  ngOnInit(): void {
    this.initBackgroundChange();
    this.id = this.route.snapshot.paramMap.get('id_usuario');
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
}
