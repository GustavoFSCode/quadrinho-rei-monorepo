# Cart Stock Integration Test Plan

## Test Cases for Automatic Stock Updates

### 1. Adding Product to Cart
**Test**: When a product is added to the cart, stock should decrease
- Initial product stock: 10
- Add 3 items to cart
- Expected product stock: 7
- Expected cart quantity: 3

### 2. Adding Same Product Again 
**Test**: When the same product is added again, stock should decrease by additional quantity
- Current product stock: 7 (from test 1)
- Add 2 more items to cart
- Expected product stock: 5
- Expected cart quantity: 5

### 3. Updating Cart Quantity (Increase)
**Test**: When cart quantity is increased, stock should decrease
- Current product stock: 5
- Current cart quantity: 5
- Update cart quantity to 7
- Expected product stock: 3
- Expected cart quantity: 7

### 4. Updating Cart Quantity (Decrease)
**Test**: When cart quantity is decreased, stock should increase
- Current product stock: 3
- Current cart quantity: 7
- Update cart quantity to 4
- Expected product stock: 6
- Expected cart quantity: 4

### 5. Removing Product from Cart
**Test**: When a product is removed from cart, stock should be restored
- Current product stock: 6
- Current cart quantity: 4
- Remove product from cart
- Expected product stock: 10
- Expected cart quantity: 0

### 6. Clearing All Cart Items
**Test**: When all cart items are cleared, all stock should be restored
- Add multiple different products to cart
- Clear all cart items
- All product stocks should be restored to original values

## API Endpoints Modified

- `POST /api/operation/cart/create-order` - Updates stock when adding products
- `PUT /api/operation/cart/update-quantity` - Updates stock when changing quantities  
- `DELETE /api/operation/cart/remove-order/{orderId}` - Restores stock when removing items
- `DELETE /api/operation/cart/remove-all-orders` - Restores stock when clearing cart

## Stock Update Logic

### Adding Products:
```typescript
newStock = currentStock - quantityAdded
```

### Updating Quantities:
```typescript 
stockDifference = oldQuantity - newQuantity
newStock = currentStock + stockDifference
```

### Removing Products:
```typescript
newStock = currentStock + removedQuantity
```

## Edge Cases Handled

1. **Stock Validation**: Prevents adding more items than available stock
2. **Quantity Validation**: Ensures quantities are positive numbers
3. **Product Existence**: Validates product exists before stock updates
4. **Transaction Safety**: Updates are atomic to prevent race conditions