const utils = require('@strapi/utils');
const { ApplicationError } = require('@strapi/utils').errors;

class AddressService {
    
    async createAddress(ctx){
        try{
            const {clientDocumentId} = ctx.request.params; 
            const {address} = ctx.request.body;
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

            return await strapi.documents('api::address.address').create({data: {
                ...address,
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

    async editAddress(ctx){
        try{
            const {addressDocumentId} = ctx.request.params;
            const {address} = ctx.request.body;
            if(!addressDocumentId){
                throw new ApplicationError("ID nao localizado.");
            }
            return await strapi.documents('api::address.address').update({
                documentId: addressDocumentId,
                data:address
            });
        }catch(error){
            if (error instanceof ApplicationError) {
                throw new ApplicationError(error.message);
            }
            console.error(error);
            throw new ApplicationError("Ocorreu um erro, tente novamente");
        }
    }
    async deleteAddress(ctx){
        try{
            const {addressDocumentId} = ctx.request.params;
            if(!addressDocumentId){
                throw new ApplicationError("ID nao localizado.");
            }
            return await strapi.documents('api::address.address').delete({
                documentId: addressDocumentId
            });
        }catch(error){
            if (error instanceof ApplicationError) {
                throw new ApplicationError(error.message);
            }
            console.error(error);
            throw new ApplicationError("Ocorreu um erro, tente novamente");
        }
    }
} export { AddressService }