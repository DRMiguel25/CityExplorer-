import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpLaravelService } from "../../../../http.service";
import Swal from 'sweetalert2';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../../auth.service';

@Component({
  selector: 'crear-actualizar-anuncio',
  standalone: false,
  templateUrl: './crear-actualizar-anuncio.component.html',
  styleUrls: ['./crear-actualizar-anuncio.component.scss']
})
export class CrearActualizarAnuncioComponent implements OnInit {
  anuncioForm: FormGroup;
  id_anuncio: string | null = null;
  direccion: any;
  imagenesSeleccionadas: File[] = [];
  categoriasOpciones: any[] = [];
  diasServicioOpciones: string[] = [];

  id_usuario: string | null = null;

  imagenesActuales: any[] = [];  // Las imágenes que ya tenía el anuncio (con sus IDs del backend)
  imagenesAEliminar: number[] = [];  // Para guardar IDs de imágenes que el usuario quiere borrar


  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private service: HttpLaravelService,
    private authService: AuthService
  ) {
    this.anuncioForm = this.fb.group({
      nombre: ['', Validators.required],
      descripcion: ['', Validators.required],
      imagenes: [null],
      paginaWeb: ['', [Validators.required, Validators.pattern(/^(https?:\/\/)?([a-z0-9-]+\.)+[a-z]{2,}(:\d+)?(\/.*)?$/)]],
      num_telefonico: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      horario_apertura: ['', Validators.required],
      horario_cierre: ['', Validators.required],
      dias_servicio: ['', Validators.required],
      categoria: ['', Validators.required],
      direccion: this.fb.group({
        calle: ['', Validators.required],
        numero_ext: ['', Validators.required],
        numero_int: [''],
        colonia: ['', Validators.required],
        codigo_postal: ['', [Validators.required, Validators.pattern(/^\d{5}$/)]],
      })
    });
  }

  ngOnInit(): void {
  this.obtenerCategoriasDesdeAPI();
  this.diasServicioOpciones = [
    'Lunes-Viernes', 'Lunes-Sábado', 'Lunes-Domingo',
    'Jueves-Domingo', 'Viernes-Domingo', 'Sabado-Domingo'
  ];

  this.id_usuario = this.route.snapshot.paramMap.get('id_usuario');
  this.id_anuncio = this.route.snapshot.paramMap.get('id_anuncio');

  console.log('📌 ID Usuario:', this.id_usuario);
  console.log('📌 ID Anuncio:', this.id_anuncio);

  if (this.id_anuncio != null && this.id_anuncio !== '0') {
    console.log('🔎 Buscando información del anuncio...');
    this.cargarAnuncio(this.id_anuncio);
  }

  this.logLoadTime();
}

ngOnDestroy(): void {
  this.imagenesSeleccionadas.forEach(file => URL.revokeObjectURL(this.getPreviewUrl(file)));
}


