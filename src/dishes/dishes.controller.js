const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /dishes handlers needed to make the tests pass

//list - GET METHOD
function list(req, res) {
  res.json({ data: dishes });
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
      message: `Dish must include a ${property}.`,
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
      message: `Dish must include a ${property}.`,
    });
  };
}

function priceIsInt(req, res, next) {
  const { data: { price } = {} } = req.body;
  if (typeof price === "number") {
    return next();
  }
  next({
    status: 400,
    message: `Dish price must be a positive integer.`,
  });
}

function priceIsPos(req, res, next) {
  const { data: { price } = {} } = req.body;
  if (price > 0) {
    return next();
  }
  next({
    status: 400,
    message: `Dish price must be a positive integer.`,
  });
}

function create(req, res) {
  const {
    data: { name, description, price, image_url },
  } = req.body;
  const dishObj = {
    id: nextId(),
    name: name,
    description: description,
    price: price,
    image_url: image_url,
  };
  dishes.push(dishObj);
  res.status(201).json({ data: dishObj });
}

//read - GET METHOD
function containsId(req, res, next) {
  const { dishId } = req.params;
  const foundDish = dishes.find((dish) => dish.id === dishId);
  if (foundDish) {
    res.locals.dish = foundDish;
    return next();
  }
  next({
    status: 404,
    message: `Dish does not exist: ${dishId}`,
  });
}

function read(req, res) {
  res.json({ data: res.locals.dish });
}

//Update - PUT METHOD
function idMatches(req, res, next) {
  const { data: { id } = {} } = req.body;
  if (id && id !== req.params.dishId) {
    return next({
      status: 400,
      message: `Dish id does not match route id. Dish: ${id}, Route: ${req.params.dishId}`,
    });
  }
  return next();
}

function update(req, res) {
  const dish = res.locals.dish;
  const { data: { name, description, price, image_url } = {}} = req.body;
  dish.name = name, dish.description = description;
  dish.price = price, dish.image_url = image_url;
  res.json({ data: dish });
}

module.exports = {
  create: [
    bodyDataHas("name"),
    isEmptyProperty("name"),
    bodyDataHas("description"),
    isEmptyProperty("description"),
    bodyDataHas("price"),
    priceIsInt,
    priceIsPos,
    bodyDataHas("image_url"),
    isEmptyProperty("image_url"),
    create,
  ],
  read: [containsId, read],
  update: [
    containsId,
    idMatches,
    bodyDataHas("name"),
    isEmptyProperty("name"),
    bodyDataHas("description"),
    isEmptyProperty("description"),
    bodyDataHas("price"),
    priceIsInt,
    priceIsPos,
    bodyDataHas("image_url"),
    isEmptyProperty("image_url"),
    update,
  ],
  list,
};
