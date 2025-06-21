import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpLaravelService } from '../../../../http.service';
import { Lugar } from '../../Vistas-Anuciante/home-anunciante/lugar.interface';


@Component({
 selector: 'categoria-vista',
 standalone: false,
 templateUrl: './categoria-vista.component.html',
 styleUrls: ['./categoria-vista.component.scss']
})
export class CategoriaVistaComponent implements OnInit {
 lugares: Lugar[] = [];
 categoriaSeleccionada = '';
 tituloCategoria = '';


 private categoriaMap: { [key: string]: number } = {
   'Restaurantes': 1,
   'Parques': 2,
   'Iglesias': 3,
   'Mercados': 6,
   'Supermercados': 7,
   'Plazas': 4,
   'Tiendas': 8,
   'Antros': 5,
   'Puestos_Locales': 9,
   'Ayuda': 10

 };


 constructor(
   private router: Router,
   private route: ActivatedRoute,
   private httpLaravelService: HttpLaravelService
 ) {}


 ngOnInit(): void {
   this.route.paramMap.subscribe(params => {
     const nombreCategoria = params.get('categoria');
     if (nombreCategoria) {
       this.categoriaSeleccionada = nombreCategoria;
       this.tituloCategoria = nombreCategoria.charAt(0).toUpperCase() + nombreCategoria.slice(1);


       const idCategoria = this.categoriaMap[nombreCategoria];
       if (!idCategoria) {
         console.warn('Categoría no encontrada:', nombreCategoria);
         return;
       }


       this.httpLaravelService.Service_Get_Lugares_Publico().subscribe({
         next: (data) => {
           // 👈 Cambio hecho aquí: filtramos por categoría Y por activo
           this.lugares = data.filter(
             (l: Lugar) => l.id_categoria === idCategoria && l.activo
           );
           console.log(`Lugares activos para '${nombreCategoria}':`, this.lugares);
         },
         error: (err) => {
           console.error('Error al cargar lugares públicos:', err);
         }
       });
     }
   });

  this.logLoadTime();  // 👈 mide tiempo de carga

 }


 vistaDetalladaDestino(id: number | string) {
   const idEntero = parseInt(id.toString(), 10);
   if (isNaN(idEntero)) {
     console.error('ID inválido:', id);
     return;
   }
   this.router.navigate(['/vista-detallada-destino', idEntero]);
 }

 logLoadTime() {
  window.addEventListener('load', () => {
    const [navEntry] = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
    if (navEntry) {
      console.log('⏱️ Tiempo total de carga en categoria vista (domComplete):', navEntry.domComplete.toFixed(2), 'ms');
      console.log('🧱 Tiempo de render en categoria vista (domContentLoaded):', navEntry.domContentLoadedEventEnd.toFixed(2), 'ms');
      console.log('🌐 Tiempo de respuesta categoria vista (responseEnd):', navEntry.responseEnd.toFixed(2), 'ms');
    } else {
      // Fallback para navegadores antiguos
      const timing = performance.timing;
      const totalLoadTime = timing.loadEventEnd - timing.navigationStart;
      console.log('⏱️ Tiempo total de carga (fallback):', totalLoadTime, 'ms');
    }
  });
}
}