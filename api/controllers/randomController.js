import axios from "axios"


export const getRandomGameById = async (req, res) => {
  try {
    // Define un rango de IDs válidos (ajusta según tus pruebas con la API RAWG).
    const minId = 1;
    const maxId = 100000;

    // Genera un ID aleatorio dentro del rango.
    const randomId = Math.floor(Math.random() * (maxId - minId + 1)) + minId;
    console.log(randomId)
    
    // Realiza la solicitud al endpoint con el ID aleatorio.
    const response = await axios.get(`https://api.rawg.io/api/games/${randomId}`, {
      params: { key: process.env.API_KEY },
    });

    if (!response.data || response.data.detail === "Not found.") {
      // Si no se encuentra el juego, vuelve a intentar con un nuevo ID.
      return res.status(404).json({ error: `Juego con ID ${randomId} no encontrado.` });
    }

    res.json(response.data); // Devuelve el juego encontrado.
    console.log(`Juego encontrado: ${response.data.name}`);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener el juego aleatorio." });
  }
};


