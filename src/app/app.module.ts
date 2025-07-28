import { NgModule } from '@angular/core';
import { BrowserModule, provideClientHydration } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { errorInterceptor } from './error.interceptor';
import { authInterceptor } from './auth.interceptor';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';


import { UsuariosModule } from './components/CRUD-Usuarios/usuarios.module';
import { VistasModule } from './components/vistas/vistas.module';
import { PasswordResetService } from './services/password-reset.service';

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

  
    VistasModule,
    UsuariosModule,

    // ❌ ¡Quitamos esto porque NO va aquí!
    // PasswordResetService
  ],
  providers: [
    PasswordResetService, // ✅ AQUÍ es donde va el servicio
    provideClientHydration(),
    provideHttpClient(
      withInterceptors([errorInterceptor, authInterceptor]), // <-- Aquí agregas el tuyo
      withFetch()
    )
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
