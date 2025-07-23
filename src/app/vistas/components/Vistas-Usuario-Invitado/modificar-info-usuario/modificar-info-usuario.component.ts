import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpLaravelService } from '../../../../http.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'modificar-info-usuario',
  standalone: false,
  templateUrl: './modificar-info-usuario.component.html',
  styleUrls: ['./modificar-info-usuario.component.scss']
})
export class ModificarInfoUsuarioComponent implements OnInit {

  ID: number = 0;
  usuarioForm!: FormGroup;
  fotoPreviewUrl: string | ArrayBuffer | null = null;
  fotoSeleccionada: File | null = null;

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private httpLaravelService: HttpLaravelService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id_usuario'));
    if (!isNaN(id) && id !== 0) {
      this.ID = id;
      this.inicializarFormulario();
      this.cargarUsuario(this.ID);
    } else {
      console.error('ID de usuario no válido:', id);
    }

    this.logLoadTime();
  }

  inicializarFormulario() {
    this.usuarioForm = this.fb.group({
      nombre: ['', Validators.required],
      apellidoP: ['', Validators.required],
      apellidoM: ['', Validators.required],
      correo: [ '', [Validators.required, Validators.email]],
      password: [''],
      id_rol: ['1'],
      foto_perfil: [null]
    });
  }

  isInvalid(campo: string): boolean {
    const control = this.usuarioForm.get(campo);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }


  cargarUsuario(id: number): void {
    this.httpLaravelService.Service_Get('usuario', id).subscribe(
      (respuesta: any) => {
        const data = respuesta.data;
        this.usuarioForm.patchValue({
          nombre: data.nombre,
          apellidoP: data.apellidoP,
          apellidoM: data.apellidoM,
          correo: data.correo,
          id_rol: data.id_rol?.toString() || '1'
        });
      },
      error => console.error('Error al obtener usuario:', error)
    );
  }

  seleccionarFoto(event: any): void {
    const file = event.target.files[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/gif'].includes(file.type)) {
      Swal.fire('Formato inválido', 'Solo se permiten JPG, PNG o GIF', 'warning');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      Swal.fire('Imagen muy grande', 'El tamaño máximo es 2MB', 'warning');
      return;
    }

    this.fotoSeleccionada = file;
    this.usuarioForm.patchValue({ foto_perfil: file });

    const reader = new FileReader();
    reader.onload = () => {
      this.fotoPreviewUrl = reader.result;
    };
    reader.readAsDataURL(file);
  }

  guardarPerfil(): void {
    if (this.usuarioForm.invalid) {
      Swal.fire('Campos incompletos', 'Por favor completa los campos obligatorios', 'warning');
      return;
    }

    const formData = new FormData();
    const formValue = this.usuarioForm.getRawValue();

    formData.append('nombre', formValue.nombre);
    formData.append('apellidoP', formValue.apellidoP);
    formData.append('apellidoM', formValue.apellidoM);
    formData.append('correo', formValue.correo);
    formData.append('id_rol', formValue.id_rol);

    if (formValue.password) {
      formData.append('password', formValue.password);
    }

    if (this.fotoSeleccionada) {
      formData.append('foto_perfil', this.fotoSeleccionada);
    }

    this.httpLaravelService.Service_Post('usuario', `${this.ID}/update`, formData).subscribe({
      next: () => {
        Swal.fire('Usuario actualizado', 'Perfil actualizado correctamente.', 'success').then(() => {
          this.router.navigate(['/home-invitado-usuario', this.ID]);
        });
      },
      error: (error) => {
        console.error('Error al actualizar perfil:', error);
        Swal.fire('Error', 'Ocurrió un error al actualizar el perfil', 'error');
      }
    });
  }

  cancelar(): void {
    this.router.navigate(['/home-invitado-usuario', this.ID]);
  }

  logLoadTime() {
    window.addEventListener('load', () => {
      const [navEntry] = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
      if (navEntry) {
        console.log('⏱️ DOM completo:', navEntry.domComplete.toFixed(2), 'ms');
        console.log('🧱 DOM content loaded:', navEntry.domContentLoadedEventEnd.toFixed(2), 'ms');
        console.log('🌐 Respuesta:', navEntry.responseEnd.toFixed(2), 'ms');
      }
    });
  }
}
