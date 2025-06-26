import { Component, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { loadStripe, Stripe, StripeCardElement } from '@stripe/stripe-js';
import { HttpLaravelService } from "../../../http.service";
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import Swal from 'sweetalert2'; // ✅ Importa SweetAlert2

@Component({
  selector: 'pagar-anuncio',
  standalone: false,
  templateUrl: './pagar-anuncio.component.html',
  styleUrls: ['./pagar-anuncio.component.scss']
})
export class PagoAnuncioComponent implements AfterViewInit {
goBack() {
throw new Error('Method not implemented.');
}
  stripe!: Stripe;
  card!: StripeCardElement;

  id_lugar: number = 0;
  id_metodo_pago: number = 1;
  stripeToken!: string;

  formularioPago!: FormGroup;
  formaDePagosOpciones: string[] = ['Tarjeta de crédito', 'Tarjeta de débito'];

  constructor(
    private router: Router,
    private servicio: HttpLaravelService,
    private route: ActivatedRoute,
    private fb: FormBuilder,
  ) {}

  ngOnInit() {
    const idAnuncio = this.route.snapshot.paramMap.get('id_anuncio');
    this.id_lugar = Number(idAnuncio);
    if (!idAnuncio) {
      console.error('ID de anuncio no proporcionado en la URL');
      return;
    }

    this.formularioPago = this.fb.group({
      formaDePago: ['', Validators.required]
    });
  }

  async ngAfterViewInit() {
    this.stripe = await loadStripe('pk_test_51RCMhO2aCGcFLodxRpMdLgzxVD0wupm9PzVZk2AZ28qjkqbssx45coJ9PI8GV5PgGrbWIYWNzq3IzXD4fGY60uSE00ZlKg9bSD') as Stripe;
    const elements = this.stripe.elements();
    this.card = elements.create('card');
    this.card.mount('#card-element');
  }

  // Método para procesar el pago
  // Método para procesar el pago
  async handlePayment(event: Event) {
    event.preventDefault();

    // Validación del campo de tarjeta visualmente
    const { token, error } = await this.stripe?.createToken(this.card) || {};
    
    if (error) {
      console.error('Error al generar token:', error.message);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Ocurrió un error al generar el token. Intenta nuevamente.'
      });
      return;
    }
    
    this.stripeToken = token?.id as string;

    // Ahora hacemos la solicitud para procesar el pago
    this.realizarPago();
  }

  // Método para hacer la solicitud de pago
  realizarPago() {
    const payload = {
      id_lugar: this.id_lugar,
      id_metodo_pago: this.id_metodo_pago,
      stripeToken: this.stripeToken
    };

    this.servicio.Service_Post_Pago(this.id_lugar, this.id_metodo_pago, this.stripeToken)
      .subscribe({
        next: (response) => {
          console.log('Pago realizado con éxito', response);
          Swal.fire({
            icon: 'success',
            title: 'Pago realizado',
            text: 'El pago se realizó con éxito. ¡Gracias por tu compra!'
          });
          this.vistaDetalladaAnuncio(this.id_lugar);
        },  
        error: (error) => {
          console.error('Error al procesar el pago', error);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Hubo un problema al procesar tu pago. Intenta nuevamente.'
          });
        }
      });
  }

  isInvalid(controlName: string): boolean {
    const control = this.formularioPago.get(controlName);
    return control ? control.invalid && (control.dirty || control.touched) : false;
  }

  vistaDetalladaAnuncio(id: number | string) {
    const idEntero = parseInt(id.toString(), 10);
  
    if (isNaN(idEntero)) {
      console.error('ID inválido:', id);
      return;
    }
  
    this.router.navigate(['/vista-detallada-anuncio', idEntero]);
  }
}
