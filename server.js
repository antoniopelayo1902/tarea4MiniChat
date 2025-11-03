const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

app.get('/health', (req, res) => res.json({ status: 'ok' }));

io.on('connection', (socket) => {
  console.log('Nuevo cliente conectado:', socket.id);

  socket.on('user_connected', (username) => {
    // Notificar a los demás clientes que un nuevo usuario se conectó
    socket.broadcast.emit('user_connected', username);
  });

  socket.on('message', (data) => {
    // Reenviar el mensaje a todos los clientes (incluido el emisor)
    io.emit('message', data);
  });

  socket.on('disconnect', () => {
    console.log('Cliente desconectado:', socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Servidor Socket.IO en http://localhost:${PORT}`));
