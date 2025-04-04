const utils = require("@strapi/utils");
const { ApplicationError } = require("@strapi/utils").errors;

class UserService {
  async getUser(ctx) {
    const { userDocumentId } = ctx.request.params;
    if (!userDocumentId) {
      throw new ApplicationError("ID nao localizado.");
    }

    const user = await strapi
      .documents("plugin::users-permissions.user")
      .findOne({
        documentId: userDocumentId,
        populate: {
          client: {
            populate: {
              addresses: {},
              cards: {},
            },
          },
        },
      });

    if (!user) {
      throw new ApplicationError("Cliente nao encontrado");
    }
    return user;
  }

  async blockUser(ctx) {
    const { userDocumentId } = ctx.request.params;
    if (!userDocumentId) {
      throw new ApplicationError("ID nao localizado.");
    }

    let blockedStatus = await strapi
      .documents("plugin::users-permissions.user")
      .findOne({
        documentId: userDocumentId,
        fields: ["blocked"],
      });
    if (!blockedStatus) {
      throw new ApplicationError("Cliente nao encontrado");
    }

    return await strapi.documents("plugin::users-permissions.user").update({
      documentId: userDocumentId,
      data: {
        blocked: !blockedStatus.blocked,
      },
    });
  }
  async deleteUser(ctx) {
    try {
      const { userDocumentId } = ctx.request.params;
      if (!userDocumentId) {
        throw new ApplicationError("ID nao localizado.");
      }
      const user = await strapi
        .documents("plugin::users-permissions.user")
        .findOne({
          documentId: userDocumentId,
          populate: {
            client: {
              populate: {
                addresses: {},
                cards: {},
              },
            },
          },
        });
      if (!user) {
        throw new ApplicationError("Cliente nao encontrado");
      }

      await user.client.addresses.forEach(async (address) => {
        await strapi.documents("api::address.address").delete({
          documentId: address.documentId,
        });
      });

      await user.client.cards.forEach(async (card) => {
        await strapi.documents("api::card.card").delete({
          documentId: card.documentId,
        });
      });

      await strapi.documents("api::client.client").delete({
        documentId: user.client.documentId,
      });

      await strapi.documents("plugin::users-permissions.user").delete({
        documentId: userDocumentId,
      });
      return user;
    } catch (error) {
      if (error instanceof ApplicationError) {
        throw new ApplicationError(error.message);
      }
      console.error(error);
      throw new ApplicationError("Ocorreu um erro, tente novamente");
    }
  }

  async changePassword(ctx) {
    try {
      const { userDocumentId } = ctx.request.params;
      const { password } = ctx.request.body;
      if (!userDocumentId) {
        throw new ApplicationError("ID nao localizado.");
      }
      return await strapi.documents("plugin::users-permissions.user").update({
        documentId: userDocumentId,
        data: {
          password,
        },
      });
    } catch (error) {
      if (error instanceof ApplicationError) {
        throw new ApplicationError(error.message);
      }
      console.error(error);
      throw new ApplicationError("Ocorreu um erro, tente novamente");
    }
  }
}
export { UserService };
