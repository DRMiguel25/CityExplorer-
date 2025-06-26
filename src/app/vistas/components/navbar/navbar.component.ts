import { Component } from '@angular/core';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-navbar',
  standalone: false,
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class navbarComponent {
  constructor(private router: Router) {}

  goHome(): void {
    console.log('Navegando a app-home...');
    this.router.navigate(['/app-home']);
  }

  mostrarAlerta(): void {
    Swal.fire({
      icon: 'info',
      title: '¡Necesitas una cuenta!',
      text: 'Para acceder a esta opción, por favor, crea una cuenta o inicia sesión.',
      confirmButtonText: 'Entendido',
      confirmButtonColor: '#3085d6',
      background: '#f9f9f9',
      iconColor: '#3085d6'
    });
  }

  mostrarAlertaCrearCuenta(): void {
    Swal.fire({
      icon: 'info',
      title: '¿Ya tienes una cuenta?',
      text: 'Para acceder a esta opción necesitas iniciar sesión o crear una cuenta. ¿Deseas ir a la página de inicio de sesión?',
      showCancelButton: true,
      confirmButtonText: 'Sí, quiero iniciar sesión',
      cancelButtonText: 'No, gracias',
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      background: '#f9f9f9',
      iconColor: '#3085d6'
    }).then((result) => {
      if (result.isConfirmed) {
        this.router.navigate(['/login']);
      }
    });
  }

  toggleMenu(): void {
    console.log('Toggling menu...'); // Para depuración
    const navMenu = document.querySelector('.nav-menu');
    const hamburger = document.querySelector('.hamburger');
    if (navMenu && hamburger) {
      navMenu.classList.toggle('active');
      hamburger.classList.toggle('active');
      console.log('Classes toggled:', navMenu.classList, hamburger.classList); // Para depuración
    } else {
      console.error('No se encontraron los elementos .nav-menu o .hamburger');
    }
  }
}