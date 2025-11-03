import { Component, OnDestroy } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SocketService, ChatMessage } from './socket.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnDestroy {
  title = 'tarea4';

  username = '';
  messageText = '';
  connected = false;

  messages: ChatMessage[] = [];
  private subs: Subscription[] = [];

  constructor(public socket: SocketService) {
    // Suscripciones a los eventos del servicio
    this.subs.push(
      this.socket.messages$.subscribe((m) => this.messages.push(m))
    );

    this.subs.push(
      this.socket.userConnected$.subscribe((name) =>
        this.messages.push({
          from: 'SYSTEM',
          text: `${name} se ha conectado`,
          timestamp: new Date().toISOString(),
        })
      )
    );

    this.subs.push(
      this.socket.disconnected$.subscribe(() => {
        this.connected = false;
        this.messages.push({
          from: 'SYSTEM',
          text: 'Conexión cerrada',
          timestamp: new Date().toISOString(),
        });
      })
    );
  }

  connect(): void {
    const name = this.username.trim();
    if (!name) return;
    this.socket.connect(name);
    this.connected = true;
  }

  send(): void {
    const text = this.messageText.trim();
    if (!text || !this.connected) return;
    this.socket.sendMessage(this.username, text);
    this.messageText = '';
  }

  ngOnDestroy(): void {
    this.subs.forEach((s) => s.unsubscribe());
    this.socket.disconnect();
  }
}
