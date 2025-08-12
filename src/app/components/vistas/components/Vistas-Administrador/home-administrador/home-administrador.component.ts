import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpLaravelService } from "../../../../../http.service";
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'home-administrador',
  standalone: false,
  templateUrl: './home-administrador.component.html',
  styleUrls: ['./home-administrador.component.scss']
})
export class HomeAdministradorComponent implements OnInit{
  idUsuario: number = 0;

  constructor(
    private service: HttpLaravelService,
    private router: Router,
    private route: ActivatedRoute
  ){}
  ngOnInit(): void {
    this.logLoadTime();  // 👈 mide tiempo de carga
    this.idUsuario = Number(this.route.snapshot.paramMap.get('id_usuario'));
    console.log("id del usuario: "+this.idUsuario);
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

  GestionarUsuarios() {
    this.router.navigate(['/lista-usuarios', this.idUsuario]);
  }

  AdministrarLugares() {
    this.router.navigate(['/lista-lugares', this.idUsuario]);
  }

  Ayuda() {
    this.router.navigate(['/ayuda-administrador', this.idUsuario]);
  }

}