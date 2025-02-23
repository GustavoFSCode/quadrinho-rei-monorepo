const utils = require('@strapi/utils');
const { ApplicationError } = require('@strapi/utils').errors;

class cardService {

    async createCard(ctx){
        try{
            const {clientDocumentId} = ctx.request.params; 
            const {card} = ctx.request.body;
            if(!clientDocumentId){
                throw new ApplicationError("ID nao localizado.");
            }
            const client = await strapi.documents('api::client.client').findOne({
                documentId: clientDocumentId,
                populate: ['addresses', 'cards', 'user']
            })

            if(!client){
                throw new ApplicationError("Cliente nao encontrado");
            }

            if(card.isFavorite){

                await client.cards.forEach(async (card) => {
                    console.log("B")

                    if(!card.isFavorite || card.isFavorite === null) return

                    await strapi.documents('api::card.card').update({
                        documentId: card.documentId,
                        data: {
                            isFavorite: false
                        }
                    })
                })
            }

            return await strapi.documents('api::card.card').create({data: {
                ...card,
                publishedAt: new Date(),
                client: client
            }});
            
        }catch(error){
            if (error instanceof ApplicationError) {
                throw new ApplicationError(error.message);
            }
            console.error(error);
            throw new ApplicationError("Ocorreu um erro, tente novamente");
        }
    }
    async deleteCard(ctx){
        try{
            const {cardDocumentId} = ctx.request.params;
            if(!cardDocumentId){
                throw new ApplicationError("ID não localizado.");
            }
            const card = await strapi.documents('api::card.card').findOne({
                documentId: cardDocumentId
            })
            if(!card){
                throw new ApplicationError("Cartão não encontrado");
            }
            return await strapi.documents('api::card.card').delete({
                documentId: cardDocumentId
            });
        }catch(error){
            if (error instanceof ApplicationError) {
                throw new ApplicationError(error.message);
            }
            console.error(error);
            throw new ApplicationError("Ocorreu um erro, tente novamente");
        }
    }
    async editCard(ctx){
        try{
            const {cardDocumentId} = ctx.request.params;
            if(!cardDocumentId){
                throw new ApplicationError("ID nao localizado.");
            }
            const card = await strapi.documents('api::card.card').findOne({
                documentId: cardDocumentId,
                populate: ['client']
            })
            if(!card){
                throw new ApplicationError("Cartão nao encontrado");
            }
            if(!card.client){
                throw new ApplicationError("Cliente nao encontrado");
            }
            
            
            const cards = await strapi.documents('api::card.card').findMany({
                filters: {
                    client: {
                        documentId: card.client.documentId
                    }
                }
            })

             

            for(const card of cards){
                if(!card.isFavorite || card.isFavorite === null) continue
                await strapi.documents('api::card.card').update({
                    documentId: card.documentId,
                    data: {
                        isFavorite: false
                    }
                })
            }

            await strapi.documents('api::card.card').update({
                documentId: cardDocumentId,
                data: {
                    isFavorite: true
                }
            });

            return 'Editado com sucesso'

        }catch(error){
            if (error instanceof ApplicationError) {
                throw new ApplicationError(error.message);
            }
            console.error(error);
            throw new ApplicationError("Ocorreu um erro, tente novamente");
        }
    }
    
} export { cardService }

