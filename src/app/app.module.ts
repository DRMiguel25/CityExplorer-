import { NgModule } from '@angular/core';
import { BrowserModule, provideClientHydration } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { errorInterceptor } from './error.interceptor';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';  // Para directivas comunes como ngClass, ngIf

import { UsuariosModule } from './CRUD-Usuarios/usuarios.module';
import { VistasModule } from './vistas/vistas.module'; // ✅ Importar el módulo de vistas

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,
    CommonModule,
    FormsModule,
    BrowserAnimationsModule,


    UsuariosModule,
    VistasModule
  ],
  providers: [
    provideClientHydration(),
    provideHttpClient(
      withInterceptors([errorInterceptor]),
      withFetch()
    )
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
