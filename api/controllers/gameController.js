import { igdbQuery, coverUrl, screenshotUrl } from '../services/igdbService.js';

const normalizeGame = (game) => ({
  id: game.id,
  name: game.name,
  // Landscape art for the backdrop; portrait cover is exposed separately.
  background_image:
    screenshotUrl(game.screenshots?.[0]?.image_id) ||
    coverUrl(game.cover?.image_id) ||
    null,
  // 2x keeps the poster sharp on high-density screens.
  cover: coverUrl(game.cover?.image_id, 't_cover_big_2x'),
  description_raw: game.summary || '',
  released: game.first_release_date
    ? new Date(game.first_release_date * 1000).toISOString()
    : null,
  tags: (game.genres || []).map((g) => ({ id: g.id, name: g.name })),
  platforms: (game.platforms || []).map((p) => ({
    platform: { id: p.id, name: p.name },
  })),
  publishers: (game.involved_companies || [])
    .filter((c) => c.publisher)
    .map((c) => ({ id: c.company?.id, name: c.company?.name })),
  // IGDB website types: 1 = official site, 13 = Steam.
  website:
    (game.websites || []).find((w) => w.type === 1)?.url ||
    (game.websites || []).find((w) => w.type === 13)?.url ||
    null,
  rating: game.aggregated_rating ? Math.round(game.aggregated_rating) : null,
});

export const getGameById = async (req, res) => {
  const { id } = req.params;
  try {
    const [game] = await igdbQuery(
      'games',
      `fields id,name,summary,first_release_date,cover.image_id,screenshots.image_id,genres.name,platforms.name,involved_companies.company.name,involved_companies.company.id,involved_companies.publisher,websites.type,websites.url,aggregated_rating; where id = ${id}; limit 1;`
    );
    if (!game) return res.status(404).json({ error: 'Juego no encontrado.' });
    res.json(normalizeGame(game));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener el juego.' });
  }
};

export const searchGamesController = async (req, res) => {
  const { search } = req.query;
  if (!search) return res.status(400).json({ error: "Falta el parámetro 'search'" });

  try {
    // game_type: 0 main, 4 standalone expansion, 8 remake, 9 remaster.
    // Excludes mods, ports and DLC, which IGDB indexes under the same name.
    const games = await igdbQuery(
      'games',
      `search "${search.replace(/"/g, '')}"; fields id,name,cover.image_id; where game_type = (0,4,8,9); limit 15;`
    );
    res.json({
      results: games.map((g) => ({
        id: g.id,
        name: g.name,
        background_image: coverUrl(g.cover?.image_id),
      })),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Hubo un problema al buscar juegos.' });
  }
};

export const getRandomGamesController = async (req, res) => {
  try {
    const offset = Math.floor(Math.random() * 150);
    const games = await igdbQuery(
      'games',
      `fields id,name,cover.image_id,aggregated_rating; where aggregated_rating > 75 & cover != null & game_type = 0; sort aggregated_rating_count desc; limit 20; offset ${offset};`
    );

    if (!games.length) return res.status(404).json({ error: 'No se encontraron juegos.' });

    const shuffled = games.sort(() => Math.random() - 0.5).slice(0, 10);
    res.json(
      shuffled.map((g) => ({
        id: g.id,
        name: g.name,
        background_image: coverUrl(g.cover?.image_id),
        rating: g.aggregated_rating ? Math.round(g.aggregated_rating) : null,
      }))
    );
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Hubo un problema al obtener juegos.' });
  }
};
