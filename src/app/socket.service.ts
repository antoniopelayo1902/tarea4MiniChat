import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable, Subject } from 'rxjs';

export interface ChatMessage {
  from: string;
  text: string;
  timestamp: string;
}

@Injectable({ providedIn: 'root' })
export class SocketService {
  private socket?: Socket;
  private readonly URL = 'http://localhost:3000';

  private messagesSubject = new Subject<ChatMessage>();
  private userConnectedSubject = new Subject<string>();
  private disconnectSubject = new Subject<void>();

  // Exposed observables
  messages$: Observable<ChatMessage> = this.messagesSubject.asObservable();
  userConnected$: Observable<string> = this.userConnectedSubject.asObservable();
  disconnected$: Observable<void> = this.disconnectSubject.asObservable();

  connect(username: string): void {
    // Cerrar conexión previa si existe
    if (this.socket) {
      this.socket.disconnect();
      this.socket = undefined;
    }

    this.socket = io(this.URL, {
      transports: ['websocket'],
      withCredentials: false
    });

    this.socket.on('connect', () => {
      // Avisar al servidor que este usuario se ha conectado
      this.socket?.emit('user_connected', username);
    });

    this.socket.on('message', (data: ChatMessage) => {
      this.messagesSubject.next(data);
    });

    this.socket.on('user_connected', (name: string) => {
      this.userConnectedSubject.next(name);
    });

    this.socket.on('disconnect', () => {
      this.disconnectSubject.next();
    });
  }

  sendMessage(from: string, text: string): void {
    const payload: ChatMessage = {
      from,
      text,
      timestamp: new Date().toISOString(),
    };
    this.socket?.emit('message', payload);
  }

  disconnect(): void {
    this.socket?.disconnect();
    this.socket = undefined;
  }
}
