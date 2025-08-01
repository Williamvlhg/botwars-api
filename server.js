import express from 'express';
import http from 'http';
import { WebSocketServer } from 'ws';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const port = 3000;

let lastWebSocketResponse = null;

app.use(express.json());

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

wss.on('connection', (ws) => {
  console.log('Client (WebSocket) connected');

  ws.on('message', (message) => {
    try {
      const command = JSON.parse(message);
      console.log('Received WebSocket command:', command);

      const response = {
        move: command.move || 'STAY',
        action: command.action || 'NONE',
      };

      if (command.action === 'BOMB') {
        response.bombType = command.bombType || 'proximity';
      }

      lastWebSocketResponse = response;

      wss.clients.forEach((client) => {
        if (client.readyState === client.OPEN) {
          client.send(JSON.stringify(response));
        }
      });
    } catch (error) {
      console.error('Failed to process WebSocket message:', error);
    }
  });
});

app.post('/action', (req, res) => {
  const command = req.body;
  console.log('Received HTTP command:', command);

  const response = {
    move: command.move || 'STAY',
    action: command.action || 'NONE',
  };

  if (command.action === 'BOMB') {
    response.bombType = command.bombType || 'proximity';
  }
  res.json(response);
});

app.get('/last-response', (req, res) => {
  if (lastWebSocketResponse) {
    res.json(lastWebSocketResponse);
  } else {
    res.status(404).json({ message: "Aucune réponse WebSocket n'a encore été envoyée." });
  }
});

  server.listen(port, () => {
    console.log(`Server listening on http://localhost:${port}`);
  });

export { app, server, wss };