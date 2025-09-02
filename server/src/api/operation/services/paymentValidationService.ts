/**
 * Service de Validação de Pagamento - RN0033-RN0036
 * Implementa regras de negócio para cupons e cartões múltiplos
 */

const utils = require('@strapi/utils');
const { ApplicationError } = utils.errors;
import { CouponOptimizationService } from './couponOptimizationService';

export class PaymentValidationService {

    /**
     * RN0033 e RN0036 - Validar e otimizar cupons na compra
     */
    public async validateCoupons(coupons: any[], totalAmount: number) {
        if (!coupons || coupons.length === 0) {
            return { 
                valid: true, 
                errors: [], 
                selectedCoupons: [],
                totalValue: 0,
                changeAmount: 0,
                needsChange: false
            };
        }

        try {
            // Extrair IDs dos cupons
            const couponIds = coupons.map(c => c.documentId || c);
            
            // Usar serviço de otimização RN0036
            const optimizationService = new CouponOptimizationService();
            const result = await optimizationService.validateAndOptimizeCoupons(couponIds, totalAmount);

            if (!result.success) {
                return {
                    valid: false,
                    errors: ['Erro na otimização de cupons'],
                    selectedCoupons: [],
                    totalValue: 0,
                    changeAmount: 0,
                    needsChange: false
                };
            }

            const { optimization } = result;

            return {
                valid: true,
                errors: [],
                selectedCoupons: optimization.selectedCoupons,
                totalValue: optimization.totalCouponValue,
                changeAmount: optimization.changeAmount,
                needsChange: optimization.needsChange,
                optimizationReason: optimization.optimizationReason,
                unusedCoupons: optimization.unusedCoupons
            };

        } catch (error) {
            console.error('Erro na validação de cupons:', error);
            return {
                valid: false,
                errors: [error.message || 'Erro na validação de cupons'],
                selectedCoupons: [],
                totalValue: 0,
                changeAmount: 0,
                needsChange: false
            };
        }
    }

    /**
     * RN0034-RN0035 - Validar múltiplos cartões (valor mínimo R$10 por cartão)
     */
    public async validateCards(cards: any[], totalAmount: number) {
        console.log('[PAYMENT] Validando cartões:', JSON.stringify(cards, null, 2));
        console.log('[PAYMENT] Total da compra:', totalAmount);
        
        if (!cards || cards.length === 0) {
            console.log('[PAYMENT] ❌ Nenhum cartão fornecido');
            return { valid: false, errors: ['Pelo menos um cartão deve ser selecionado'] };
        }

        console.log(`[PAYMENT] ✅ ${cards.length} cartão(ões) encontrado(s)`);

        const errors = [];
        let totalCardValue = 0;

        // Verificar se cartões têm estrutura adequada
        for (let i = 0; i < cards.length; i++) {
            const card = cards[i];
            console.log(`[PAYMENT] Validando cartão ${i + 1}:`, card);
            
            // Se cartão é apenas um documentId (string), buscar dados completos
            if (typeof card === 'string') {
                const cardData = await strapi.documents('api::card.card').findOne({
                    documentId: card
                });
                
                if (!cardData) {
                    errors.push(`Cartão ${i + 1} não encontrado`);
                    continue;
                }
                
                console.log(`[PAYMENT] Cartão ${i + 1} encontrado:`, cardData.holderName);
                
                // Para cartão único, usar valor total da compra
                if (cards.length === 1) {
                    totalCardValue = totalAmount;
                    console.log(`[PAYMENT] Cartão único - valor total: R$${totalAmount.toFixed(2)}`);
                } else {
                    // Para múltiplos cartões, precisamos de valores específicos
                    // Por enquanto, vamos dividir igualmente
                    const valuePerCard = totalAmount / cards.length;
                    if (valuePerCard < 10) {
                        errors.push(`Valor por cartão (R$${valuePerCard.toFixed(2)}) é menor que R$10,00`);
                    } else {
                        totalCardValue += valuePerCard;
                        console.log(`[PAYMENT] Cartão ${i + 1} - valor: R$${valuePerCard.toFixed(2)}`);
                    }
                }
                
            } else if (typeof card === 'object') {
                // Cartão com estrutura completa (com value)
                if (!card.value || card.value <= 0) {
                    errors.push(`Cartão ${i + 1}: valor deve ser maior que zero`);
                } else if (cards.length > 1 && card.value < 10) {
                    errors.push(`Cartão ${i + 1}: valor mínimo de R$10,00 para múltiplos cartões`);
                } else {
                    totalCardValue += card.value;
                    console.log(`[PAYMENT] Cartão ${i + 1} - valor específico: R$${card.value.toFixed(2)}`);
                }

                // Verificar se cartão existe
                if (card.cardId || card.documentId) {
                    const cardData = await strapi.documents('api::card.card').findOne({
                        documentId: card.cardId || card.documentId
                    });
                    
                    if (!cardData) {
                        errors.push(`Cartão ${i + 1} não encontrado`);
                    }
                }
            }
        }

        // Verificar se soma dos cartões cobre o valor total
        if (totalCardValue < totalAmount) {
            errors.push(`Valor total dos cartões (R$${totalCardValue.toFixed(2)}) é menor que o valor da compra (R$${totalAmount.toFixed(2)})`);
        }

        return {
            valid: errors.length === 0,
            errors,
            totalValue: totalCardValue,
            needsChange: totalCardValue > totalAmount,
            changeAmount: totalCardValue > totalAmount ? totalCardValue - totalAmount : 0
        };
    }

