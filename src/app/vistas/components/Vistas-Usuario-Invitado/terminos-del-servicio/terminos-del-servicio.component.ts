import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'terminos-del-servicio',
  standalone: false,
  templateUrl: './terminos-del-servicio.component.html',
  styleUrl: './terminos-del-servicio.component.scss'
})
export class TerminosDelServicioComponent implements OnInit{

  ngOnInit(): void {
    this.logLoadTime();  // 👈 mide tiempo de carga
  }

  logLoadTime() {
  window.addEventListener('load', () => {
    const [navEntry] = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
    if (navEntry) {
      console.log('⏱️ Tiempo total de carga en terminos del servicio (domComplete):', navEntry.domComplete.toFixed(2), 'ms');
      console.log('🧱 Tiempo de render en terminos del servicio (domContentLoaded):', navEntry.domContentLoadedEventEnd.toFixed(2), 'ms');
      console.log('🌐 Tiempo de respuesta terminos del servicio (responseEnd):', navEntry.responseEnd.toFixed(2), 'ms');
    } else {
      // Fallback para navegadores antiguos
      const timing = performance.timing;
      const totalLoadTime = timing.loadEventEnd - timing.navigationStart;
      console.log('⏱️ Tiempo total de carga (fallback):', totalLoadTime, 'ms');
    }
  });
}
}