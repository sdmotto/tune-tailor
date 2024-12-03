import AcrCloudAdapter from '../interfaces/acrCloud';

export default defineEventHandler(async (event) => {
  // Read audioBuffer (base64 string) from the request body
  const { audioBuffer } = await readBody(event);

  // Ensure audioBuffer is provided
  if (!audioBuffer || typeof audioBuffer !== 'string') {
    throw createError({
      statusCode: 400,
      message: 'Invalid audio buffer provided',
    });
  }

  // Decode base64 string to a Buffer
  const buffer = Buffer.from(audioBuffer, 'base64');

  // Initialize the AcrCloudAdapter
  const acr = new AcrCloudAdapter();
  
  return new Promise((resolve, reject) => {
    try {
      acr.identify(buffer, (error, response, body) => {
        if (error) {
          console.error('Error during ACRCloud identification:', error);
          reject(
            createError({
              statusCode: 500,
              message: 'Failed to identify audio',
            })
          );
        } else {
          resolve(JSON.parse(body));
        }
      });
    } catch (error) {
      console.error('Error during ACRCloud identification:', error.message);
      reject(
        createError({
          statusCode: 500,
          message: 'Failed to identify audio',
        })
      );
    }
  });
});
