import { Component } from '@angular/core';
import { Router } from '@angular/router';
import Swal from 'sweetalert2'; // Importar SweetAlert2

@Component({
  selector: 'ayuda',
  standalone: false,
  templateUrl: './ayuda.component.html',
  styleUrls: ['./ayuda.component.scss']
})
export class AyudaComponent {

  constructor(private router: Router) {}

}
