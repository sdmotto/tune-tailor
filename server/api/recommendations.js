import SpotifyAdapter from '../interfaces/spotify';

export default defineEventHandler(async (event) => {
  const spotify = new SpotifyAdapter();
  const { seedArtists, seedTracks, seedGenres } = await readBody(event);
  return await spotify.getRecommendations(seedArtists, seedTracks, seedGenres);
});
