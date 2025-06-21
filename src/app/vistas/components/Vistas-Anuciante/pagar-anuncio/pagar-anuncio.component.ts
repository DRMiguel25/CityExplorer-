import { Component, AfterViewInit, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { loadStripe, Stripe, StripeElements, StripeCardNumberElement } from '@stripe/stripe-js';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { HttpLaravelService } from '../../../../http.service';
import Swal from 'sweetalert2';
import { catchError, tap } from 'rxjs';

@Component({
  selector: 'pagar-anuncio',
   standalone: false, // <- activa si lo usarás como standalone
  templateUrl: './pagar-anuncio.component.html',
  styleUrls: ['./pagar-anuncio.component.scss']
})
export class PagoAnuncioComponent implements AfterViewInit, OnDestroy, OnInit {
  formularioPago!: FormGroup;

  stripe!: Stripe;
  elements!: StripeElements;
  cardNumber!: StripeCardNumberElement;

  id_lugar = 0;
  id_metodo_pago = 1;
  stripeToken = '';
  isProcessing = false;

  currentStep: 'name' | 'number' | 'exp' | 'cvv' | 'postal' | 'complete' = 'name';
  completedSteps: Set<string> = new Set();

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private servicio: HttpLaravelService
  ) {}

  ngOnInit(): void {
    const idAnuncio = this.route.snapshot.paramMap.get('id_anuncio');
    this.id_lugar = Number(idAnuncio);

    this.formularioPago = this.fb.group({
      cardName: ['', [Validators.required, Validators.minLength(2)]],
      cardPostal: ['', [Validators.required, Validators.pattern(/^\d{5}$/)]],
      formaDePago: ['', Validators.required]
    });

    this.logLoadTime();  // 👈 mide tiempo de carga
  }

  async ngAfterViewInit(): Promise<void> {
    this.stripe = await loadStripe('pk_test_51RCMhO2aCGcFLodxRpMdLgzxVD0wupm9PzVZk2AZ28qjkqbssx45coJ9PI8GV5PgGrbWIYWNzq3IzXD4fGY60uSE00ZlKg9bSD') as Stripe;
    this.elements = this.stripe.elements();

    const style = {
      base: {
        color: '#ffffff',
        fontSize: '16px',
        '::placeholder': { color: '#ffffff99' }
      },
      invalid: {
        color: '#ff6b6b'
      }
    };

    this.cardNumber = this.elements.create('cardNumber', { style });
    this.cardNumber.mount('#card-number-element');

    this.elements.create('cardExpiry', { style }).mount('#card-expiry-element');
    this.elements.create('cardCvc', { style }).mount('#card-cvc-element');
  }

  ngOnDestroy(): void {
    if (this.cardNumber) this.cardNumber.unmount();
  }

  async handlePayment(event: Event): Promise<void> {
    event.preventDefault();
    if (this.isProcessing) return;
    this.isProcessing = true;

    if (this.formularioPago.invalid) {
      Swal.fire('Error', 'Completa todos los campos correctamente.', 'error');
      this.isProcessing = false;
      return;
    }

    const name = this.formularioPago.get('cardName')?.value;
    const address_zip = this.formularioPago.get('cardPostal')?.value;

    const { token, error } = await this.stripe.createToken(this.cardNumber, {
      name,
      address_zip
    });

    if (error || !token) {
      Swal.fire('Error', error?.message || 'Error desconocido al crear el token.', 'error');
      this.isProcessing = false;
      return;
    }

    this.stripeToken = token.id;

    this.servicio.Service_Post_Pago(this.id_lugar, this.id_metodo_pago, this.stripeToken)
      .pipe(
        tap(() => {
          Swal.fire('Éxito', 'El pago fue realizado con éxito.', 'success');
          this.router.navigate(['/vista-detallada-anuncio', this.id_lugar]);
        }),
        catchError(err => {
          Swal.fire('Error', 'No se pudo procesar el pago.', 'error');
          throw err;
        })
      )
      .subscribe(() => this.isProcessing = false);
  }

  isInvalid(controlName: string): boolean {
    const control = this.formularioPago.get(controlName);
    return !!control && control.invalid && (control.dirty || control.touched);
  }

  goBack(): void {
    this.router.navigate(['/anuncios']);
  }

    logLoadTime() {
  window.addEventListener('load', () => {
    const [navEntry] = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
    if (navEntry) {
      console.log('⏱️ Tiempo total de carga en pagar anuncio (domComplete):', navEntry.domComplete.toFixed(2), 'ms');
      console.log('🧱 Tiempo de render en pagar anuncio (domContentLoaded):', navEntry.domContentLoadedEventEnd.toFixed(2), 'ms');
      console.log('🌐 Tiempo de respuesta pagar anuncio (responseEnd):', navEntry.responseEnd.toFixed(2), 'ms');
    } else {
      // Fallback para navegadores antiguos
      const timing = performance.timing;
      const totalLoadTime = timing.loadEventEnd - timing.navigationStart;
      console.log('⏱️ Tiempo total de carga (fallback):', totalLoadTime, 'ms');
    }
  });
}
}