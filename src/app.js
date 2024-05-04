const express = require("express");
const { engine } = require("express-handlebars");
const http = require("http");
const socketIo = require("socket.io");
const path = require("path");
const ProductManager = require("./controllers/ProductManager");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const productManager = new ProductManager("./src/models/productos.json");

const PUERTO = 8080;

app.engine("handlebars", engine());
app.set("view engine", "handlebars");
app.set("views", path.join(__dirname, "views"));

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get("/", async (req, res) => {
  try {
    const products = await productManager.getProducts();
    res.render("index", { products });
  } catch (error) {
    console.error("Error al obtener productos:", error);
    res.status(500).send("Error al cargar la página");
  }
});
app.get("/realtimeproducts", (req, res) => {
  res.render("realTimeProducts");
});

io.on("connection", (socket) => {
  console.log("Cliente conectado");

  productManager.getProducts().then((products) => {
    socket.emit("updateProducts", products);
  });

  socket.on("disconnect", () => {
    console.log("Cliente desconectado");
  });
});

app.post("/api/products/add", async (req, res) => {
  try {
    await productManager.addProduct(req.body);
    const products = await productManager.getProducts();
    io.emit("updateProducts", products);
    res.status(201).send("Producto añadido");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error al añadir el producto");
  }
});

const productsRouter = require("./routes/products.router.js")(io);
const cartsRouter = require("./routes/carts.router.js");

app.use("/api/products", productsRouter);
app.use("/api/carts", cartsRouter);

server.listen(PUERTO, () => {
  console.log(`Servidor corriendo el puerto ${PUERTO}`);
});
