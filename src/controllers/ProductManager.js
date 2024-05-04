const fs = require("fs").promises;
const path = require("path");

class ProductManager {
  static ultId = 0;

  constructor() {
    this.path = path.join(__dirname, "..", "models", "productos.json");
    this.products = [];
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

  async guardarArchivo(arrayProductos) {
    try {
      await fs.writeFile(this.path, JSON.stringify(arrayProductos, null, 2));
    } catch (error) {
      console.log("Error al guardar el archivo", error);
    }
  }

  async getNextId() {
    const products = await this.leerArchivo();
    if (products.length === 0) {
      return 1;
    }
    const maxId = products.reduce(
      (max, product) => Math.max(max, product.id),
      products[0].id
    );
    return maxId + 1;
  }

  async addProduct(product) {
    let {
      title,
      description,
      code,
      price,
      stock,
      category,
      thumbnail = [],
    } = product;

    if (
      !title ||
      !description ||
      !code ||
      price === undefined ||
      stock === undefined ||
      !category
    ) {
      throw new Error("Todos los campos son obligatorios, excepto thumbnail");
    }
    const products = await this.leerArchivo();

    const existingProduct = products.find((p) => p.code === code);
    if (existingProduct) {
      throw new Error(`El producto con el código ${code} ya existe.`);
    }

    const id = await this.getNextId();
    const newProduct = {
      id,
      title,
      description,
      code,
      price,
      stock,
      category,
      thumbnail,
      status: true,
    };

    products.push(newProduct);

    await this.guardarArchivo(products);
    return newProduct;
  }

  async getProducts() {
    return await this.leerArchivo();
  }

  async getProductById(id) {
    try {
      const arrayProductos = await this.leerArchivo();
      return arrayProductos.find((item) => item.id === id);
    } catch (error) {
      console.log("Error al leer el archivo ", error);
    }
  }

  async updateProduct(id, updatedProduct) {
    const products = await this.leerArchivo();
    const index = products.findIndex((product) => product.id === id);

    if (index !== -1) {
      const { id: ignoredId, ...updatedData } = updatedProduct;
      products[index] = { ...products[index], ...updatedData };
      await this.guardarArchivo(products);
      console.log("Producto actualizado");
    } else {
      console.log("Producto no encontrado para actualizar");
    }
  }

  async deleteProduct(id) {
    try {
      const arrayProductos = await this.leerArchivo();
      const index = arrayProductos.findIndex((product) => product.id === id);

      if (index !== -1) {
        arrayProductos.splice(index, 1);
        await this.guardarArchivo(arrayProductos);
        console.log(`Producto con id: ${id} eliminado.`);
      } else {
        console.log(`Producto con id: ${id} no encontrado para eliminar.`);
      }
    } catch (error) {
      console.log("Error al eliminar el producto", error);
    }
  }
}

module.exports = ProductManager;
