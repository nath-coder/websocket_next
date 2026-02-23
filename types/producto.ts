export interface ProductoBase {
  nombre: string;
  cantidad: number;
  precio: number;
}

export interface ProductoCreate extends ProductoBase {}

export interface ProductoUpdate {
  nombre?: string;
  cantidad?: number;
  precio?: number;
}

export interface ProductoResponse extends ProductoBase {
  id: number;
  fecha_creacion: string;
}

export interface ProductoWebSocketMessage {
  action: 'create' | 'update' | 'delete';
  producto?: ProductoResponse;
  producto_id?: number;
}