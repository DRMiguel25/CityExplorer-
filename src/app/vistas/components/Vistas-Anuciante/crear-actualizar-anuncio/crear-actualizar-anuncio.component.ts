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
  ID: number | null = null;
  direccion: any;
  imagenesSeleccionadas: File[] = [];
  categoriasOpciones: any[] = [];
  diasServicioOpciones: string[] = [];

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

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.ID = +id;
      this.cargarAnuncio(this.ID);
    }

    this.logLoadTime();
  }

  cargarAnuncio(id: number): void {
    this.service.Service_Get('lugar', id).subscribe((anuncioArr: any[]) => {
      const anuncio = anuncioArr[0]; // Primer elemento del array

      this.service.Service_Get('direccion', anuncio.id_direccion).subscribe((direccionArr: any[]) => {
        const direccion = direccionArr[0]; // Primer elemento del array

        this.direccion = direccion;

        this.anuncioForm.patchValue({
          nombre: anuncio.nombre,
          descripcion: anuncio.descripcion,
          paginaWeb: anuncio.paginaWeb,
          num_telefonico: anuncio.num_telefonico,
          horario_apertura: anuncio.horario_apertura,
          horario_cierre: anuncio.horario_cierre,
          dias_servicio: anuncio.dias_servicio,
          categoria: this.obtenerNombreCategoriaPorId(anuncio.categoria_id), // Aquí usamos el nombre
          direccion: {
            calle: direccion.calle,
            numero_ext: direccion.numero_ext,
            numero_int: direccion.numero_int || '',
            colonia: direccion.colonia,
            codigo_postal: direccion.codigo_postal
          }
        });
      }, (error) => console.error('❌ Error al cargar la dirección:', error));
    }, (error) => console.error('❌ Error al cargar el anuncio:', error));
  }

  obtenerNombreCategoriaPorId(id: number): string {
    const categoria = this.categoriasOpciones.find(cat => cat.id_categoria === id);
    return categoria ? categoria.nombre : '';
  }

  obtenerCategoriasDesdeAPI(): void {
    this.service.Service_Get('categorias', '').subscribe({
      next: (resp: any) => {
        this.categoriasOpciones = resp.data; // <- solo tomamos el array
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
    data.append('lugar[activo]', '1');

    diasServicio.forEach((dia: string) => {
      data.append('lugar[dias_servicio][]', dia);
    });

    this.imagenesSeleccionadas.forEach((img: File) => {
      data.append('imagenes[]', img);
    });

    this.service.Service_Post_FormData_Auth('lugar', 'con-direccion', data).subscribe({
      next: (response) => {
        Swal.fire('¡Éxito!', 'Lugar creado correctamente', 'success');
        this.router.navigate([`/home-anunciante`, this.authService.getIdUsuario()]);
      },
      error: (error) => {
        console.error('❌ Error al crear el lugar:', error);
        Swal.fire('Error', 'Ocurrió un error al enviar los datos', 'error');
      }
    });
  }

  onImagenesSeleccionadas(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const nuevosArchivos = Array.from(input.files);
      const archivosValidos = nuevosArchivos.filter(file =>
        ['image/jpeg', 'image/png', 'image/webp'].includes(file.type) && file.size <= 2 * 1024 * 1024
      );

      if (archivosValidos.length !== nuevosArchivos.length) {
        Swal.fire('¡Error!', 'Solo JPG, PNG o WEBP menores a 2MB', 'error');
        return;
      }

      if (this.imagenesSeleccionadas.length + archivosValidos.length > 5) {
        Swal.fire('¡Límite alcanzado!', 'Máximo 5 imágenes.', 'warning');
        return;
      }

      archivosValidos.forEach((archivo) => {
        this.imagenesSeleccionadas.push(archivo);
      });

      console.log('📸 Imágenes seleccionadas:', this.imagenesSeleccionadas);
    }
  }

  isInvalid(controlPath: string): boolean {
    const control = this.anuncioForm.get(controlPath);
    return !!control && control.invalid && (control.touched || control.dirty);
  }

  goBack(): void {
    const id_usuario = this.authService.getIdUsuario();
    this.router.navigate([`/home-anunciante`, id_usuario]);
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
}
