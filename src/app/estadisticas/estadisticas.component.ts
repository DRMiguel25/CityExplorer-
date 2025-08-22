// estadisticas.component.ts
import { Component, OnInit } from '@angular/core';
import { HttpLaravelService } from '../http.service'; 
import { EstadisticasResponse } from './estadisticas.model';


@Component({
  selector: 'app-estadisticas',
  templateUrl: './estadisticas.component.html',
  styleUrls: ['./estadisticas.component.scss']
})
export class EstadisticasComponent implements OnInit {
  estadisticas: any[] = [];

  constructor(private httpLaravelService: HttpLaravelService) {}

  ngOnInit(): void {
    this.cargarEstadisticas();
  }
 
  cargarEstadisticas(): void {
    this.httpLaravelService.Service_GetEstadisticas('lugar', 1) // Ajusta según tus necesidades
      .subscribe({
        next: (data: EstadisticasResponse) => {
          if (data.estatus === 1 && Array.isArray(data.data)) {
            this.estadisticas = data.data; // Asigna el array de estadísticas
          } else {
            console.error('Los datos de estadísticas no son válidos:', data);
          }
        },
        error: (error) => console.error('Error al cargar estadísticas:', error)
      });
  }
  formatearTiempo(segundos: number): string {
  const horas = Math.floor(segundos / 3600);
  const minutos = Math.floor((segundos % 3600) / 60);
  const segs = segundos % 60;

  if (horas > 0) return `${horas}h ${minutos}m ${segs}s`;
  if (minutos > 0) return `${minutos}m ${segs}s`;
  return `${segs}s`;
}

}