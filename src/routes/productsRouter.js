import { Router } from "express";
import { ProductManager } from "../manager/productManager.js";
import { productsUpdated } from "../socketUtils.js";

const productManager = new ProductManager('../src/data/products.json');
const router = Router();

router.get('/', async (req, res) => {
    try {
        const {limit} = req.query;
        const products = await productManager.getProducts();
        const limitValue = parseInt(limit) >= 0 ? parseInt(limit) : products.length;
        res.send({products: products.slice(0, limitValue)});
    } catch (error) {
        res.status(500).send({status: 0, msg: error.message});
    }
});

router.get('/:productsId', async (req, res) => {
    try {
        const productId = req.params.productId;
        const product = await productManager.getProductById(productId)
        res.send({products});
    } catch (error) {
        res.status(404).send({status: 0, msg: error.message});
    }
});

router.post('/', async (req, res) => {
    try {
        const newProductFields = req.body;
        const newProduct = await productManager.addProduct(newProductFields);
        productsUpdated(req.app.get('io'));
        res.send({status: 1, msg: 'Product added successfully', product: newProduct});

    } catch (error) {
        res.status(500).send({status: 0, msg: error.message});
    }
});

router.put('/:productId', async (req, res) => {
    try {
        const productId = req.params.productId;
        const updatedProductFields= req.body;

        if (Object.keys(req.body).length === 0) throw new Error('Empty request body');

        const updatedProduct = await productManager.updateProduct(productId, updatedProductFields);
        productsUpdated(req.app.get('io'));
        res.send({status: 1, msg: 'Product updated successfully', product: updatedProduct});
    } catch (error) {
        res.status(404).send({status: 0, msg: error.message});
    }
});

router.delete('/:productId', async (req, res) => {
    try {
        const productId = req.params.productId;
        await productManager.deleteProduct(productId);
        productsUpdated(req.app.get('io'));
        res.send({status: 1, msg: 'Product deleted successfully'});
    } catch (error) {
        res.status(404).send({status: 0, msg: error.message});
    }
});

export default router;