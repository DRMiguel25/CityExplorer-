import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpLaravelService } from '../../../../http.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-registro',
  standalone: false,
  templateUrl: './registro.component.html',
  styleUrls: ['./registro.component.scss']
})
export class RegistroComponent implements OnInit {
  registroForm: FormGroup;
  previewUrl: string | ArrayBuffer | null = null;

  roles = [
    { id: 1, nombre: 'Usuario' },
    { id: 2, nombre: 'Anunciante' },
    { id: 3, nombre: 'Administrador' },
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private service: HttpLaravelService
  ) {
    this.registroForm = this.fb.group({
      nombre: ['', Validators.required],
      apellidoP: ['', Validators.required],
      apellidoM: ['', Validators.required],
      correo: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      id_rol: ['', Validators.required],
      foto_perfil: [null, Validators.required],
      acceptTerms: [false, Validators.requiredTrue]
    });
  }

  ngOnInit(): void {
    this.logLoadTime();
  }

  onFileChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.registroForm.patchValue({ foto_perfil: file });
      this.registroForm.get('foto_perfil')?.markAsTouched();

      const reader = new FileReader();
      reader.onload = () => {
        this.previewUrl = reader.result;
      };
      reader.readAsDataURL(file);
    }
  }

  registrar() {
  if (this.registroForm.invalid) {
    this.registroForm.markAllAsTouched();
    return;
  }
const formValue = { ...this.registroForm.value };
delete formValue.acceptTerms; // 🔹 Eliminar campo

  

  this.service.Service_Post_FormData('user', 'register', formValue).subscribe({
    next: (data: any) => {
      if (data.estatus) {
        Swal.fire('¡Éxito!', 'Usuario registrado correctamente', 'success');
        this.router.navigate(['/inicio-sesion']);
      } else {
        Swal.fire('Error', data.mensaje || 'No se pudo registrar el usuario', 'error');
      }
    },
    error: (err) => {
      console.error('Error en registro:', err);
      if (err.error && err.error.mensaje) {
        Swal.fire('Error', err.error.mensaje, 'error');
      } else {
        Swal.fire('Error', 'Ocurrió un error en la conexión con el servidor', 'error');
      }
    }
  });
}


  login() {
    this.router.navigate(['/login']);
  }

  get f() {
    return this.registroForm.controls;
  }

  isInvalid(field: string): boolean {
    return this.f[field].invalid && this.f[field].touched;
  }

  openTerms() {
    Swal.fire({
      title: 'Términos y Condiciones',
      html: `
        <p><strong>Términos y Condiciones de Uso</strong></p>
        <p>1. Aceptas no usar la plataforma para fines ilegales.</p>
        <p>2. Eres responsable de la veracidad de tus datos.</p>
        <p>3. Nos reservamos el derecho de suspender cuentas inactivas.</p>
      `,
      icon: 'info',
      confirmButtonText: 'Aceptar',
      width: '80%'
    });
  }

  logLoadTime() {
    window.addEventListener('load', () => {
      const [navEntry] = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
      if (navEntry) {
        console.log('⏱️ Tiempo total de carga (domComplete):', navEntry.domComplete.toFixed(2), 'ms');
        console.log('🧱 Tiempo de render (domContentLoaded):', navEntry.domContentLoadedEventEnd.toFixed(2), 'ms');
        console.log('🌐 Tiempo de respuesta (responseEnd):', navEntry.responseEnd.toFixed(2), 'ms');
      } else {
        const timing = performance.timing;
        const loadTime = timing.loadEventEnd - timing.navigationStart;
        console.log('⏱️ Tiempo de carga (fallback):', loadTime, 'ms');
      }
    });
  }
}