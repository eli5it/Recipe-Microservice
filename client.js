//  Hello World client
const zmq = require("zeromq");
const prompt = require("prompt-sync")();

async function runClient() {
  //  Socket to talk to server
  const sock = new zmq.Request();
  sock.connect("tcp://localhost:5555");

  while (true) {
    const userInput = prompt(
      "Please provided a comma separated list of ingredients or type quit to quit: "
    );
    if (userInput === "quit") {
      break;
    }
    const ingredientList = JSON.stringify(userInput.split(", "));
    await sock.send(ingredientList);
    const [result] = await sock.receive();
    const data = JSON.parse(result.toString());
    console.log("Ingredient data \n");
    console.log(data);
  }
}

runClient();
