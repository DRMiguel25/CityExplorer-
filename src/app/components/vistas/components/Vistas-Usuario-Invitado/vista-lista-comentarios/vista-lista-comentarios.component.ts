import { Component, Inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpLaravelService } from '../../../../../http.service';
import { Location } from '@angular/common'; // ⬅️ Agrega esto arriba, junto a otros imports
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'vista-lista-comentarios',
  standalone: false,
  templateUrl: './vista-lista-comentarios.component.html',
  styleUrls: ['./vista-lista-comentarios.component.scss']
})
export class VistaListaComentariosComponent implements OnInit {

  id_destino: number | null = null; // ID del destino
  listaComentarios: any[] = [];
  promedioValoracion: number | null = null;
  totalComentarios: number = 0;

  constructor(
    private route: ActivatedRoute,
    private httpLaravelService: HttpLaravelService,
    private location: Location, // ⬅️ Inyecta esto
    private dialogRef: MatDialogRef<VistaListaComentariosComponent>, // <- agregado
    @Inject(MAT_DIALOG_DATA) public data: { id_destino: number, id_usuario: number } // aquí llega el id

  ) {}

  ngOnInit(): void {
    this.id_destino = this.data.id_destino

    if (this.id_destino) {
      this.obtenerComentarios();
    } else {
      console.error('❌ No se recibió id_destino en la ruta');
    }

    this.logLoadTime(); // sigue midiendo la carga igual
  }


  obtenerComentarios(): void {
    const modelo = 'lugar';
    const dato = `${this.id_destino}/comentarios`;

    this.httpLaravelService.Service_Get(modelo, dato).subscribe({
      next: (respuesta: any) => {
        const comentarios = respuesta?.data || [];

        if (Array.isArray(comentarios) && comentarios.length > 0) {
          this.listaComentarios = comentarios.sort((a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );

          const suma = comentarios.reduce((acc, c) => acc + (c.valoracion || 0), 0);
          this.promedioValoracion = +(suma / comentarios.length).toFixed(1);
          this.totalComentarios = comentarios.length;

        } else {
          this.listaComentarios = [];
          this.promedioValoracion = null;
          this.totalComentarios = 0;

          console.warn('⚠️ No hay comentarios disponibles o formato inesperado');
        }
      },
      error: (error) => {
        console.error('❌ Error al obtener los comentarios del lugar:', error);
        this.listaComentarios = [];
        this.promedioValoracion = null;
        this.totalComentarios = 0;
      }
    });
  }

  logLoadTime() {
  window.addEventListener('load', () => {
    const [navEntry] = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
    if (navEntry) {
      console.log('⏱️ Tiempo total de carga en vista lista comentarios (domComplete):', navEntry.domComplete.toFixed(2), 'ms');
      console.log('🧱 Tiempo de render en vista lista comentarios (domContentLoaded):', navEntry.domContentLoadedEventEnd.toFixed(2), 'ms');
      console.log('🌐 Tiempo de respuesta vista lista comentarios (responseEnd):', navEntry.responseEnd.toFixed(2), 'ms');
    } else {
      // Fallback para navegadores antiguos
      const timing = performance.timing;
      const totalLoadTime = timing.loadEventEnd - timing.navigationStart;
      console.log('⏱️ Tiempo total de carga (fallback):', totalLoadTime, 'ms');
    }
  });
}

volverAtras(): void {
  this.dialogRef.close();
}


}