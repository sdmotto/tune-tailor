import AcrCloudAdapter from "../interfaces/acrCloud";

export default defineEventHandler(async (event) => {
    const acr = new AcrCloudAdapter({
        host: process.env.ACR_HOST,
        accessKey: process.env.ACR_ACCESS_KEY,
        accessSecret: process.env.ACR_ACCESS_SECRET,
    });
    const { audioBuffer } = await readBody(event);

    return await acr.identify(audioBuffer);
});