    /**
     * RN0036 - Gerar cupom de troco quando pagamento excede valor da compra
     */
    public async generateChangeCoupon(changeAmount: number, clientId: string) {
        if (changeAmount <= 0) {
            return null;
        }

        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

        // Gerar código único
        let couponCode = 'TROCO-';
        for (let i = 0; i < 8; i++) {
            const randomChar = characters.charAt(Math.floor(Math.random() * characters.length));
            couponCode += randomChar;
        }

        // Verificar se código já existe
        const existingCoupons = await strapi.documents('api::coupon.coupon').findMany({
            filters: { code: couponCode }
        });

        if (existingCoupons.length > 0) {
            // Recursivamente tentar novo código
            return this.generateChangeCoupon(changeAmount, clientId);
        }

        // Criar cupom de troco
        const changeCoupon = await strapi.documents('api::coupon.coupon').create({
            data: {
                code: couponCode,
                couponStatus: "NaoUsado",
                price: changeAmount,
                couponType: "Troco",
                originType: "CHANGE_PAYMENT",
                client: clientId,
                expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 ano
                createdAt: new Date(),
                publishedAt: new Date()
            }
        });

        console.log(`[PAYMENT] Cupom de troco gerado - Código: ${couponCode}, Valor: R$${changeAmount.toFixed(2)}`);

        return changeCoupon;
    }

    /**
     * Validação completa de pagamento
     */
    public async validatePayment(paymentData: {
        coupons?: any[],
        cards: any[],
        totalAmount: number,
        clientId: string
    }) {
        const { coupons, cards, totalAmount, clientId } = paymentData;
        
        const errors = [];
        let finalAmount = totalAmount;
        let changeCoupon = null;

        // 1. Validar e otimizar cupons
        const couponValidation = await this.validateCoupons(coupons || [], totalAmount);
        if (!couponValidation.valid) {
            errors.push(...couponValidation.errors);
        } else {
            finalAmount -= couponValidation.totalValue;
            
            // Se cupons geram troco, gerar cupom de troca
            if (couponValidation.needsChange) {
                try {
                    changeCoupon = await this.generateChangeCoupon(couponValidation.changeAmount, clientId);
                } catch (error) {
                    console.error('Erro ao gerar cupom de troca dos cupons:', error);
                    errors.push('Erro ao gerar cupom de troca dos cupons');
                }
            }
        }

        // 2. Validar cartões
        const cardValidation = await this.validateCards(cards, finalAmount);
        if (!cardValidation.valid) {
            errors.push(...cardValidation.errors);
        }

        // 3. Gerar cupom de troco se necessário
        if (errors.length === 0 && cardValidation.needsChange) {
            try {
                changeCoupon = await this.generateChangeCoupon(cardValidation.changeAmount, clientId);
            } catch (error) {
                console.error('Erro ao gerar cupom de troco:', error);
                errors.push('Erro ao gerar cupom de troco');
            }
        }

        return {
            valid: errors.length === 0,
            errors,
            finalAmount,
            couponDiscount: couponValidation.totalValue || 0,
            cardTotal: cardValidation.totalValue || 0,
            changeCoupon,
            changeAmount: (cardValidation.changeAmount || 0) + (couponValidation.changeAmount || 0),
            couponOptimization: {
                selectedCoupons: couponValidation.selectedCoupons || [],
                unusedCoupons: couponValidation.unusedCoupons || [],
                optimizationReason: couponValidation.optimizationReason || 'N/A'
            }
        };
    }

