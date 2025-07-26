import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { InicioSesionComponent } from './components/inicio-sesion/inicio-sesion.component';
import { LoginComponent } from './components/login/login.component';
import { RegistroComponent } from './components/registro/registro.component';

import { PaginatorModule } from 'primeng/paginator';
import { UsuariosRoutingModule } from './usuarios-routing.module';

@NgModule({
  declarations: [
    InicioSesionComponent,
    LoginComponent,
    RegistroComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    UsuariosRoutingModule,
    PaginatorModule
  ],
})
export class UsuariosModule { }
