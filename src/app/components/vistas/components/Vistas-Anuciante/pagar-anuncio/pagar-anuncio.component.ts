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

// Reemplaza tu función confirmarAntesDePagar() con esta versión más compacta
// Nueva función confirmarAntesDePagar con diseño ártico
confirmarAntesDePagar() {
  Swal.fire({
    title: 'Confirmar Plan de Suscripción',
    html: `
      <div class="arctic-payment-container">
        <div class="arctic-header">
          <div class="frost-icon"></div>
          <p class="arctic-subtitle">
            Elige tu plan y activa tu anuncio premium
          </p>
        </div>
        
        <div class="arctic-plan-selector">
          <select id="planSelect" class="arctic-select">
            <option value="mensual">🗓️ Plan Mensual - $580 MXN</option>
            <option value="anual">✨ Plan Anual - $5,800 MXN (¡2 meses gratis!)</option>
          </select>
        </div>
         
        
        <div class="arctic-note">
          <div class="note-icon">💡</div>
          <div class="note-text">El plan anual incluye 2 meses adicionales totalmente gratis</div>
        </div>
      </div>
    `,
    background: 'transparent',
    backdrop: 'rgba(230, 241, 247, 0.85)',
    
    customClass: {
      popup: 'arctic-popup',
      title: 'arctic-title',
      confirmButton: 'arctic-confirm-btn',
      cancelButton: 'arctic-cancel-btn',
      htmlContainer: 'arctic-html-container'
    },
    
    showCancelButton: true,
    confirmButtonText: 'Proceder al Pago',
    cancelButtonText: 'Cancelar',
    buttonsStyling: false,
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
      // Aplicar estilos CSS dinámicamente
      const style = document.createElement('style');
      style.textContent = `
        /* Variables CSS Árticas */
        :root {
          --blanco-hielo: #F0F8FF;
          --alice-blue: #F0F8FF;
          --blanco-glaciar: #EAF6FB;
          --blanco-artico: #E6F1F7;
          --perla-azulada: #F3F7FA;
          --niebla-azul: #EDF3F9;
          --azul-palido: #E6F0FA;
          --humo-azul-claro: #F5F9FD;
          --polar-white: #F2F8FC;
          --blanco-boreal: #EEF7FB;
        }
        
        /* Popup Principal */
        .arctic-popup {
          background: linear-gradient(145deg, 
            var(--blanco-hielo) 0%, 
            var(--polar-white) 30%, 
            var(--blanco-glaciar) 70%, 
            var(--alice-blue) 100%) !important;
          border-radius: 24px !important;
          padding: 0 !important;
          box-shadow: 
            0 25px 60px rgba(70, 130, 180, 0.15),
            0 15px 35px rgba(70, 130, 180, 0.08),
            inset 0 1px 0 rgba(255, 255, 255, 0.7),
            inset 0 -1px 0 rgba(70, 130, 180, 0.1) !important;
          border: 2px solid rgba(70, 130, 180, 0.08) !important;
          max-width: 480px !important;
          width: 95% !important;
          overflow: hidden !important;
          position: relative !important;
        }
        
        /* Efecto de cristal ártico */
        .arctic-popup::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 60%;
          background: linear-gradient(180deg, 
            rgba(255, 255, 255, 0.4) 0%, 
            rgba(240, 248, 255, 0.2) 50%, 
            transparent 100%);
          pointer-events: none;
          z-index: 1;
        }
        
        /* Título */
        .arctic-title {
          font-size: 1.75rem !important;
          font-weight: 700 !important;
          color: #2C5282 !important;
          margin: 0 !important;
          padding: 30px 30px 20px 30px !important;
          text-align: center !important;
          background: linear-gradient(135deg, #2C5282, #4682B4);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          position: relative;
          z-index: 2;
          text-shadow: 0 2px 4px rgba(44, 82, 130, 0.1) !important;
        }
        
        /* Contenedor HTML */
        .arctic-html-container {
          padding: 0 30px 30px 30px !important;
          position: relative;
          z-index: 2;
        }
        
        /* Contenedor Principal */
        .arctic-payment-container {
          display: flex;
          flex-direction: column;
          gap: 25px;
          align-items: center;
        }
        
        /* Header Ártico */
        .arctic-header {
          text-align: center;
          margin-bottom: 10px;
        }
        
        .frost-icon {
          font-size: 3rem;
          margin-bottom: 15px;
          filter: drop-shadow(0 4px 8px rgba(70, 130, 180, 0.2));
          animation: frostedPulse 3s ease-in-out infinite;
        }
        
        @keyframes frostedPulse {
          0%, 100% { transform: scale(1); opacity: 0.9; }
          50% { transform: scale(1.05); opacity: 1; }
        }
        
        .arctic-subtitle {
          color: #4682B4 !important;
          font-size: 1.1rem !important;
          font-weight: 500 !important;
          margin: 0 !important;
          line-height: 1.5 !important;
        }
        
        /* Selector de Plan */
        .arctic-plan-selector {
          width: 100%;
          margin: 20px 0;
        }
        
        .arctic-select {
          width: 100% !important;
          padding: 18px 20px !important;
          border: 2px solid rgba(70, 130, 180, 0.2) !important;
          border-radius: 16px !important;
          background: linear-gradient(135deg, 
            var(--blanco-hielo) 0%, 
            var(--humo-azul-claro) 100%) !important;
          color: #2C5282 !important;
          font-size: 1rem !important;
          font-weight: 600 !important;
          box-shadow: 
            0 8px 25px rgba(70, 130, 180, 0.08),
            inset 0 1px 0 rgba(255, 255, 255, 0.8) !important;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
          cursor: pointer !important;
        }
        
        .arctic-select:focus {
          outline: none !important;
          border-color: #4682B4 !important;
          background: var(--polar-white) !important;
          box-shadow: 
            0 0 0 4px rgba(70, 130, 180, 0.1),
            0 12px 35px rgba(70, 130, 180, 0.12),
            inset 0 1px 0 rgba(255, 255, 255, 0.9) !important;
          transform: translateY(-2px) !important;
        }
        
        .arctic-select option {
          background: var(--blanco-hielo) !important;
          color: #2C5282 !important;
          padding: 12px !important;
          font-weight: 500 !important;
        }
        
        /* Beneficios */
        .arctic-benefits {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
          gap: 15px;
          width: 100%;
          margin: 20px 0;
        }
        
        .benefit-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 20px 15px;
          background: linear-gradient(135deg, 
            rgba(255, 255, 255, 0.7) 0%, 
            rgba(240, 248, 255, 0.8) 100%);
          border: 1px solid rgba(70, 130, 180, 0.15);
          border-radius: 16px;
          box-shadow: 
            0 6px 20px rgba(70, 130, 180, 0.06),
            inset 0 1px 0 rgba(255, 255, 255, 0.9);
          transition: all 0.3s ease;
        }
        
        .benefit-item:hover {
          transform: translateY(-3px);
          box-shadow: 
            0 10px 30px rgba(70, 130, 180, 0.1),
            inset 0 1px 0 rgba(255, 255, 255, 0.95);
        }
        
        .benefit-icon {
          font-size: 1.5rem;
          margin-bottom: 8px;
          filter: drop-shadow(0 2px 4px rgba(70, 130, 180, 0.2));
        }
        
        .benefit-text {
          color: #4682B4;
          font-weight: 600;
          font-size: 0.9rem;
          text-align: center;
        }
        
        /* Nota Informativa */
        .arctic-note {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 18px 20px;
          background: linear-gradient(135deg, 
            rgba(70, 130, 180, 0.08) 0%, 
            rgba(70, 130, 180, 0.05) 100%);
          border: 1px solid rgba(70, 130, 180, 0.2);
          border-radius: 16px;
          margin-top: 10px;
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.7);
        }
        
        .note-icon {
          font-size: 1.3rem;
          filter: drop-shadow(0 2px 4px rgba(70, 130, 180, 0.2));
        }
        
        .note-text {
          color: #4682B4;
          font-size: 0.95rem;
          font-weight: 500;
          line-height: 1.4;
        }
        
        /* Botón Confirmar */
        .arctic-confirm-btn {
          background: linear-gradient(135deg, 
            #4682B4 0%, 
            #2C5282 100%) !important;
          color: white !important;
          border: none !important;
          border-radius: 16px !important;
          padding: 16px 32px !important;
          font-weight: 700 !important;
          font-size: 1rem !important;
          text-transform: none !important;
          letter-spacing: 0.5px !important;
          box-shadow: 
            0 12px 30px rgba(70, 130, 180, 0.25),
            inset 0 1px 0 rgba(255, 255, 255, 0.2) !important;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
          position: relative !important;
          overflow: hidden !important;
        }
        
        .arctic-confirm-btn::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, 
            transparent, 
            rgba(255, 255, 255, 0.2), 
            transparent);
          transition: left 0.6s ease;
        }
        
        .arctic-confirm-btn:hover {
          background: linear-gradient(135deg, 
            #5A9BD4 0%, 
            #3A6BAC 100%) !important;
          transform: translateY(-3px) !important;
          box-shadow: 
            0 18px 40px rgba(70, 130, 180, 0.35),
            inset 0 1px 0 rgba(255, 255, 255, 0.3) !important;
        }
        
        .arctic-confirm-btn:hover::before {
          left: 100%;
        }
        
        .arctic-confirm-btn:active {
          transform: translateY(-1px) !important;
        }
        
        /* Botón Cancelar */
        .arctic-cancel-btn {
          background: var(--niebla-azul) !important;
          color: #4682B4 !important;
          border: 2px solid rgba(70, 130, 180, 0.2) !important;
          border-radius: 16px !important;
          padding: 14px 30px !important;
          font-weight: 600 !important;
          font-size: 1rem !important;
          transition: all 0.3s ease !important;
          box-shadow: 
            0 6px 20px rgba(70, 130, 180, 0.08),
            inset 0 1px 0 rgba(255, 255, 255, 0.8) !important;
        }
        
        .arctic-cancel-btn:hover {
          background: var(--blanco-artico) !important;
          border-color: rgba(70, 130, 180, 0.3) !important;
          transform: translateY(-2px) !important;
          box-shadow: 
            0 10px 25px rgba(70, 130, 180, 0.12),
            inset 0 1px 0 rgba(255, 255, 255, 0.9) !important;
        }
        
        /* Contenedor de Botones */
        .swal2-actions {
          gap: 20px !important;
          margin-top: 30px !important;
          padding: 0 !important;
        }
        
        /* Animaciones de entrada */
        .arctic-popup.swal2-show {
          animation: arcticShow 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) !important;
        }
        
        @keyframes arcticShow {
          0% {
            opacity: 0;
            transform: scale(0.8) translateY(40px);
          }
          60% {
            opacity: 0.9;
            transform: scale(1.02) translateY(-10px);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        
        /* Responsive */
        @media (max-width: 768px) {
          .arctic-popup {
            margin: 20px !important;
            max-width: calc(100vw - 40px) !important;
          }
          
          .arctic-title {
            font-size: 1.5rem !important;
            padding: 25px 20px 15px 20px !important;
          }
          
          .arctic-html-container {
            padding: 0 20px 25px 20px !important;
          }
          
          .arctic-benefits {
            grid-template-columns: 1fr;
            gap: 12px;
          }
          
          .benefit-item {
            flex-direction: row;
            justify-content: flex-start;
            padding: 15px;
            text-align: left;
          }
          
          .benefit-icon {
            margin-right: 12px;
            margin-bottom: 0;
            font-size: 1.3rem;
          }
          
          .arctic-note {
            flex-direction: column;
            text-align: center;
            gap: 8px;
          }
          
          .swal2-actions {
            flex-direction: column !important;
            width: 100% !important;
          }
          
          .arctic-confirm-btn,
          .arctic-cancel-btn {
            width: 100% !important;
          }
        }
        
        @media (max-width: 480px) {
          .frost-icon {
            font-size: 2.5rem;
          }
          
          .arctic-select {
            font-size: 0.95rem !important;
            padding: 16px 18px !important;
          }
          
          .arctic-note {
            padding: 15px 18px;
          }
          
          .note-text {
            font-size: 0.9rem;
          }
        }
      `;
      
      document.head.appendChild(style);
    }
    
  }).then((result) => {
    if (result.isConfirmed) {
      const planTexto = this.planSeleccionado === 'anual'
        ? 'Plan Anual - $5,800 MXN (¡Incluye 2 meses gratis!)'
        : 'Plan Mensual - $580 MXN';
      
      // Alerta de procesamiento con el mismo tema ártico
      Swal.fire({
        title: 'Procesando Pago',
        html: `
          <div style="text-align: center; padding: 20px;">
            <div style="font-size: 3rem; margin-bottom: 20px; animation: spin 2s linear infinite;">💵</div>
            <p style="color: #4682B4; font-weight: 600; margin-bottom: 10px;">
              Iniciando proceso de pago para:
            </p>
            <div style="
              background: linear-gradient(135deg, var(--blanco-hielo), var(--polar-white));
              padding: 15px 20px;
              border-radius: 12px;
              border: 1px solid rgba(70, 130, 180, 0.2);
              box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.8);
            ">
              <strong style="color: #2C5282; font-size: 1.1rem;">${planTexto}</strong>
            </div>
          </div>
          <style>
            @keyframes spin {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
          </style>
        `,
        timer: 1500,
        timerProgressBar: true,
        showConfirmButton: false,
        background: 'linear-gradient(145deg, var(--blanco-hielo), var(--polar-white))',
        customClass: {
          popup: 'arctic-processing-popup'
        },
        willOpen: (popup) => {
          const style = document.createElement('style');
          style.textContent = `
            .arctic-processing-popup {
              border-radius: 20px !important;
              border: 2px solid rgba(70, 130, 180, 0.1) !important;
              box-shadow: 
                0 20px 50px rgba(70, 130, 180, 0.15),
                inset 0 1px 0 rgba(255, 255, 255, 0.7) !important;
            }
          `;
          document.head.appendChild(style);
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
