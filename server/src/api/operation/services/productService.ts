// src/api/product/services/ProductService.ts

const utils = require('@strapi/utils');
const { ApplicationError } = utils.errors;

export class ProductService {
  // mapeamento de markups
  private markups: Record<string, number> = {
    economy: 1.10,
    standard: 1.25,
    premium: 1.50,
  };

  public async getProductsMaster(ctx) {
    const { page, pageSize } = ctx.request.query;
    try {
      const products = await strapi.documents('api::product.product').findMany({
        populate: ['precificationType', 'productCategories'],
        page,
        pageSize,
      });
      return products;
    } catch (e) {
      console.error(`Erro ao buscar produtos master:`, e);
      throw new ApplicationError("Erro ao encontrar produtos");
    }
  }

  public async getProductsUser(ctx) {
    const { page, pageSize, filter } = ctx.request.query;
    try {
      const products = await strapi.documents('api::product.product').findMany({
        filters: { active: true },
        populate: ['precificationType', 'productCategories'],
      });
  
      if (filter) {
        const term = filter.toLowerCase();
        const result = [];
        const fields = ['title', 'author', 'publisher', 'year', 'issue', 'edition', 'synopsis', 'isbn', 'barCode'];
        const numericFields = ['pageNumber', 'priceBuy', 'priceSell', 'stock', 'height', 'length', 'weight', 'depth']; // inclui todos os campos numéricos relevantes
  
        for (const p of products) {
          // Verifica campos textuais
          for (const f of fields) {
            const val = p[f];
            if (val != null && val.toString().toLowerCase().includes(term) && !result.includes(p)) {
              result.push(p);
            }
          }
  
          // Verifica campos numéricos como string (contains)
          for (const nf of numericFields) {
            const val = p[nf];
            if (val != null && val.toString().includes(term) && !result.includes(p)) {
              result.push(p);
            }
          }
  
          // Verifica nome do tipo de precificação
          if (p.precificationType?.name.toLowerCase().includes(term) && !result.includes(p)) {
            result.push(p);
          }
  
          // Verifica nome das categorias
          for (const cat of p.productCategories) {
            if (cat.name.toLowerCase().includes(term) && !result.includes(p)) {
              result.push(p);
            }
          }
        }
  
        return result;
      }
  
      if (!page && !pageSize) {
        return products;
      }
  
      const pg = Number(page), ps = Number(pageSize);
      const start = (pg - 1) * ps;
      const end = start + ps;
      return {
        data: products.slice(start, end),
        totalCount: products.length,
        page,
        pageSize,
      };
    } catch (e) {
      console.error(`Erro ao buscar produtos usuário:`, e);
      throw new ApplicationError("Erro ao encontrar produtos");
    }
  }
  

  public async createProduct(ctx) {
    const body = ctx.request.body;
    try {
      // busca o tipo de precificação para ler o nome
      const prec = await strapi.documents('api::precification-type.precification-type').findOne({
        documentId: body.precificationType,
      });
      const pct = this.markups[(prec.name || '').toLowerCase()] || 1;
      const priceSell = parseFloat((body.priceBuy * pct).toFixed(2));

      const information = await strapi.documents('api::product.product').create({
        data: {
          title:            body.title,
          author:           body.author,
          publisher:        body.publisher,
          year:             body.year,
          issue:            body.issue,
          edition:          body.edition,
          pageNumber:       body.pageNumber,
          synopsis:         body.synopsis,
          isbn:             body.isbn,
          barCode:          body.barCode,
          height:           body.height,
          length:           body.length,
          weight:           body.weight,
          depth:            body.depth,
          priceBuy:         body.priceBuy,
          priceSell:        priceSell,
          stock:            body.stock,
          active:           body.active,
          inactiveReason:   body.inactiveReason,
          productCategories: [...body.productCategories],
          precificationType: body.precificationType,
          createdAt:        new Date(),
          publishedAt:      new Date(),
        },
        populate: ['precificationType','productCategories'],
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

    const exists = await strapi.documents('api::product.product').findOne({ documentId });
    if (!documentId || !exists) {
      throw new ApplicationError("Erro ao encontrar o produto");
    }

    try {
      const prec = await strapi.documents('api::precification-type.precification-type').findOne({
        documentId: body.precificationType,
      });
      const pct = this.markups[(prec.name || '').toLowerCase()] || 1;
      const priceSell = parseFloat((body.priceBuy * pct).toFixed(2));

      const information = await strapi.documents('api::product.product').update({
        documentId,
        data: {
          title:            body.title,
          author:           body.author,
          publisher:        body.publisher,
          year:             body.year,
          issue:            body.issue,
          edition:          body.edition,
          pageNumber:       body.pageNumber,
          synopsis:         body.synopsis,
          isbn:             body.isbn,
          barCode:          body.barCode,
          height:           body.height,
          length:           body.length,
          weight:           body.weight,
          depth:            body.depth,
          priceBuy:         body.priceBuy,
          priceSell:        priceSell,
          stock:            body.stock,
          active:           body.active,
          inactiveReason:   body.inactiveReason,
          productCategories: [...body.productCategories],
          precificationType: body.precificationType,
        },
        populate: ['precificationType','productCategories'],
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
      await strapi.documents('api::product.product').delete({ documentId });
      return { message: "Produto removido com sucesso!" };
    } catch (e) {
      console.error(`Erro ao remover produto:`, e);
      throw new ApplicationError("Erro ao remover produto");
    }
  }
}
