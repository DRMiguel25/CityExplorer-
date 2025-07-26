import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit{

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.logLoadTime();  // 👈 mide tiempo de carga
  }

  login() {
    console.log('Iniciar sesión');
    this.router.navigate(['/inicio-sesion']);  // Redirige a la ruta de inicio-sesion
  }

  register() {
    console.log('Ir a registro');
    this.router.navigate(['/registro']);  // Redirige a la ruta de registro
  }

  homeScreen() {
    console.log('Navegar como invitado');
    this.router.navigate(['/home-invitado-usuario']);  // Redirige a la ruta de home
    // Aquí puedes manejar la navegación como invitado si lo deseas
  }

  logLoadTime() {
  window.addEventListener('load', () => {
    const [navEntry] = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
    if (navEntry) {
      console.log('⏱️ Tiempo total de carga en login (domComplete):', navEntry.domComplete.toFixed(2), 'ms');
      console.log('🧱 Tiempo de render en login (domContentLoaded):', navEntry.domContentLoadedEventEnd.toFixed(2), 'ms');
      console.log('🌐 Tiempo de respuesta login (responseEnd):', navEntry.responseEnd.toFixed(2), 'ms');
    } else {
      // Fallback para navegadores antiguos
      const timing = performance.timing;
      const totalLoadTime = timing.loadEventEnd - timing.navigationStart;
      console.log('⏱️ Tiempo total de carga (fallback):', totalLoadTime, 'ms');
    }
  });
}
}
