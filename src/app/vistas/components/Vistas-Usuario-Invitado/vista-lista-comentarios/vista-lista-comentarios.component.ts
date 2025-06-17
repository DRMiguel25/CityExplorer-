import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpLaravelService } from '../../../../http.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'vista-lista-comentarios',
  standalone: false,
  templateUrl: './vista-lista-comentarios.component.html',
  styleUrls: ['./vista-lista-comentarios.component.scss']
})
export class VistaListaComentariosComponent implements OnInit{

  id_destino: string | null = null; // Aquí guardamos el ID del destino


 constructor(
   private router: Router,
   private route: ActivatedRoute,
   private httpLaravelService: HttpLaravelService,
 ) {}

  ngOnInit(): void {
    this.id_destino = this.route.snapshot.paramMap.get('id_destino');

    if (this.id_destino) {
      this.obtenerComentarios();
    }
  }

    obtenerComentarios(): void {
    const modelo = 'lugar';
    const dato = `${this.id_destino}/comentarios`; // ← Armamos el endpoint completo como string

    this.httpLaravelService.Service_Get(modelo, dato).subscribe({
      next: (comentarios) => {
        console.log('✅ Reseñas del lugar:', comentarios);
      },
      error: (error) => {
        console.error('❌ Error al obtener los comentarios del lugar:', error);
      }
    });
  }

}