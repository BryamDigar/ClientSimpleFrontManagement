import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Cliente, ClienteCreateDTO, ClienteUpdateDTO, ApiResponse } from '../models/cliente.model';

@Injectable({
  providedIn: 'root'
})
export class ClienteService {
  private apiUrl = 'http://localhost:8080/api/clientes'; // Cambia la URL según tu configuración

  constructor(private http: HttpClient) { }

  // Crear un nuevo cliente
  crearCliente(cliente: ClienteCreateDTO): Observable<ApiResponse<string>> {
    return this.http.post<ApiResponse<string>>(this.apiUrl, cliente);
  }

  // Obtener todos los clientes
  obtenerTodosLosClientes(): Observable<ApiResponse<Cliente[]>> {
    return this.http.get<ApiResponse<Cliente[]>>(this.apiUrl);
  }

  // Obtener un cliente por número de documento
  obtenerClientePorDocumento(numeroDocumento: string): Observable<ApiResponse<Cliente>> {
    return this.http.get<ApiResponse<Cliente>>(`${this.apiUrl}/${numeroDocumento}`);
  }

  // Actualizar un cliente
  actualizarCliente(numeroDocumento: string, cliente: ClienteUpdateDTO): Observable<ApiResponse<string>> {
    return this.http.put<ApiResponse<string>>(`${this.apiUrl}/${numeroDocumento}`, cliente);
  }

  // Eliminar un cliente
  eliminarCliente(numeroDocumento: string): Observable<ApiResponse<string>> {
    return this.http.delete<ApiResponse<string>>(`${this.apiUrl}/${numeroDocumento}`);
  }

  // Buscar clientes por nombre o apellidos
  buscarClientes(termino: string): Observable<ApiResponse<Cliente[]>> {
    const params = new HttpParams().set('q', termino);
    return this.http.get<ApiResponse<Cliente[]>>(`${this.apiUrl}/buscar`, { params });
  }
}
