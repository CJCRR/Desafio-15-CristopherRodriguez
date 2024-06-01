import ProductManager from "../dao/manager/products.dao.js";
import logger from "../logger.js";
const pm = new ProductManager()

const socketProducts = (socketServer) => {
    socketServer.on("connection", async (socket) => {
        logger.info("client connected")
        const listadeproductos = await pm.getAll()
        socketServer.emit("enviodeproducts", listadeproductos)

        socket.on("addProduct", async (obj) => {
            await pm.create(obj)
            const listadeproductos = await pm.getAll()
            socketServer.emit("enviodeproducts", listadeproductos)
        })

        socket.on("deleteProduct", async (id) => {
            logger.info(id)
            await pm.delete(id)
            const listadeproductos = await pm.getAll()
            socketServer.emit("enviodeproducts", listadeproductos)
        })

        socket.on('updateProduct', async (updatedProduct) => {
            const { productId, title, description, price, thumbnail, code, stock } = updatedProduct;
            try {
                await pm.update(productId, { title, description, price, thumbnail, code, stock });
                const listadeproductos = await pm.getAll();
                socketServer.emit('enviodeproducts', listadeproductos);
            } catch (error) {
                console.error('Error al actualizar el producto:', error);
            }
        });
        

        socket.on("nuevousuario", (usuario) => {
            logger.info("usuario", usuario)
            socket.broadcast.emit("broadcast", usuario)
        })
        socket.on("disconnect", () => {
            logger.info(`Usuario esta desconectado `)
        })
    })
};

export default socketProducts;