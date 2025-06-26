








import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpLaravelService } from "../../../http.service";
import Swal from 'sweetalert2';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../auth.service';


@Component({
 selector: 'crear-actualizar-anuncio',
 standalone: false,
 templateUrl: './crear-actualizar-anuncio.component.html',
 styleUrls: ['./crear-actualizar-anuncio.component.scss']
})
export class CrearActualizarAnuncioComponent implements OnInit {
 anuncioForm: FormGroup;
 ID: number | null = null;
 direccion: any; // Aquí guardamos los datos de la dirección


 diasServicioOpciones: string[] = ['Lunes-Viernes', 'Lunes-Sábado', 'Lunes-Domingo','Viernes-Domingo'];
 // Opciones de categorías
 categoriasOpciones: string[] = [
   'Restaurantes', 'Parques', 'Iglesias', 'Mercados', 'Supermercados',
   'plaza', 'Tiendas', 'Antros', 'Puestos_Locales'
 ];


 // Mapeo entre las categorías y sus respectivos ID en la base de datos
 private categoriaMap: { [key: string]: number } = {
   'Restaurantes': 1,
   'Parques': 2,
   'Iglesias': 3,
   'Mercados': 6,
   'Supermercados': 7,
   'Plazas': 4,
   'Tiendas': 8,
   'Antros': 5,
   'Puestos_Locales': 9
 };


 constructor(
   private fb: FormBuilder,
   private router: Router,
   private route: ActivatedRoute,
   private service: HttpLaravelService,
   private authService: AuthService  // 👈 AQUI
 ) {
   this.anuncioForm = this.fb.group({
     nombre: ['', Validators.required],
     descripcion: ['', Validators.required],
     paginaWeb: ['', [Validators.required, Validators.pattern(/^(https?:\/\/)?([a-z0-9-]+\.)+[a-z]{2,}(:\d+)?(\/.*)?$/)]],
     num_telefonico: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
     horario_apertura: ['', Validators.required],
     horario_cierre: ['', Validators.required],
     dias_servicio: ['', Validators.required],
     categoria: ['', Validators.required], // ID de la categoría
     direccion: this.fb.group({
       calle: ['', Validators.required],
       numero_ext: ['', Validators.required],
       numero_int: [''], // Se puede dejar vacío
       colonia: ['', Validators.required],
       codigo_postal: ['', [Validators.required, Validators.pattern(/^\d{5}$/)]],
     }),
     url: ['', [Validators.required, Validators.pattern(/^(https?:\/\/)?([a-z0-9-]+\.)+[a-z]{2,}(:\d+)?(\/.*)?$/)]],
   });
 }


 ngOnInit(): void {
   // Cargar días y categorías
   this.diasServicioOpciones = ['Lunes-Viernes', 'Lunes-Sábado', 'Lunes-Domingo','Jueves-Domingo','Viernes-Domingo','Sabado-Domingo'];
   this.categoriasOpciones = [
     'Restaurantes', 'Parques', 'Iglesias', 'Mercados', 'Supermercados',
     'Plazas', 'Tiendas', 'Antros', 'Puestos_Locales'
   ];
    // Verifica si viene un ID por la URL y carga el anuncio
   this.route.paramMap.subscribe(params => {
     const id = params.get('id');
     if (id) {
       this.ID = +id;
       this.cargarAnuncio(this.ID);
     }
   });
 }
  cargarAnuncio(id: number): void {
   this.service.Service_Get('lugar', id).subscribe((anuncio: any) => {
     console.log('Anuncio cargado:', anuncio);
      // Ahora sí, llama obtenerDireccion y espera su resultado dentro del subscribe
     this.service.Service_Get(`direccion/${anuncio.id_direccion}`, '').subscribe(
       (direccion) => {
         this.direccion = direccion;
         console.log('Dirección cargada del anuncio:', this.direccion);
          // Ya que tienes todo, ahora sí patch al form
         this.anuncioForm.patchValue({
           nombre: anuncio.nombre,
           descripcion: anuncio.descripcion,
           paginaWeb: anuncio.paginaWeb,
           num_telefonico: anuncio.num_telefonico,
           horario_apertura: anuncio.horario_apertura,
           horario_cierre: anuncio.horario_cierre,
           dias_servicio: anuncio.dias_servicio,
           categoria: Object.keys(this.categoriaMap).find(key => this.categoriaMap[key] === anuncio.categoria_id) || '',
           url: anuncio.url,
           direccion: {
             calle: this.direccion.calle,
             numero_ext: this.direccion.numero_ext,
             numero_int: this.direccion.numero_int || '',
             colonia: this.direccion.colonia,
             codigo_postal: this.direccion.codigo_postal
           }
         });
       },
       (error) => {
         console.error('Error al cargar la dirección:', error);
       }
     );
   });
 }


