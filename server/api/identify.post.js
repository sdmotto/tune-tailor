import AcrCloudAdapter from '../interfaces/acrCloud';

export default defineEventHandler(async (event) => {
  // Read audioBuffer (base64 string) from the request body
  const { audioBuffer } = await readBody(event);

  // Decode base64 string to a Buffer
  const buffer = Buffer.from(audioBuffer, 'base64');

  // Initialize the AcrCloudAdapter
  const acr = new AcrCloudAdapter();

  return new Promise((resolve, reject) => {
    acr.identify(buffer, (error, response, body) => {
        resolve(JSON.parse(body));
    });
  });
});
