const express = require("express");
const CartManager = require("../controllers/CartManager.js");
const ProductManager = require("../controllers/ProductManager.js");
const router = express.Router();

const cartManager = new CartManager("./src/models/carrito.json");
const productManager = new ProductManager("./src/models/productos.json");

router.post("/", async (req, res) => {
  try {
    const cartId = await cartManager.createCart();
    res.status(201).json({ id: cartId });
  } catch (error) {
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

router.get("/:cid", async (req, res) => {
  try {
    const products = await cartManager.getProductsInCart(
      Number(req.params.cid)
    );
    res.json(products);
  } catch (error) {
    res.status(404).json({ error: "Carrito no encontrado" });
  }
});

router.post("/:cid/product/:pid", async (req, res) => {
  try {
    const productId = Number(req.params.pid);
    const product = await productManager.getProductById(productId);

    if (!product) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    await cartManager.addProductToCart(Number(req.params.cid), productId, 1);
    res.json({ message: "Producto agregado al carrito exitosamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

router.delete("/:cid/product/:pid", async (req, res) => {
  try {
    await cartManager.removeProductFromCart(
      Number(req.params.cid),
      Number(req.params.pid)
    );
    res.json({ message: "Producto eliminado del carrito" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete("/:cartId", async (req, res) => {
  try {
    const cartId = parseInt(req.params.cartId);
    const deleted = await cartManager.deleteCart(cartId);
    if (!deleted) {
      return res.status(404).json({ message: `Carrito con id ${cartId} no encontrado` });
    }
    res.status(200).json({ message: `Carrito con id ${cartId} eliminado exitosamente.` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
