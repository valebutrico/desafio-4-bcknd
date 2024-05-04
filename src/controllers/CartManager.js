const fs = require("fs").promises;
const path = require("path");

class CartManager {
  constructor() {
    this.path = path.join(__dirname, "..", "models", "carrito.json");
  }

  async leerArchivo() {
    try {
      const respuesta = await fs.readFile(this.path, "utf-8");
      return JSON.parse(respuesta);
    } catch (error) {
      console.log("Error al leer un archivo", error);
      return [];
    }
  }

  async guardarArchivo(data) {
    try {
      await fs.writeFile(this.path, JSON.stringify(data, null, 2));
    } catch (error) {
      console.log("Error al guardar el archivo", error);
    }
  }

  async getNextId() {
    const carts = await this.leerArchivo();
    const lastCart = carts[carts.length - 1];
    return lastCart ? lastCart.id + 1 : 1;
  }

  async createCart() {
    const carts = await this.leerArchivo();
    const id = await this.getNextId();
    const newCart = { id, products: [] };
    carts.push(newCart);
    await this.guardarArchivo(carts);
    return id;
  }

  async addProductToCart(cartId, productId, quantity) {
    if (!Number.isInteger(quantity) || quantity <= 0) {
      throw new Error("La cantidad debe ser un número entero positivo");
    }

    const carts = await this.leerArchivo();
    const cartIndex = carts.findIndex((cart) => cart.id === cartId);
    if (cartIndex === -1) throw new Error("Carrito no encontrado");

    const productIndex = carts[cartIndex].products.findIndex(
      (product) => product.id === productId
    );
    if (productIndex !== -1) {
      carts[cartIndex].products[productIndex].quantity += quantity;
    } else {
      carts[cartIndex].products.push({ id: productId, quantity });
    }

    await this.guardarArchivo(carts);
  }

  async getProductsInCart(cartId) {
    try {
      const carts = await this.leerArchivo();
      const cart = carts.find((cart) => cart.id === cartId);
      if (!cart) throw new Error("Carrito no encontrado");
      return cart.products;
    } catch (error) {
      console.error("Error al obtener productos del carrito:", error.message);
      throw error;
    }
  }

  async deleteCart(cartId) {
    const carts = await this.leerArchivo();
    const initialLength = carts.length;
    const filteredCarts = carts.filter((cart) => cart.id !== cartId);
    if (filteredCarts.length === initialLength) {
      return false;
    }
    await this.guardarArchivo(filteredCarts);
    return true;
  }

  async removeProductFromCart(cartId, productId) {
    const carts = await this.leerArchivo();
    const cartIndex = carts.findIndex((cart) => cart.id === cartId);
    if (cartIndex === -1) throw new Error("Carrito no encontrado");

    const productIndex = carts[cartIndex].products.findIndex(
      (product) => product.id === productId
    );
    if (productIndex !== -1) {
      if (carts[cartIndex].products[productIndex].quantity > 1) {
        carts[cartIndex].products[productIndex].quantity -= 1;
      } else {
        carts[cartIndex].products.splice(productIndex, 1);
      }
      await this.guardarArchivo(carts);
    } else {
      throw new Error("Producto no encontrado en el carrito");
    }
  }
}

module.exports = CartManager;
