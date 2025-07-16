import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ClienteService } from '../services/cliente.service';
import { Cliente, ClienteCreateDTO, ClienteUpdateDTO, OCUPACIONES, CIUDADES } from '../models/cliente.model';

@Component({
  selector: 'app-client',
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './client.component.html',
  styleUrl: './client.component.css'
})
export class ClientComponent implements OnInit {
  // ========== PROPIEDADES ==========
  
  // Formulario y datos
  clienteForm: FormGroup;
  clientes: Cliente[] = [];
  ciudadesFiltradas: string[] = [];
  
  // Constantes
  readonly ocupaciones = OCUPACIONES;
  readonly ciudades = CIUDADES;
  
  // Estado del componente
  modoEdicion = false;
  clienteEditando: string | null = null;
  mensaje = '';
  cargando = false;
  
  // Búsqueda
  tipoBusqueda = 'nombre'; // 'nombre' o 'documento'
  valorBusqueda = '';

  // ========== CONSTRUCTOR E INICIALIZACIÓN ==========
  
  constructor(
    private fb: FormBuilder,
    private clienteService: ClienteService
  ) {
    this.clienteForm = this.crearFormulario();
  }

  ngOnInit(): void {
    this.cargarClientes();
    this.ciudadesFiltradas = [...this.ciudades];
  }

  // ========== CONFIGURACIÓN DEL FORMULARIO ==========
  
  private crearFormulario(): FormGroup {
    return this.fb.group({
      numeroDocumento: ['', [
        Validators.required, 
        Validators.maxLength(20), 
        Validators.pattern('^[0-9A-Za-z-]+$')
      ]],
      nombre: ['', [
        Validators.required, 
        Validators.maxLength(100), 
        Validators.pattern('^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$')
      ]],
      apellidos: ['', [
        Validators.required, 
        Validators.maxLength(150), 
        Validators.pattern('^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$')
      ]],
      fechaNacimiento: ['', [
        Validators.required, 
        this.validarFechaNacimiento
      ]],
      ciudad: ['', [Validators.required, Validators.maxLength(100)]],
      correoElectronico: ['', [
        Validators.required, 
        Validators.email, 
        Validators.maxLength(255)
      ]],
      telefono: ['', [
        Validators.required, 
        Validators.maxLength(20), 
        Validators.pattern('^[+]?[0-9\\s-()]+$')
      ]],
      ocupacion: ['', [Validators.required]]
    });
  }

  // ========== OPERACIONES CRUD ==========
  
  cargarClientes(): void {
    this.cargando = true;
    this.clienteService.obtenerTodosLosClientes().subscribe({
      next: (response) => {
        this.clientes = response.data;
        this.cargando = false;
        this.mostrarMensaje('Clientes cargados exitosamente', 'success');
      },
      error: (error) => {
        console.error('Error al cargar clientes:', error);
        this.cargando = false;
        this.mostrarMensaje('Error al cargar clientes', 'error');
      }
    });
  }

  onSubmit(): void {
    if (this.clienteForm.valid) {
      this.cargando = true;
      
      if (this.modoEdicion && this.clienteEditando) {
        this.actualizarCliente();
      } else {
        this.crearCliente();
      }
    } else {
      this.marcarCamposComoTocados();
    }
  }

  private crearCliente(): void {
    const clienteData: ClienteCreateDTO = this.clienteForm.value;
    
    this.clienteService.crearCliente(clienteData).subscribe({
      next: (response) => {
        this.mostrarMensaje(response.message, 'success');
        this.limpiarFormulario();
        this.cargarClientes();
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al crear cliente:', error);
        this.mostrarMensaje(this.procesarError(error), 'error');
        this.cargando = false;
      }
    });
  }

  private actualizarCliente(): void {
    if (!this.clienteEditando) return;
    
    const clienteData: ClienteUpdateDTO = {
      nombre: this.clienteForm.value.nombre,
      apellidos: this.clienteForm.value.apellidos,
      fechaNacimiento: this.clienteForm.value.fechaNacimiento,
      ciudad: this.clienteForm.value.ciudad,
      correoElectronico: this.clienteForm.value.correoElectronico,
      telefono: this.clienteForm.value.telefono,
      ocupacion: this.clienteForm.value.ocupacion
    };

    this.clienteService.actualizarCliente(this.clienteEditando, clienteData).subscribe({
      next: (response) => {
        this.mostrarMensaje(response.message, 'success');
        this.cancelarEdicion();
        this.cargarClientes();
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al actualizar cliente:', error);
        this.mostrarMensaje(this.procesarError(error), 'error');
        this.cargando = false;
      }
    });
  }

  editarCliente(cliente: Cliente): void {
    this.modoEdicion = true;
    this.clienteEditando = cliente.numeroDocumento;
    
    this.clienteForm.patchValue({
      numeroDocumento: cliente.numeroDocumento,
      nombre: cliente.nombre,
      apellidos: cliente.apellidos,
      fechaNacimiento: cliente.fechaNacimiento,
      ciudad: cliente.ciudad,
      correoElectronico: cliente.correoElectronico,
      telefono: cliente.telefono,
      ocupacion: cliente.ocupacion
    });
    
    this.clienteForm.get('numeroDocumento')?.disable();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    this.mostrarMensaje(`Editando cliente: ${cliente.nombre} ${cliente.apellidos}`, 'success');
  }

