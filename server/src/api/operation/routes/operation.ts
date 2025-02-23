/**
 * operation router
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreRouter('api::operation.operation');

module.exports = {
    routes: [
        {
            method: "GET",
            path: "/getClient",
            handler: "operation.getClient",
        },
        {
            method: "POST",
            path: "/createClient",
            handler: "operation.createClient",
        },
        {
            method: "PUT",
            path: "/editClient/:clientDocumentId",
            handler: "operation.editClient",
        },
        {
            method: "DELETE",
            path: "/deleteUser/:userDocumentId",
            handler: "operation.deleteUser",
        },
        {
            method: "POST",
            path: "/createCard/:clientDocumentId",
            handler: "operation.createCard",
        },
        {
            method: "DELETE",
            path: "/deleteCard/:cardDocumentId",
            handler: "operation.deleteCard",
        },
        {
            method: "PUT",
            path: "/editCard/:cardDocumentId",
            handler: "operation.editCard",
        }
    ]
};