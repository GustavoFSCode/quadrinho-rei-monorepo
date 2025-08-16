# Coupon Status Column Implementation

## Overview
Added a new column "Cupom já utilizado" to the "Minhas Trocas" table that shows whether a coupon has been used or not with "Sim" (Yes) or "Não" (No) responses.

## Changes Made

### Backend ✅ (No changes required)
The backend was already providing the coupon status through the `couponStatus` field in the coupon model with the following enum values:
- `"NaoUsado"` - Not used
- `"EmUso"` - In use  
- `"Usado"` - Used

The `getMyTrades` API endpoint already populates the coupon with all its fields including `couponStatus`.

### Frontend Updates

#### 1. Updated Coupon Interface (`src/services/purchaseService.ts`)
```typescript
export interface Coupon {
  id: number;
  documentId: string;
  code: string;
  price: number;
  couponStatus: 'NaoUsado' | 'EmUso' | 'Usado'; // ← Added this field
}
```

#### 2. Updated MinhasTrocas Table Component (`src/components/Tables/Minhas-Trocas/index.tsx`)

**Added new table header:**
```tsx
<TableHeadCell center>Cupom já utilizado</TableHeadCell>
```

**Added new table body cell with logic:**
```tsx
<TableBodyCell center>
  {trade.coupon && trade.coupon.couponStatus
    ? (trade.coupon.couponStatus === 'Usado' ? 'Sim' : 'Não')
    : 'N/A'}
</TableBodyCell>
```

## Logic Implementation

The new column displays:
- **"Sim"** - When `couponStatus === 'Usado'`
- **"Não"** - When `couponStatus === 'NaoUsado'` or `couponStatus === 'EmUso'`
- **"N/A"** - When no coupon exists or coupon data is missing

## Table Structure

The table now has the following columns (from left to right):
1. Produto
2. Quantidade  
3. Valor Total
4. Status
5. Data
6. Cupom
7. **Cupom já utilizado** ← New column

## Benefits

1. **Clear Status Visibility**: Users can immediately see which coupons have been used
2. **Better UX**: No need to check coupon status elsewhere in the system
3. **Data Consistency**: Shows real-time coupon status from the backend
4. **Type Safety**: Fully typed with TypeScript interfaces

## Testing

✅ Frontend builds successfully  
✅ TypeScript compilation passes  
✅ Interface properly typed  
✅ Logic handles all coupon states  
✅ Graceful handling of missing coupon data

## Usage

The column will automatically display the correct status for each trade:
- Trades with used coupons show "Sim"
- Trades with unused/in-use coupons show "Não"  
- Trades without coupons show "N/A"

No additional API calls are required as the data is already provided by the existing `getMyTrades` endpoint.