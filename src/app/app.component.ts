import { Component } from '@angular/core';
import { ClientComponent } from './client/client.component';

@Component({
  selector: 'app-root',
  imports: [ClientComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'Gestión de Clientes - RTI';
}
