import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PaginatorModule } from 'primeng/paginator';

import { VistasRoutingModule } from './vistas-routing.module'; // ✅ Importar el módulo de rutas

//vistas
import { CategoriaVistaComponent } from './components/Vistas-Usuario-Invitado/categoria-vista/categoria-vista.component';
import { CategoriasComponent } from './components/Vistas-Usuario-Invitado/categorias/categorias.component';

import { CrearActualizarAnuncioComponent } from './components/Vistas-Aunuciante/crear-actualizar-anuncio/crear-actualizar-anuncio.component';
import { DestinosVistaComponent } from './components/Vistas-Usuario-Invitado/destinos/destinos.component';


import { HomeInvitadoUsuarioComponent } from './components/Vistas-Usuario-Invitado/home-invitado-usuario/home-invitado-usuario.component';
import { HomeAnuncianteComponent } from './components/Vistas-Aunuciante/home-anunciante/home-anunciante.component';

import { navbarInvitadoUsuarioComponent } from './components/Vistas-Usuario-Invitado/navbar-invitado-usuario/navbar-invitado-usuario.component';
import { VistaDetalladaAnuncioComponent } from './components/Vistas-Aunuciante/vista-detallada-anuncio/vista-detallada-anuncio.component';

import { VistaDetalladaDestinoComponent } from './components/Vistas-Usuario-Invitado/vista-detallada-destino/vista-detallada-destino.component';
import { AyudaComponent } from './components/Vistas-Usuario-Invitado/ayuda/ayuda.component';

import { PagoAnuncioComponent } from './components/Vistas-Aunuciante/pagar-anuncio/pagar-anuncio.component';


import { HomeAdministradorComponent } from './components/Vistas-Administrador/home-administrador/home-administrador.component';

import { FavoritosUsuariosComponent } from './components/Vistas-Usuario-Invitado/favoritos-usuarios/favoritos-usuarios.component';
import { InfoUsuarioComponent } from './components/Vistas-Usuario-Invitado/info-usuario/info-usuario.component'; // Asegúrate de que esta ruta sea correcta
@NgModule({
  declarations: [
    CategoriasComponent,
    HomeInvitadoUsuarioComponent,
    HomeAnuncianteComponent,
    CrearActualizarAnuncioComponent,
    VistaDetalladaAnuncioComponent,
    navbarInvitadoUsuarioComponent,
    CategoriaVistaComponent,
    DestinosVistaComponent,
    VistaDetalladaDestinoComponent,
    AyudaComponent,
    PagoAnuncioComponent,
    HomeAdministradorComponent,
    FavoritosUsuariosComponent,
    InfoUsuarioComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    PaginatorModule,
    VistasRoutingModule
  ],
})
export class VistasModule { }
