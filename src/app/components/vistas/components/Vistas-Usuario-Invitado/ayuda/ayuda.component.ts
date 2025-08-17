import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'ayuda',
  standalone: false,
  templateUrl: './ayuda.component.html',
  styleUrls: ['./ayuda.component.scss']
})
export class AyudaComponent implements OnInit{

  ngOnInit(): void {
    this.logLoadTime();  // 👈 mide tiempo de carga
  }

  logLoadTime() {
  window.addEventListener('load', () => {
    const [navEntry] = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
    if (navEntry) {
      console.log('⏱️ Tiempo total de carga en ayuda (domComplete):', navEntry.domComplete.toFixed(2), 'ms');
      console.log('🧱 Tiempo de render en ayuda (domContentLoaded):', navEntry.domContentLoadedEventEnd.toFixed(2), 'ms');
      console.log('🌐 Tiempo de respuesta ayuda (responseEnd):', navEntry.responseEnd.toFixed(2), 'ms');
    } else {
      // Fallback para navegadores antiguos
      const timing = performance.timing;
      const totalLoadTime = timing.loadEventEnd - timing.navigationStart;
      console.log('⏱️ Tiempo total de carga (fallback):', totalLoadTime, 'ms');
    }
  });
}
toggleFAQ(event: Event) {
  const element = event.currentTarget as HTMLElement;
  const answer = element.nextElementSibling as HTMLElement;
  const symbol = element.querySelector('span');
  
  // Close all other FAQs
  document.querySelectorAll('.faq-answer').forEach(ans => {
    if (ans !== answer) {
      ans.classList.remove('active');
      (ans.previousElementSibling as HTMLElement).querySelector('span')!.textContent = '+';
    }
  });
  
  // Toggle current FAQ
  if (answer.classList.contains('active')) {
    answer.classList.remove('active');
    symbol!.textContent = '+';
  } else {
    answer.classList.add('active');
    symbol!.textContent = '−';
  }
}
}
