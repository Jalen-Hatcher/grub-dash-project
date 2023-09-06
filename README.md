# grub-dash-project
Backend API service for a hypothetical, GrubDash application. This project defines the middleware pipelining for the RESTful API using node.js and Express.
# Overview
This project models the backend of an online delivery service such as Doordash or Grubhub. Users can access certain dishes already existent within the application, as well as documented orders detailing delivery recipients, their addresses and the dishes they've ordered. Although there is no GUI or direct HTML with which the user can interact, data is still sent and displayed in the form of JSON modelling the scaffold of real-world backend-api delivery service.
# Routes
Two routes exist for this api service: dishes and orders. Once cloned, making a get request, through the localhost:500 url, to either of these routes will return JSON describing all existent dishes or orders respectively for the application. Although DELETE is not defined for the dishes route, PUT and POST work as expected for each route. If a user decides to include a route parameter represing the program defined id of a dish/order that specific dish/order will be modified or displayed following RESTful protocol.
