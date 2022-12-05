const amqp = require("amqplib");
const amqpURL = "amqp://localhost:5672";
const { chatting, sequelize } = require("./models");

let arr = [];

module.exports = {
  Consumer: async () => {
    try {
      const connect = await amqp.connect(amqpURL);
      const ch = await connect.createChannel();
      const queue = "queue";
      await ch.assertQueue(queue, { durable: true });
      await ch.consume(queue, async (message) => {
        // console.log(typeof JSON.parse(message.content));
        let msg = JSON.parse(message.content);
        console.log(message.content);
        //console.log(typeof message);
        let chat = {};
        chat.chat = message.content.toString();
        arr.push(chat);
        console.log(msg);
        //console.log(typeof arr);
        //console.log(typeof push);
        console.log(arr);
        if (arr.length == 5) {
          try {
            console.log(arr);
            const rows = await chatting.bulkCreate(arr).catch((err) => {
              console.log(err);
            });
            arr.splice(0);
            console.log(rows);
            return;
          } catch (err) {
            console.log(err);
          }
        }
        ch.ack(message);
      });
    } catch (err) {
      console.log(err);
    }
  },
};
