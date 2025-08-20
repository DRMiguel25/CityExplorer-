import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Lugar } from './components/vistas/components/Vistas-Anuciante/home-anunciante/lugar.interface';
import { LocalstorageService } from './localstorage.service'; // Importa tu servicio de storage
import { AuthService } from './auth.service';
import { EstadisticasResponse } from './estadisticas/estadisticas.model';

@Injectable({
  providedIn: 'root'
})
export class HttpLaravelService {
private _url = 'http://127.0.0.1:8001/api';
  constructor(
    public http: HttpClient,
    private storage: LocalstorageService, 
    private authService: AuthService 
  ) {}

  private getHeaders(): HttpHeaders {
    const token = this.storage.getItem('access_token'); // Usa tu servicio aquí
    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }

  Service_Get(Modelo: string, Dato: string | number): Observable<Lugar[]> {
    return this.http.get<Lugar[]>(`${this._url}/${Modelo}/${Dato}`, {
      headers: this.getHeaders()
    });
  }

  Service_Get_Paginator(Modelo: string, Dato: string | number, page: number, rows: number): Observable<Lugar[]> {
    return this.http.get<Lugar[]>(`${this._url}/${Modelo}/${Dato}?page=${page}&rows=${rows}`, {
      headers: this.getHeaders()
    });
  }

  Service_Post(Modelo: string, Dato: string | number, Parametros: any): Observable<any> {
    console.log(`${this._url}/${Modelo}/${Dato}`, Parametros);
    return this.http.post(`${this._url}/${Modelo}/${Dato}`, Parametros, {
      headers: this.getHeaders()
    });
  }

  Service_Patch(Modelo: string, Dato: string | number, Parametros: any): Observable<any> {
    return this.http.patch(`${this._url}/${Modelo}/${Dato}`, Parametros, {
      headers: this.getHeaders()
    });
  }

  Service_Delete(Modelo: string, Dato: string | number): Observable<any> {
    return this.http.delete(`${this._url}/${Modelo}/${Dato}`, {
      headers: this.getHeaders()
    });
  }

  // Este método accede a la ruta pública sin headers ni token
  Service_Get_Lugares_Publico(): Observable<Lugar[]> {
    return this.http.get<Lugar[]>(`${this._url}/lugar`);
  }

  Service_Get_Lugar_Publico(id: number): Observable<Lugar> {
    return this.http.get<Lugar>(`${this._url}/lugar/${id}`);
  }

  Service_Get_Direccion_Publica(id: number): Observable<any> {
    return this.http.get<any>(`${this._url}/direccion-publica/${id}`);
  }
  

  Service_Post_Pago(id_lugar: number, id_metodo_pago: number, stripeToken: string): Observable<any> {
    const body = {
      id_lugar: id_lugar,
      id_metodo_pago: id_metodo_pago,
      stripeToken: stripeToken
    };
  
    const token = this.storage.getItem('access_token'); // o tu token fijo para pruebas
  
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });
  
    return this.http.post(`${this._url}/pago/pagar`, body, { headers });
  }

  Service_Post_FormData(controller: string, endpoint: string, data: FormData) {
    const url = `${this._url}/${controller}/${endpoint}`;
    return this.http.post(url, data);
  }

  Service_Patch_FormData(controller: string, endpoint: number, data: FormData) {
    const url = `${this._url}/${controller}/${endpoint}`;

    const token = this.storage.getItem('access_token'); // o tu token fijo para pruebas


    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json'
    });

    console.log(`Enviando PATCH a ${url} con datos:`, data);

    // Importante: cuando envías FormData, **no pongas Content-Type explícito** para que Angular lo asigne automáticamente
    return this.http.patch(url, data, { headers });
  }

  // 🔐 Método con token y FormData
  Service_Post_FormData_Auth(controller: string, metodo: string, formData: FormData) {
    const token = this.authService.getToken();  // ✅ Ahora si

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      Accept: 'application/json'
    });

    const url = `${this._url}/${controller}/${metodo}`;
    console.log("📡 POST Auth a:", url);

    return this.http.post(url, formData, { headers });
  }

  Service_Put(Modelo: string, Dato: string | number, Parametros: any): Observable<any> {
  return this.http.put(`${this._url}/${Modelo}/${Dato}`, Parametros, {
    headers: this.getHeaders()
  });
}

