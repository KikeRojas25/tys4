export interface UserBot {
  id?: number;
  dni?: string | null;
  nombre?: string | null;
  apellido?: string | null;
  telefono?: string | null;
  idperfil?: number | null;
  perfil?: string | null;
  ClientesIds?: string | null;
  estado?: string | null;
  fecharegistro?: string | null;
}

export interface PerfilBot {
  id: number;
  nombrePerfil: string;
}

// Mapeo de perfiles que se muestran en el módulo:
// 4 -> Repartidor (RepartidorTys)
// 6 -> Chofer    (AdminCho)
export const PERFIL_LABELS: Record<number, string> = {
  4: 'Repartidor',
  6: 'Chofer'
};
