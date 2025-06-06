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
      foto_perfil: [null, Validators.required] // Nuevo campo
    });
  }

  onFileChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.registroForm.patchValue({ foto_perfil: file });
      this.registroForm.get('foto_perfil')?.markAsTouched();
    }
  }


  registrar() {
  if (this.registroForm.invalid) {
    this.registroForm.markAllAsTouched();
    return;
  }

  const formData = new FormData();
  for (const key in this.registroForm.value) {
    if (key === 'foto_perfil') {
      formData.append(key, this.registroForm.value[key]); // archivo
    } else {
      formData.append(key, this.registroForm.value[key]); // texto
    }
  }

  this.service.Service_Post_FormData('user', 'register', formData).subscribe({
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