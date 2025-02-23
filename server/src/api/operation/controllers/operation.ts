/**
 * operation controller
 */

import { factories } from '@strapi/strapi'
import { clientService } from '../services/clientService';
import { UserService } from '../services/userService';
import { cardService } from '../services/cardService';

export default factories.createCoreController('api::operation.operation', ({ strapi }) => ({
    async getClient(ctx){
        const sales = new clientService();
        return sales.getClient(ctx.request.query.id);
    },
    async createClient(ctx){
        const sales = new clientService();
        return sales.createClient(ctx.request.body);
    },
    async editClient(ctx){
        const sales = new clientService();
        return sales.editClient(ctx);
    },
    async deleteUser(ctx){
        const sales = new UserService();
        return sales.deleteUser(ctx);
    },
    async createCard(ctx){
        const sales = new cardService();
        return sales.createCard(ctx);
    },
    async deleteCard(ctx){
        const sales = new cardService();
        return sales.deleteCard(ctx);
    },
    async editCard(ctx){
        const sales = new cardService();
        return sales.editCard(ctx);
    }
 }));
