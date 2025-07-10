import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'terminos-de-servicio',
  standalone: false,
  templateUrl: './terminos-de-servicio.component.html',
  styleUrl: './terminos-de-servicio.component.scss'
})
export class TerminosDeServicioAnuncianteComponent implements OnInit{

  ngOnInit(): void {
    this.logLoadTime();  // 👈 mide tiempo de carga
  }

  logLoadTime() {
  window.addEventListener('load', () => {
    const [navEntry] = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
    if (navEntry) {
      console.log('⏱️ Tiempo total de carga en terminos-de-servicio (domComplete):', navEntry.domComplete.toFixed(2), 'ms');
      console.log('🧱 Tiempo de render en terminos-de-servicio (domContentLoaded):', navEntry.domContentLoadedEventEnd.toFixed(2), 'ms');
      console.log('🌐 Tiempo de respuesta terminos-de-servicio (responseEnd):', navEntry.responseEnd.toFixed(2), 'ms');
    } else {
      // Fallback para navegadores antiguos
      const timing = performance.timing;
      const totalLoadTime = timing.loadEventEnd - timing.navigationStart;
      console.log('⏱️ Tiempo total de carga (fallback):', totalLoadTime, 'ms');
    }
  });
}
}