cargarAnuncio(id: string): void {
  console.log(`🔁 Haciendo GET a: lugar/${id}`);

  this.service.Service_Get('lugar', id).subscribe({
    next: (anuncio: any) => {
      console.log('✅ Anuncio recibido del backend:', anuncio);

      if (!anuncio) {
        console.warn('⚠️ No se encontró anuncio con ese ID.');
        return;
      }

      // Si el backend te devuelve las imágenes:
      if (anuncio.imagenes) {
        this.imagenesActuales = anuncio.imagenes;
        console.log('🖼️ Imágenes actuales:', this.imagenesActuales);
      }

      // Ahora carga la dirección
      console.log(`🔁 Haciendo GET a: direccion/${anuncio.id_direccion}`);
      this.service.Service_Get('direccion', anuncio.id_direccion).subscribe({
        next: (direccion: any) => {
          console.log('✅ Dirección recibida:', direccion);

          // Setear valores en el formulario
          this.anuncioForm.patchValue({
            nombre: anuncio.nombre,
            descripcion: anuncio.descripcion,
            paginaWeb: anuncio.paginaWeb,
            num_telefonico: anuncio.num_telefonico,
            horario_apertura: anuncio.horario_apertura.length === 8
              ? anuncio.horario_apertura.substring(0, 5)
              : anuncio.horario_apertura,
            horario_cierre: anuncio.horario_cierre.length === 8
              ? anuncio.horario_cierre.substring(0, 5)
              : anuncio.horario_cierre,
            dias_servicio: Array.isArray(anuncio.dias_servicio)
              ? anuncio.dias_servicio.join('-')
              : anuncio.dias_servicio,
            categoria: anuncio.id_categoria,
            direccion: {
              calle: direccion.calle,
              numero_ext: direccion.numero_ext,
              numero_int: direccion.numero_int || '',
              colonia: direccion.colonia,
              codigo_postal: direccion.codigo_postal
            }
          });

          console.log('✅ Formulario rellenado correctamente con datos del anuncio.');
        },
        error: (error) => {
          console.error('❌ Error al cargar la dirección:', error);
        }
      });
    },
    error: (error) => {
      console.error('❌ Error al cargar el anuncio:', error);
    }
  });
}

  obtenerCategoriasDesdeAPI(): void {
    this.service.Service_Get('categorias', '').subscribe({
      next: (resp: any) => {
        this.categoriasOpciones = resp.data;
        console.log('📦 Categorías obtenidas:', this.categoriasOpciones);
      },
      error: (error) => {
        console.error('❌ Error al obtener categorías:', error);
      }
    });
  }

  guardarAnuncio(): void {
    if (this.anuncioForm.invalid) {
      this.logErroresFormulario(this.anuncioForm);
      this.anuncioForm.markAllAsTouched();
      return;
    }

    if (this.id_anuncio && this.id_anuncio !== '0') {
      this.actualizarAnuncio();
    } else {
      this.crearAnuncio();
    }
  }

  crearAnuncio(): void {
    const formData = this.prepararFormData();

    this.service.Service_Post_FormData_Auth('lugar', 'con-direccion', formData).subscribe({
      next: (response) => {
        Swal.fire('¡Éxito!', 'Lugar creado correctamente', 'success');
        this.router.navigate([`/home-anunciante`, this.id_usuario]);
      },
      error: (error) => {
        console.error('❌ Error al crear el lugar:', error);
        Swal.fire('Error', 'Ocurrió un error al crear el anuncio', 'error');
      }
    });
  }

  actualizarAnuncio(): void {
    const formData = this.prepararFormData();

    // 👉 Agregar imágenes a eliminar si el usuario marcó alguna
    this.imagenesAEliminar.forEach((id: number) => {
      formData.append('imagenes_a_eliminar[]', id.toString());
    });

    this.service.Service_Post_FormData_Auth('lugar', this.id_anuncio!, formData).subscribe({
      next: (response) => {
        Swal.fire('¡Actualizado!', 'Anuncio actualizado correctamente', 'success');
        this.router.navigate([`/home-anunciante`, this.id_usuario]);
      },
      error: (error) => {
        console.error('❌ Error al actualizar el lugar:', error);
        Swal.fire('Error', 'Ocurrió un error al actualizar el anuncio', 'error');
      }
    });
  }


private prepararFormData(): FormData {
  const formData = this.anuncioForm.value;
  const data = new FormData();

  const diasServicio = Array.isArray(formData.dias_servicio)
    ? formData.dias_servicio
    : formData.dias_servicio.split('-').map((dia: string) => dia.trim());

  const horarioApertura = formData.horario_apertura.length === 5
    ? `${formData.horario_apertura}:00`
    : formData.horario_apertura;

  const horarioCierre = formData.horario_cierre.length === 5
    ? `${formData.horario_cierre}:00`
    : formData.horario_cierre;

  const paginaWeb = formData.paginaWeb.startsWith('http')
    ? formData.paginaWeb
    : `https://${formData.paginaWeb}`;

  // Dirección
  data.append('direccion[calle]', formData.direccion.calle);
  data.append('direccion[numero_ext]', formData.direccion.numero_ext);
  data.append('direccion[numero_int]', formData.direccion.numero_int || '');
  data.append('direccion[colonia]', formData.direccion.colonia);
  data.append('direccion[codigo_postal]', formData.direccion.codigo_postal);

  // Lugar
  data.append('lugar[nombre]', formData.nombre);
  data.append('lugar[descripcion]', formData.descripcion);
  data.append('lugar[paginaWeb]', paginaWeb);
  data.append('lugar[num_telefonico]', formData.num_telefonico);
  data.append('lugar[horario_apertura]', horarioApertura);
  data.append('lugar[horario_cierre]', horarioCierre);
  data.append('lugar[id_categoria]', formData.categoria.toString());
  data.append('lugar[activo]', '0');

  diasServicio.forEach((dia: string) => {
    data.append('lugar[dias_servicio][]', dia);
  });

  // Agregar imágenes nuevas seleccionadas
  this.imagenesSeleccionadas.forEach((img: File) => {
    data.append('imagenes[]', img);
  });

  // Agregar IDs de imágenes actuales que no están marcadas para eliminar
  this.imagenesActuales.forEach(img => {
    if (img?.id_imagen && !this.imagenesAEliminar.includes(img.id_imagen)) {
      data.append('imagenes[]', img.id_imagen.toString());
    }
  });

  return data;
}