 obtenerDireccion(idDireccion: number): void {
   this.service.Service_Get(`direccion/${idDireccion}`, '').subscribe(
     (data) => {
       this.direccion = data;
       console.log('Dirección cargada:', this.direccion);
        // Actualiza el formulario con los datos de la dirección
       this.anuncioForm.patchValue({
         calle: this.direccion.calle,
         colonia: this.direccion.colonia,
         municipio: this.direccion.municipio,
         estado_dir: this.direccion.estado,
         codigo_postal: this.direccion.codigo_postal
       });
     },
     (error) => {
       console.error('Error al cargar la dirección:', error);
     }
   );
 }
 
 getCategoriaNombre(idCategoria: number): string {
   const entry = Object.entries(this.categoriaMap).find(([_, id]) => id === idCategoria);
   return entry ? entry[0] : '';
 }


 guardarAnuncio(): void {
   if (this.anuncioForm.invalid) {
     this.anuncioForm.markAllAsTouched();
     return;
   }
    const formData = this.anuncioForm.value;
    // Convertimos el string de días a array
   const diasServicio = Array.isArray(formData.dias_servicio)
     ? formData.dias_servicio
     : formData.dias_servicio.split('-').map((dia: string) => dia.trim());
    // Aseguramos formato correcto para hora (HH:mm:ss)
   const horarioApertura = formData.horario_apertura.includes(':') && formData.horario_apertura.length === 5
     ? `${formData.horario_apertura}:00`
     : formData.horario_apertura;
    const horarioCierre = formData.horario_cierre.includes(':') && formData.horario_cierre.length === 5
     ? `${formData.horario_cierre}:00`
     : formData.horario_cierre;
    // Convertimos la categoría string a su ID
   const idCategoria = this.categoriaMap[formData.categoria];
    // Creamos el objeto con la estructura correcta para la API
   const payload = {
     direccion: {
       calle: formData.direccion.calle,
       numero_ext: formData.direccion.numero_ext,
       numero_int: formData.direccion.numero_int || "", // Si es opcional, dejamos vacío
       colonia: formData.direccion.colonia,
       codigo_postal: formData.direccion.codigo_postal
     },
     lugar: {
       nombre: formData.nombre,
       descripcion: formData.descripcion,
       paginaWeb: formData.paginaWeb.startsWith('http') ? formData.paginaWeb : `https://${formData.paginaWeb}`,
       dias_servicio: diasServicio,
       num_telefonico: formData.num_telefonico,
       horario_apertura: horarioApertura,
       horario_cierre: horarioCierre,
       id_categoria: idCategoria,
       activo: false,
       url: formData.url.startsWith('http') ? formData.url : `https://${formData.url}`
     }
   };


   console.log(payload);
    if (this.ID) {
     // Actualizar lugar existente
     this.service.Service_Patch('lugar', this.ID, payload).subscribe(() => {
       Swal.fire('Actualizado', 'El anuncio se actualizó correctamente', 'success');
       this.router.navigate([`/home-anunciante`, this.authService.getIdUsuario()]);
     });
   } else {
     // Crear nuevo lugar
     this.service.Service_Post('lugar', 'con-direccion', payload).subscribe({
       next: (data: any) => {
         Swal.fire('¡Éxito!', 'Lugar creado correctamente', 'success');
         this.router.navigate([`/home-anunciante`, this.authService.getIdUsuario()]);
       },
       error: (err) => {
         console.error('Error al crear el lugar:', err);
         Swal.fire('Error', 'Ocurrió un error en la conexión con el servidor', 'error');
       }
     });
   }
 }


 isInvalid(controlName: string): boolean {
   const control = this.anuncioForm.get(controlName);
   return !!control && control.invalid && (control.touched || control.dirty);
 }


 goBack(): void {
   const id_usuario = this.authService.getIdUsuario();
   console.log('👤 ID del usuario:', id_usuario);
   if (isNaN(id_usuario)) {
     console.error('ID de usuario inválido');
     return;
   } else {
     this.router.navigate([`/home-anunciante`, id_usuario]);
   }
 }
}
