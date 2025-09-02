/**
 * Service de Categorização Avançada - RN0012
 * Implementa sistema robusto de múltiplas categorias por produto
 */

const utils = require('@strapi/utils');
const { ApplicationError } = utils.errors;

export interface CategoryTree {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parentId?: string;
  level: number;
  children: CategoryTree[];
  productCount: number;
  isActive: boolean;
  displayOrder: number;
  metaKeywords?: string;
  metaDescription?: string;
}

export interface CategoryStats {
  totalCategories: number;
  activeCategories: number;
  categoriesWithProducts: number;
  averageProductsPerCategory: number;
  topCategories: Array<{
    categoryId: string;
    name: string;
    productCount: number;
    revenue?: number;
  }>;
}

export class AdvancedCategoryService {

  /**
   * RN0012 - Obter árvore completa de categorias
   */
  public async getCategoryTree(includeEmpty: boolean = false): Promise<CategoryTree[]> {
    console.log('[CATEGORY] Gerando árvore de categorias...');

    try {
      // Buscar todas as categorias com contagem de produtos
      const categories = await strapi.entityService.findMany('api::product-category.product-category', {
        populate: {
          products: {
            filters: { active: true },
            fields: ['id']
          }
        }
      });

      // Construir árvore hierárquica
      const categoryTree: CategoryTree[] = [];

      for (const category of categories) {
        const categoryData = category as any;
        const productCount = categoryData.products?.length || 0;
        
        // Filtrar categorias vazias se necessário
        if (!includeEmpty && productCount === 0) {
          continue;
        }

        const categoryNode: CategoryTree = {
          id: category.documentId,
          name: category.name || '',
          slug: this.generateSlug(category.name || ''),
          description: categoryData.description,
          level: 1, // Por enquanto flat, pode expandir para hierárquica
          children: [],
          productCount,
          isActive: true,
          displayOrder: categoryData.displayOrder || 0,
          metaKeywords: categoryData.metaKeywords,
          metaDescription: categoryData.metaDescription
        };

        categoryTree.push(categoryNode);
      }

      // Ordenar por displayOrder e nome
      categoryTree.sort((a, b) => {
        if (a.displayOrder !== b.displayOrder) {
          return a.displayOrder - b.displayOrder;
        }
        return a.name.localeCompare(b.name);
      });

      console.log(`[CATEGORY] Árvore gerada com ${categoryTree.length} categorias`);
      return categoryTree;

    } catch (error) {
      console.error('[CATEGORY] Erro ao gerar árvore:', error);
      throw error;
    }
  }

  /**
   * Buscar produtos por múltiplas categorias com filtros avançados
   */
  public async getProductsByCategories(
    categoryIds: string[],
    filters: {
      priceMin?: number;
      priceMax?: number;
      inStock?: boolean;
      author?: string;
      publisher?: string;
      year?: number;
      sortBy?: 'name' | 'price' | 'popularity' | 'newest';
      sortOrder?: 'asc' | 'desc';
      page?: number;
      pageSize?: number;
    } = {}
  ) {
    console.log(`[CATEGORY] Buscando produtos nas categorias: ${categoryIds.join(', ')}`);

    try {
      const {
        priceMin,
        priceMax,
        inStock = true,
        author,
        publisher,
        year,
        sortBy = 'name',
        sortOrder = 'asc',
        page = 1,
        pageSize = 20
      } = filters;

      // Construir filtros dinâmicos
      const productFilters: any = {
        active: true,
        productCategories: {
          $in: categoryIds
        }
      };

      if (priceMin) productFilters.priceSell = { $gte: priceMin };
      if (priceMax) {
        if (productFilters.priceSell) {
          productFilters.priceSell.$lte = priceMax;
        } else {
          productFilters.priceSell = { $lte: priceMax };
        }
      }

      if (inStock) productFilters.stock = { $gt: 0 };
      if (author) productFilters.author = { $containsi: author };
      if (publisher) productFilters.publisher = { $containsi: publisher };
      if (year) productFilters.year = year;

      // Definir ordenação
      let sort: any[];
      switch (sortBy) {
        case 'price':
          sort = [`priceSell:${sortOrder}`];
          break;
        case 'newest':
          sort = ['createdAt:desc'];
          break;
        case 'popularity':
          // Por enquanto, ordenar por estoque (produtos mais vendidos têm menos estoque)
          sort = ['stock:asc'];
          break;
        default:
          sort = [`title:${sortOrder}`];
      }

      const products = await strapi.entityService.findMany('api::product.product', {
        filters: productFilters,
        populate: {
          productCategories: {
            fields: ['name']
          }
        },
        sort: sort,
        start: (page - 1) * pageSize,
        limit: pageSize
      });

      const totalCount = await strapi.entityService.count('api::product.product', {
        filters: productFilters
      });

      return {
        success: true,
        data: products,
        pagination: {
          page,
          pageSize,
          total: totalCount,
          pageCount: Math.ceil(totalCount / pageSize)
        }
      };

    } catch (error) {
      console.error('[CATEGORY] Erro na busca por categorias:', error);
      throw error;
    }
  }

