import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PaginatorModule } from 'primeng/paginator';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button'; // para los botones del diálogo


import { VistasRoutingModule } from './vistas-routing.module'; // ✅ Importar el módulo de rutas

//vistas
import { CategoriaVistaComponent } from './components/Vistas-Usuario-Invitado/categoria-vista/categoria-vista.component';
import { CategoriasComponent } from './components/Vistas-Usuario-Invitado/categorias/categorias.component';

import { CrearActualizarAnuncioComponent } from './components/Vistas-Anuciante/crear-actualizar-anuncio/crear-actualizar-anuncio.component';
import { DestinosVistaComponent } from './components/Vistas-Usuario-Invitado/destinos/destinos.component';


import { HomeInvitadoUsuarioComponent } from './components/Vistas-Usuario-Invitado/home-invitado-usuario/home-invitado-usuario.component';
import { HomeAnuncianteComponent } from './components/Vistas-Anuciante/home-anunciante/home-anunciante.component';

import { navbarInvitadoUsuarioComponent } from './components/Vistas-Usuario-Invitado/navbar-invitado-usuario/navbar-invitado-usuario.component';
import { VistaDetalladaAnuncioComponent } from './components/Vistas-Anuciante/vista-detallada-anuncio/vista-detallada-anuncio.component';

import { VistaDetalladaDestinoComponent } from './components/Vistas-Usuario-Invitado/vista-detallada-destino/vista-detallada-destino.component';
import { AyudaComponent } from './components/Vistas-Usuario-Invitado/ayuda/ayuda.component';

import { PagoAnuncioComponent } from './components/Vistas-Anuciante/pagar-anuncio/pagar-anuncio.component';


import { HomeAdministradorComponent } from './components/Vistas-Administrador/home-administrador/home-administrador.component';

import { FavoritosUsuariosComponent } from './components/Vistas-Usuario-Invitado/favoritos-usuarios/favoritos-usuarios.component';
import { ModificarInfoUsuarioComponent } from './components/Vistas-Usuario-Invitado/modificar-info-usuario/modificar-info-usuario.component';
import { AlertaInfoUsuarioComponent } from './components/Vistas-Usuario-Invitado/alerta-info-usuario/alerta-info-usuario.component';

import { ReseniaUsuarioComponent } from './components/Vistas-Usuario-Invitado/resenia-usuario/resenia-usuario.component'; // Asegúrate de importar el componente ReseniaUsuarioComponent
import { TerminosDelServicioComponent } from './components/Vistas-Usuario-Invitado/terminos-del-servicio/terminos-del-servicio.component'; // Asegúrate de importar el componente TerminosDelServicioComponent
import { PoliticasDePrivacidadComponent } from './components/Vistas-Usuario-Invitado/Politicas-de-privacidad/politicas-de-privacidad.component'; // Asegúrate de importar el componente PoliticasDePrivacidadComponent
import { VistaListaComentariosComponent } from './components/Vistas-Usuario-Invitado/vista-lista-comentarios/vista-lista-comentarios.component'; // Asegúrate de importar el componente VistaListaComentariosComponent


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
    ModificarInfoUsuarioComponent,
    AlertaInfoUsuarioComponent,
    ReseniaUsuarioComponent,
    TerminosDelServicioComponent,
    PoliticasDePrivacidadComponent,
    VistaListaComentariosComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    PaginatorModule,
    VistasRoutingModule,
    MatDialogModule,
    MatButtonModule,
  ],
})
export class VistasModule { }
