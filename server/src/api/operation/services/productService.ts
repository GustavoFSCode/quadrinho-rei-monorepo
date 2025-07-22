const utils = require('@strapi/utils');
const { ApplicationError } = utils.errors;

export class ProductService {

  public async getProductsMaster(ctx) {
    const { page, pageSize } = ctx.request.query;

    try {
      const products = await strapi.documents('api::product.product').findMany({
        populate: ['precificationType', 'productCategories'],
        page: page,
        pageSize: pageSize,
      });
      return products;
    } catch (e) {
      console.error(`Erro ao buscar produtos master:`, e);
      throw new ApplicationError("Erro ao encontrar produtos");
    }
  }

  public async getProductsUser(ctx) {
    const { page, pageSize } = ctx.request.query;

    try {
      const products = await strapi.documents('api::product.product').findMany({
        filters: { active: true },
        populate: ['precificationType', 'productCategories'],
        page: page,
        pageSize: pageSize,
      });
      return products;
    } catch (e) {
      console.error(`Erro ao buscar produtos usuário:`, e);
      throw new ApplicationError("Erro ao encontrar produtos");
    }
  }

  public async createProduct(ctx) {
    const body = ctx.request.body;

    try {
      const information = await strapi.documents('api::product.product').create({
        data: {
          title: body.title,
          author: body.author,
          publisher: body.publisher,
          year: body.year,
          issue: body.issue,
          edition: body.edition,
          pageNumber: body.pageNumber,
          synopsis: body.synopsis,
          isbn: body.isbn,
          barCode: body.barCode,
          height: body.height,
          length: body.length,
          weight: body.weight,
          depth: body.depth,
          priceBuy: body.priceBuy,
          priceSell: body.priceSell,
          stock: body.stock,
          active: body.active,
          inactiveReason: body.inactiveReason,
          productCategories: [...body.productCategories],
          precificationType: body.precificationType,
          createdAt: new Date(),
          publishedAt: new Date(),
        },
        populate: ['precificationType', 'productCategories'],
      });

      return {
        message: "Produto criado com sucesso!",
        data: information,
      };
    } catch (e) {
      console.error(`Erro ao criar produto:`, e);
      throw new ApplicationError("Erro ao criar produto");
    }
  }

  public async editProduct(ctx) {
    const body = ctx.request.body;
    const { documentId } = ctx.params;

    const exists = await strapi.documents('api::product.product').findOne({
      documentId,
    });
    if (!documentId || !exists) {
      throw new ApplicationError("Erro ao encontrar o produto");
    }

    try {
      const information = await strapi.documents('api::product.product').update({
        documentId,
        data: {
          title: body.title,
          author: body.author,
          publisher: body.publisher,
          year: body.year,
          issue: body.issue,
          edition: body.edition,
          pageNumber: body.pageNumber,
          synopsis: body.synopsis,
          isbn: body.isbn,
          barCode: body.barCode,
          height: body.height,
          length: body.length,
          weight: body.weight,
          depth: body.depth,
          priceBuy: body.priceBuy,
          priceSell: body.priceSell,
          stock: body.stock,
          active: body.active,
          inactiveReason: body.inactiveReason,
          productCategories: [...body.productCategories],
          precificationType: body.precificationType,
        },
        populate: ['precificationType', 'productCategories'],
      });

      return {
        message: "Produto editado com sucesso!",
        data: information,
      };
    } catch (e) {
      console.error(`Erro ao editar produto:`, e);
      throw new ApplicationError("Erro ao editar produto");
    }
  }

  public async removeProduct(ctx) {
    const { documentId } = ctx.params;

    try {
      await strapi.documents('api::product.product').delete({
        documentId,
      });
      return {
        message: "Produto removido com sucesso!",
      };
    } catch (e) {
      console.error(`Erro ao remover produto:`, e);
      throw new ApplicationError("Erro ao remover produto");
    }
  }
}