  /**
   * Criar categoria com validações
   */
  public async createCategory(categoryData: {
    name: string;
    description?: string;
    parentId?: string;
    displayOrder?: number;
    metaKeywords?: string;
    metaDescription?: string;
  }): Promise<CategoryTree> {
    
    const { name, description, parentId, displayOrder, metaKeywords, metaDescription } = categoryData;

    if (!name || name.trim().length === 0) {
      throw new ApplicationError('Nome da categoria é obrigatório');
    }

    try {
      // Verificar se categoria já existe
      const existingCategories = await strapi.entityService.findMany('api::product-category.product-category', {
        filters: {
          name: { $eqi: name.trim() }
        }
      });

      if (existingCategories.length > 0) {
        throw new ApplicationError('Categoria com este nome já existe');
      }

      // Criar categoria
      const category = await strapi.entityService.create('api::product-category.product-category', {
        data: {
          name: name.trim(),
          description: description?.trim(),
          displayOrder: displayOrder || 0,
          metaKeywords: metaKeywords?.trim(),
          metaDescription: metaDescription?.trim()
        }
      });

      const categoryData = category as any;
      console.log(`[CATEGORY] Categoria criada: ${category.name} (ID: ${category.documentId})`);

      return {
        id: category.documentId,
        name: category.name || '',
        slug: this.generateSlug(category.name || ''),
        description: categoryData.description,
        level: 1,
        children: [],
        productCount: 0,
        isActive: true,
        displayOrder: categoryData.displayOrder || 0,
        metaKeywords: categoryData.metaKeywords,
        metaDescription: categoryData.metaDescription
      };

    } catch (error) {
      console.error('[CATEGORY] Erro ao criar categoria:', error);
      throw error;
    }
  }

  /**
   * Atualizar categoria
   */
  public async updateCategory(
    categoryId: string, 
    updateData: Partial<{
      name: string;
      description: string;
      displayOrder: number;
      metaKeywords: string;
      metaDescription: string;
    }>
  ) {
    if (!categoryId) {
      throw new ApplicationError('ID da categoria é obrigatório');
    }

    try {
      // Verificar se categoria existe
      const existingCategory = await strapi.entityService.findOne('api::product-category.product-category', categoryId);
      if (!existingCategory) {
        throw new ApplicationError('Categoria não encontrada');
      }

      // Se mudou o nome, verificar duplicata
      if (updateData.name && updateData.name !== existingCategory.name) {
        const duplicates = await strapi.entityService.findMany('api::product-category.product-category', {
          filters: {
            name: { $eqi: updateData.name.trim() }
          }
        });

        if (duplicates.length > 0) {
          throw new ApplicationError('Categoria com este nome já existe');
        }
      }

      const updatedCategory = await strapi.entityService.update('api::product-category.product-category', categoryId, {
        data: {
          ...updateData,
          name: updateData.name?.trim(),
          description: updateData.description?.trim(),
          metaKeywords: updateData.metaKeywords?.trim(),
          metaDescription: updateData.metaDescription?.trim()
        }
      });

      console.log(`[CATEGORY] Categoria atualizada: ${updatedCategory.name}`);
      return { success: true, data: updatedCategory };

    } catch (error) {
      console.error('[CATEGORY] Erro ao atualizar categoria:', error);
      throw error;
    }
  }

