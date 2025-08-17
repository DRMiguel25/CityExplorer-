import { Component, AfterViewInit, OnDestroy, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { loadStripe, Stripe, StripeElements, StripeCardNumberElement, StripeCardExpiryElement, StripeCardCvcElement } from '@stripe/stripe-js';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpLaravelService } from '../../../../../http.service';
import Swal from 'sweetalert2';
import { catchError, tap } from 'rxjs';

@Component({
  selector: 'pagar-anuncio',
  standalone: false,
  templateUrl: './pagar-anuncio.component.html',
  styleUrls: ['./pagar-anuncio.component.scss']
})
export class PagoAnuncioComponent implements AfterViewInit, OnDestroy, OnInit {
  formularioPago!: FormGroup;

  stripe!: Stripe;
  elements!: StripeElements;
  cardNumber!: StripeCardNumberElement;
  cardExpiry!: StripeCardExpiryElement;
  cardCvc!: StripeCardCvcElement;

  id_lugar = 0;
  id_metodo_pago = 1;
  stripeToken = '';
  isProcessing = false;

  id_usuario: string | null = null;

  // Tarjeta giratoria
  isCardFlipped = false;

  // Confirmación de plan
  planSeleccionado: 'mensual' | 'anual' = 'mensual';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private servicio: HttpLaravelService
  ) {}

  ngOnInit(): void {
    const idAnuncio = this.route.snapshot.paramMap.get('id_anuncio');
    this.id_lugar = Number(idAnuncio);

    this.id_usuario = this.route.snapshot.paramMap.get('id_usuario');

    this.formularioPago = this.fb.group({
      cardName: ['', [Validators.required, Validators.minLength(2)]],
      cardPostal: ['', [Validators.required, Validators.pattern(/^\d{5}$/)]],
      formaDePago: ['', Validators.required]
    });

    this.logLoadTime();
  }

  async ngAfterViewInit(): Promise<void> {
    this.stripe = await loadStripe('pk_test_51RCMhO2aCGcFLodxRpMdLgzxVD0wupm9PzVZk2AZ28qjkqbssx45coJ9PI8GV5PgGrbWIYWNzq3IzXD4fGY60uSE00ZlKg9bSD') as Stripe;
    this.elements = this.stripe.elements();

    const cardNumberStyle = {
      base: { color: '#18181b', fontSize: '20px', fontFamily: 'Courier New, monospace', letterSpacing: '2px', '::placeholder': { color: 'rgba(255, 255, 255, 0.6)' } },
      invalid: { color: '#ff6b6b' }
    };

    const formStyle = {
      base: { color: '#2c3e50', fontSize: '16px', '::placeholder': { color: '#95a5a6' } },
      invalid: { color: '#ff6b6b' }
    };

    this.cardNumber = this.elements.create('cardNumber', { style: cardNumberStyle });
    this.cardExpiry = this.elements.create('cardExpiry', { style: formStyle });
    this.cardCvc = this.elements.create('cardCvc', { style: formStyle });

    this.cardNumber.mount('#card-number-element');
    this.cardExpiry.mount('#card-expiry-element');
    this.cardCvc.mount('#card-cvc-element');

    this.cardCvc.on('focus', () => this.onCvcFocus());
    this.cardCvc.on('blur', () => this.onCvcBlur());
    this.cardNumber.on('change', (event) => this.onCardNumberChange(event));
    this.cardExpiry.on('change', (event) => this.onExpiryChange(event));
    this.cardCvc.on('change', (event) => this.onCvcChange(event));
  }

  ngOnDestroy(): void {
    if (this.cardNumber) this.cardNumber.unmount();
    if (this.cardExpiry) this.cardExpiry.unmount();
    if (this.cardCvc) this.cardCvc.unmount();
  }

  // Tarjeta giratoria
  onCvcFocus() { this.isCardFlipped = true; }
  onCvcBlur() { this.isCardFlipped = false; }
  flipCard() { this.isCardFlipped = !this.isCardFlipped; }

  // Actualización de tarjeta
  onCardNumberChange(event: any) {
    const cardNumberDisplay = document.querySelector('.card-number-display');
    if (cardNumberDisplay) {
      cardNumberDisplay.textContent = '•••• •••• •••• ••••';
    }
  }
  onExpiryChange(event: any) {
    const expiryDisplay = document.querySelector('.card-exp-date');
    if (expiryDisplay && event.complete) {
      expiryDisplay.textContent = `${String(event.value.month).padStart(2, '0')}/${String(event.value.year).slice(-2)}`;
    }
  }
  onCvcChange(event: any) {
    const cvcDisplay = document.querySelector('.card-cvv-display');
    const cvcBox = document.querySelector('.cvv-box');
    if (cvcDisplay) cvcDisplay.textContent = '•••';
    if (cvcBox) cvcBox.textContent = '•••';
  }

  // Popup para confirmar plan antes de pagar