onImagenesSeleccionadas(event: Event): void {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files.length > 0) {
    const nuevosArchivos = Array.from(input.files);

    // Validar tipo y tamaño
    const archivosValidos = nuevosArchivos.filter(file =>
      ['image/jpeg', 'image/png', 'image/webp'].includes(file.type) && file.size <= 2 * 1024 * 1024
    );

    if (archivosValidos.length !== nuevosArchivos.length) {
      Swal.fire('¡Error!', 'Solo se permiten imágenes JPG, PNG o WEBP menores a 2MB.', 'error');
      return;
    }

    const totalActual = this.imagenesActuales.length + this.imagenesSeleccionadas.length;
    const totalDespues = totalActual + archivosValidos.length;

    if (totalDespues > 8) {
      Swal.fire(
        '¡Límite de imágenes!',
        `Solo puedes tener un máximo de 8 imágenes.\nActualmente tienes: ${this.imagenesActuales.length + this.imagenesSeleccionadas.length} seleccionadas.`,
        'warning'
      );
      return;
    }

    archivosValidos.forEach((archivo, index) => {
      const numeroImagen = this.imagenesActuales.length + this.imagenesSeleccionadas.length + 1;
      this.imagenesSeleccionadas.push(archivo);

      Swal.fire({
        icon: 'success',
        title: 'Imagen agregada',
        text: `Imagen ${numeroImagen}/8: ${archivo.name}`,
        timer: 2000,
        showConfirmButton: false,
        toast: true,
        position: 'top-end'
      });
    });

    console.log('📸 Imágenes seleccionadas:', this.imagenesSeleccionadas);
  }
}


  isInvalid(controlPath: string): boolean {
    const control = this.anuncioForm.get(controlPath);
    return !!control && control.invalid && (control.touched || control.dirty);
  }

  goBack(): void {
    this.router.navigate([`/home-anunciante`, this.id_usuario]);
  }

  private logErroresFormulario(form: FormGroup, nivel: string = ''): void {
    Object.keys(form.controls).forEach(controlNombre => {
      const control = form.get(controlNombre);
      const ruta = nivel ? `${nivel}.${controlNombre}` : controlNombre;

      if (control instanceof FormGroup) {
        this.logErroresFormulario(control, ruta);
      } else if (control?.invalid) {
        console.warn(`❌ Campo inválido: ${ruta}`, control.errors);
      }
    });
  }

  logLoadTime() {
    window.addEventListener('load', () => {
      const [navEntry] = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
      if (navEntry) {
        console.log('⏱️ Tiempo de carga:', navEntry.domComplete.toFixed(2), 'ms');
      } else {
        const timing = performance.timing;
        const totalLoadTime = timing.loadEventEnd - timing.navigationStart;
        console.log('⏱️ Tiempo total de carga (fallback):', totalLoadTime, 'ms');
      }
    });
  }

eliminarImagen(idImagen: number | undefined): void {
  if (!idImagen) {
    console.warn('Intento de eliminar imagen con ID inválido:', idImagen);
    return;
  }

  // Calculamos cuántas imágenes quedarían después de eliminar
  const totalRestantes =
    this.imagenesActuales.filter(img => img.id_imagen !== idImagen).length +
    this.imagenesSeleccionadas.length;

  if (totalRestantes < 1) {
    Swal.fire({
      icon: 'warning',
      title: 'Debe haber al menos una imagen',
      text: 'No puedes eliminar esta imagen porque el anuncio debe tener al menos una imagen visible.',
      confirmButtonText: 'Entendido',
      confirmButtonColor: '#3085d6'
    });
    return;
  }

  if (!this.imagenesAEliminar.includes(idImagen)) {
    this.imagenesAEliminar.push(idImagen);
  }

  this.imagenesActuales = this.imagenesActuales.filter(img => img.id_imagen !== idImagen);
  console.log('🗑️ Imágenes marcadas para eliminar:', this.imagenesAEliminar);
}


getPreviewUrl(file: File): string {
  return URL.createObjectURL(file);
}

eliminarImagenSeleccionada(file: File): void {
  this.imagenesSeleccionadas = this.imagenesSeleccionadas.filter(f => f !== file);
  console.log('🗑️ Imagen nueva quitada:', file.name);
}

}