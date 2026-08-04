import axios from "axios"

export const getGameById = async (req, res) => {
  const { id } = req.params;

  try {
    const response = await axios.get(`https://api.rawg.io/api/games/${id}`, {
      params: { key: process.env.API_KEY },
    });

    res.json(response.data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener el juego por ID' });
  }
};

 export const searchGamesController = async (req, res) => {
   const { search } = req.query;

   if (!search) {
     return res.status(400).json({ error: "Falta el parámetro 'search'" });
   }

   try {
     const response = await axios.get("https://api.rawg.io/api/games", {
       params: {
         key: process.env.API_KEY,
         search,
       },
     });

     res.json(response.data);
   } catch (error) {
     console.error(error);
     res
       .status(500)
       .json({ error: "Hubo un problema al obtener los datos de la API externa." });
   }
 };

export const getRandomGamesController = async (req, res) => {
  try {
    const maxPages = 100;
    const randomPage = Math.floor(Math.random() * maxPages) + 1;

    const response = await axios.get("https://api.rawg.io/api/games", {
      params: { key: process.env.API_KEY, page: randomPage, page_size: 10 },
      timeout: 8000,
    });

    const games = response.data.results;
    if (!games || games.length === 0) {
      return res.status(404).json({ error: "No se encontraron juegos en esta página." });
    }

    res.json(games);
  } catch (error) {
    const status = error.response?.status;
    if (status === 522 || status === 524 || error.code === "ECONNABORTED") {
      return res.status(503).json({ error: "El servicio de juegos no está disponible en este momento. Intentá más tarde." });
    }
    if (status === 401 || status === 403) {
      return res.status(502).json({ error: "Error de autenticación con el proveedor de juegos." });
    }
    res.status(500).json({ error: "Hubo un problema al obtener juegos aleatorios." });
  }
};