confirmarAntesDePagar() {
  Swal.fire({
    title: '✨ Confirmar Pago',
    html: `
      <div style="text-align: center; margin-bottom: 20px;">
        <p style="margin-bottom: 15px; font-size: 16px; font-weight: 500;">
           Selecciona tu plan preferido:
        </p>
        <select id="planSelect" class="swal2-input" style="width: 100%; max-width: 320px; padding: 10px; border-radius: 8px; font-size: 15px;">
          <option value="mensual">💳 Plan Mensual - $580 MXN (IVA incluido)</option>
          <option value="anual">🎊 Plan Anual - $5,800 MXN (IVA incluido) - ¡2 meses gratis!</option>
        </select>
        <div style="margin-top: 12px; font-size: 13px; opacity: 0.8;">
          💡 El plan anual incluye 2 meses adicionales sin costo
        </div>
      </div>
    `,
    // 🔽 FONDO SÓLIDO (blanco o gris muy claro)
    background: '#ffffff', // Fondo blanco puro
    // Opcional: fondo gris claro moderno
    // background: '#f8f9fa',

    // 🔽 Elimina el backdrop difuminado pesado o déjalo sutil
    backdrop: 'rgba(0, 0, 0, 0.4)', // Solo oscurece el fondo, sin blur ni textura

    customClass: {
      popup: 'swal-solid-popup',        // Clase opcional para estilos extra
      title: 'swal-solid-title',
      confirmButton: 'swal-solid-confirm',
      cancelButton: 'swal-solid-cancel'
    },

    showCancelButton: true,
    confirmButtonText: '✅ Confirmar Pago',
    cancelButtonText: '❌ Cancelar',
    buttonsStyling: false, // Para usar tus clases personalizadas
    allowOutsideClick: false,
    allowEscapeKey: true,
    focusConfirm: false,

    preConfirm: () => {
      const planSelect = document.getElementById('planSelect') as HTMLSelectElement;
      if (!planSelect || !planSelect.value) {
        Swal.showValidationMessage('Por favor selecciona un plan');
        return false;
      }
      this.planSeleccionado = planSelect.value as 'mensual' | 'anual';
      return true;
    },

    willOpen: (popup) => {
      // Opcional: ajustar sombra o bordes al popup
      popup.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.15)';
      popup.style.borderRadius = '16px';
    }

  }).then((result) => {
    if (result.isConfirmed) {
      const planTexto = this.planSeleccionado === 'anual'
        ? 'Plan Anual - $5,800 MXN (¡Incluye 2 meses gratis!)'
        : 'Plan Mensual - $580 MXN';

      Swal.fire({
        title: 'Procesando...',
        html: `
          <div style="text-align: center;">
            <p style="margin-bottom: 10px;">Iniciando pago para:</p>
            <strong style="color: #16a34a;">${planTexto}</strong>
          </div>
        `,
        timer: 1500,
        timerProgressBar: true,
        showConfirmButton: false,
        background: '#ffffff93', // Fondo blanco limpio
        willOpen: (popup) => {
          popup.style.borderRadius = '12px';
          popup.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.1)';
        },
        didOpen: () => {
          setTimeout(() => { 
            this.handlePayment(new Event('submit'));
          }, 1500);
        }
      });
    }
  });
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
          Swal.fire('Éxito', `Pago realizado con éxito por ${this.planSeleccionado === 'anual' ? '$5,800 MXN' : '$580 MXN'}`, 'success');
          this.router.navigate([`/home-anunciante`, this.id_usuario]);
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
    this.router.navigate([`/vista-detallada-anuncio`, this.id_lugar, this.id_usuario]);
  }

  logLoadTime() {
    window.addEventListener('load', () => {
      const [navEntry] = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
      if (navEntry) {
        console.log('⏱️ Tiempo total de carga en pagar anuncio (domComplete):', navEntry.domComplete.toFixed(2), 'ms');
        console.log('🧱 Tiempo de render en pagar anuncio (domContentLoaded):', navEntry.domContentLoadedEventEnd.toFixed(2), 'ms');
        console.log('🌐 Tiempo de respuesta pagar anuncio (responseEnd):', navEntry.responseEnd.toFixed(2), 'ms');
      } else {
        const timing = performance.timing;
        const totalLoadTime = timing.loadEventEnd - timing.navigationStart;
        console.log('⏱️ Tiempo total de carga (fallback):', totalLoadTime, 'ms');
      }
    });
  }
}
