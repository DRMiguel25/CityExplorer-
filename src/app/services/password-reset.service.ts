import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ForgotPasswordResponse {
  message: string;
  expires_in_minutes: number;
  correo: string; // Cambiar de 'email' a 'correo'
}

export interface ResetPasswordResponse {
  message: string;
  usuario: { // Cambiar de 'user' a 'usuario'
    id_usuario: number; // Cambiar de 'id' a 'id_usuario'
    nombre_completo: string; // Cambiar de 'name' a 'nombre_completo'
    correo: string; // Cambiar de 'email' a 'correo'
  };
}

export interface CodeStatusResponse {
  exists: boolean;
  expires_at?: string;
  remaining_attempts?: number;
  is_expired?: boolean;
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PasswordResetService {
  private apiUrl = `${environment.apiUrl}/password`;

  constructor(private http: HttpClient) {}

  sendResetCode(correo: string): Observable<ForgotPasswordResponse> {
    return this.http.post<ForgotPasswordResponse>(`${this.apiUrl}/forgot`, { correo });
  }

  resetPassword(data: {
    correo: string; // Cambiar de 'email' a 'correo'
    code: string;
    password: string;
    password_confirmation: string;
  }): Observable<ResetPasswordResponse> {
    return this.http.post<ResetPasswordResponse>(`${this.apiUrl}/reset`, data);
  }

  checkCodeStatus(correo: string): Observable<CodeStatusResponse> {
    return this.http.post<CodeStatusResponse>(`${this.apiUrl}/check-status`, { correo });
  }
}
