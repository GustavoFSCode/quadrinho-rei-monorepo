const utils = require('@strapi/utils');
const { ApplicationError } = require('@strapi/utils').errors;

export class ProductService {

    public async getProductsMaster(ctx) {
        const {
            page,
            pageSize
        } = ctx.request.query;

        try {
            const products = await strapi.documents('api::product.product').findMany({
                page: page,
                pageSize: pageSize
            })
            return products;
        } catch (e) {
            console.log(`Erro: ${e}`)
            throw new ApplicationError("Erro ao encontrar produtos");
        }
    }

    public async getProductsUser(ctx) {
        const {
            page,
            pageSize
        } = ctx.request.query;

        try {
            const products = await strapi.documents('api::product.product').findMany({
                filters: {
                    active: true
                },
                page: page,
                pageSize: pageSize
            })
            return products;
        } catch (e) {
            console.log(`Erro: ${e}`)
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
                    publishedAt: new Date()
                }
            })

            return {
                message: "Produto criado com sucesso!",
                data: information
            }

        } catch (e) {
            console.log(`Error: ${e}`)
            throw new ApplicationError("Erro ao criar produto")
        }
    }

    public async editProduct(ctx) {
        const body = ctx.request.body;
        const params = ctx.params;


        const product = await strapi.documents('api::product.product').findOne({
            documentId: params?.documentId
        })

        if (!params?.documentId || !product) throw new ApplicationError("Erro ao encontrar o produto");

        try {
            const information = await strapi.documents('api::product.product').update({
                documentId: params.documentId,
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
                }
            })

            return {
                message: "Produto editado com sucesso!",
                data: information
            }
        } catch (e) {
            console.log(`Error: ${e}`)
            throw new ApplicationError("Erro ao editar produto");
        }
    }

    public async removeProduct(ctx) {
        const params = ctx.params;

        //Remover relações


        //Remover produto
        
        try{
            await strapi.documents('api::product.product').delete({
                documentId: params.documentId
            })
            
            return {
                message: "Produto removido com sucesso!"
            }
        }catch(e){
            console.log(`Erro: ${e}`)
            throw new ApplicationError("Erro ao remover produto")
        }

    }

}