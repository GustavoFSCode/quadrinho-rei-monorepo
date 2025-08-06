const utils = require('@strapi/utils');
const { ApplicationError } = utils.errors;
export class TradeService {
    public async getTrades(ctx) {
        const query = ctx.request.query;

        const trades = await strapi.documents('api::trade.trade').findMany({
            populate: {
                client: {},
                cartOrder: {},
                purchase: {},
                tradeStatus: {},
                coupon: {}
            },
            sort: 'id:desc'
        })

        if (query.page && query.pageSize) {
            return {
                data: {
                    trades: trades,
                    pagination: {
                        page: query.page || 1,
                        pageSize: query.pageSize || 10,
                        totalOrders: trades.length,
                        totalPages: Math.ceil(trades.length / (query.pageSize || 10)),
                    }
                }
            };
        }

        return trades;
    }

    public async getTradesStatuses(ctx) {
        const statuses = await strapi.documents('api::trade-status.trade-status').findMany()

        return statuses;
    }

