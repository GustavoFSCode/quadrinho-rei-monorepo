/**
 * operation controller
 */

import { factories } from "@strapi/strapi";
import { clientService } from "../services/clientService";
import { UserService } from "../services/userService";
import { cardService } from "../services/cardService";
import { AddressService } from "../services/addressService";
import { ProductService } from "../services/productService";
import { CartService } from "../services/cartService";

export default factories.createCoreController(
  "api::operation.operation",
  ({ strapi }) => ({
    async getClient(ctx) {
      const sales = new clientService();
      return sales.getClient(ctx.request.query.id, ctx);
    },
    async createClient(ctx) {
      const sales = new clientService();
      return sales.createClient(ctx.request.body);
    },
    async editClient(ctx) {
      const sales = new clientService();
      return sales.editClient(ctx);
    },
    async deleteUser(ctx) {
      const sales = new UserService();
      return sales.deleteUser(ctx);
    },
    async blockUser(ctx) {
      const sales = new UserService();
      return sales.blockUser(ctx);
    },
    async changePassword(ctx) {
      const sales = new UserService();
      return sales.changePassword(ctx);
    },
    async createCard(ctx) {
      const sales = new cardService();
      return sales.createCard(ctx);
    },
    async deleteCard(ctx) {
      const sales = new cardService();
      return sales.deleteCard(ctx);
    },
    async editCard(ctx) {
      const sales = new cardService();
      return sales.editCard(ctx);
    },
    async createAddress(ctx) {
      const sales = new AddressService();
      return sales.createAddress(ctx);
    },
    async editAddress(ctx) {
      const sales = new AddressService();
      return sales.editAddress(ctx);
    },
    async deleteAddress(ctx) {
      const sales = new AddressService();
      return sales.deleteAddress(ctx);
    },
    async getUser(ctx) {
      const userService = new UserService();
      return userService.getUser(ctx);
    },
    async createProduct(ctx) {
      const productService = new ProductService();
      return productService.createProduct(ctx);
    },
    async getProductsMaster(ctx) {
      const productService = new ProductService();
      return productService.getProductsMaster(ctx);
    },
    async getProductsUser(ctx) {
      const productService = new ProductService();
      return productService.getProductsUser(ctx);
    },
    async editProduct(ctx) {
      const productService = new ProductService();
      return productService.editProduct(ctx);
    },
    async removeProduct(ctx) {
      const productService = new ProductService();
      return productService.removeProduct(ctx);
    },
    async createOrder(ctx) {
      const productService = new CartService();
      return productService.createOrder(ctx);
    },
    async updateQuantityOrder(ctx) {
      const cartService = new CartService();
      return cartService.updateQuantityOrder(ctx);
    },
    async getOrders(ctx) {
      const cartService = new CartService();
      return cartService.getOrders(ctx);
    },
    async removeAllOrders(ctx) {
      const cartService = new CartService();
      return cartService.removeAllOrders(ctx);
    },
    async removeOrder(ctx) {
      const cartService = new CartService();
      return cartService.removeOrder(ctx);
    },
  })
);