  eliminarCliente(numeroDocumento: string): void {
    if (!confirm('¿Está seguro de que desea eliminar este cliente?')) return;
    
    this.cargando = true;
    this.clienteService.eliminarCliente(numeroDocumento).subscribe({
      next: (response) => {
        this.mostrarMensaje(response.message, 'success');
        this.cargarClientes();
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al eliminar cliente:', error);
        this.mostrarMensaje(error.error?.message || 'Error al eliminar cliente', 'error');
        this.cargando = false;
      }
    });
  }

  // ========== FUNCIONES DE BÚSQUEDA ==========
  
  buscar(): void {
    if (!this.valorBusqueda.trim()) {
      this.cargarClientes();
      return;
    }

    if (this.tipoBusqueda === 'nombre') {
      this.buscarPorNombre();
    } else {
      this.buscarPorDocumentoUnificado();
    }
  }

  private buscarPorNombre(): void {
    this.cargando = true;
    this.clienteService.buscarClientes(this.valorBusqueda)
      .subscribe({
        next: (response) => {
          this.clientes = response.data;
          this.mostrarMensaje(`Se encontraron ${response.total} resultados`, 'success');
          this.cargando = false;
        },
        error: (error) => {
          this.mostrarMensaje(this.procesarError(error), 'error');
          this.cargando = false;
        }
      });
  }

  private buscarPorDocumentoUnificado(): void {
    this.cargando = true;
    this.clienteService.obtenerClientePorDocumento(this.valorBusqueda)
      .subscribe({
        next: (response) => {
          this.clientes = [response.data];
          this.mostrarMensaje('Cliente encontrado exitosamente', 'success');
          this.cargando = false;
        },
        error: (error) => {
          this.clientes = [];
          this.mostrarMensaje(this.procesarError(error), 'error');
          this.cargando = false;
        }
      });
  }

  limpiarBusqueda(): void {
    this.valorBusqueda = '';
    this.cargarClientes();
  }

  // ========== UTILIDADES DEL FORMULARIO ==========
  
  filtrarCiudades(event: any): void {
    const valor = event.target.value.toLowerCase();
    this.ciudadesFiltradas = this.ciudades.filter(ciudad => 
      ciudad.toLowerCase().includes(valor)
    );
  }

  cancelarEdicion(): void {
    this.modoEdicion = false;
    this.clienteEditando = null;
    this.limpiarFormulario();
  }

  limpiarFormulario(): void {
    this.clienteForm.reset();
    this.clienteForm.get('numeroDocumento')?.enable();
    this.ciudadesFiltradas = [...this.ciudades];
  }

  private marcarCamposComoTocados(): void {
    Object.keys(this.clienteForm.controls).forEach(key => {
      this.clienteForm.get(key)?.markAsTouched();
    });
  }

  // ========== MANEJO DE MENSAJES Y ERRORES ==========
  
  private mostrarMensaje(texto: string, tipo: 'success' | 'error'): void {
    this.mensaje = texto;
    setTimeout(() => {
      this.mensaje = '';
    }, 5000);
  }

  private procesarError(error: any): string {
    console.error('Error del backend:', error);
    
    if (error.error) {
      // Errores de validación de campos
      if (error.error.fieldErrors) {
        const errores = Object.entries(error.error.fieldErrors)
          .map(([campo, mensaje]) => `${campo}: ${mensaje}`)
          .join(', ');
        return errores;
      }
      
      // Mensaje directo del backend
      if (error.error.message) {
        return error.error.message;
      }
      
      // Error general del backend
      if (error.error.error) {
        return error.error.error;
      }
    }
    
    // Error de conexión
    if (error.status === 0) {
      return 'No se pudo conectar con el servidor. Verifique su conexión.';
    }
    
    return error.message || 'Ha ocurrido un error inesperado';
  }

  // ========== VALIDADORES Y HELPERS ==========
  
  private validarFechaNacimiento(control: any) {
    if (!control.value) return null;
    
    const fechaNacimiento = new Date(control.value);
    const fechaActual = new Date();
    
    fechaActual.setHours(0, 0, 0, 0);
    fechaNacimiento.setHours(0, 0, 0, 0);
    
    if (fechaNacimiento >= fechaActual) {
      return { fechaFutura: true };
    }
    
    return null;
  }

  obtenerErrorCampo(campo: string): string {
    const control = this.clienteForm.get(campo);
    if (control && control.errors && control.touched) {
      if (control.errors['required']) return `${campo} es obligatorio`;
      if (control.errors['email']) return 'Formato de email inválido';
      if (control.errors['pattern']) return `Formato de ${campo} inválido`;
      if (control.errors['maxlength']) return `${campo} excede la longitud máxima`;
      if (control.errors['fechaFutura']) return 'La fecha de nacimiento no puede ser futura';
    }
    return '';
  }

  campoEsInvalido(campo: string): boolean {
    const control = this.clienteForm.get(campo);
    return !!(control && control.invalid && control.touched);
  }
}