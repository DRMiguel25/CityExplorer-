import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ForgotPasswordResponse {
  message: string;
  expires_in_minutes: number;
  correo: string;
}

export interface ResetPasswordResponse {
  message: string;
  usuario: {
    id_usuario: number;
    nombre_completo: string;
    correo: string;
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
  // Reemplazamos environment.apiUrl por una constante
  private apiUrl = 'http://localhost:8000/api/password';

  constructor(private http: HttpClient) {}

  sendResetCode(correo: string): Observable<ForgotPasswordResponse> {
    return this.http.post<ForgotPasswordResponse>(`${this.apiUrl}/forgot`, { correo });
  }

  resetPassword(data: {
    correo: string;
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
