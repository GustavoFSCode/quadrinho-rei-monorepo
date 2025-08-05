const utils = require('@strapi/utils')
const { ApplicationError } = utils.errors
export class SalesManagement {
    public async getSales(ctx) {
        const sales = await strapi.documents('api::purchase.purchase').findMany({
            populate: {
                client: {},
                purchaseSalesStatus: {},
                cartOrders: {}
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

