import axios from 'axios';

let _token = null;
let _tokenExpiry = 0;

async function getToken() {
  if (_token && Date.now() < _tokenExpiry) return _token;

  const { data } = await axios.post('https://id.twitch.tv/oauth2/token', null, {
    params: {
      client_id: process.env.IGDB_CLIENT_ID,
      client_secret: process.env.IGDB_CLIENT_SECRET,
      grant_type: 'client_credentials',
    },
  });

  _token = data.access_token;
  _tokenExpiry = Date.now() + (data.expires_in - 300) * 1000; // 5-min safety buffer
  return _token;
}

export async function igdbQuery(endpoint, body) {
  const token = await getToken();
  const { data } = await axios.post(`https://api.igdb.com/v4/${endpoint}`, body, {
    headers: {
      'Client-ID': process.env.IGDB_CLIENT_ID,
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
    timeout: 8000,
  });
  return data;
}

export const coverUrl = (imageId, size = 't_cover_big') =>
  imageId ? `https://images.igdb.com/igdb/image/upload/${size}/${imageId}.jpg` : null;

export const screenshotUrl = (imageId) =>
  imageId ? `https://images.igdb.com/igdb/image/upload/t_screenshot_big/${imageId}.jpg` : null;

// Resolves portrait covers for a batch of game ids in a single IGDB request.
// Posts store a landscape screenshot, so poster grids need this lookup.
export async function fetchCoversByGameIds(gameIds) {
  const ids = [...new Set(gameIds.map(String).filter((id) => /^\d+$/.test(id)))];
  if (!ids.length) return new Map();

  const rows = await igdbQuery(
    'games',
    `fields id,cover.image_id; where id = (${ids.join(',')}); limit ${ids.length};`
  );

  return new Map(
    rows.map((g) => [String(g.id), coverUrl(g.cover?.image_id, 't_cover_big_2x')])
  );
}
