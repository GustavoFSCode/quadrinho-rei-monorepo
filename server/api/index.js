const strapi = require('@strapi/strapi');

let instance;

async function getStrapi() {
  if (instance) {
    return instance;
  }

  try {
    instance = await strapi({
      distDir: './.strapi',
      autoReload: false,
    }).load();

    await instance.start();

    return instance;
  } catch (error) {
    console.error('Failed to start Strapi:', error);
    throw error;
  }
}

module.exports = async (req, res) => {
  try {
    const strapiInstance = await getStrapi();

    // Remove o prefixo /api da URL para o Strapi processar corretamente
    req.url = req.url.replace(/^\/api/, '');

    // Passa a requisição para o Strapi
    return strapiInstance.server.app(req, res);
  } catch (error) {
    console.error('Error handling request:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};