  /**
   * Remover categoria (só se não tiver produtos)
   */
  public async deleteCategory(categoryId: string) {
    if (!categoryId) {
      throw new ApplicationError('ID da categoria é obrigatório');
    }

    try {
      // Verificar se categoria existe e tem produtos
      const category = await strapi.entityService.findOne('api::product-category.product-category', categoryId, {
        populate: {
          products: {
            fields: ['id']
          }
        }
      });

      if (!category) {
        throw new ApplicationError('Categoria não encontrada');
      }

      const categoryData = category as any;
      if (categoryData.products && categoryData.products.length > 0) {
        throw new ApplicationError(
          `Não é possível excluir categoria "${category.name}" pois possui ${categoryData.products.length} produto(s) associado(s)`
        );
      }

      await strapi.entityService.delete('api::product-category.product-category', categoryId);
      
      console.log(`[CATEGORY] Categoria removida: ${category.name}`);
      return { success: true, message: 'Categoria removida com sucesso' };

    } catch (error) {
      console.error('[CATEGORY] Erro ao remover categoria:', error);
      throw error;
    }
  }

  /**
   * Obter estatísticas de categorias
   */
  public async getCategoryStats(): Promise<CategoryStats> {
    try {
      const categories = await strapi.entityService.findMany('api::product-category.product-category', {
        populate: {
          products: {
            filters: { active: true },
            fields: ['id']
          }
        }
      });

      const stats: CategoryStats = {
        totalCategories: categories.length,
        activeCategories: categories.length, // Por enquanto todas são ativas
        categoriesWithProducts: 0,
        averageProductsPerCategory: 0,
        topCategories: []
      };

      let totalProducts = 0;
      const categoryData: Array<{ categoryId: string; name: string; productCount: number }> = [];

      categories.forEach(category => {
        const categoryData = category as any;
        const productCount = categoryData.products?.length || 0;
        totalProducts += productCount;

        if (productCount > 0) {
          stats.categoriesWithProducts++;
        }

        categoryData.push({
          categoryId: category.documentId,
          name: category.name || '',
          productCount
        });
      });

      // Calcular média
      stats.averageProductsPerCategory = stats.totalCategories > 0 
        ? Math.round((totalProducts / stats.totalCategories) * 100) / 100 
        : 0;

      // Top 5 categorias
      stats.topCategories = categoryData
        .sort((a, b) => b.productCount - a.productCount)
        .slice(0, 5)
        .map(cat => ({
          categoryId: cat.categoryId,
          name: cat.name,
          productCount: cat.productCount
        }));

      console.log(`[CATEGORY] Estatísticas geradas - Total: ${stats.totalCategories}, Com produtos: ${stats.categoriesWithProducts}`);
      return stats;

    } catch (error) {
      console.error('[CATEGORY] Erro ao gerar estatísticas:', error);
      throw error;
    }
  }

