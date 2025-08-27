import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpLaravelService } from "../../../../../http.service";
import { ActivatedRoute } from '@angular/router';
import { Lugar } from './lugar.interface';
import { MatDialog } from '@angular/material/dialog';
import { AlertaInfoUsuarioComponent } from '../../Vistas-Usuario-Invitado/alerta-info-usuario/alerta-info-usuario.component';
import { LugarAdministrador } from '../lista-lugares/lugar_administrador.interface';

@Component({
  selector: 'home-administrador',
  standalone: false,
  templateUrl: './home-administrador.component.html',
  styleUrls: ['./home-administrador.component.scss']
})
export class HomeAdministradorComponent implements OnInit{
  idUsuario: number = 0;

  usuario: any = null; // Aquí vamos a guardar la info para mostrarla en el HTML

  nombreCompleto: any = null;

  usuarios: any[] = [];
  usuariosfiltrados: any[] = [];

  totalUsuarios: number = 0;
  usuariosActivos: number = 0; // 👈 aquí guardamos la cuenta de los activos
  usuariosBloqueados: number = 0; // 👈 aquí guardamos la cuenta de los activos

  lugares: Lugar[] = [];

  totalLugares: number = 0;

  constructor(
    private service: HttpLaravelService,
    private router: Router,
    private route: ActivatedRoute,
    private dialog: MatDialog,
  ){}
  ngOnInit(): void {
    this.logLoadTime();  // 👈 mide tiempo de carga
    this.idUsuario = Number(this.route.snapshot.paramMap.get('id_usuario'));
    console.log("id del usuario: "+this.idUsuario);

    this.cargarInfoUsuario();
    this.cargarUsuarios();
    this.loadLugares();
  }

  logLoadTime() {
    window.addEventListener('load', () => {
      const [navEntry] = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
      if (navEntry) {
        console.log('⏱️ Tiempo total de carga en home administrador (domComplete):', navEntry.domComplete.toFixed(2), 'ms');
        console.log('🧱 Tiempo de render en home administrador (domContentLoaded):', navEntry.domContentLoadedEventEnd.toFixed(2), 'ms');
        console.log('🌐 Tiempo de respuesta home administrador (responseEnd):', navEntry.responseEnd.toFixed(2), 'ms');
      } else {
        // Fallback para navegadores antiguos
        const timing = performance.timing;
        const totalLoadTime = timing.loadEventEnd - timing.navigationStart;
        console.log('⏱️ Tiempo total de carga (fallback):', totalLoadTime, 'ms');
      }
    });
  }

  GestionarUsuarios() {
    this.router.navigate(['/lista-usuarios', this.idUsuario]);
  }

  AdministrarLugares() {
    this.router.navigate(['/lista-lugares', this.idUsuario]);
  }

  Ayuda() {
    this.router.navigate(['/ayuda-administrador', this.idUsuario]);
  }

  PanelDeControl(){
    this.dialog.open(AlertaInfoUsuarioComponent, {
      width: '450px',
      data: { id_usuario: this.idUsuario, tipo_usuario: 3},
      autoFocus: true // opcional: enfoca al abrir
    });
  }

  cargarInfoUsuario() {
    this.service.Service_Get('usuario', this.idUsuario).subscribe(
      (respuesta: any) => {  // 👈 Cast a any aquí, no tocamos el servicio
        if (respuesta.estatus === 1) {
          this.usuario = respuesta.data;
          this.nombreCompleto = (this.usuario.nombre+" "+this.usuario.apellidoP+" "+this.usuario.apellidoM)
        } else {
          console.warn('⚠️ La API respondió sin éxito:', respuesta);
        }
      },
      error => {
        console.error('❌ Error al obtener usuario:', error);
      }
    );
  }

    cargarUsuarios(): void {
    this.service.Service_Get_Usuarios_Admin().subscribe({
      next: (respuesta) => {
        this.usuarios = respuesta.data; // 👈 solo la lista de usuarios

        this.usuariosfiltrados = respuesta.data; // 👈 solo la lista de usuarios filtrados

        this.totalUsuarios = respuesta.total; // 👈 total del paginador
        this.usuariosActivos = this.usuarios.filter(u => u.activo === true).length;
        this.usuariosBloqueados = this.usuarios.filter(u => u.bloqueado === true).length;

      },
      error: (error) => {
        console.error('❌ Error al cargar usuarios:', error);
      }
    });
  }

loadLugares(): void {
  this.service.Service_Get_Lugares_Administrador().subscribe({
    next: (respuesta: any) => {
      // ✅ obtener array real
      const lugares = respuesta?.lugares?.data || [];

      // ✅ map directamente sobre "lugares" (que ya es array)
      const adaptados: LugarAdministrador[] = lugares.map((l: any) => ({
        id_lugar: l.id_lugar,
        id_usuario: l.id_usuario,
        id_categoria: l.id_categoria,
        id_direccion: l.id_direccion,
        nombre: l.nombre,
        descripcion: l.descripcion,
        paginaWeb: l.paginaWeb,
        num_telefonico: l.num_telefonico,
        activo: l.activo,
        bloqueado: l.bloqueado,
        bloqueado_por: l.bloqueado_por ?? null,
        desbloqueado_por: l.desbloqueado_por ?? null,
        motivo_bloqueo: l.motivo_bloqueo ?? null,
        fecha_activacion: l.fecha_activacion ?? null,
        fecha_bloqueo: l.fecha_bloqueo ?? null,
        fecha_desbloqueo: l.fecha_desbloqueo ?? null,
        activado_por_pago_id: l.activado_por_pago_id ?? null,
        horario_apertura: l.horario_apertura,
        horario_cierre: l.horario_cierre,
        dias_servicio: l.dias_servicio || [],
        imagenes: l.imagenes || [],
        created_at: l.created_at,
        updated_at: l.updated_at,
        last_login: l.last_login ?? null,

        // Extras
        promedioValoracion: l.promedioValoracion ?? 0,
        totalComentarios: l.totalComentarios ?? 0,
        direccion: l.direccion ?? undefined,
        usuario: l.usuario ?? undefined,
        categoria: l.categoria ?? undefined,
        estado_texto: l.estado_texto ?? null
      }));

      this.totalLugares = respuesta?.resumen?.total_lugares ?? adaptados.length; // 📌 Aquí tienes el total
    },
    error: (error) => {
      console.error('❌ Error al cargar lugares:', error);
    }
  });
}

}