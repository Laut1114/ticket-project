const express = require("express");
const { buildSchema } = require("graphql");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");
const { createHandler } = require("graphql-http/lib/use/express");
const e = require("express");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Esquema GraphQL
const schema = buildSchema(`
  type Ticket {
    turno: String
    puesto: Int
  }

  type Query {
    tickets: [Ticket]
    ultimoTicket: Ticket
    lastThree: [Ticket]
    ticketsAtendidos: Int
  }

  type Mutation {
    addTicket(turno: String, puesto: Int): Ticket
    callTicket: Ticket
  }
`);

let ticketsList = [];
let ultimosTickets = [];

// Funcion para resolver las peticiones
const root = {
  // Query
  tickets: () => ticketsList,
  ultimoTicket: () => {
    const ticket = ticketsList.shift();
    return ticket;
  },
  lastThree: () => ultimosTickets,
  ticketsAtendidos: () => ultimosTickets.length,

  // Mutations
  addTicket: ({ turno, puesto }) => {
    const ticket = { turno, puesto };
    ticketsList.push(ticket);
    console.log(ticketsList);

    return ticket;
  },
  callTicket: () => {
    if (ticketsList.length === 0) return null;
    const ticket = ticketsList;
    io.emit("ticketCalled", { ticket });

    ultimosTickets.push(ticket[0]);

    return ticket;
  },
};

app.use(cors());

app.use("/graphql", createHandler({ schema, rootValue: root }));
app.use(e.static(__dirname + "/src"));

io.on("connection", (socket) => {
  console.log("New client connected");
  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
