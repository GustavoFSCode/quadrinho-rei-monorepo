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

    public async editTradeStatus(ctx) {
        const tradeId = ctx.request.param.tradeId
        const body = ctx.request.body;

        const foundTrade = await strapi.documents('api::trade.trade').findOne({
            documentId: tradeId
        })

        if (!tradeId || !foundTrade) throw new ApplicationError("Erro ao encontrar troca");

        const status = await strapi.documents('api::trade-status.trade-status').findOne({
            documentId: body?.status
        })

        if (!body?.status || !status) throw new ApplicationError("Erro ao encontrar status de troca")

        try {
            await strapi.documents('api::trade.trade').update({
                documentId: tradeId,
                data: {
                    tradeStatus: status.documentId,
                    updatedAt: new Date(),
                }
            })
        } catch (e) {
            console.log(e);
            throw new ApplicationError("Erro ao modificar status da troca");
        }
    }

