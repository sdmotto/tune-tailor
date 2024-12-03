import AcrCloudAdapter from '../interfaces/acrCloud';

export default defineEventHandler(async (event) => {
  const acr = new AcrCloudAdapter();
  const { audioBuffer } = await readBody(event);
  return await acr.identify(audioBuffer);
});
