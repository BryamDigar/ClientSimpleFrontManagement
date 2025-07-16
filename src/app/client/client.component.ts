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
  clienteForm: FormGroup;
  clientes: Cliente[] = [];
  ciudadesFiltradas: string[] = [];
  ocupaciones = OCUPACIONES;
  ciudades = CIUDADES;
  modoEdicion = false;
  clienteEditando: string | null = null;
  mensaje = '';
  cargando = false;
  terminoBusqueda = '';
  documentoBusqueda = '';

  constructor(
    private fb: FormBuilder,
    private clienteService: ClienteService
  ) {
    this.clienteForm = this.crearFormulario();
  }

  ngOnInit() {
    this.cargarClientes();
    this.ciudadesFiltradas = [...this.ciudades];
  }

  crearFormulario(): FormGroup {
    return this.fb.group({
      numeroDocumento: ['', [Validators.required, Validators.maxLength(20), Validators.pattern('^[0-9A-Za-z-]+$')]],
      nombre: ['', [Validators.required, Validators.maxLength(100), Validators.pattern('^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$')]],
      apellidos: ['', [Validators.required, Validators.maxLength(150), Validators.pattern('^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$')]],
      fechaNacimiento: ['', [Validators.required]],
      ciudad: ['', [Validators.required, Validators.maxLength(100)]],
      correoElectronico: ['', [Validators.required, Validators.email, Validators.maxLength(255)]],
      telefono: ['', [Validators.required, Validators.maxLength(20), Validators.pattern('^[+]?[0-9\\s-()]+$')]],
      ocupacion: ['', [Validators.required]]
    });
  }

  cargarClientes() {
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

  onSubmit() {
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

  crearCliente() {
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
        this.mostrarMensaje(error.error?.message || 'Error al crear cliente', 'error');
        this.cargando = false;
      }
    });
  }

  actualizarCliente() {
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
        this.mostrarMensaje(error.error?.message || 'Error al actualizar cliente', 'error');
        this.cargando = false;
      }
    });
  }

  editarCliente(cliente: Cliente) {
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
    
    // Deshabilitar el campo número de documento en modo edición
    this.clienteForm.get('numeroDocumento')?.disable();
  }

  eliminarCliente(numeroDocumento: string) {
    if (confirm('¿Está seguro de que desea eliminar este cliente?')) {
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
  }

  buscarClientes() {
    if (this.terminoBusqueda.trim()) {
      this.cargando = true;
      
      this.clienteService.buscarClientes(this.terminoBusqueda).subscribe({
        next: (response) => {
          this.clientes = response.data;
          this.mostrarMensaje(`Se encontraron ${response.total} resultados`, 'success');
          this.cargando = false;
        },
        error: (error) => {
          console.error('Error al buscar clientes:', error);
          this.mostrarMensaje('Error al buscar clientes', 'error');
          this.cargando = false;
        }
      });
    } else {
      this.cargarClientes();
    }
  }

  buscarPorDocumento() {
    if (this.documentoBusqueda.trim()) {
      this.cargando = true;
      
      this.clienteService.obtenerClientePorDocumento(this.documentoBusqueda).subscribe({
        next: (response) => {
          this.clientes = [response.data]; // Mostrar solo el cliente encontrado
          this.mostrarMensaje('Cliente encontrado exitosamente', 'success');
          this.cargando = false;
        },
        error: (error) => {
          console.error('Error al buscar cliente por documento:', error);
          this.clientes = []; // Limpiar la lista si no se encuentra
          this.mostrarMensaje(error.error?.message || 'Cliente no encontrado', 'error');
          this.cargando = false;
        }
      });
    } else {
      this.cargarClientes();
    }
  }

  filtrarCiudades(event: any) {
    const valor = event.target.value.toLowerCase();
    this.ciudadesFiltradas = this.ciudades.filter(ciudad => 
      ciudad.toLowerCase().includes(valor)
    );
  }

  seleccionarCiudad(ciudad: string) {
    this.clienteForm.patchValue({ ciudad });
    this.ciudadesFiltradas = [...this.ciudades];
  }

  cancelarEdicion() {
    this.modoEdicion = false;
    this.clienteEditando = null;
    this.limpiarFormulario();
  }

  limpiarFormulario() {
    this.clienteForm.reset();
    this.clienteForm.get('numeroDocumento')?.enable();
    this.ciudadesFiltradas = [...this.ciudades];
  }

  marcarCamposComoTocados() {
    Object.keys(this.clienteForm.controls).forEach(key => {
      this.clienteForm.get(key)?.markAsTouched();
    });
  }

  mostrarMensaje(texto: string, tipo: 'success' | 'error') {
    this.mensaje = texto;
    setTimeout(() => {
      this.mensaje = '';
    }, 5000);
  }

  // Métodos auxiliares para validaciones
  obtenerErrorCampo(campo: string): string {
    const control = this.clienteForm.get(campo);
    if (control && control.errors && control.touched) {
      if (control.errors['required']) return `${campo} es obligatorio`;
      if (control.errors['email']) return 'Formato de email inválido';
      if (control.errors['pattern']) return `Formato de ${campo} inválido`;
      if (control.errors['maxlength']) return `${campo} excede la longitud máxima`;
    }
    return '';
  }

  campoEsInvalido(campo: string): boolean {
    const control = this.clienteForm.get(campo);
    return !!(control && control.invalid && control.touched);
  }
}
