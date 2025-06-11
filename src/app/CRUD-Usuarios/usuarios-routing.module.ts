import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { InicioSesionComponent } from './components/inicio-sesion/inicio-sesion.component';
import { RegistroComponent } from './components/registro/registro.component';
import { LoginComponent } from './components/login/login.component';
import { HomeInvitadoUsuarioComponent } from '../vistas/components/Vistas-Usuario-Invitado/home-invitado-usuario/home-invitado-usuario.component';
import { DestinosVistaComponent } from '../vistas/components/Vistas-Usuario-Invitado/destinos/destinos.component';
import { CategoriaVistaComponent } from '../vistas/components/Vistas-Usuario-Invitado/categoria-vista/categoria-vista.component';
import { CategoriasComponent } from '../vistas/components/Vistas-Usuario-Invitado/categorias/categorias.component';
import { VistaDetalladaDestinoComponent } from '../vistas/components/Vistas-Usuario-Invitado/vista-detallada-destino/vista-detallada-destino.component';
import { HomeAnuncianteComponent } from '../vistas/components/Vistas-Aunuciante/home-anunciante/home-anunciante.component';

import { CrearActualizarAnuncioComponent } from '../vistas/components/Vistas-Aunuciante/crear-actualizar-anuncio/crear-actualizar-anuncio.component';
import { navbarInvitadoUsuarioComponent } from '../vistas/components/Vistas-Usuario-Invitado/navbar-invitado-usuario/navbar-invitado-usuario.component';
import { VistaDetalladaAnuncioComponent } from '../vistas/components/Vistas-Aunuciante/vista-detallada-anuncio/vista-detallada-anuncio.component';
import { AyudaComponent } from '../vistas/components/Vistas-Usuario-Invitado/ayuda/ayuda.component';
import { PagoAnuncioComponent } from '../vistas/components/Vistas-Aunuciante/pagar-anuncio/pagar-anuncio.component';

import { HomeAdministradorComponent } from '../vistas/components/Vistas-Administrador/home-administrador/home-administrador.component';
import { FavoritosUsuariosComponent } from '../vistas/components/Vistas-Usuario-Invitado/favoritos-usuarios/favoritos-usuarios.component';
import { ModificarInfoUsuarioComponent } from '../vistas/components/Vistas-Usuario-Invitado/modificar-info-usuario/modificar-info-usuario.component';
import { AlertaInfoUsuarioComponent } from '../vistas/components/Vistas-Usuario-Invitado/alerta-info-usuario/alerta-info-usuario.component';

import { ReseniaUsuarioComponent } from '../vistas/components/Vistas-Usuario-Invitado/resenia-usuario/resenia-usuario.component'; // Asegúrate de importar el componente ReseniaUsuarioComponent
import { TerminosDelServicioComponent } from '../vistas/components/Vistas-Usuario-Invitado/terminos-del-servicio/terminos-del-servicio.component'; // Asegúrate de importar el componente TerminosDelServicioComponent
import { PoliticasDePrivacidadComponent } from '../vistas/components/Vistas-Usuario-Invitado/Politicas-de-privacidad/politicas-de-privacidad.component'; // Asegúrate de importar el componente PoliticasDePrivacidadComponent
const routes: Routes = [
  { path: 'inicio-sesion', component: InicioSesionComponent },
  { path: 'registro', component: RegistroComponent },
  { path: 'login', component: LoginComponent },
  { path: 'destino-vista', component: DestinosVistaComponent },
  { path: 'destino-vista/:id_usuario', component: DestinosVistaComponent },
  { path: 'categoria-vista/:categoria/:id_usuario', component: CategoriaVistaComponent },
  { path: 'categorias', component: CategoriasComponent },
  { path: 'categorias/:id_usuario', component: CategoriasComponent },
  { path: 'vista-detallada-destino/:id_destino/:id_usuario', component: VistaDetalladaDestinoComponent },
  { path: 'vista-detallada-destino/:id_destino', component: VistaDetalladaDestinoComponent },
  { path: 'home-anunciante/:id_usuario', component: HomeAnuncianteComponent },
  { path: 'home-administrador/:id_usuario', component: HomeAdministradorComponent },
  { path: 'home-invitado-usuario/:id_usuario', component: HomeInvitadoUsuarioComponent },
  { path: 'home-invitado-usuario', component: HomeInvitadoUsuarioComponent },
  { path: 'crear-actualizar-anuncio', component: CrearActualizarAnuncioComponent },
  { path: 'crear-actualizar-anuncio/:id', component: CrearActualizarAnuncioComponent },
  { path: 'vista-detallada-anuncio/:id', component: VistaDetalladaAnuncioComponent },
  { path: 'navbar-invitado-usuario', component: navbarInvitadoUsuarioComponent },
  { path: 'ayuda', component: AyudaComponent },
  { path: 'ayuda/:id_usuario', component: AyudaComponent },
  { path: 'pagar-anuncio/:id_anuncio', component: PagoAnuncioComponent },
  { path: 'favoritos-usuarios/:id_usuario', component: FavoritosUsuariosComponent },
  { path: 'modificar-info-usuario/:id_usuario', component: ModificarInfoUsuarioComponent },
  { path: 'alerta-info-usuario/:id_usuario', component: AlertaInfoUsuarioComponent },
  { path: 'resenia-usuario/:id_anuncio', component: ReseniaUsuarioComponent },
  { path: 'terminos-del-servicio', component: TerminosDelServicioComponent },
  { path: 'politicas-de-privacidad', component: PoliticasDePrivacidadComponent },
  { path: '', redirectTo: 'login', pathMatch: 'full' },  // ✅ Ruta por defecto al login
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UsuariosRoutingModule { }
