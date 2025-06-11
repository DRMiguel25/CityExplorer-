import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpLaravelService } from '../../../../http.service';
import Swal from 'sweetalert2';


@Component({
 selector: 'vista-detallada-destino',
 standalone: false,
 templateUrl: './vista-detallada-destino.component.html',
 styleUrls: ['./vista-detallada-destino.component.scss']
})
export class VistaDetalladaDestinoComponent implements OnInit {
 lugar: any; // Aquí guardaremos los datos del lugar
 direccion: any; // Aquí guardamos los datos de la dirección
 isLoading = true;
 id_usuario: string | null = null; // Aquí guardamos el ID del usuario

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
   private router: Router,
   private route: ActivatedRoute,
   private httpLaravelService: HttpLaravelService
 ) {}


 ngOnInit(): void {
   const id_destino = this.route.snapshot.paramMap.get('id_destino');
   this.id_usuario = this.route.snapshot.paramMap.get('id_usuario');
   if (id_destino) {
     this.obtenerLugar(+id_destino);
   }
 }


 // Método para obtener la información del lugar
 obtenerLugar(id_destino: number): void {
   this.httpLaravelService.Service_Get(`lugar/${id_destino}`, '').subscribe(
     (data) => {
       this.lugar = data;
       this.isLoading = false;
       console.log('Lugar cargado:', this.lugar);
       this.obtenerDireccion(this.lugar.id_direccion); // Llamada para obtener la dirección
     },
     (error) => {
       console.log("id_destino:", id_destino);
       console.error('Error al cargar el lugar:', error);
       Swal.fire('Error', 'No se pudo cargar la información del lugar. Intenta más tarde.', 'error');
       this.isLoading = false;
     }
   );
 }


 // Método para obtener la dirección
 obtenerDireccion(idDireccion: number): void {
   this.httpLaravelService.Service_Get_Direccion_Publica(idDireccion).subscribe(
     (data) => {
       this.direccion = data;
       console.log('Dirección cargada (pública):', this.direccion);
     },
     (error) => {
       console.error('Error al cargar la dirección pública:', error);
       Swal.fire('Error', 'No se pudo cargar la dirección del lugar. Intenta más tarde.', 'error');
     }
   );
 }


 // Método de retroceso
 goBack() {
   this.router.navigate(['/destino-vista']);
 }


 // Método para obtener el nombre de la categoría basado en el ID
 obtenerCategoriaNombre(idCategoria: number): string {
   for (const categoria in this.categoriaMap) {
     if (this.categoriaMap[categoria] === idCategoria) {
       return categoria.charAt(0).toUpperCase() + categoria.slice(1).replace('_', ' '); // Capitaliza la primera letra y reemplaza _ por espacios
     }
   }
   return 'Categoría desconocida'; // Si no encuentra la categoría, muestra este texto
 }

 crearResenia(): void {
    console.log('Navegando a la reseña del usuario para el lugar con ID:', this.lugar.id);
    this.router.navigate(['/resenia-usuario', this.lugar.id]);
 }
}