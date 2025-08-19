export interface ImagenLugar {
  id_imagen: number;
  id_lugar: number;
  url: string;
}

export interface LugarAdministrador {
  id_lugar: number;
  id_usuario: number;
  id_categoria: number;
  id_direccion: number;
  nombre: string;
  descripcion: string;
  paginaWeb: string;
  num_telefonico: string;
  activo: boolean;
  bloqueado: boolean;
  bloqueado_por: number | null;
  desbloqueado_por: number | null;
  motivo_bloqueo: string | null;
  fecha_activacion: string | null;
  fecha_bloqueo: string | null;
  fecha_desbloqueo: string | null;
  activado_por_pago_id: number | null;
  horario_apertura: string;
  horario_cierre: string;
  dias_servicio: string[];
  imagenes: ImagenLugar[];
  created_at: string;
  updated_at: string;
  last_login: string | null;

  // Extras / opcionales
  promedioValoracion?: number | null;
  totalComentarios?: number;
  estado_texto?: string;

  categoria?: {
    id_categoria: number;
    nombre: string;
    descripcion: string;
  };

  direccion?: {
    calle: string;
    numero_int?: string | null;
    numero_ext?: string | null;
    colonia?: string;
    codigo_postal?: string;
  };

  usuario?: {
    id_usuario: number;
    nombre: string;
    apellidoP: string;
    apellidoM: string;
    correo: string;
    foto_perfil: string;
    id_rol: number;
    activo: boolean;
    rol: { id_rol: number; nombre: string; descripcion: string };
    last_login?: string;
  };
}
