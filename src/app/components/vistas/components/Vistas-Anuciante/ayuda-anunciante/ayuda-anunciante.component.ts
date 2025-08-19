import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';

@Component({
  selector: 'ayuda-anunciante',
  standalone: false,
  templateUrl: './ayuda-anunciante.component.html',
  styleUrls: ['./ayuda-anunciante.component.scss']
})
export class AyudaAnuncianteComponent implements OnInit{
  idUsuario: number = 0;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
  ){}

  ngOnInit(): void {
    this.idUsuario = Number(this.route.snapshot.paramMap.get('id_usuario'));
    console.log("id del usuario: "+this.idUsuario);
    
    this.logLoadTime();  // 👈 mide tiempo de carga
  }

  logLoadTime() {
  window.addEventListener('load', () => {
    const [navEntry] = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
    if (navEntry) {
      console.log('⏱️ Tiempo total de carga en ayuda (domComplete):', navEntry.domComplete.toFixed(2), 'ms');
      console.log('🧱 Tiempo de render en ayuda (domContentLoaded):', navEntry.domContentLoadedEventEnd.toFixed(2), 'ms');
      console.log('🌐 Tiempo de respuesta ayuda (responseEnd):', navEntry.responseEnd.toFixed(2), 'ms');
    } else {
      // Fallback para navegadores antiguos
      const timing = performance.timing;
      const totalLoadTime = timing.loadEventEnd - timing.navigationStart;
      console.log('⏱️ Tiempo total de carga (fallback):', totalLoadTime, 'ms');
    }
  });
}

goBack(){
  this.router.navigate([`/home-anunciante`,this.idUsuario]);
}

}
