//  Hello World client
const zmq = require("zeromq");

async function runClient() {
  console.log("Connecting to hello world server…");

  //  Socket to talk to server
  const sock = new zmq.Request();
  sock.connect("tcp://localhost:5555");

  const ingredients = JSON.stringify(["chickpea"]);
  await sock.send(ingredients);
  const [result] = await sock.receive();
  console.log("Received ", result.toString());
}

runClient();
