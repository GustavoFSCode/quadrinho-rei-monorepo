const utils = require('@strapi/utils')
const { ApplicationError } = utils.errors
export class SalesManagement {
    public async getSales(ctx) {
        const sales = await strapi.documents('api::purchase.purchase').findMany({
            populate: {
                client: {},
                purchaseSalesStatus: {},
                cartOrders: {
                    populate: {
                        product: {
                            fields: ['title']
                        }
                    }
                }
            },
            sort: "id:desc"
        })

        return {
            data: sales
        };
    }

    public async getSalesStatus(ctx) {

        try {
            const status = await strapi.documents('api::purchase-sales-status.purchase-sales-status').findMany({
                fields: ['id', 'name']
            })

            return status;
        } catch (e) {
            console.log(e);
            throw new ApplicationError("Erro ao encontrar status")
        }

    }

    public async editSalesStatus(ctx) {
        const param = ctx.params;
        const body = ctx.request.body;

        if (!param?.saleId) throw new ApplicationError("Erro ao encontrar venda");

        const sale = await strapi.documents('api::purchase.purchase').findOne({
            documentId: param.saleId,
            populate: {
                coupons: {}
            }
        })

        if (!sale) throw new ApplicationError("Erro ao encontrar venda");

        const statuses = await this.getSalesStatus(ctx);

        console.log('statuses: ', statuses)

        const foundStatus = statuses.filter((status) => status?.documentId === body?.status);

        if (!foundStatus) throw new ApplicationError("Erro ao encontrar status");

        await strapi.documents('api::purchase.purchase').update({
            documentId: sale.documentId,
            data: {
                purchaseSalesStatus: body.status
            }
        })

        if (foundStatus[0].name === "Pedido cancelado" || foundStatus[0].name === "Pedido recusado") {
            for (const coupon of sale.coupons) {
                await strapi.documents('api::coupon.coupon').update({
                    documentId: coupon.documentId,
                    data: {
                        couponStatus: "NaoUsado"
                    }
                })
            }
        }

        return "Status alterado com sucesso!";
    }
}