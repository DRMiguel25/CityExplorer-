
import { Component, OnInit, OnDestroy } from '@angular/core';
import { PasswordResetService } from '../../../../services/password-reset.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-restablecer',
  standalone: false,
  templateUrl: './restablecer.component.html',
  styleUrls: ['./restablecer.component.scss']

})
export class RestablecerComponent implements OnInit, OnDestroy{
  currentStep = 1;
  correo = '';
  codigo = '';
  password = '';
  confirmPassword = '';
  loading = false;
  error = '';
  success = '';
  timeRemaining = 0;
  remainingAttempts = 5;

  tiempoRestante: number = 15 * 60; // 15 minutos en segundos
  intervalo: any;

  constructor(private service: PasswordResetService, private router: Router, ) {}
  
  ngOnInit(): void {
    this.iniciarContador();
  }

  ngOnDestroy(): void {
    clearInterval(this.intervalo);
  }

  enviarCorreo() {
    this.loading = true;
    this.service.sendResetCode(this.correo).subscribe({
      next: (res) => {
        this.success = res.message;
        this.currentStep = 2;
        this.timeRemaining = res.expires_in_minutes * 60;
      },
      error: (err) => {
        this.error = err.error?.message || 'Error al enviar el código';
      },
      complete: () => (this.loading = false)
    });
  }

  cambiarClave() {
    if (this.password !== this.confirmPassword) {
      this.error = 'Las contraseñas no coinciden';
      return;
    }

    this.loading = true;
    this.service.resetPassword({
      correo: this.correo,
      code: this.codigo,
      password: this.password,
      password_confirmation: this.confirmPassword
    }).subscribe({
      next: (res) => {
        this.success = res.message;
        setTimeout(() => this.router.navigate(['/inicio-sesion']), 2000);
      },
      error: (err) => {
        this.error = err.error?.message || 'Error al restablecer';
      },
      complete: () => (this.loading = false)
    });
  }

  reenviarCodigo() {
    this.enviarCorreo();
  }

  volver() {
    this.router.navigate(['/inicio-sesion']);
  }

  formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

iniciarContador(): void {
  this.intervalo = setInterval(() => {
    this.tiempoRestante--;

    if (this.tiempoRestante <= 0) {
      clearInterval(this.intervalo);
      Swal.fire({
        title: 'Tiempo agotado',
        text: 'El tiempo para ingresar el código ha caducado.',
        icon: 'warning',
        confirmButtonText: 'OK'
      }).then(() => {
        this.router.navigate(['/inicio-sesion']);
      });
    }
  }, 1000);
}

  get tiempoFormateado(): string {
    const minutos = Math.floor(this.tiempoRestante / 60).toString().padStart(2, '0');
    const segundos = (this.tiempoRestante % 60).toString().padStart(2, '0');
    return `${minutos}:${segundos}`;
  }
}
