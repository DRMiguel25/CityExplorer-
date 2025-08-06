// estadisticas.model.ts
export interface EstadisticasResponse {
    estatus: number;
    data: Estadistica[];
}

export interface Estadistica {
    fecha: string;
    total_tiempo: number;
}