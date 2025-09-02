const https = require('https');
const http = require('http');

// Script para testar endpoint do carrinho usando apenas módulos nativos
function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const protocol = options.port === 443 ? https : http;
    
    const req = protocol.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => responseData += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData);
          resolve({ status: res.statusCode, data: parsed });
        } catch {
          resolve({ status: res.statusCode, data: responseData });
        }
      });
    });
    
    req.on('error', reject);
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function testCartEndpoint() {
  try {
    console.log('🔍 Testando endpoint de adicionar ao carrinho...');
    
    // Primeiro, listar produtos disponíveis
    console.log('📋 Buscando produtos disponíveis...');
    const productsResponse = await makeRequest({
      hostname: 'localhost',
      port: 1337,
      path: '/api/getProductsUser',
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    
    console.log('Products response status:', productsResponse.status);
    
    if (productsResponse.status !== 200 || !productsResponse.data) {
      console.log('❌ Erro ao buscar produtos:', productsResponse.data);
      return;
    }
    
    const products = Array.isArray(productsResponse.data) ? productsResponse.data : productsResponse.data.data || [];
    
    if (products.length === 0) {
      console.log('❌ Nenhum produto encontrado');
      return;
    }
    
    const firstProduct = products[0];
    console.log('✅ Produto encontrado:', firstProduct?.title, '- ID:', firstProduct?.documentId);
    
    // Tentar fazer login
    console.log('🔐 Tentando fazer login...');
    const loginResponse = await makeRequest({
      hostname: 'localhost',
      port: 1337,
      path: '/api/auth/local',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      identifier: 'admin@quadrinhoroi.com',
      password: 'Admin123456'
    });
    
    if (loginResponse.status !== 200) {
      console.log('❌ Erro no login:', loginResponse.data);
      return;
    }
    
    const token = loginResponse.data.jwt;
    console.log('✅ Login realizado com sucesso');
    
    // Tentar adicionar ao carrinho
    console.log('🛒 Tentando adicionar produto ao carrinho...');
    console.log('Product ID a ser usado:', firstProduct.documentId);
    
    const cartResponse = await makeRequest({
      hostname: 'localhost',
      port: 1337,
      path: '/api/createOrder',
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    }, {
      product: firstProduct.documentId,
      quantity: 1
    });
    
    console.log('Cart response status:', cartResponse.status);
    console.log('Cart response data:', JSON.stringify(cartResponse.data, null, 2));
    
    if (cartResponse.status === 500) {
      console.error('🔥 Erro 500 detectado!');
      console.error('Detalhes do erro:', cartResponse.data);
    } else {
      console.log('✅ Operação realizada. Status:', cartResponse.status);
    }
    
  } catch (error) {
    console.error('❌ Erro durante o teste:', error.message);
  }
}

testCartEndpoint();