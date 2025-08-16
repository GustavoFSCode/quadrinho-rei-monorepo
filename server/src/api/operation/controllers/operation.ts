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
import { PurchaseService } from "../services/purchaseService";
import { SalesManagement } from "../services/salesManagement";
import { MyPurchase } from "../services/myPurchaseService";
import { TradeService } from "../services/tradesService";
import { DashboardService } from "../services/dashboardService";
import { DatabaseCleanupService } from "../services/databaseCleanupService";

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
    /* Purchases */
    async getPurchase(ctx) {
      const purchaseService = new PurchaseService();
      return purchaseService.getPurchase(ctx);
    },
    async createUpdatePurchase(ctx) {
      const purchaseService = new PurchaseService();
      return purchaseService.createUpdatePurchase(ctx);
    },
    async insertCouponPurchase(ctx) {
      const purchaseService = new PurchaseService();
      return purchaseService.insertCouponPurchase(ctx);
    },
    async insertCards(ctx) {
      const purchaseService = new PurchaseService();
      return purchaseService.insertCards(ctx)
    },
    async insertAddresses(ctx) {
      const purchaseService = new PurchaseService();
      return purchaseService.insertAddresses(ctx)
    },
    async endPurchase(ctx) {
      const purchaseService = new PurchaseService();
      return purchaseService.endPurchase(ctx);
    },
    /* Sales */
    async getSales(ctx) {
      const salesService = new SalesManagement();
      return salesService.getSales(ctx);
    },
    async getSalesStatus(ctx) {
      const salesService = new SalesManagement();
      return salesService.getSalesStatus(ctx);
    },
    async editSalesStatus(ctx) {
      const salesService = new SalesManagement();
      return salesService.editSalesStatus(ctx);
    },
    /* My purchases */
    async getMyPurchases(ctx) {
      const myPurchasesService = new MyPurchase();
      return myPurchasesService.getMyPurchases(ctx);
    },
    async getMyTrades(ctx) {
      const myPurchasesService = new MyPurchase();
      return myPurchasesService.getMyTrades(ctx);
    },
    async requestTrade(ctx) {
      const myPurchasesService = new MyPurchase();
      return myPurchasesService.requestTrade(ctx);
    },
    /* Trades */
    async getTrades(ctx) {
      const tradesService = new TradeService();
      return tradesService.getTrades(ctx);
    },
    async getTradesStatuses(ctx) {
      const tradeService = new TradeService();
      return tradeService.getTradesStatuses(ctx);
    },
    async editTradeStatus(ctx) {
      const tradesService = new TradeService();
      return tradesService.editTradeStatus(ctx);
    },
    async generateCoupon(ctx) {
      const tradesService = new TradeService();
      return tradesService.generateCoupon(ctx);
    },
    async getDashboard(ctx) {
      const dashboardService = new DashboardService();
      return dashboardService.getDashboard(ctx);
    },
    async getProductCategories(ctx) {
      const dashboardService = new DashboardService();
      return dashboardService.getProductCategories(ctx);
    },
    /* Chat AI */
    async sendChatMessage(ctx) {
      console.log('sendChatMessage controller called');
      try {
        const { message, conversationId } = ctx.request.body;
        
        // Buscar o client associado ao user
        const user = ctx.state.user;
        const client = await strapi.entityService.findMany('api::client.client', {
          filters: {
            user: {
              id: user.id
            }
          }
        });
        
        const clientId = client?.[0]?.id;

        if (!clientId) {
          return ctx.badRequest('Cliente não autenticado');
        }

        if (!message || message.trim().length === 0) {
          return ctx.badRequest('Mensagem não pode estar vazia');
        }

        const operationService = strapi.service('api::operation.operation');
        const result = await operationService.sendChatMessage(clientId, message.trim(), conversationId);

        return ctx.send(result);
      } catch (error) {
        console.error('Error in sendChatMessage:', error);
        return ctx.internalServerError(error.message || 'Erro interno do servidor');
      }
    },
    async getChatHistory(ctx) {
      try {
        // Buscar o client associado ao user
        const user = ctx.state.user;
        const client = await strapi.entityService.findMany('api::client.client', {
          filters: {
            user: {
              id: user.id
            }
          }
        });
        
        const clientId = client?.[0]?.id;
        const { conversationId } = ctx.params;

        if (!clientId) {
          return ctx.badRequest('Cliente não autenticado');
        }

        const operationService = strapi.service('api::operation.operation');
        const result = await operationService.getConversationHistory(clientId, conversationId ? parseInt(conversationId) : undefined);

        return ctx.send(result);
      } catch (error) {
        console.error('Error in getChatHistory:', error);
        return ctx.internalServerError(error.message || 'Erro interno do servidor');
      }
    },
    /* Database Cleanup */
    async cleanupDatabase(ctx) {
      const cleanupService = new DatabaseCleanupService();
      return cleanupService.cleanupDatabase(ctx);
    },
    async getDataSummary(ctx) {
      const cleanupService = new DatabaseCleanupService();
      return cleanupService.getDataSummary(ctx);
    },
  })
);
