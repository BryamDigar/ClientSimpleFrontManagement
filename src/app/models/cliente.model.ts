export interface Cliente {
  numeroDocumento: string;
  nombre: string;
  apellidos: string;
  fechaNacimiento: string; // formato YYYY-MM-DD
  ciudad: string;
  correoElectronico: string;
  telefono: string;
  ocupacion: 'Empleado' | 'Independiente' | 'Pensionado';
  esViable?: boolean;
  edad?: number;
}

export interface ClienteCreateDTO {
  numeroDocumento: string;
  nombre: string;
  apellidos: string;
  fechaNacimiento: string;
  ciudad: string;
  correoElectronico: string;
  telefono: string;
  ocupacion: 'Empleado' | 'Independiente' | 'Pensionado';
}

export interface ClienteUpdateDTO {
  nombre: string;
  apellidos: string;
  fechaNacimiento: string;
  ciudad: string;
  correoElectronico: string;
  telefono: string;
  ocupacion: 'Empleado' | 'Independiente' | 'Pensionado';
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  total?: number;
  termino?: string;
}

export const OCUPACIONES = ['Empleado', 'Independiente', 'Pensionado'] as const;

export const CIUDADES = [
  'Bogotá',
  'Medellín', 
  'Cali',
  'Barranquilla',
  'Cartagena',
  'Bucaramanga',
  'Pereira',
  'Manizales',
  'Ibagué',
  'Cúcuta',
  'Santa Marta',
  'Villavicencio',
  'Pasto',
  'Montería',
  'Valledupar'
] as const;