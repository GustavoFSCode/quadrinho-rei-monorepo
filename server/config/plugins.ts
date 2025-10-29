export default ({ env }) => ({
  // Configuração do provider de upload
  upload: {
    config: {
      provider: env('NODE_ENV') === 'production' ? 'cloudinary' : 'local',
      providerOptions: {
        cloud_name: env('CLOUDINARY_NAME'),
        api_key: env('CLOUDINARY_KEY'),
        api_secret: env('CLOUDINARY_SECRET'),
      },
      actionOptions: {
        upload: {},
        uploadStream: {},
        delete: {},
      },
    },
  },
});
