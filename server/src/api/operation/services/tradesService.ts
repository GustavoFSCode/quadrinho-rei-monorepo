const utils = require('@strapi/utils');
const { ApplicationError } = utils.errors;
import { StockService } from './stockService';
export class TradeService {
    public async getTrades(ctx) {
        const query = ctx.request.query;
        const page = parseInt(query.page) || 1;
        const pageSize = parseInt(query.pageSize) || 12;
        const start = (page - 1) * pageSize;

        // Primeiro, contar o total de registros
        const totalCount = await strapi.documents('api::trade.trade').count({});

        // Buscar os dados com paginação
        const trades: any = await strapi.documents('api::trade.trade').findMany({
            populate: {
                client: {
                    fields: ['name']
                },
                cartOrder: {
                    populate: {
                        purchase: {},
                        product: {
                            fields: ['title']
                        }
                    }
                },
                tradeStatus: {},
                coupon: {}
            },
            sort: 'id:desc',
            start: start,
            limit: pageSize
        });

        // Tratar trocas com clientes excluídos
        const tradesWithClientInfo = trades.map((trade: any) => ({
            ...trade,
            client: trade.client ? trade.client : {
                id: null,
                documentId: null,
                name: "Cliente excluído"
            }
        }));

        // Se foi solicitada paginação, retornar com metadados
        if (query.page || query.pageSize) {
            return {
                data: tradesWithClientInfo,
                pagination: {
                    page: page,
                    pageSize: pageSize,
                    total: totalCount,
                    pageCount: Math.ceil(totalCount / pageSize)
                }
            };
        }

        // Retornar apenas os dados se não foi solicitada paginação
        return tradesWithClientInfo;
    }

    public async getTradesStatuses(ctx) {
        const statuses = await strapi.documents('api::trade-status.trade-status').findMany()

        return statuses;
    }

    public async editTradeStatus(ctx) {
        const tradeId = ctx.params.tradeId
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

            return "Status editado com sucesso!"
        } catch (e) {
            console.log(e);
            throw new ApplicationError("Erro ao modificar status da troca");
        }
    }

    public async generateCoupon(ctx) {
        const tradeId = ctx.params.tradeId

        const coupons = await strapi.documents('api::coupon.coupon').findMany({})
        const trade = await strapi.documents('api::trade.trade').findOne({
            documentId: tradeId,
            populate: {
                cartOrder: {
                    populate: {
                        product: {
                            fields: ['title', 'stock']
                        }
                    }
                },
                coupon: {}
            }
        }) as any;

        if (!tradeId || !trade) throw new ApplicationError("Erro ao encontrar troca");

        // Verificar se já foi gerado cupom para evitar duplicação
        if (trade.coupon) {
            throw new ApplicationError("Cupom já foi gerado para esta troca");
        }

        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

        const generateCode = async () => {
            let couponCode = '';
            for (let i = 0; i < 10; i++) {
                const randomChar = characters.charAt(Math.floor(Math.random() * characters.length));
                couponCode += randomChar;
            }

            return couponCode;
        }

        var code = "";

        do {
            code = await generateCode();
        } while (coupons.some((coupon) => coupon.code === code));

        const newCoupon = await strapi.documents('api::coupon.coupon').create({
            data: {
                code: code,
                couponStatus: "NaoUsado",
                price: trade.totalValue,
                createdAt: new Date(),
                publishedAt: new Date()
            }
        })

        await strapi.documents('api::trade.trade').update({
            documentId: trade.documentId,
            data: {
                coupon: newCoupon.documentId,
                updatedAt: new Date()
            }
        })

        // RF0054 - Reentrada de estoque quando troca é confirmada (cupom gerado)
        try {
            const stockService = new StockService();
            const stockResult = await stockService.reentradaEstoquePorTroca(trade.id.toString());
            
            console.log(`[TRADE] Reentrada de estoque realizada para troca ${tradeId}:`, stockResult);
            
            return {
                data: {
                    coupon: newCoupon,
                    stockUpdate: stockResult,
                    message: "Cupom criado com sucesso e estoque atualizado!"
                }
            }
        } catch (stockError) {
            console.error(`[ERROR] Falha na reentrada de estoque para troca ${tradeId}:`, stockError);
            
            // Cupom já foi criado, mas falhou a reentrada de estoque
            // Vamos reverter o cupom ou apenas registrar o erro?
            // Por segurança, vou apenas logar o erro e continuar
            return {
                data: {
                    coupon: newCoupon,
                    stockError: stockError.message,
                    message: "Cupom criado com sucesso, mas houve erro na reentrada de estoque. Verifique manualmente."
                }
            }
        }
    }
}