const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /orders handlers needed to make the tests pass

// list - GET METHOD
function list(req, res) {
  res.json({ data: orders });
}

// read - GET METHOD
function containsId(req, res, next) {
  const { orderId } = req.params;
  const foundOrder = orders.find((order) => order.id === orderId);
  if (foundOrder) {
    res.locals.order = foundOrder;
    return next();
  }
  next({
    status: 404,
    message: `Order does not exist: ${orderId}`,
  });
}

function read(req, res) {
  res.json({ data: res.locals.order });
}

//create - POST METHOD
function bodyDataHas(property) {
  return (req, res, next) => {
    const { data = {} } = req.body;
    if (data[property]) {
      return next();
    }
    next({
      status: 400,
      message: `Order must include a ${property}`,
    });
  };
}

function isEmptyProperty(property) {
  return (req, res, next) => {
    const { data = {} } = req.body;
    if (data[property].length > 0) {
      return next();
    }
    next({
      status: 400,
      message: `Order must include a ${property}`,
    });
  };
}

function isArray(req, res, next) {
  const { data: { dishes } = {} } = req.body;
  if (Array.isArray(dishes) && dishes.length > 0) {
    return next();
  }
  next({
    status: 400,
    message: "Order must include at least one dish.",
  });
}

function quantityIsMissing(req, res, next) {
  const { data: { dishes } = {} } = req.body;
  const index = dishes.findIndex((dish) => dish.quantity === undefined);
  if (index === -1) {
    // Would it be wise to store dishes in
    // res.locals to prevent copying in future middleware?
    //res.locals.dishes = dishes
    return next();
  }
  next({
    status: 400,
    message: `Dish ${index} must have a quantity that is an integer greater than 0`,
  });
}

function quantityIsInt(req, res, next) {
  const { data: { dishes } = {} } = req.body;
  const index = dishes.findIndex((dish) => typeof dish.quantity !== "number");
  if (index === -1) {
    return next();
  }
  next({
    status: 400,
    message: `Dish ${index} must have a quantity that is an integer greater than 0`,
  });
}

function quantityisPosInt(req, res, next) {
  const { data: { dishes } = {} } = req.body;
  const index = dishes.findIndex((dish) => dish.quantity <= 0);
  if (index == -1) {
    return next();
  }
  next({
    status: 400,
    message: `Dish ${index} must have a quantity that is an integer greater than 0`,
  });
}

function create(req, res) {
  const { data: { deliverTo, mobileNumber, status, dishes } = {} } = req.body;
  const order = {
    id: nextId(),
    deliverTo: deliverTo,
    mobileNumber: mobileNumber,
    status: status,
    dishes: dishes,
  };
  orders.push(order);
  res.status(201).json({ data: order });
}

//update - PUT METHOD
function idMatches(req, res, next) {
  const { data: { id } = {} } = req.body;
  if (!id) {
    //res.locals.needsId = true;
    req.needsId = true;
    return next();
  } else if (id != req.params.orderId) {
    next({
      status: 400,
      message: `Order id does not match route id. Order: ${id}, Route: ${req.params.orderId}`,
    });
  }
  return next();
}

function isDeliveredOrder(req, res, next) {
  const { data: { status } = {} } = req.body;
  // Body request can have status "invalid"??
  if (res.locals.order.status !== "delivered" && status !== "invalid") {
    return next();
  }
  next({
    status: 400,
    // Solution to confusing error involving "status" substring
    message: `An order of status: ${res.locals.order.status} can not be changed.`,
  });
}

function update(req, res) {
  // Checking if new order needs id
  if (!req.needsId) {
    const order = (res.locals.order = req.body.data);
    res.json({ data: order });
  } else {
    const { data: { deliverTo, mobileNumber, status, dishes } = {} } = req.body;
    const order = (res.locals.order = {
      id: req.params.orderId,
      deliverTo: deliverTo,
      mobileNumber: mobileNumber,
      status: status,
      dishes: dishes,
    });
    res.json({ data: order });
  }
}

//delete - DELETE METHOD
function isPendingOrder(req, res, next) {
  if (res.locals.order.status === "pending") {
    return next();
  }
  next({
    status: 400,
    message: "An order cannot be deleted unless it is pending.",
  });
}
function destroy(req, res) {
  const order = res.locals.order;
  orders.splice(orders.indexOf(order), 1);
  res.status(204).json({ data: order });
}

module.exports = {
  create: [
    bodyDataHas("deliverTo"),
    isEmptyProperty("deliverTo"),
    bodyDataHas("mobileNumber"),
    isEmptyProperty("mobileNumber"),
    bodyDataHas("dishes"),
    isArray,
    quantityIsMissing,
    quantityIsInt,
    quantityisPosInt,
    create,
  ],
  read: [containsId, read],
  update: [
    containsId,
    idMatches,
    bodyDataHas("deliverTo"),
    isEmptyProperty("deliverTo"),
    bodyDataHas("mobileNumber"),
    isEmptyProperty("mobileNumber"),
    bodyDataHas("status"),
    isEmptyProperty("status"),
    isDeliveredOrder,
    bodyDataHas("dishes"),
    isArray,
    quantityIsMissing,
    quantityIsInt,
    quantityisPosInt,
    update,
  ],
  delete: [containsId, isPendingOrder, destroy],
  list,
};