  /**
   * Buscar categorias populares baseado em vendas
   */
  public async getPopularCategories(limit: number = 10, period?: { startDate: Date; endDate: Date }) {
    try {
      const filters: any = {
        purchaseStatus: {
          $in: ['APROVADA', 'EM_TRANSITO', 'ENTREGUE']
        }
      };

      if (period) {
        filters.date = {
          $gte: period.startDate,
          $lte: period.endDate
        };
      }

      const purchases = await strapi.entityService.findMany('api::purchase.purchase', {
        filters,
        populate: {
          cartOrders: {
            populate: {
              product: {
                populate: {
                  productCategories: {
                    fields: ['name']
                  }
                }
              }
            }
          }
        }
      });

      const categoryStats: Record<string, {
        name: string;
        totalQuantity: number;
        totalRevenue: number;
        totalOrders: number;
      }> = {};

      purchases.forEach((purchase: any) => {
        if (purchase.cartOrders) {
          purchase.cartOrders.forEach((order: any) => {
            if (order.product && order.product.productCategories) {
              order.product.productCategories.forEach((category: any) => {
                if (!categoryStats[category.documentId]) {
                  categoryStats[category.documentId] = {
                    name: category.name,
                    totalQuantity: 0,
                    totalRevenue: 0,
                    totalOrders: 0
                  };
                }
                
                categoryStats[category.documentId].totalQuantity += order.quantity;
                categoryStats[category.documentId].totalRevenue += order.totalValue;
                categoryStats[category.documentId].totalOrders += 1;
              });
            }
          });
        }
      });

      const popularCategories = Object.entries(categoryStats)
        .map(([categoryId, stats]) => ({
          categoryId,
          ...stats,
          averageOrderValue: stats.totalRevenue / stats.totalOrders,
          popularityScore: (stats.totalQuantity * 0.4) + (stats.totalRevenue * 0.6) // Score ponderado
        }))
        .sort((a, b) => b.popularityScore - a.popularityScore)
        .slice(0, limit);

      return {
        success: true,
        data: popularCategories,
        period: period || { message: 'Todos os períodos' }
      };

    } catch (error) {
      console.error('[CATEGORY] Erro ao buscar categorias populares:', error);
      throw error;
    }
  }

  /**
   * Gerar slug a partir do nome
   */
  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/[áàâãä]/g, 'a')
      .replace(/[éèêë]/g, 'e')
      .replace(/[íìîï]/g, 'i')
      .replace(/[óòôõö]/g, 'o')
      .replace(/[úùûü]/g, 'u')
      .replace(/[ç]/g, 'c')
      .replace(/[ñ]/g, 'n')
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/--+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  /**
   * Mover produtos entre categorias em lote
   */
  public async batchMoveCategoriesForProducts(
    productIds: string[],
    addCategoryIds: string[] = [],
    removeCategoryIds: string[] = []
  ) {
    if (!productIds.length) {
      throw new ApplicationError('Lista de produtos é obrigatória');
    }

    console.log(`[CATEGORY] Movendo categorias para ${productIds.length} produtos...`);

    try {
      const results = {
        processed: 0,
        updated: 0,
        errors: 0,
        errorDetails: [] as string[]
      };

      for (const productId of productIds) {
        results.processed++;

        try {
          // Buscar produto atual
          const product = await strapi.entityService.findOne('api::product.product', productId, {
            populate: {
              productCategories: {
                fields: ['id']
              }
            }
          });

          if (!product) {
            results.errors++;
            results.errorDetails.push(`Produto ${productId} não encontrado`);
            continue;
          }

          // Preparar nova lista de categorias
          const productData = product as any;
          let currentCategoryIds = productData.productCategories?.map((cat: any) => cat.documentId) || [];
          
          // Remover categorias especificadas
          if (removeCategoryIds.length > 0) {
            currentCategoryIds = currentCategoryIds.filter((id: string) => !removeCategoryIds.includes(id));
          }

          // Adicionar novas categorias
          if (addCategoryIds.length > 0) {
            addCategoryIds.forEach(id => {
              if (!currentCategoryIds.includes(id)) {
                currentCategoryIds.push(id);
              }
            });
          }

          // Atualizar produto
          await strapi.entityService.update('api::product.product', productId, {
            data: {
              productCategories: currentCategoryIds
            }
          });

          results.updated++;

        } catch (productError: any) {
          results.errors++;
          results.errorDetails.push(`Erro no produto ${productId}: ${productError.message}`);
        }
      }

      console.log(`[CATEGORY] Operação em lote concluída - Processados: ${results.processed}, Atualizados: ${results.updated}, Erros: ${results.errors}`);
      
      return results;

    } catch (error) {
      console.error('[CATEGORY] Erro na operação em lote:', error);
      throw error;
    }
  }
}