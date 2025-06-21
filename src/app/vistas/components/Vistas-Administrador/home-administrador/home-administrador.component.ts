import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpLaravelService } from "../../../../http.service";
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'home-administrador',
  standalone: false,
  templateUrl: './home-administrador.component.html',
  styleUrls: ['./home-administrador.component.scss']
})
export class HomeAdministradorComponent implements OnInit{

  ngOnInit(): void {
    this.logLoadTime();  // 👈 mide tiempo de carga
  }

  logLoadTime() {
  window.addEventListener('load', () => {
    const [navEntry] = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
    if (navEntry) {
      console.log('⏱️ Tiempo total de carga en home administrador (domComplete):', navEntry.domComplete.toFixed(2), 'ms');
      console.log('🧱 Tiempo de render en home administrador (domContentLoaded):', navEntry.domContentLoadedEventEnd.toFixed(2), 'ms');
      console.log('🌐 Tiempo de respuesta home administrador (responseEnd):', navEntry.responseEnd.toFixed(2), 'ms');
    } else {
      // Fallback para navegadores antiguos
      const timing = performance.timing;
      const totalLoadTime = timing.loadEventEnd - timing.navigationStart;
      console.log('⏱️ Tiempo total de carga (fallback):', totalLoadTime, 'ms');
    }
  });
}
}