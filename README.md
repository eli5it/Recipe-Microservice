# Recipe-Microservice

Communication Contract

To Programmatically request data, you will have to send a stringified JSON array of ingredients to the zeromq server running the microservice. What follows below is example code for doing so while utilizing Node.js.

    const ingredients = JSON.stringify(["chickpea"]);
    await sock.send(ingredients);

To Programatically receive data, from the microservice, you will have to utilize the zeromq receive method (which is called recv within the python library). In order to work with the received data, it is necessary to convert it from string representation to JSON one. This conversion is performed in the below sample Node.js code, with the JSON.parse method.

const [result] = await sock.receive();
const data = JSON.parse(result.toString());
console.log(data);
