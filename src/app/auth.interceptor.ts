import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<any>, next: HttpHandlerFn): Observable<HttpEvent<any>> => {
  const token = localStorage.getItem('access_token'); // O usa tu servicio si quieres

  if (token) {
    const cloned = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    console.log('🛡️ Token agregado al header:', token);
    return next(cloned);
  } else {
    console.warn('⚠️ No se encontró token, la petición se envía sin Authorization');
    return next(req);
  }
};
