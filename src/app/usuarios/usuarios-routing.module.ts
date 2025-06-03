import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { InicioSesionComponent } from './components/inicio-sesion/inicio-sesion.component';
import { RegistroComponent } from './components/registro/registro.component';
import { LoginComponent } from './components/login/login.component';
import { HomeComponent } from '../vistas/components/home/home.component';
import { DestinosVistaComponent } from '../vistas/components/destinos/destinos.component';
import { CategoriaVistaComponent } from '../vistas/components/categoria-vista/categoria-vista.component';
import { CategoriasComponent } from '../vistas/components/categorias/categorias.component';
import { VistaDetalladaDestinoComponent } from '../vistas/components/vista-detallada-destino/vista-detallada-destino.component';
import { HomeAnuncianteComponent } from '../vistas/components/home-anunciante/home-anunciante.component';

import { CrearActualizarAnuncioComponent } from '../vistas/components/crear-actualizar-anuncio/crear-actualizar-anuncio.component';
import { navbarComponent } from '../vistas/components/navbar/navbar.component';
import { VistaDetalladaAnuncioComponent } from '../vistas/components/vista-detallada-anuncio/vista-detallada-anuncio.component';
import { AyudaComponent } from '../vistas/components/ayuda/ayuda.component';
import { PagoAnuncioComponent } from '../vistas/components/pagar-anuncio/pagar-anuncio.component';

import {HomeAdministradorComponent} from '../vistas/components/home-administrador/home-administrador.component';
import {HomeUsuarioComponent} from '../vistas/components/home-usuario/home-usuario.component';

import { navbarUsuarioComponent } from '../vistas/components/navbar-usuario/navbar-usuario.component';

const routes: Routes = [
  { path: 'inicio-sesion', component: InicioSesionComponent },
  { path: 'registro', component: RegistroComponent },
  { path: 'login', component: LoginComponent },
  { path: 'app-home', component: HomeComponent },
  { path: 'destino-vista', component: DestinosVistaComponent },
  { path: 'categoria-vista/:categoria', component: CategoriaVistaComponent },
  { path: 'categorias', component: CategoriasComponent },
  { path: 'vista-detallada-destino/:id', component: VistaDetalladaDestinoComponent },
  { path: 'home-anunciante/:id_usuario', component: HomeAnuncianteComponent },
  { path: 'home-administrador/:id_usuario', component: HomeAdministradorComponent },
  { path: 'home-usuario/:id_usuario', component: HomeUsuarioComponent },
  { path: 'crear-actualizar-anuncio', component: CrearActualizarAnuncioComponent },
  { path: 'crear-actualizar-anuncio/:id', component: CrearActualizarAnuncioComponent },
  { path: 'vista-detallada-anuncio/:id', component: VistaDetalladaAnuncioComponent },
  { path: 'navbar', component: navbarComponent },
  { path: 'navbar-usuario', component: navbarUsuarioComponent },
  { path: 'ayuda', component: AyudaComponent },
  { path: 'pagar-anuncio/:id_anuncio', component: PagoAnuncioComponent },

  { path: '', redirectTo: 'login', pathMatch: 'full' },  // ✅ Ruta por defecto al login
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UsuariosRoutingModule { }
