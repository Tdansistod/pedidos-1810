const express = require("express");
const bodyParser = require("body-parser");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors"); // Requiere el paquete cors

const app = express();
const server = http.createServer(app); // Necesitamos el servidor HTTP para usar WebSockets
const io = socketIo(server); // Inicia Socket.io

app.use(bodyParser.json());

app.use(
  cors({
    origin: ["https://1810.xn--wdiseoweb-p6a.com", "http://localhost:3000"], // Permitir el frontend y localhost
    methods: "GET,POST,PUT,DELETE",
    allowedHeaders: "Content-Type,Authorization",
  })
);

// Manejar el webhook
app.options("/webhook", (req, res) => {
  res.header(
    "Access-Control-Allow-Origin",
    "https://1810.xn--wdiseoweb-p6a.com"
  );
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type,Authorization");
  res.sendStatus(200);
});

let pedidos = []; // Aquí guardaremos los pedidos

// Ruta para recibir los pedidos mediante webhooks (POST)
app.post("/webhook", (req, res) => {
  const nuevoPedido = req.body;
  pedidos.push(nuevoPedido);
  console.log("Nuevo pedido recibido:", nuevoPedido);

  // Emitimos el nuevo pedido a todos los clientes conectados
  io.emit("nuevoPedido", nuevoPedido);

  res.header(
    "Access-Control-Allow-Origin",
    "https://1810.xn--wdiseoweb-p6a.com"
  );
  res.status(200).send("Pedido recibido");
});

// Ruta para mostrar los pedidos en formato JSON (GET)
app.get("/pedidos", (req, res) => {
  res.json(pedidos); // Enviar la lista de pedidos al cliente
});

// Servir el frontend
app.use(express.static("public"));

const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});

io.on("connection", (socket) => {
  console.log("Un cliente se ha conectado");
});