    /**
     * Aplicar validações na finalização da compra
     */
    public async applyPaymentValidation(purchaseId: string) {
        try {
            // Buscar dados da compra com relacionamentos
            const purchase = await strapi.documents('api::purchase.purchase').findOne({
                documentId: purchaseId,
                populate: {
                    client: true,
                    coupons: true,
                    cards: true,
                    cartOrders: {
                        populate: { product: true }
                    }
                }
            });

            if (!purchase) {
                throw new ApplicationError('Compra não encontrada');
            }

            // Calcular valor total da compra
            const totalAmount = purchase.cartOrders?.reduce((acc: number, order: any) => {
                return acc + (order.totalValue || 0);
            }, 0) || 0;

            // Adicionar frete se houver
            const totalWithFreight = totalAmount + (purchase.freteValue || 0);

            // Debug dos dados da compra
            console.log('[PAYMENT] Dados da compra encontrada:');
            console.log('[PAYMENT] - Purchase ID:', purchaseId);
            console.log('[PAYMENT] - Client ID:', purchase.client?.documentId);
            console.log('[PAYMENT] - Coupons:', purchase.coupons?.length || 0);
            console.log('[PAYMENT] - Cards:', purchase.cards?.length || 0, purchase.cards);
            console.log('[PAYMENT] - Total Amount:', totalWithFreight);
            console.log('[PAYMENT] - Full purchase object:', JSON.stringify(purchase, null, 2));

            // Preparar cartões com valores
            let cardsWithValues = [];
            const purchaseAny = purchase as any;
            if (purchaseAny.cardPaymentData) {
                try {
                    const cardPaymentData = JSON.parse(purchaseAny.cardPaymentData);
                    cardsWithValues = cardPaymentData.map(data => ({
                        ...purchase.cards.find(card => card.documentId === data.cardId),
                        value: data.value
                    })).filter(card => card.documentId);
                } catch (error) {
                    console.error('[PAYMENT] Erro ao processar cardPaymentData:', error);
                    cardsWithValues = purchase.cards;
                }
            } else {
                cardsWithValues = purchase.cards;
            }

            // Validar pagamento
            const validation = await this.validatePayment({
                coupons: purchase.coupons,
                cards: cardsWithValues,
                totalAmount: totalWithFreight,
                clientId: purchase.client.documentId
            });

            if (!validation.valid) {
                throw new ApplicationError('Erro de validação de pagamento: ' + validation.errors.join('; '));
            }

            // Atualizar compra com cupom de troco se gerado
            if (validation.changeCoupon) {
                await strapi.documents('api::purchase.purchase').update({
                    documentId: purchaseId,
                    data: {
                        ...({
                            changeCoupon: validation.changeCoupon.documentId,
                            changeAmount: validation.changeAmount
                        } as any)
                    }
                });
            }

            return {
                success: true,
                validation,
                message: validation.changeCoupon 
                    ? `Pagamento validado. Cupom de troco gerado: ${validation.changeCoupon.code}`
                    : 'Pagamento validado com sucesso'
            };

        } catch (error) {
            console.error('Erro na validação de pagamento:', error);
            throw error;
        }
    }
}