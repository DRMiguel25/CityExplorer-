import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'politicas-de-privacidad',
  standalone: false,
  templateUrl: './politicas-de-privacidad.component.html.html',
  styleUrl: './politicas-de-privacidad.component.html.scss'
})
export class PoliticasDePrivacidadAnuncianteComponent implements OnInit{

  ngOnInit(): void {
    this.logLoadTime();  // 👈 mide tiempo de carga
  }

  logLoadTime() {
  window.addEventListener('load', () => {
    const [navEntry] = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
    if (navEntry) {
      console.log('⏱️ Tiempo total de carga en politicas-de-privacidad (domComplete):', navEntry.domComplete.toFixed(2), 'ms');
      console.log('🧱 Tiempo de render en politicas-de-privacidad (domContentLoaded):', navEntry.domContentLoadedEventEnd.toFixed(2), 'ms');
      console.log('🌐 Tiempo de respuesta politicas-de-privacidad (responseEnd):', navEntry.responseEnd.toFixed(2), 'ms');
    } else {
      // Fallback para navegadores antiguos
      const timing = performance.timing;
      const totalLoadTime = timing.loadEventEnd - timing.navigationStart;
      console.log('⏱️ Tiempo total de carga (fallback):', totalLoadTime, 'ms');
    }
  });
}
}