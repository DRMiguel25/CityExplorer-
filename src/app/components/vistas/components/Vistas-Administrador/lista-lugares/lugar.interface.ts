export interface Lugar {
  id_lugar: number;  // Cambiado de id a id_lugar
  nombre: string;
  descripcion: string | null;
  paginaWeb: string | null;
  num_telefonico: string | null;
  horario_apertura: string | null;
  horario_cierre: string | null;
  id_categoria: number;
  id_direccion: number;
  activo: boolean | null;
  url: string;

  // Agrega id_usuario si no está presente
  id_usuario: number;

  promedioValoracion?: number | string;
  totalComentarios?: number;
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
