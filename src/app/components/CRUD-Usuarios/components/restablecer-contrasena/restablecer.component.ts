
import { Component } from '@angular/core';
import { PasswordResetService } from '../../../../services/password-reset.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-restablecer',
  standalone: false,
  templateUrl: './restablecer.component.html',
  styleUrls: ['./restablecer.component.scss']

})
export class RestablecerComponent {
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

  constructor(private service: PasswordResetService, private router: Router, ) {}

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
        setTimeout(() => this.router.navigate(['/login']), 2000);
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
    this.router.navigate(['/login']);
  }

  formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  }
}
