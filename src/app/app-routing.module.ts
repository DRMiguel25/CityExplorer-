import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './auth.guard';
import { AyudaComponent } from './components/vistas/components/Vistas-Usuario-Invitado/ayuda/ayuda.component';
import { VistaDetalladaAnuncioComponent } from './components/vistas/components/Vistas-Anuciante/vista-detallada-anuncio/vista-detallada-anuncio.component';

const routes: Routes = [
  {
    path: 'vistas',
    loadChildren: () => import('./components/vistas/vistas.module').then(m => m.VistasModule),
    canActivate: [AuthGuard]  // ✅ Protegido
  },
  {
    path: '', // 👈 Este es el módulo de usuarios: login, registro, etc.
loadChildren: () => import('./components/CRUD-Usuarios/usuarios.module').then(m => m.UsuariosModule)    // ❌ SIN AuthGuard, porque aquí se puede entrar sin estar logueado
  },
  {
    path: '**',
    redirectTo: ''
  },
  {
    path: 'ayuda',
    component: AyudaComponent
  },
  {
    path: 'vista-detallada-anuncio/:id',
    component: VistaDetalladaAnuncioComponent // asegúrate que este es el componente correcto
  }
  
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