Service_GetImagenes(idLugar: number): Observable<any[]> {
  return this.http.get<any[]>(`${this._url}/lugar/${idLugar}/imagenes`, {
    headers: this.getHeaders()
  });
}

// === MÉTODOS DE ADMINISTRACIÓN DE USUARIOS ===
Service_Get_Usuarios_Admin(): Observable<any> {
  return this.http.get(`${this._url}/admin/usuarios`, {
    headers: this.getHeaders()
  });
}

toggleEstadoUsuario(id: number): Observable<any> {
  return this.http.post(`${this._url}/admin/usuarios/${id}/toggle`, {}, {
    headers: this.getHeaders()
  });
}

// === MÉTODOS DE ESTADÍSTICAS ===
Service_GetEstadisticas(Modelo: string, Dato: string | number): Observable<EstadisticasResponse> {
    return this.http.get<EstadisticasResponse>(`${this._url}/${Modelo}/${Dato}`, {
        headers: this.getHeaders()
    });
}

// 📊 Métodos específicos para estadísticas de visitas
Service_RegistrarVisita(parametros: any): Observable<any> {
  return this.http.post(`${this._url}/estadisticas-visitas/`, parametros);
}

Service_Get_Estadisticas_Lugar(id: number): Observable<any> {
  return this.http.get(`${this._url}/estadisticas-visitas/lugar/${id}`);
}

Service_Get_Lugares_Populares(parametros?: any): Observable<any> {
  let url = `${this._url}/estadisticas-visitas/lugares-populares`;
  if (parametros) {
    const params = new URLSearchParams(parametros).toString();
    url += `?${params}`;
  }
  return this.http.get(url);
}

Service_Get_Estadisticas_Usuario(id: number): Observable<any> {
  return this.http.get(`${this._url}/estadisticas-visitas/usuario/${id}`, {
    headers: this.getHeaders()
  });
}

Service_Get_Mis_Estadisticas(): Observable<any> {
  return this.http.get(`${this._url}/estadisticas-visitas/mis-estadisticas`, {
    headers: this.getHeaders()
  });
}

// 🔐 Métodos de administración para estadísticas
Service_Get_Resumen_General_Admin(parametros?: any): Observable<any> {
  let url = `${this._url}/admin/estadisticas-visitas/resumen`;
  if (parametros) {
    const params = new URLSearchParams(parametros).toString();
    url += `?${params}`;
  }
  return this.http.get(url, {
    headers: this.getHeaders()
  });
}

Service_Limpiar_Estadisticas_Admin(parametros?: any): Observable<any> {
  return this.http.delete(`${this._url}/admin/estadisticas-visitas/limpiar`, {
    headers: this.getHeaders(),
    body: parametros
  });
}

Service_GetEstadisticasGenerales(): Observable<any> {
  return this.http.get(`${this._url}/estadisticas-visitas/mis-estadisticas`, {
    headers: this.getHeaders()
  });
}

Service_Get_Estadisticas_Por_Anunciante(idUsuario: number): Observable<any> {
  return this.http.get(`${this._url}/estadisticas/anunciante/${idUsuario}`, {
    headers: this.getHeaders()
  });
}

Service_Get_Lugares_Administrador(): Observable<any> {
  return this.http.get(`${this._url}/admin/lugares`, {
    headers: this.getHeaders()
  });
}

Service_toggle_Lugares_Administrador(id: number): Observable<any> {
  console.log(`mandando a llamar a la ruta: ${this._url}/admin/lugares/${id}/toggle`);
  return this.http.patch(`${this._url}/admin/lugares/${id}/toggle`, {
    headers: this.getHeaders()
  });
}

Service_delete_Lugar_Administrador(id: number): Observable<any> {
  return this.http.delete(`${this._url}/admin/lugares/${id}`, {
    headers: this.getHeaders()
  });
}

Service_restaurar_Lugar_Administrador(id: number): Observable<any> {
  return this.http.patch(`${this._url}/admin/lugares/${id}/restaurar`, {
    headers: this.getHeaders()
  });
}
Service_Cerrar_seccion(): Observable<any> {
  return this.http.post(`${this._url}/logout`, {
    headers: this.getHeaders()
  });
}

Service_Get_lugares_anunciante(): Observable<any> {
  return this.http.get(`${this._url}/lugar/listaLugares`, {
    headers: this.getHeaders()
  });
}
}