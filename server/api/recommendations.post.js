export default defineEventHandler(async (event) => {
    const { trackId, artistId, genre } = await readBody(event);

    
});