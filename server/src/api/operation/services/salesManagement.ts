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

