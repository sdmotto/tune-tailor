import axios from 'axios';

export default class SpotifyAdapter {
  constructor() {
    this.clientId = process.env.SPOTIFY_CLIENT_ID;
    this.clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
    this.token = null;
  }

var authOptions = {
  url: 'https://accounts.spotify.com/api/token',
  headers: {
    'Authorization': 'Basic ' + (new Buffer.from(client_id + ':' + client_secret).toString('base64'))
  },
  form: {
    grant_type: 'client_credentials'
  },
  json: true
};

request.post(authOptions, function(error, response, body) {
  if (!error && response.statusCode === 200) {
    var token = body.access_token;
  }
});

//example 200 OK response from above
/*
{
  "access_token": "NgCXRKc...MzYjw",
  "token_type": "bearer",
  "expires_in": 3600
}
*/


  async authenticate() {
    const authString = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');
    try {
      const response = await axios.post(
        'https://accounts.spotify.com/api/token',
        new URLSearchParams({ grant_type: 'client_credentials' }),
        {
          headers: {
            Authorization: `Basic ${authString}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );
      this.token = response.data.access_token;
    } catch (error) {
      throw new Error(`Spotify Authentication failed: ${error.message}`);
    }
  }

  async getRecommendations(seedArtists, seedTracks, seedGenres) {
    if (!this.token) await this.authenticate();

    try {
      const response = await axios.get('https://api.spotify.com/v1/recommendations', {
        headers: { Authorization: `Bearer ${this.token}` },
        params: {
          seed_artists: seedArtists,
          seed_tracks: seedTracks,
          seed_genres: seedGenres,
        },
      });
      return response.data;
    } catch (error) {
      throw new Error(`Spotify Recommendation failed: ${error.message}`);
    }
  }
}
