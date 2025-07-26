import { Component } from '@angular/core';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { HttpLaravelService } from '../../../../../http.service';

@Component({
  selector: 'navbar-anunciante',
  standalone: false,
  templateUrl: './navbar-anunciante.component.html',
  styleUrls: ['./navbar-anunciante.component.scss']
})
export class navbarAnuncianteComponent {

}