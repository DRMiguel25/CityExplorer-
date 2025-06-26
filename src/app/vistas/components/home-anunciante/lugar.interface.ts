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
}
