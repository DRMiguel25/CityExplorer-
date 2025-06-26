import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpLaravelService } from "../../../http.service";
import Swal from 'sweetalert2';

@Component({
  selector: 'app-registro',
  standalone: false,
  templateUrl: './registro.component.html',
  styleUrls: ['./registro.component.scss']
})
export class RegistroComponent {
  registroForm: FormGroup;

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
    });
  }

  registrar() {
    if (this.registroForm.invalid) {
      this.registroForm.markAllAsTouched();
      return;
    }
  
    const payload = this.registroForm.value;
    const rolId = Number(payload.id_rol); // Convertimos a número para evitar comparaciones fallidas
  
    // Validación para roles no habilitados
    if (rolId === 1 || rolId === 3) {
      Swal.fire({
        icon: 'info',
        title: 'Función no disponible',
        text: 'El rol seleccionado aún no está habilitado. Por favor, selecciona otro.',
        confirmButtonText: 'Entendido'
      });
      return;
    } else {
      console.log('Enviando JSON al backend:', payload);
    
      this.service.Service_Post('user', 'register', payload).subscribe({
        next: (data: any) => {
          if (data.estatus) {
            Swal.fire('¡Éxito!', 'Usuario registrado correctamente', 'success');
            this.router.navigate(['/inicio-sesion']);
          } else {
            Swal.fire('Error', data.mensaje || 'No se pudo registrar el usuario', 'error');
          }
        },
        error: (err) => {
          console.error(err);
          Swal.fire('Error', 'Ocurrió un error en la conexión con el servidor', 'error');
        }
      });
    }
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
}