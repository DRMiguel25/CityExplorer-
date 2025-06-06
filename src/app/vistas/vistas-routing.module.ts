import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../auth.guard';  // Asegúrate de importar el AuthGuard

// Vistas
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
const routes: Routes = [
  {
    path: '',
    component: HomeInvitadoUsuarioComponent, 
    canActivate: [AuthGuard], // Protege esta ruta
  },
  {
    path: 'categoria-vista/:categoria', 
    component: CategoriaVistaComponent,
  },
  {
    path: 'categorias', 
    component: CategoriasComponent,
  },
  {
    path: 'crear-actualizar-anuncio', 
    component: CrearActualizarAnuncioComponent,
    canActivate: [AuthGuard], // Protege esta ruta
  },
  {
    path: 'crear-actualizar-anuncio/:id', 
    component: CrearActualizarAnuncioComponent,
    canActivate: [AuthGuard], // Protege esta ruta
  },
  {
    path: 'destino-vista', 
    component: DestinosVistaComponent,
  },
  {
    path: 'home-invitado-usuario', 
    component: HomeInvitadoUsuarioComponent,
  },
  {
    path: 'home-anunciante/:id_usuario', 
    component: HomeAnuncianteComponent,
    canActivate: [AuthGuard], // Protege esta ruta
  },
  {
    path: 'navbar-invitado-usuario', 
    component: navbarInvitadoUsuarioComponent,
  },
  {
    path: 'vista-detallada-anuncio/:id', 
    component: VistaDetalladaAnuncioComponent,
    canActivate: [AuthGuard], // Protege esta ruta
  },
  {
    path: 'vista-detallada-destino/:id', 
    component: VistaDetalladaDestinoComponent,
  },
  {
    path: 'ayuda', 
    component: AyudaComponent,
  },
  {
    path: 'pagar-anuncio/:id-lugar', 
    component: PagoAnuncioComponent,
  },
  {
    path: '**', 
    redirectTo: '', 
    pathMatch: 'full',
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class VistasRoutingModule { }
