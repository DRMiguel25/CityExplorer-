import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpLaravelService } from '../../../../http.service';

@Component({
  selector: 'modificar-info-usuario',
  standalone: false,
  templateUrl: './modificar-info-usuario.component.html',
  styleUrls: ['./modificar-info-usuario.component.scss']
})
export class ModificarInfoUsuarioComponent implements OnInit {

  usuario: any = null; // Aquí vamos a guardar la info para mostrarla en el HTML

  ID: number = 0;

  constructor(
    private route: ActivatedRoute,
    private apiService: HttpLaravelService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = this.route.snapshot.paramMap.get('id_usuario');
      const idNum = Number(id);
      if (!isNaN(idNum) && idNum !== 0) {
        this.ID = idNum;
        this.cargarUsuario(this.ID);
      } else {
        console.error('ID de usuario no proporcionado o no válido: ' + idNum);
      }
    });
  }


  cargarUsuario(id: number): void {
    console.log('ID recibido desde el diálogo:', id);

    this.apiService.Service_Get('usuario', id).subscribe(
      respuesta => {
        this.usuario = respuesta;
        console.log('Datos del usuario:', this.usuario);
      },
      error => {
        console.error('Error al obtener usuario:', error);
      }
    );
  }

  guardarPerfil(): void {
    
  }


  cancelar(): void {
    if (this.ID !== null) {
      this.router.navigate(['/home-invitado-usuario', this.ID]);
    } else {
      this.router.navigate(['/']);
    }
  }

  seleccionarFoto(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.usuario.foto = file;
      console.log('Foto seleccionada:', file);
    }
  }
}
