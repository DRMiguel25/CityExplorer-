import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'politicas-de-privacidad-anunciante',
  standalone: false,
  templateUrl: './politicas-de-privacidad-anunciante.component.html',
  styleUrls: ['./politicas-de-privacidad-anunciante.component.scss']
})
export class PoliticasDePrivacidadAnuncianteComponent implements OnInit{

  TipoUsuario: string | null = null;
  id_usuario: string | null = null;

  constructor(private router: Router, private route: ActivatedRoute){}

  ngOnInit(): void {
    this.logLoadTime();  // 👈 mide tiempo de carga

    this.TipoUsuario = this.route.snapshot.paramMap.get('tipo-usuario');
    this.id_usuario = this.route.snapshot.paramMap.get('id_usuario');
  }

  logLoadTime() {
  window.addEventListener('load', () => {
    const [navEntry] = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
    if (navEntry) {
      console.log('⏱️ Tiempo total de carga en politicas de privacidad (domComplete):', navEntry.domComplete.toFixed(2), 'ms');
      console.log('🧱 Tiempo de render en politicas de privacidad (domContentLoaded):', navEntry.domContentLoadedEventEnd.toFixed(2), 'ms');
      console.log('🌐 Tiempo de respuesta politicas de privacidad (responseEnd):', navEntry.responseEnd.toFixed(2), 'ms');
    } else {
      // Fallback para navegadores antiguos
      const timing = performance.timing;
      const totalLoadTime = timing.loadEventEnd - timing.navigationStart;
      console.log('⏱️ Tiempo total de carga (fallback):', totalLoadTime, 'ms');
    }
  });
}

goBack(){
  if (this.TipoUsuario === "1"){
    this.router.navigate(['/home-anunciante', this.id_usuario]);
  }
  else if (this.TipoUsuario === "2"){
    this.router.navigate(['/home-invitado-usuario', this.id_usuario]);
  }
  else if (this.TipoUsuario === "3"){
    this.router.navigate(['/home-administrador', this.id_usuario]);
  }
}
}