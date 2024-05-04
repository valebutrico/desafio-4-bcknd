const express = require("express");
const ProductManager = require("../controllers/ProductManager.js");
const router = express.Router();
const path = require("path");
let io = null;

const productManager = new ProductManager(
  path.join(__dirname, "..", "models", "productos.json")
);

router.get("/", async (req, res) => {
  try {
    const products = await productManager.getProducts();
    const limit = parseInt(req.query.limit, 10);

    if (!isNaN(limit)) {
      res.json(products.slice(0, limit));
    } else {
      res.json(products);
    }
  } catch (error) {
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

router.get("/:pid", async (req, res) => {
  try {
    const product = await productManager.getProductById(Number(req.params.pid));
    if (!product)
      return res.status(404).json({ error: "Producto no encontrado" });
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

router.post("/", async (req, res) => {
  try {
    const newProduct = await productManager.addProduct(req.body);
    const products = await productManager.getProducts();
    io.emit("updateProducts", products);
    res.status(201).json(newProduct);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put("/:pid", async (req, res) => {
  try {
    const updatedProduct = await productManager.updateProduct(
      Number(req.params.pid),
      req.body
    );
    res.json(updatedProduct);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete("/:pid", async (req, res) => {
  try {
    await productManager.deleteProduct(Number(req.params.pid));
    res.json({ message: "Producto eliminado" });
  } catch (error) {
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

module.exports = function (socketIoInstance) {
  io = socketIoInstance;
  return router;
};
