# Database Cleanup Guide

## Overview
This guide provides tools to clean the database while preserving products (comics) and clients with their addresses and cards.

## What will be REMOVED ❌
- **Purchases** (compras) - All purchase records
- **Trades** (trocas) - All trade/refund records  
- **Coupons** (cupons) - All generated coupons
- **Cart Orders** (card-orders) - All items in shopping carts
- **Chat Messages** - All chat conversations and messages
- **Articles** - Additional content and articles

## What will be PRESERVED ✅
- **Products** (quadrinhos) - All comic book records
- **Clients** (clientes) - All customer records
- **Addresses** (endereços) - Customer addresses
- **Cards** (cartões) - Customer payment cards
- **Users** (usuários) - User accounts
- **Carts** (carrinhos) - Empty cart containers (to maintain client relationships)
- **System Data** - Categories, statuses, pricing types, etc.

## How to Use

### 1. Prerequisites
Make sure the Strapi server is running:
```bash
cd server
yarn develop
# Wait for server to fully initialize
```

### 2. Check Current Database Status
Before cleaning, check what data exists:
```bash
cd server
node scripts/check-database-status.js
```

This will show you:
- How many records exist in each category
- What will be preserved vs. removed
- Total number of records that will be deleted

### 3. Perform Database Cleanup
⚠️ **WARNING: This operation cannot be undone!**

```bash
cd server
node scripts/cleanup-database.js
```

The script will:
1. Show you what will be removed/preserved
2. Ask for confirmation (type "CONFIRMAR")
3. Execute the cleanup
4. Show results summary

### 4. Alternative: API Endpoints
You can also use the API endpoints directly:

**Check Status:**
```bash
curl -X GET http://localhost:1337/api/getDataSummary
```

**Execute Cleanup:**
```bash
curl -X POST http://localhost:1337/api/cleanupDatabase
```

## API Endpoints Added

### GET `/api/getDataSummary`
Returns current count of records in each table:
```json
{
  "products": 25,
  "clients": 10,
  "addresses": 15,
  "cards": 8,
  "users": 12,
  "purchases": 45,
  "trades": 12,
  "coupons": 8,
  "cardOrders": 67,
  "chatConversations": 5,
  "chatMessages": 23
}
```

### POST `/api/cleanupDatabase`
Executes the cleanup operation and returns:
```json
{
  "success": true,
  "message": "Banco de dados limpo com sucesso!",
  "cleaned": ["chat-messages", "trades", "coupons", ...],
  "preserved": ["products", "clients", "addresses", ...]
}
```

## Files Added

### Backend
- `src/api/operation/services/databaseCleanupService.ts` - Main cleanup service
- Updated `src/api/operation/controllers/operation.ts` - Added cleanup endpoints
- Updated `src/api/operation/routes/operation.ts` - Added cleanup routes

### Scripts
- `scripts/cleanup-database.js` - Interactive cleanup script
- `scripts/check-database-status.js` - Database status checker

## Safety Features

1. **Confirmation Required** - Script asks for explicit "CONFIRMAR" input
2. **Status Preview** - Shows exactly what will be removed/preserved
3. **Server Validation** - Checks if server is running before executing
4. **Error Handling** - Clear error messages for common issues
5. **Detailed Logging** - Shows progress and results

## Common Issues & Solutions

### "Connection refused" error
- **Cause:** Strapi server is not running
- **Solution:** Run `yarn develop` and wait for server to start

### "404" error
- **Cause:** API routes not available
- **Solution:** Rebuild server with `yarn build`

### Permission errors
- **Cause:** Script files not executable
- **Solution:** Run `chmod +x scripts/*.js`

## Example Usage Session

```bash
# 1. Start server
cd server
yarn develop

# 2. Check current status
node scripts/check-database-status.js
# Output: Shows current record counts

# 3. Execute cleanup
node scripts/cleanup-database.js
# Output: Shows preview, asks for confirmation
# Type: CONFIRMAR
# Output: Shows cleanup results

# 4. Verify results
node scripts/check-database-status.js
# Output: Shows updated counts (should be 0 for removed data)
```

## Database Relations Handled

The cleanup service respects database relationships and deletes in the correct order:
1. Chat messages → Chat conversations  
2. Trades → Coupons
3. Purchases → Card orders
4. Other content tables

This prevents foreign key constraint violations and ensures clean removal.

## Recovery

⚠️ **There is no automatic recovery mechanism.** Make sure you have database backups before running cleanup operations in production environments.

For development environments, you can:
1. Use the application to recreate test data
2. Re-seed the database if you have seed scripts
3. Restore from a database backup if available