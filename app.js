const express = require("express");
const app = express();
const cors = require("cors");
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const { chatting, sequelize } = require("./models");
const rabbitmq = require("./rabbit");
//const consumer = require("./consumer");
const amqp = require("amqplib");

const amqpURL = "amqp://localhost:5672";

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

sequelize
  .sync({ force: false })
  .then(() => {
    console.log("연결됨");
  })
  .catch((err) => {
    console.log(err);
  });

const send = async (message) => {
  try {
    //console.log(message);
    const connect = await amqp.connect(amqpURL);
    const channel = await connect.createChannel();
    const exchange = "exchange";
    const queue = "queue";
    const routingkey = "sample.routing";
    //const somebuffer = Buffer.from(message.toString());
    await channel
      .assertExchange(exchange, "direct", { durable: true })
      .catch((err) => console.log(err));
    await channel.assertQueue(queue, { durable: true });
    await channel.bindQueue(queue, exchange, routingkey);
    await channel.publish(exchange, routingkey, Buffer.from(message));
  } catch (err) {
    console.log(err);
  }
};
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});
app.get("/test", async (req, res) => {
  try {
    const { idx } = req.body;
    const rows = await chatting.findOne({ idx: idx });
    if (rows) return res.status(200).json({ result: rows });
  } catch (err) {
    console.log(err);
  }
});
io.on("connection", (socket) => {
  console.log("connect");
  socket.on("disconnect", () => {
    console.log("disconnect");
  });
});
io.emit("some event", {
  someProperty: "some value",
  otherProperty: "other value",
});
io.on("connection", (socket) => {
  socket.on("chat message", async (message) => {
    try {
      //console.log(typeof message);

      io.emit("chat message", message);
      await send(JSON.stringify(message));
      // console.log(message);
    } catch (err) {
      console.log(err);
    }
  });
});

server.listen(2022, () => {
  console.log("listening on :2022");
});

rabbitmq.Consumer();
