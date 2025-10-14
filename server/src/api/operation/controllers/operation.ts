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
import { PurchaseStatusService } from "../services/purchaseStatusService";
import { FreteService } from "../services/freteService";
import { StockService } from "../services/stockService";
import { StockEntryService } from "../services/stockEntryService";
import { ProductInactivationService } from "../services/productInactivationService";
import { CouponOptimizationService } from "../services/couponOptimizationService";
import { AdvancedAnalyticsService } from "../services/advancedAnalyticsService";
import { MarginValidationService } from "../services/marginValidationService";
import { CartExpirationService } from "../services/cartExpirationService";
import { PricingCalculationService } from "../services/pricingCalculationService";
import { AdvancedCategoryService } from "../services/advancedCategoryService";
import { NotificationService } from "../services/notificationService";
import { SupplierService } from "../services/supplierService";
import { PromotionalCouponService } from "../services/promotionalCouponService";
import { PromotionalCouponManagementService } from "../services/promotionalCouponManagementService";
import { WishlistService } from "../services/wishlistService";
import { ReviewService } from "../services/reviewService";
import { StockValidationService } from "../services/stockValidationService";
import { StockNotificationService } from "../services/stockNotificationService";
import { ClientRankingService } from "../services/clientRankingService";

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
    async consolidateDuplicateProducts(ctx) {
      const cartService = new CartService();
      return cartService.consolidateDuplicateProducts(ctx);
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
    async removeCoupon(ctx) {
      console.log('[CONTROLLER] removeCoupon called');
      const purchaseService = new PurchaseService();
      return await purchaseService.removeCoupon(ctx);
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
    /* Promotional Coupons Management */
    async createPromotionalCoupon(ctx) {
      try {
        console.log('[CONTROLLER] createPromotionalCoupon called by user:', ctx.state.user?.email);
        const couponManagementService = new PromotionalCouponManagementService();
        return couponManagementService.createPromotionalCoupon(ctx);
      } catch (error) {
        console.error('[CONTROLLER] Error in createPromotionalCoupon:', error);
        throw error;
      }
    },
    async getPromotionalCoupons(ctx) {
      try {
        console.log('[CONTROLLER] getPromotionalCoupons called by user:', ctx.state.user?.email);
        const couponManagementService = new PromotionalCouponManagementService();
        return couponManagementService.getPromotionalCoupons(ctx);
      } catch (error) {
        console.error('[CONTROLLER] Error in getPromotionalCoupons:', error);
        throw error;
      }
    },
    async getCouponUsages(ctx) {
      const couponManagementService = new PromotionalCouponManagementService();
      return couponManagementService.getCouponUsages(ctx);
    },
    async toggleCouponStatus(ctx) {
      const couponManagementService = new PromotionalCouponManagementService();
      return couponManagementService.toggleCouponStatus(ctx);
    },
    async deletePromotionalCoupon(ctx) {
      const couponManagementService = new PromotionalCouponManagementService();
      return couponManagementService.deletePromotionalCoupon(ctx);
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
    /* Purchase Status Management */
    async updatePurchaseStatus(ctx) {
      const statusService = new PurchaseStatusService();
      const { purchaseId, newStatus } = ctx.request.body;
      const userId = ctx.state.user?.id;
      
      if (!purchaseId || !newStatus) {
        return ctx.badRequest('purchaseId e newStatus são obrigatórios');
      }
      
      try {
        const updatedPurchase = await statusService.updatePurchaseStatus(purchaseId, newStatus, userId);
        return ctx.send(updatedPurchase);
      } catch (error) {
        return ctx.badRequest(error.message);
      }
    },
    async getAvailableStatusTransitions(ctx) {
      const statusService = new PurchaseStatusService();
      const { currentStatus } = ctx.params;
      
      if (!currentStatus) {
        return ctx.badRequest('currentStatus é obrigatório');
      }
      
      const transitions = statusService.getAvailableTransitions(currentStatus);
      return ctx.send({ transitions });
    },
    /* Freight Calculation */
    async calcularFrete(ctx) {
      const freteService = new FreteService();
      const { produtos, enderecoEntrega } = ctx.request.body;
      
      if (!produtos || !enderecoEntrega) {
        return ctx.badRequest('produtos e enderecoEntrega são obrigatórios');
      }
      
      try {
        const frete = await freteService.calcularFrete(produtos, enderecoEntrega);
        return ctx.send(frete);
      } catch (error) {
        return ctx.badRequest(error.message);
      }
    },
    async consultarCEP(ctx) {
      const freteService = new FreteService();
      const { cep } = ctx.params;
      
      if (!cep) {
        return ctx.badRequest('CEP é obrigatório');
      }
      
      try {
        const endereco = await freteService.consultarCEP(cep);
        return ctx.send(endereco);
      } catch (error) {
        return ctx.badRequest(error.message);
      }
    },
    /* Stock Management */
    async entradaEstoque(ctx) {
      const stockService = new StockService();
      const { produtoId, quantidade, custo, fornecedor } = ctx.request.body;
      
      if (!produtoId || !quantidade || quantidade <= 0) {
        return ctx.badRequest('produtoId e quantidade (positiva) são obrigatórios');
      }
      
      try {
        const resultado = await stockService.entradaEstoque(produtoId, quantidade, custo, fornecedor);
        return ctx.send(resultado);
      } catch (error) {
        return ctx.badRequest(error.message);
      }
    },
    async validarEstoque(ctx) {
      const stockService = new StockService();
      const { cartOrders } = ctx.request.body;
      
      if (!cartOrders) {
        return ctx.badRequest('cartOrders é obrigatório');
      }
      
      try {
        const validacao = await stockService.validarEstoqueCarrinho(cartOrders);
        return ctx.send(validacao);
      } catch (error) {
        return ctx.badRequest(error.message);
      }
    },
    /* Advanced Stock Entry Management - RF0051 */
    async registerStockEntry(ctx) {
      const stockEntryService = new StockEntryService();
      const { entries } = ctx.request.body;
      const userId = ctx.state.user?.id;
      
      if (!entries || !Array.isArray(entries) || entries.length === 0) {
        return ctx.badRequest('entries deve ser um array não vazio');
      }
      
      try {
        const result = await stockEntryService.registerStockEntry(entries, userId);
        return ctx.send(result);
      } catch (error) {
        return ctx.badRequest(error.message);
      }
    },
    async quickStockEntry(ctx) {
      const stockEntryService = new StockEntryService();
      const { productId, quantity, unitCost, supplierName, notes } = ctx.request.body;
      
      if (!productId || !quantity || quantity <= 0 || unitCost < 0) {
        return ctx.badRequest('productId, quantity (positiva) e unitCost (não negativo) são obrigatórios');
      }
      
      try {
        const result = await stockEntryService.quickStockEntry(productId, quantity, unitCost, supplierName, notes);
        return ctx.send(result);
      } catch (error) {
        return ctx.badRequest(error.message);
      }
    },
    async getStockEntryHistory(ctx) {
      const stockEntryService = new StockEntryService();
      const { productId, startDate, endDate, supplierId, page, pageSize } = ctx.query;
      
      const filters = {
        productId: productId as string,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
        supplierId: supplierId as string,
        page: page ? parseInt(page as string) : 1,
        pageSize: pageSize ? parseInt(pageSize as string) : 20
      };
      
      try {
        const history = await stockEntryService.getStockEntryHistory(filters);
        return ctx.send(history);
      } catch (error) {
        return ctx.badRequest(error.message);
      }
    },
    async getStockEntryStats(ctx) {
      const stockEntryService = new StockEntryService();
      const { startDate, endDate } = ctx.query;
      
      const period = startDate && endDate ? {
        startDate: new Date(startDate as string),
        endDate: new Date(endDate as string)
      } : undefined;
      
      try {
        const stats = await stockEntryService.getStockEntryStats(period);
        return ctx.send(stats);
      } catch (error) {
        return ctx.badRequest(error.message);
      }
    },
    /* Product Inactivation Service - RF0013 */
    async runProductInactivation(ctx) {
      const inactivationService = new ProductInactivationService();
      const { 
        daysWithoutSales, 
        minPriceThreshold, 
        zeroStockOnly, 
        dryRun 
      } = ctx.request.body;
      
      const config = {
        daysWithoutSales: daysWithoutSales || 90,
        minPriceThreshold: minPriceThreshold || 10.00,
        zeroStockOnly: zeroStockOnly !== false,
        dryRun: dryRun !== false
      };
      
      try {
        const result = await inactivationService.inactivateProducts(config);
        return ctx.send(result);
      } catch (error) {
        return ctx.badRequest(error.message);
      }
    },
    async getInactivationStats(ctx) {
      const inactivationService = new ProductInactivationService();
      
      try {
        const stats = await inactivationService.getInactivationStats();
        return ctx.send(stats);
      } catch (error) {
        return ctx.badRequest(error.message);
      }
    },
    /* Coupon Optimization Service - RN0036 */
    async optimizeCoupons(ctx) {
      const optimizationService = new CouponOptimizationService();
      const { coupons, totalAmount } = ctx.request.body;
      
      if (!coupons || !Array.isArray(coupons) || coupons.length === 0) {
        return ctx.badRequest('coupons deve ser um array não vazio');
      }
      
      if (!totalAmount || totalAmount <= 0) {
        return ctx.badRequest('totalAmount deve ser maior que zero');
      }
      
      try {
        const result = await optimizationService.validateAndOptimizeCoupons(coupons, totalAmount);
        return ctx.send(result);
      } catch (error) {
        return ctx.badRequest(error.message);
      }
    },
    /* Advanced Analytics Service - RNF0043 */
    async getSalesLineChart(ctx) {
      const analyticsService = new AdvancedAnalyticsService();
      const { startDate, endDate, groupBy = 'day' } = ctx.query;
      
      if (!startDate || !endDate) {
        return ctx.badRequest('startDate e endDate são obrigatórios');
      }
      
      try {
        const result = await analyticsService.getSalesLineChartData(
          new Date(startDate as string),
          new Date(endDate as string),
          groupBy as 'day' | 'week' | 'month'
        );
        return ctx.send(result);
      } catch (error) {
        return ctx.badRequest(error.message);
      }
    },
    async getComparisonAnalytics(ctx) {
      const analyticsService = new AdvancedAnalyticsService();
      const { currentStart, currentEnd, previousStart, previousEnd } = ctx.query;
      
      if (!currentStart || !currentEnd || !previousStart || !previousEnd) {
        return ctx.badRequest('Todas as datas são obrigatórias');
      }
      
      try {
        const result = await analyticsService.getComparisonAnalytics(
          new Date(currentStart as string),
          new Date(currentEnd as string),
          new Date(previousStart as string),
          new Date(previousEnd as string)
        );
        return ctx.send(result);
      } catch (error) {
        return ctx.badRequest(error.message);
      }
    },
    async getTopProductsAnalytics(ctx) {
      const analyticsService = new AdvancedAnalyticsService();
      const { startDate, endDate, limit = 10 } = ctx.query;
      
      if (!startDate || !endDate) {
        return ctx.badRequest('startDate e endDate são obrigatórios');
      }
      
      try {
        const result = await analyticsService.getTopProductsAnalytics(
          new Date(startDate as string),
          new Date(endDate as string),
          parseInt(limit as string)
        );
        return ctx.send(result);
      } catch (error) {
        return ctx.badRequest(error.message);
      }
    },
    async getCategoryAnalytics(ctx) {
      const analyticsService = new AdvancedAnalyticsService();
      const { startDate, endDate } = ctx.query;
      
      if (!startDate || !endDate) {
        return ctx.badRequest('startDate e endDate são obrigatórios');
      }
      
      try {
        const result = await analyticsService.getCategoryAnalytics(
          new Date(startDate as string),
          new Date(endDate as string)
        );
        return ctx.send(result);
      } catch (error) {
        return ctx.badRequest(error.message);
      }
    },
    async getConversionFunnel(ctx) {
      const analyticsService = new AdvancedAnalyticsService();
      const { startDate, endDate } = ctx.query;
      
      if (!startDate || !endDate) {
        return ctx.badRequest('startDate e endDate são obrigatórios');
      }
      
      try {
        const result = await analyticsService.getConversionFunnelData(
          new Date(startDate as string),
          new Date(endDate as string)
        );
        return ctx.send(result);
      } catch (error) {
        return ctx.badRequest(error.message);
      }
    },
    /* Margin Validation Service - RN0013-RN0014 */
    async validateMargin(ctx) {
      const marginService = new MarginValidationService();
      const { costPrice, salePrice, productId } = ctx.request.body;
      const userId = ctx.state.user?.id;
      
      if (!costPrice || !salePrice) {
        return ctx.badRequest('costPrice e salePrice são obrigatórios');
      }
      
      try {
        const result = await marginService.validateMargin(costPrice, salePrice, productId, userId);
        return ctx.send(result);
      } catch (error) {
        return ctx.badRequest(error.message);
      }
    },
    async requestMarginApproval(ctx) {
      const marginService = new MarginValidationService();
      const { productId, proposedPrice, costPrice, reason } = ctx.request.body;
      const userId = ctx.state.user?.id;
      
      if (!productId || !proposedPrice || !costPrice || !reason || !userId) {
        return ctx.badRequest('Todos os campos são obrigatórios');
      }
      
      try {
        const result = await marginService.requestMarginApproval(productId, proposedPrice, costPrice, reason, userId);
        return ctx.send(result);
      } catch (error) {
        return ctx.badRequest(error.message);
      }
    },
    async processMarginApproval(ctx) {
      const marginService = new MarginValidationService();
      const { approvalId, decision, comments } = ctx.request.body;
      const userId = ctx.state.user?.id;
      
      if (!approvalId || !decision || !userId) {
        return ctx.badRequest('approvalId, decision e userId são obrigatórios');
      }
      
      try {
        const result = await marginService.processMarginApproval(approvalId, decision, userId, comments);
        return ctx.send(result);
      } catch (error) {
        return ctx.badRequest(error.message);
      }
    },
    async getPendingApprovals(ctx) {
      const marginService = new MarginValidationService();
      const userId = ctx.state.user?.id;
      
      try {
        const result = await marginService.getPendingApprovals(userId);
        return ctx.send(result);
      } catch (error) {
        return ctx.badRequest(error.message);
      }
    },
    /* Cart Expiration Service - RN0044 */
    async getClientReservations(ctx) {
      const cartService = new CartExpirationService();
      const { clientId, warningMinutes } = ctx.query;
      
      if (!clientId) {
        return ctx.badRequest('clientId é obrigatório');
      }
      
      try {
        const result = await cartService.getClientExpiringReservations(
          clientId as string,
          warningMinutes ? parseInt(warningMinutes as string) : undefined
        );
        return ctx.send(result);
      } catch (error) {
        return ctx.badRequest(error.message);
      }
    },
    async extendCartReservation(ctx) {
      const cartService = new CartExpirationService();
      const { cartOrderId, additionalMinutes, clientId } = ctx.request.body;
      
      if (!cartOrderId || !additionalMinutes || !clientId) {
        return ctx.badRequest('Todos os campos são obrigatórios');
      }
      
      try {
        const result = await cartService.extendReservation(cartOrderId, additionalMinutes, clientId);
        return ctx.send(result);
      } catch (error) {
        return ctx.badRequest(error.message);
      }
    },
    async getReservationStats(ctx) {
      const cartService = new CartExpirationService();
      
      try {
        const result = await cartService.getReservationStats();
        return ctx.send(result);
      } catch (error) {
        return ctx.badRequest(error.message);
      }
    },
    async cleanupExpiredReservations(ctx) {
      const cartService = new CartExpirationService();
      
      try {
        const result = await cartService.cleanupExpiredReservations();
        return ctx.send(result);
      } catch (error) {
        return ctx.badRequest(error.message);
      }
    },
    /* Pricing Calculation Service - RF0052 */
    async calculateSalePrice(ctx) {
      const pricingService = new PricingCalculationService();
      const { costPrice, pricingTypeId, productCategories, productId } = ctx.request.body;
      
      if (!costPrice) {
        return ctx.badRequest('costPrice é obrigatório');
      }
      
      try {
        const result = await pricingService.calculateSalePrice(costPrice, pricingTypeId, productCategories, productId);
        return ctx.send(result);
      } catch (error) {
        return ctx.badRequest(error.message);
      }
    },
    async getPricingOptions(ctx) {
      const pricingService = new PricingCalculationService();
      const { costPrice, pricingTypeId, productCategories } = ctx.request.body;
      
      if (!costPrice) {
        return ctx.badRequest('costPrice é obrigatório');
      }
      
      try {
        const result = await pricingService.calculatePricingOptions(costPrice, pricingTypeId, productCategories);
        return ctx.send(result);
      } catch (error) {
        return ctx.badRequest(error.message);
      }
    },
    async syncProductPrices(ctx) {
      const pricingService = new PricingCalculationService();
      const { categoryId, pricingTypeId } = ctx.request.body;
      
      try {
        const result = await pricingService.syncProductPrices(categoryId, pricingTypeId);
        return ctx.send(result);
      } catch (error) {
        return ctx.badRequest(error.message);
      }
    },
    /* Advanced Category Service - RN0012 */
    async getCategoryTree(ctx) {
      const categoryService = new AdvancedCategoryService();
      const { includeEmpty } = ctx.query;
      
      try {
        const result = await categoryService.getCategoryTree(includeEmpty === 'true');
        return ctx.send(result);
      } catch (error) {
        return ctx.badRequest(error.message);
      }
    },
    async getProductsByCategories(ctx) {
      const categoryService = new AdvancedCategoryService();
      const { categoryIds } = ctx.request.body;
      const filters = ctx.request.body.filters || {};
      
      if (!categoryIds || !Array.isArray(categoryIds)) {
        return ctx.badRequest('categoryIds deve ser um array');
      }
      
      try {
        const result = await categoryService.getProductsByCategories(categoryIds, filters);
        return ctx.send(result);
      } catch (error) {
        return ctx.badRequest(error.message);
      }
    },
    async createCategory(ctx) {
      const categoryService = new AdvancedCategoryService();
      const categoryData = ctx.request.body;
      
      try {
        const result = await categoryService.createCategory(categoryData);
        return ctx.send(result);
      } catch (error) {
        return ctx.badRequest(error.message);
      }
    },
    async updateCategory(ctx) {
      const categoryService = new AdvancedCategoryService();
      const { categoryId } = ctx.params;
      const updateData = ctx.request.body;
      
      if (!categoryId) {
        return ctx.badRequest('categoryId é obrigatório');
      }
      
      try {
        const result = await categoryService.updateCategory(categoryId, updateData);
        return ctx.send(result);
      } catch (error) {
        return ctx.badRequest(error.message);
      }
    },
    async deleteCategory(ctx) {
      const categoryService = new AdvancedCategoryService();
      const { categoryId } = ctx.params;
      
      if (!categoryId) {
        return ctx.badRequest('categoryId é obrigatório');
      }
      
      try {
        const result = await categoryService.deleteCategory(categoryId);
        return ctx.send(result);
      } catch (error) {
        return ctx.badRequest(error.message);
      }
    },
    async getCategoryStats(ctx) {
      const categoryService = new AdvancedCategoryService();
      
      try {
        const result = await categoryService.getCategoryStats();
        return ctx.send(result);
      } catch (error) {
        return ctx.badRequest(error.message);
      }
    },
    async getPopularCategories(ctx) {
      const categoryService = new AdvancedCategoryService();
      const { limit, startDate, endDate } = ctx.query;
      
      const period = startDate && endDate ? {
        startDate: new Date(startDate as string),
        endDate: new Date(endDate as string)
      } : undefined;
      
      try {
        const result = await categoryService.getPopularCategories(
          limit ? parseInt(limit as string) : undefined,
          period
        );
        return ctx.send(result);
      } catch (error) {
        return ctx.badRequest(error.message);
      }
    },
    async batchMoveCategoriesForProducts(ctx) {
      const categoryService = new AdvancedCategoryService();
      const { productIds, addCategoryIds, removeCategoryIds } = ctx.request.body;
      
      if (!productIds || !Array.isArray(productIds)) {
        return ctx.badRequest('productIds deve ser um array');
      }
      
      try {
        const result = await categoryService.batchMoveCategoriesForProducts(
          productIds,
          addCategoryIds,
          removeCategoryIds
        );
        return ctx.send(result);
      } catch (error) {
        return ctx.badRequest(error.message);
      }
    },
    /* Notification Service - RNF0046 */
    async sendNotification(ctx) {
      const notificationService = new NotificationService();
      const { templateKey, recipientType, recipientId, templateData, options } = ctx.request.body;
      
      if (!templateKey || !recipientType || !recipientId) {
        return ctx.badRequest('templateKey, recipientType e recipientId são obrigatórios');
      }
      
      try {
        const result = await notificationService.sendNotification(
          templateKey,
          recipientType,
          recipientId,
          templateData || {},
          options || {}
        );
        return ctx.send(result);
      } catch (error) {
        return ctx.badRequest(error.message);
      }
    },
    async markNotificationAsRead(ctx) {
      const notificationService = new NotificationService();
      const { notificationId } = ctx.params;
      const userId = ctx.state.user?.id;
      
      if (!notificationId) {
        return ctx.badRequest('notificationId é obrigatório');
      }
      
      try {
        await notificationService.markAsRead(notificationId, userId?.toString());
        return ctx.send({ success: true, message: 'Notificação marcada como lida' });
      } catch (error) {
        return ctx.badRequest(error.message);
      }
    },
    async getUserNotifications(ctx) {
      const notificationService = new NotificationService();
      const { recipientType, recipientId } = ctx.params;
      const { isRead, type, priority, limit, offset } = ctx.query;
      
      if (!recipientType || !recipientId) {
        return ctx.badRequest('recipientType e recipientId são obrigatórios');
      }
      
      const filters = {
        isRead: isRead !== undefined ? isRead === 'true' : undefined,
        type: type as any,
        priority: priority as any,
        limit: limit ? parseInt(limit as string) : undefined,
        offset: offset ? parseInt(offset as string) : undefined
      };
      
      try {
        const result = await notificationService.getUserNotifications(recipientType as any, recipientId, filters);
        return ctx.send(result);
      } catch (error) {
        return ctx.badRequest(error.message);
      }
    },
    async getAllNotifications(ctx) {
      const notificationService = new NotificationService();
      const { recipientType, type, isRead, startDate, endDate, limit, offset } = ctx.query;
      
      const filters = {
        recipientType: recipientType as any,
        type: type as any,
        isRead: isRead !== undefined ? isRead === 'true' : undefined,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
        offset: offset ? parseInt(offset as string) : undefined
      };
      
      try {
        const result = await notificationService.getAllNotifications(filters);
        return ctx.send(result);
      } catch (error) {
        return ctx.badRequest(error.message);
      }
    },
    async getNotificationStats(ctx) {
      const notificationService = new NotificationService();
      const { startDate, endDate } = ctx.query;
      
      const period = startDate && endDate ? {
        startDate: new Date(startDate as string),
        endDate: new Date(endDate as string)
      } : undefined;
      
      try {
        const result = await notificationService.getNotificationStats(period);
        return ctx.send(result);
      } catch (error) {
        return ctx.badRequest(error.message);
      }
    },
    async archiveNotifications(ctx) {
      const notificationService = new NotificationService();
      const { notificationIds } = ctx.request.body;
      const userId = ctx.state.user?.id;
      
      if (!notificationIds || !Array.isArray(notificationIds)) {
        return ctx.badRequest('notificationIds deve ser um array');
      }
      
      try {
        const result = await notificationService.archiveNotifications(notificationIds, userId?.toString());
        return ctx.send(result);
      } catch (error) {
        return ctx.badRequest(error.message);
      }
    },
    async cleanupExpiredNotifications(ctx) {
      const notificationService = new NotificationService();
      const { daysOld } = ctx.query;
      
      try {
        const result = await notificationService.cleanupExpiredNotifications(
          daysOld ? parseInt(daysOld as string) : undefined
        );
        return ctx.send(result);
      } catch (error) {
        return ctx.badRequest(error.message);
      }
    },
    /* Supplier Service - RNF0013 */
    async createSupplier(ctx) {
      const supplierService = new SupplierService();
      const supplierData = ctx.request.body;
      
      try {
        const result = await supplierService.createSupplier(supplierData);
        return ctx.send(result);
      } catch (error) {
        return ctx.badRequest(error.message);
      }
    },
    async updateSupplier(ctx) {
      const supplierService = new SupplierService();
      const { supplierId } = ctx.params;
      const updateData = ctx.request.body;
      
      if (!supplierId) {
        return ctx.badRequest('supplierId é obrigatório');
      }
      
      try {
        const result = await supplierService.updateSupplier(supplierId, updateData);
        return ctx.send(result);
      } catch (error) {
        return ctx.badRequest(error.message);
      }
    },
    async getSupplierById(ctx) {
      const supplierService = new SupplierService();
      const { supplierId } = ctx.params;
      
      if (!supplierId) {
        return ctx.badRequest('supplierId é obrigatório');
      }
      
      try {
        const result = await supplierService.getSupplierById(supplierId);
        if (!result) {
          return ctx.notFound('Fornecedor não encontrado');
        }
        return ctx.send(result);
      } catch (error) {
        return ctx.badRequest(error.message);
      }
    },
    async getAllSuppliers(ctx) {
      const supplierService = new SupplierService();
      const { 
        isActive, isPreferred, category, minRating, search, 
        sortBy, sortOrder, limit, offset 
      } = ctx.query;
      
      const filters = {
        isActive: isActive !== undefined ? isActive === 'true' : undefined,
        isPreferred: isPreferred !== undefined ? isPreferred === 'true' : undefined,
        category: category as string,
        minRating: minRating ? parseFloat(minRating as string) : undefined,
        search: search as string,
        sortBy: sortBy as any,
        sortOrder: sortOrder as any,
        limit: limit ? parseInt(limit as string) : undefined,
        offset: offset ? parseInt(offset as string) : undefined
      };
      
      try {
        const result = await supplierService.getAllSuppliers(filters);
        return ctx.send(result);
      } catch (error) {
        return ctx.badRequest(error.message);
      }
    },
    async evaluateSupplierPerformance(ctx) {
      const supplierService = new SupplierService();
      const { supplierId } = ctx.params;
      const { startDate, endDate } = ctx.query;
      
      if (!supplierId) {
        return ctx.badRequest('supplierId é obrigatório');
      }
      
      const period = startDate && endDate ? {
        startDate: new Date(startDate as string),
        endDate: new Date(endDate as string)
      } : undefined;
      
      try {
        const result = await supplierService.evaluateSupplierPerformance(supplierId, period);
        return ctx.send(result);
      } catch (error) {
        return ctx.badRequest(error.message);
      }
    },
    async getSupplierComparison(ctx) {
      const supplierService = new SupplierService();
      const { supplierIds, metrics } = ctx.request.body;
      
      if (!supplierIds || !Array.isArray(supplierIds)) {
        return ctx.badRequest('supplierIds deve ser um array');
      }
      
      try {
        const result = await supplierService.getSupplierComparison(supplierIds, metrics);
        return ctx.send(result);
      } catch (error) {
        return ctx.badRequest(error.message);
      }
    },
    async createPurchaseOrder(ctx) {
      const supplierService = new SupplierService();
      const orderData = ctx.request.body;
      
      try {
        const result = await supplierService.createPurchaseOrder(orderData);
        return ctx.send(result);
      } catch (error) {
        return ctx.badRequest(error.message);
      }
    },
    async updatePurchaseOrderStatus(ctx) {
      const supplierService = new SupplierService();
      const { orderId } = ctx.params;
      const { status, notes } = ctx.request.body;
      
      if (!orderId || !status) {
        return ctx.badRequest('orderId e status são obrigatórios');
      }
      
      try {
        const result = await supplierService.updatePurchaseOrderStatus(orderId, status, notes);
        return ctx.send(result);
      } catch (error) {
        return ctx.badRequest(error.message);
      }
    },
    async getSupplierStats(ctx) {
      const supplierService = new SupplierService();
      
      try {
        const result = await supplierService.getSupplierStats();
        return ctx.send(result);
      } catch (error) {
        return ctx.badRequest(error.message);
      }
    },
    /* Wishlist Service - UX Improvement */
    async addToWishlist(ctx) {
      const wishlistService = new WishlistService();
      const { clientId, productId, notifications } = ctx.request.body;
      
      if (!clientId || !productId) {
        return ctx.badRequest('clientId e productId são obrigatórios');
      }
      
      try {
        const result = await wishlistService.addToWishlist(clientId, productId, notifications);
        return ctx.send(result);
      } catch (error) {
        return ctx.badRequest(error.message);
      }
    },
    async removeFromWishlist(ctx) {
      const wishlistService = new WishlistService();
      const { clientId, productId } = ctx.request.body;
      
      if (!clientId || !productId) {
        return ctx.badRequest('clientId e productId são obrigatórios');
      }
      
      try {
        await wishlistService.removeFromWishlist(clientId, productId);
        return ctx.send({ success: true, message: 'Item removido da wishlist' });
      } catch (error) {
        return ctx.badRequest(error.message);
      }
    },
    async getClientWishlist(ctx) {
      const wishlistService = new WishlistService();
      const { clientId } = ctx.params;
      
      if (!clientId) {
        return ctx.badRequest('clientId é obrigatório');
      }
      
      try {
        const result = await wishlistService.getClientWishlist(clientId);
        return ctx.send({ success: true, data: result });
      } catch (error) {
        return ctx.badRequest(error.message);
      }
    },
    async checkWishlistAvailability(ctx) {
      const wishlistService = new WishlistService();
      const { clientId } = ctx.params;
      
      if (!clientId) {
        return ctx.badRequest('clientId é obrigatório');
      }
      
      try {
        const result = await wishlistService.checkWishlistAvailability(clientId);
        return ctx.send(result);
      } catch (error) {
        return ctx.badRequest(error.message);
      }
    },
    /* Review Service - UX Improvement */
    async createProductReview(ctx) {
      const reviewService = new ReviewService();
      const reviewData = ctx.request.body;
      
      try {
        const result = await reviewService.createReview(reviewData);
        return ctx.send(result);
      } catch (error) {
        return ctx.badRequest(error.message);
      }
    },
    async getProductReviews(ctx) {
      const reviewService = new ReviewService();
      const { productId } = ctx.params;
      const { status, minRating, verifiedOnly, sortBy, limit, offset } = ctx.query;
      
      if (!productId) {
        return ctx.badRequest('productId é obrigatório');
      }
      
      const filters = {
        status: status as any,
        minRating: minRating ? parseInt(minRating as string) : undefined,
        verifiedOnly: verifiedOnly === 'true',
        sortBy: sortBy as any,
        limit: limit ? parseInt(limit as string) : undefined,
        offset: offset ? parseInt(offset as string) : undefined
      };
      
      try {
        const result = await reviewService.getProductReviews(productId, filters);
        return ctx.send(result);
      } catch (error) {
        return ctx.badRequest(error.message);
      }
    },
    async moderateReview(ctx) {
      const reviewService = new ReviewService();
      const { reviewId } = ctx.params;
      const { action, reason } = ctx.request.body;
      const moderatorId = ctx.state.user?.id;
      
      if (!reviewId || !action || !moderatorId) {
        return ctx.badRequest('reviewId, action e moderatorId são obrigatórios');
      }
      
      try {
        const result = await reviewService.moderateReview(reviewId, action, moderatorId.toString(), reason);
        return ctx.send(result);
      } catch (error) {
        return ctx.badRequest(error.message);
      }
    },
    async markReviewHelpful(ctx) {
      const reviewService = new ReviewService();
      const { reviewId } = ctx.params;
      const { isHelpful } = ctx.request.body;
      const userId = ctx.state.user?.id;
      
      if (!reviewId || isHelpful === undefined || !userId) {
        return ctx.badRequest('reviewId, isHelpful e userId são obrigatórios');
      }
      
      try {
        await reviewService.markReviewHelpful(reviewId, isHelpful, userId.toString());
        return ctx.send({ success: true, message: 'Voto registrado com sucesso' });
      } catch (error) {
        return ctx.badRequest(error.message);
      }
    },
    async getReviewsStats(ctx) {
      const reviewService = new ReviewService();
      
      try {
        const result = await reviewService.getReviewsStats();
        return ctx.send(result);
      } catch (error) {
        return ctx.badRequest(error.message);
      }
    },

    /* Stock Validation Service - RN0028 */
    async validateStockOperation(ctx) {
      const stockValidationService = new StockValidationService();
      const { type, purchaseId, productId, quantity, reason } = ctx.request.body;
      
      if (!type || !productId || !quantity) {
        return ctx.badRequest('type, productId e quantity são obrigatórios');
      }
      
      try {
        const result = await stockValidationService.validateStockOperation({
          type,
          purchaseId,
          productId,
          quantity,
          reason: reason || 'Validação via API'
        });
        return ctx.send(result);
      } catch (error) {
        return ctx.badRequest(error.message);
      }
    },
    async validateStockByPurchase(ctx) {
      const stockValidationService = new StockValidationService();
      const { purchaseId } = ctx.params;
      const { operation } = ctx.request.body;
      
      if (!purchaseId || !operation) {
        return ctx.badRequest('purchaseId e operation são obrigatórios');
      }
      
      try {
        const result = await stockValidationService.validateStockOperationByPurchaseStatus(purchaseId, operation);
        return ctx.send(result);
      } catch (error) {
        return ctx.badRequest(error.message);
      }
    },
    async validateProductStock(ctx) {
      const stockValidationService = new StockValidationService();
      const { productId } = ctx.params;
      const { quantity, operation } = ctx.request.body;
      
      if (!productId || !quantity || !operation) {
        return ctx.badRequest('productId, quantity e operation são obrigatórios');
      }
      
      try {
        const result = await stockValidationService.validateProductStock(productId, quantity, operation);
        return ctx.send(result);
      } catch (error) {
        return ctx.badRequest(error.message);
      }
    },
    async getProductValidationHistory(ctx) {
      const stockValidationService = new StockValidationService();
      const { productId } = ctx.params;
      const { limit } = ctx.request.query;
      
      if (!productId) {
        return ctx.badRequest('productId é obrigatório');
      }
      
      try {
        const result = await stockValidationService.getProductValidationHistory(productId as string, limit ? parseInt(limit as string) : 10);
        return ctx.send(result);
      } catch (error) {
        return ctx.badRequest(error.message);
      }
    },
    async getValidationStats(ctx) {
      const stockValidationService = new StockValidationService();
      
      try {
        const result = await stockValidationService.getValidationStats();
        return ctx.send(result);
      } catch (error) {
        return ctx.badRequest(error.message);
      }
    },

    /* Stock Notification Service - RN0031-RN0032 */
    async validateCartStock(ctx) {
      const cartService = new CartService();
      
      try {
        const result = await cartService.validateCartStock(ctx);
        return ctx.send(result);
      } catch (error) {
        return ctx.badRequest(error.message);
      }
    },
    async validateCartProductStock(ctx) {
      const stockNotificationService = new StockNotificationService();
      const { productId, quantity } = ctx.request.body;
      const clientId = ctx.state.user?.client?.documentId;
      
      if (!productId || !quantity || !clientId) {
        return ctx.badRequest('productId, quantity e clientId são obrigatórios');
      }
      
      try {
        const result = await stockNotificationService.validateCartProductStock(productId, quantity, clientId);
        return ctx.send(result);
      } catch (error) {
        return ctx.badRequest(error.message);
      }
    },
    async getCartValidationStats(ctx) {
      const stockNotificationService = new StockNotificationService();
      const { clientId, days } = ctx.request.query;
      
      try {
        const result = await stockNotificationService.getCartValidationStats(
          clientId as string, 
          days ? parseInt(days as string) : 30
        );
        return ctx.send(result);
      } catch (error) {
        return ctx.badRequest(error.message);
      }
    },
    async updateStockThresholds(ctx) {
      const stockNotificationService = new StockNotificationService();
      const { low, critical, outOfStock } = ctx.request.body;
      
      try {
        const result = await stockNotificationService.updateStockThresholds({
          low,
          critical, 
          outOfStock
        });
        return ctx.send({ success: true, thresholds: result });
      } catch (error) {
        return ctx.badRequest(error.message);
      }
    },

    /* Client Ranking Service - RN0027 */
    async calculateClientRanking(ctx) {
      const rankingService = new ClientRankingService();
      const { clientId } = ctx.params;
      
      if (!clientId) {
        return ctx.badRequest('clientId é obrigatório');
      }
      
      try {
        const result = await rankingService.calculateClientRanking(clientId);
        return ctx.send(result);
      } catch (error) {
        return ctx.badRequest(error.message);
      }
    },
    async recalculateAllClientRankings(ctx) {
      const rankingService = new ClientRankingService();
      
      try {
        const result = await rankingService.recalculateAllClientRankings();
        return ctx.send(result);
      } catch (error) {
        return ctx.badRequest(error.message);
      }
    },
    async getRankingStats(ctx) {
      const rankingService = new ClientRankingService();
      
      try {
        const result = await rankingService.getRankingStats();
        return ctx.send(result);
      } catch (error) {
        return ctx.badRequest(error.message);
      }
    },
    async getClientBenefits(ctx) {
      const rankingService = new ClientRankingService();
      const { clientId } = ctx.params;
      
      if (!clientId) {
        return ctx.badRequest('clientId é obrigatório');
      }
      
      try {
        const result = await rankingService.getClientBenefits(clientId);
        return ctx.send(result);
      } catch (error) {
        return ctx.badRequest(error.message);
      }
    },
    async updateRankingConfig(ctx) {
      const rankingService = new ClientRankingService();
      const configUpdate = ctx.request.body;
      
      try {
        const result = await rankingService.updateRankingConfig(configUpdate);
        return ctx.send({ success: true, config: result });
      } catch (error) {
        return ctx.badRequest(error.message);
      }
    },
  })
);
