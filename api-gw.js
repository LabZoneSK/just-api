const { ServiceBroker } = require("moleculer");
const ApiService = require("moleculer-web");

const broker = new ServiceBroker();

// Load API Gateway
broker.createService(ApiService);
broker.loadService(__dirname + "/services/fed.service.js");

// Start server
broker.start();