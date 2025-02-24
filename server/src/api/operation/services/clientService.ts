const utils = require('@strapi/utils');
const { ApplicationError } = require('@strapi/utils').errors;

class clientService {

    async getClient(id?: any) {

        const user = await strapi.documents('api::client.client').findMany(
            {
                filters: {
                    documentId: id ? id : {}
                },
                populate: {
                    addresses: {},
                    cards: {},
                    user: {}
                }
            }
        )
        if (!user) {
            return []
        }
        return user
    }

    async createClient(data){
        try{
            const {
                email,
                password,
                name,
                birthDate,
                gender,
                cpf,
                phone,
                typePhone,
                ranking,
                Address,
                Card,
            } = data
            
            const users = await strapi.documents('plugin::users-permissions.user').findMany({
                filters:{
                    email: email
                }
            });
            if(users.length > 0){
                throw new ApplicationError("Email já cadastrado")
            }

            let addressIsBilling = false
            let addressIsDelivery = false
            let addresses = [];

            for(const field of Address){
                const createAddress = await strapi.documents('api::address.address').create({
                    data: {
                        nameAddress: field.nameAddress,
                        TypeAddress: field.TypeAddress,
                        typeLogradouro: field.typeLogradouro,
                        nameLogradouro: field.nameLogradouro,
                        number: field.number,
                        neighborhood: field.neighborhood,
                        cep: field.cep,
                        city: field.city,
                        state: field.state,
                        country: field.country,
                        observation: field.observation,
                    }
                })
                if(field.TypeAddress === 'Cobrança'){
                    addressIsBilling = true
                }
                if(field.TypeAddress === 'Entrega'){
                    addressIsDelivery = true
                }
                addresses.push(createAddress.documentId)
            }

            if(!addressIsBilling || !addressIsDelivery){
                for(const a of addresses){
                    await strapi.documents('api::address.address').delete({
                        documentId: a
                    })
                }
                throw new ApplicationError("O cliente precisa ter um endereço de cobrança e um endereço de entrega");
            }

            
            let cards = [];

            for(const field of Card){
                const createCard = await strapi.documents('api::card.card').create({
                    data: {
                        holderName: field.holderName,
                        numberCard: field.numberCard,
                        flagCard: field.flagCard,
                        safeNumber : field.safeNumber,
                        isFavorite: field.isFavorite
                    }
                })
                cards.push(createCard.documentId)
            }
            
            const user = await strapi.documents('plugin::users-permissions.user').create({
                data: {
                    username: email.toLowerCase(),
                    email: email.toLowerCase(),
                    provider: 'local',
                    blocked: false,
                    confirmed: true,
                    password: password,
                    role: 1,
                }
            })


           const client = await strapi.documents('api::client.client').create({
                data: {
                    name,
                    birthDate,
                    gender,
                    cpf,
                    phone,
                    typePhone,
                    ranking,
                    user: user.documentId,
                    cards: cards,
                    addresses: addresses
                }
            })
            return await strapi.documents('api::client.client').findOne({
                documentId: client.documentId,
                populate: ['addresses', 'cards', 'user']
            })

        }catch(error){
            if (error instanceof ApplicationError) {
                throw new ApplicationError(error.message);
            }
            console.error(error);
            throw new ApplicationError("Ocorreu um erro, tente novamente");
        }
    }
    async editClient (ctx){
        try{
            const {clientDocumentId} = ctx.request.params;
            const {clientEdit} = ctx.request.body;
            if(!clientDocumentId){
                throw new ApplicationError("ID não localizado.");
            }
            const client = await strapi.documents('api::client.client').findOne({
                documentId: clientDocumentId,
                populate: ['addresses', 'cards', 'user']
            })

            if(!client){
                throw new ApplicationError("Cliente nao encontrado");
            }

            await strapi.documents('plugin::users-permissions.user').update({
                documentId: client.user.documentId,
                data: clientEdit.user
            })
            for(const address of clientEdit.addresses){
                await strapi.documents('api::address.address').update({
                    documentId: address.documentId,
                    data: address
                })
            }

            return await strapi.documents('api::client.client').update({
                documentId: clientDocumentId,
                data: clientEdit.client,
                populate: ['addresses', 'cards', 'user']
            })
        }catch(error){
            if (error instanceof ApplicationError) {
                throw new ApplicationError(error.message);
            }
            console.error(error);
            throw new ApplicationError("Ocorreu um erro, tente novamente");
        }
    }
   

} export {clientService}