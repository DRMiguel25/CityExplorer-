import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {

  constructor(private router: Router) {}

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
    this.router.navigate(['/app-home']);  // Redirige a la ruta de home
    // Aquí puedes manejar la navegación como invitado si lo deseas
  }
}
