import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { PasswordResetService } from '../../services/password-reset.service';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-password-reset',
  templateUrl: './password-reset.component.html',
  styleUrls: ['./password-reset.component.css']
})
export class PasswordResetComponent implements OnInit, OnDestroy {
  currentStep = 1;
  correoForm: FormGroup;
  resetForm: FormGroup;

  loading = false;
  error: string | null = null;
  success: string | null = null;

  timeRemaining = 0;
  timerSubscription?: Subscription;

  remainingAttempts = 5;
  currentCorreo = '';

  constructor(
    private fb: FormBuilder,
    private passwordResetService: PasswordResetService,
    private router: Router
  ) {
    this.correoForm = this.fb.group({
      correo: ['', [Validators.required, Validators.email]]
    });

    this.resetForm = this.fb.group({
      code: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      password_confirmation: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit() {
    const savedCorreo = localStorage.getItem('reset_correo');
    if (savedCorreo) {
      this.currentCorreo = savedCorreo;
      this.checkExistingCode();
    }
  }

  ngOnDestroy() {
    this.stopTimer();
    localStorage.removeItem('reset_correo');
  }

  passwordMatchValidator(group: FormGroup) {
    const password = group.get('password');
    const confirmPassword = group.get('password_confirmation');
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    return null;
  }

  sendResetCode() {
    if (this.correoForm.invalid) return;

    this.loading = true;
    this.error = null;
    this.success = null;

    const correo = this.correoForm.value.correo;

    this.passwordResetService.sendResetCode(correo).subscribe({
      next: (response) => {
        this.loading = false;
        this.success = response.message;
        this.currentCorreo = correo;
        this.currentStep = 2;

        localStorage.setItem('reset_correo', correo);

        this.timeRemaining = response.expires_in_minutes * 60;
        this.startTimer();

        setTimeout(() => {
          const codeInput = document.getElementById('code');
          if (codeInput) codeInput.focus();
        }, 100);
      },
      error: (error) => {
        this.loading = false;
        this.error = error.error?.message || 'Error enviando código';

        if (error.status === 429) {
          this.error = 'Has superado el límite de códigos por hora. Intenta más tarde.';
        }
      }
    });
  }

  resetPassword() {
    if (this.resetForm.invalid) return;

    this.loading = true;
    this.error = null;

    const formData = {
      correo: this.currentCorreo,
      code: this.resetForm.value.code,
      password: this.resetForm.value.password,
      password_confirmation: this.resetForm.value.password_confirmation
    };

    this.passwordResetService.resetPassword(formData).subscribe({
      next: (response) => {
        this.loading = false;
        this.success = response.message;
        this.stopTimer();
        localStorage.removeItem('reset_correo');
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (error) => {
        this.loading = false;
        this.error = error.error?.message || 'Error restableciendo contraseña';

        if (error.error?.remaining_attempts !== undefined) {
          this.remainingAttempts = error.error.remaining_attempts;
        }

        if (error.error?.error === 'code_expired' || error.error?.error === 'max_attempts_exceeded') {
          this.backToStep1();
        }
      }
    });
  }

  checkExistingCode() {
    this.passwordResetService.checkCodeStatus(this.currentCorreo).subscribe({
      next: (response) => {
        if (response.exists && !response.is_expired) {
          this.currentStep = 2;
          this.remainingAttempts = response.remaining_attempts || 5;

          if (response.expires_at) {
            const expiresAt = new Date(response.expires_at).getTime();
            const now = new Date().getTime();
            this.timeRemaining = Math.max(0, Math.floor((expiresAt - now) / 1000));

            if (this.timeRemaining > 0) {
              this.startTimer();
            } else {
              this.backToStep1();
            }
          }
        } else {
          this.backToStep1();
        }
      },
      error: () => {
        this.backToStep1();
      }
    });
  }

  backToStep1() {
    this.currentStep = 1;
    this.stopTimer();
    this.remainingAttempts = 5;
    this.currentCorreo = '';
    this.resetForm.reset();
    this.error = null;
    this.success = null;
    localStorage.removeItem('reset_correo');
  }

  resendCode() {
    this.correoForm.patchValue({ correo: this.currentCorreo });
    this.sendResetCode();
  }

  onCodeInput(event: any) {
    let value = event.target.value.replace(/\D/g, '');
    if (value.length > 6) {
      value = value.substring(0, 6);
    }
    this.resetForm.patchValue({ code: value });
  }

  startTimer() {
    this.timerSubscription = interval(1000).subscribe(() => {
      this.timeRemaining--;
      if (this.timeRemaining <= 0) {
        this.stopTimer();
        this.error = 'El código ha expirado. Solicita uno nuevo.';
      }
    });
  }

  stopTimer() {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
      this.timerSubscription = undefined;
    }
  }

  formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  get correoControl() { return this.correoForm.get('correo'); }
  get codeControl() { return this.resetForm.get('code'); }
  get passwordControl() { return this.resetForm.get('password'); }
  get confirmPasswordControl() { return this.resetForm.get('password_confirmation'); }
}

