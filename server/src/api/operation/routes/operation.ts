/**
 * operation router
 */

import { factories } from "@strapi/strapi";
import { measureMemory } from "vm";

export default factories.createCoreRouter("api::operation.operation");

module.exports = {
  routes: [
    {
      method: "GET",
      path: "/getClient",
      handler: "operation.getClient",
    },
    {
      method: "POST",
      path: "/createClient",
      handler: "operation.createClient",
    },
    {
      method: "PUT",
      path: "/editClient/:clientDocumentId",
      handler: "operation.editClient",
    },
    {
      method: "PUT",
      path: "/blockUser/:userDocumentId",
      handler: "operation.blockUser",
    },
    {
      method: "DELETE",
      path: "/deleteUser/:userDocumentId",
      handler: "operation.deleteUser",
    },
    {
      method: "POST",
      path: "/createCard/:clientDocumentId",
      handler: "operation.createCard",
    },
    {
      method: "DELETE",
      path: "/deleteCard/:cardDocumentId",
      handler: "operation.deleteCard",
    },
    {
      method: "PUT",
      path: "/editCard/:cardDocumentId",
      handler: "operation.editCard",
    },
    {
      method: "POST",
      path: "/createAddress/:clientDocumentId",
      handler: "operation.createAddress",
    },
    {
      method: "PUT",
      path: "/editAddress/:addressDocumentId",
      handler: "operation.editAddress",
    },
    {
      method: "DELETE",
      path: "/deleteAddress/:addressDocumentId",
      handler: "operation.deleteAddress",
    },
    {
      method: "PUT",
      path: "/changePassword/:userDocumentId",
      handler: "operation.changePassword",
    },
    {
      method: "GET",
      path: "/getUser/:userDocumentId",
      handler: "operation.getUser",
    },
    {
      method: "POST",
      path: "/createProduct",
      handler: "operation.createProduct",
    },
    {
      method: "GET",
      path: "/getProductsMaster",
      handler: "operation.getProductsMaster",
    },
    {
      method: "GET",
      path: "/getProductsUser",
      handler: "operation.getProductsUser",
    },
    {
      method: "PUT",
      path: "/editProduct/:documentId",
      handler: "operation.editProduct",
    },
    {
      method: "DELETE",
      path: "/removeProduct/:documentId",
      handler: "operation.removeProduct",
    },
    /* Carrinho */
    {
      method: "POST",
      path: "/createOrder",
      handler: "operation.createOrder",
    },
    {
      method: "PUT",
      path: "/updateQuantityOrder",
      handler: "operation.updateQuantityOrder",
    },
    {
      method: "GET",
      path: "/getOrders",
      handler: "operation.getOrders",
    },
    {
      method: "DELETE",
      path: "/removeAllOrders",
      handler: "operation.removeAllOrders",
    },
    {
      method: "DELETE",
      path: "/removeOrder/:orderId",
      handler: "operation.removeOrder",
    },

    /* Purchases */
    {
      method: "GET",
      path: "/getPurchase",
      handler: "operation.getPurchase",
    },
    {
      method: "POST",
      path: "/createUpdatePurchase",
      handler: "operation.createUpdatePurchase",
    },
    {
      method: "POST",
      path: "/insertCouponPurchase",
      handler: "operation.insertCouponPurchase",
    },
    {
      method: "POST",
      path: "/insertCards",
      handler: "operation.insertCards",
    },
    {
      method: "POST",
      path: "/insertAddresses",
      handler: "operation.insertAddresses",
    },
    {
      method: "POST",
      path: "/endPurchase",
      handler: "operation.endPurchase",
    },
    /* Sales */
    {
      method: "GET",
      path: "/getSales",
      handler: "operation.getSales",
    },
    {
      method: "GET",
      path: "/getSalesStatus",
      handler: "operation.getSalesStatus",
    },
    {
      method: "PUT",
      path: "/editSalesStatus/:saleId",
      handler: "operation.editSalesStatus",
    },
    /* My purchases */
    {
      method: "GET",
      path: "/getMyPurchases",
      handler: "operation.getMyPurchases",
    },
    {
      method: "GET",
      path: "/getMyTrades",
      handler: "operation.getMyTrades",
    },
  ],
};
