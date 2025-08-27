import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'terminos-del-servicio-anunciante',
  standalone: false,
  templateUrl: './terminos-del-servicio-anunciante.component.html',
  styleUrl: './terminos-del-servicio-anunciante.component.scss'
})
export class TerminosDelServicioAnuncianteComponent implements OnInit{

  id_usuario: string | null = null;

  constructor(private router: Router, private route: ActivatedRoute){}

  ngOnInit(): void {
    this.logLoadTime();  // 👈 mide tiempo de carga
    
    this.id_usuario = this.route.snapshot.paramMap.get('id_usuario');
  }

  logLoadTime() {
  window.addEventListener('load', () => {
    const [navEntry] = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
    if (navEntry) {
      console.log('⏱️ Tiempo total de carga en terminos del servicio anunciante (domComplete):', navEntry.domComplete.toFixed(2), 'ms');
      console.log('🧱 Tiempo de render en terminos del servicio anunciante (domContentLoaded):', navEntry.domContentLoadedEventEnd.toFixed(2), 'ms');
      console.log('🌐 Tiempo de respuesta terminos del servicio anunciante (responseEnd):', navEntry.responseEnd.toFixed(2), 'ms');
    } else {
      // Fallback para navegadores antiguos
      const timing = performance.timing;
      const totalLoadTime = timing.loadEventEnd - timing.navigationStart;
      console.log('⏱️ Tiempo total de carga (fallback):', totalLoadTime, 'ms');
    }
  });
}

goBack(){
  this.router.navigate(['/home-anunciante', this.id_usuario]);
}
}