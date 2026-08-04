import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcrypt";

import { igdbQuery, coverUrl, screenshotUrl } from "../services/igdbService.js";
import Users from "../models/users_model.js";
import Post from "../models/Post.js";
import Playlist from "../models/Playlist.js";
import GameScore from "../models/GameScore.js";

const DEMO_PASSWORD = "demo1234";

// --- Demo users -------------------------------------------------------------
const USERS = [
  {
    username: "luci_plays",
    name: "Lucía Fernández",
    bio: "RPGs y cafecito ☕ | Elden Ring me arruinó la vida (gracias).",
  },
  {
    username: "tincho.gg",
    name: "Martín Gómez",
    bio: "Speedrunner amateur. Souls enjoyer. Muero, aprendo, repito.",
  },
  {
    username: "sofi_pixel",
    name: "Sofía Ramírez",
    bio: "Indies > AAA. Peleame en los comentarios.",
  },
  {
    username: "jc_diaz",
    name: "Juan Cruz Díaz",
    bio: "Shooters competitivos y algún cozy game para bajar revoluciones.",
  },
  {
    username: "cami.tor",
    name: "Camila Torres",
    bio: "Terminando el backlog desde 2019 😅 mandá fuerzas.",
  },
  {
    username: "nico_ibz",
    name: "Nicolás Ibáñez",
    bio: "Metroidvanias y bandas sonoras que te hacen llorar.",
  },
];

// --- Games to pull from IGDB (real ids + images) ----------------------------
const GAME_TITLES = [
  "Elden Ring",
  "The Witcher 3: Wild Hunt",
  "Hades",
  "Hollow Knight",
  "Portal 2",
  "Celeste",
  "Stardew Valley",
  "Cyberpunk 2077",
  "Red Dead Redemption 2",
  "Disco Elysium",
  "Outer Wilds",
  "Dark Souls III",
  "Baldur's Gate 3",
  "God of War",
  "Sekiro: Shadows Die Twice",
  "Undertale",
  "Bloodborne",
  "Death Stranding",
];

// --- Reviews (user + game title + rating 0-10 + content) --------------------
const REVIEWS = [
  { user: "luci_plays", game: "Elden Ring", rating: 10, daysAgo: 13, content: "La primera vez que bajás a Nokron sin spoilers no tiene precio. Obra maestra." },
  { user: "luci_plays", game: "The Witcher 3: Wild Hunt", rating: 9, daysAgo: 11, content: "Las sidequests tienen más laburo narrativo que muchos juegos enteros. Geralt <3" },
  { user: "luci_plays", game: "Hades", rating: 8, daysAgo: 6, content: "Empecé por el gameplay, me quedé por la historia. Supergiant no falla nunca." },
  { user: "tincho.gg", game: "Elden Ring", rating: 9, daysAgo: 12, content: "Malenia me sacó años de vida pero volvería a hacerlo. GOTY sin dudas." },
  { user: "tincho.gg", game: "Hollow Knight", rating: 10, daysAgo: 9, content: "Una clase magistral de diseño de niveles. Cada rincón premia la curiosidad." },
  { user: "tincho.gg", game: "Portal 2", rating: 9, daysAgo: 4, content: "Humor, puzzles y GLaDOS. Envejeció como el mejor vino." },
  { user: "sofi_pixel", game: "Hollow Knight", rating: 10, daysAgo: 10, content: "Me perdí 40 horas y no me arrepiento de ninguna. Hallownest es mágico." },
  { user: "sofi_pixel", game: "Celeste", rating: 10, daysAgo: 7, content: "Un juego sobre subir una montaña que en realidad es sobre la ansiedad. Me hizo llorar." },
  { user: "sofi_pixel", game: "Stardew Valley", rating: 8, daysAgo: 3, content: "Peligroso. Prendés 'una partidita' y de golpe son las 4am. Adictivo del bueno." },
  { user: "jc_diaz", game: "Cyberpunk 2077", rating: 7, daysAgo: 8, content: "Arrancó roto, hoy es un juegazo. Night City tira un ambientazo tremendo." },
  { user: "jc_diaz", game: "Red Dead Redemption 2", rating: 9, daysAgo: 5, content: "Lento al principio, pero el tercer acto es de lo mejor que jugué. Arthur, loco." },
  { user: "cami.tor", game: "Stardew Valley", rating: 9, daysAgo: 6, content: "Mi terapia después del laburo. Concerned Ape es un genio absoluto." },
  { user: "cami.tor", game: "The Witcher 3: Wild Hunt", rating: 8, daysAgo: 2, content: "Me costó entrar pero cuando enganchás no soltás. Blood and Wine es capítulo aparte." },
  { user: "nico_ibz", game: "Celeste", rating: 9, daysAgo: 4, content: "La banda sonora de Lena Raine es un personaje más. Las B-sides son dolor puro." },
  { user: "nico_ibz", game: "Hollow Knight", rating: 9, daysAgo: 1, content: "¿Silksong cuándo? Mientras tanto lo rejuego por decimoquinta vez, sin culpa." },

  { user: "luci_plays", game: "Baldur's Gate 3", rating: 10, daysAgo: 20, content: "Larian entendió algo que el resto olvidó: dejar que el jugador rompa el guion. 100 horas y sigo encontrando cosas." },
  { user: "luci_plays", game: "Disco Elysium", rating: 10, daysAgo: 17, content: "No disparás un solo tiro y es lo más intenso que jugué. Tus propios pensamientos te discuten." },
  { user: "luci_plays", game: "Outer Wilds", rating: 9, daysAgo: 15, content: "Hablar de este juego es arruinarlo. Andá a ciegas y agendate 20 horas libres." },
  { user: "tincho.gg", game: "Sekiro: Shadows Die Twice", rating: 10, daysAgo: 18, content: "El parry más satisfactorio jamás programado. Isshin me tuvo tres días, valió cada intento." },
  { user: "tincho.gg", game: "Bloodborne", rating: 10, daysAgo: 16, content: "Yharnam es el mejor escenario que hizo FromSoft. Necesitamos los 60fps, Sony, por favor." },
  { user: "tincho.gg", game: "Dark Souls III", rating: 9, daysAgo: 7, content: "El cierre que la saga merecía. Los jefes del DLC son otro nivel de diseño." },
  { user: "sofi_pixel", game: "Undertale", rating: 10, daysAgo: 14, content: "Toby Fox hizo solo lo que estudios enteros no logran. La ruta pacifista te cambia la cabeza." },
  { user: "sofi_pixel", game: "Outer Wilds", rating: 10, daysAgo: 12, content: "Un juego sobre la curiosidad pura. El final me dejó mirando la pared media hora." },
  { user: "sofi_pixel", game: "Disco Elysium", rating: 9, daysAgo: 5, content: "Prosa de novela real. Nunca vi diálogos escritos con este nivel en un videojuego." },
  { user: "jc_diaz", game: "God of War", rating: 9, daysAgo: 19, content: "El plano secuencia entero sin cortes y encima la relación con Atreus funciona. Tremendo." },
  { user: "jc_diaz", game: "Sekiro: Shadows Die Twice", rating: 8, daysAgo: 11, content: "Me costó soltar el instinto de Souls, pero cuando entendés el ritmo no hay vuelta atrás." },
  { user: "jc_diaz", game: "Baldur's Gate 3", rating: 9, daysAgo: 6, content: "Nunca jugué D&D de mesa y me enganchó igual. El acto 3 pide una PC decente, eso sí." },
  { user: "cami.tor", game: "God of War", rating: 8, daysAgo: 13, content: "Kratos padre funciona mucho mejor de lo que esperaba. Los vikingos le quedan bien." },
  { user: "cami.tor", game: "Hades", rating: 9, daysAgo: 9, content: "El roguelite que le explica al género cómo se hace narrativa. Morir avanza la historia." },
  { user: "cami.tor", game: "Celeste", rating: 9, daysAgo: 3, content: "Los controles son perfectos y el mensaje sobre la ansiedad pega sin ser panfleto." },
  { user: "nico_ibz", game: "Bloodborne", rating: 9, daysAgo: 10, content: "La banda sonora coral en Ludwig es de las mejores cosas que escuché en un juego." },
  { user: "nico_ibz", game: "Death Stranding", rating: 8, daysAgo: 8, content: "Kojima hizo un simulador de caminar y de alguna forma es hipnótico. No es para todos." },
  { user: "nico_ibz", game: "Undertale", rating: 9, daysAgo: 2, content: "Megalovania ya es cultura general. Pero el juego vale mucho más que su meme." },

  // Registros sin texto: solo puntuación.
  { user: "jc_diaz", game: "Celeste", rating: 7, daysAgo: 4, content: "" },
  { user: "cami.tor", game: "Portal 2", rating: 8, daysAgo: 2, content: "" },
  { user: "luci_plays", game: "Bloodborne", rating: 9, daysAgo: 1, content: "" },
];

// --- Playlists (owner + name + game titles) ---------------------------------
const PLAYLISTS = [
  { user: "luci_plays", name: "Mis GOTY personales", description: "Los que me marcaron de verdad.", games: ["Elden Ring", "The Witcher 3: Wild Hunt", "Hades"] },
  { user: "tincho.gg", name: "Para sufrir 🗡️", description: "Soulslike y compañía. Traé paciencia.", games: ["Hollow Knight", "Elden Ring", "Celeste"] },
  { user: "sofi_pixel", name: "Joyitas indie", description: "Presupuesto chico, corazón enorme.", games: ["Hollow Knight", "Celeste", "Stardew Valley", "Undertale", "Outer Wilds"] },
  { user: "nico_ibz", name: "Bandas sonoras que duelen", description: "Ponete auriculares y agradecé después.", games: ["Celeste", "Bloodborne", "Undertale", "Death Stranding"] },
  { user: "jc_diaz", name: "Historias que te dejan pensando", description: "Terminalos y después charlamos.", games: ["Disco Elysium", "Outer Wilds", "God of War", "Red Dead Redemption 2"] },
  { user: "cami.tor", name: "Backlog 2026", description: "Este año sí los termino. Es en serio.", games: ["Baldur's Gate 3", "Sekiro: Shadows Die Twice", "Cyberpunk 2077"] },
];

// --- Follow graph (follower -> followee) ------------------------------------
const FOLLOWS = [
  ["luci_plays", "tincho.gg"],
  ["luci_plays", "sofi_pixel"],
  ["luci_plays", "nico_ibz"],
  ["tincho.gg", "luci_plays"],
  ["tincho.gg", "jc_diaz"],
  ["sofi_pixel", "luci_plays"],
  ["sofi_pixel", "nico_ibz"],
  ["jc_diaz", "cami.tor"],
  ["jc_diaz", "tincho.gg"],
  ["cami.tor", "sofi_pixel"],
  ["cami.tor", "luci_plays"],
  ["nico_ibz", "sofi_pixel"],
];

const emailFor = (username) => `${username}@demo.mygamelog.com`;
const avatarFor = (username) => `https://i.pravatar.cc/150?u=${encodeURIComponent(username)}`;

async function fetchGame(title) {
  // game_type = 0 keeps main games only; IGDB also indexes mods and ports under the same name.
  const results = await igdbQuery(
    "games",
    `search "${title.replace(/"/g, "")}"; fields id,name,cover.image_id,screenshots.image_id,total_rating_count; where game_type = 0; limit 10;`
  );

  const hasArt = (g) => g.screenshots?.[0]?.image_id || g.cover?.image_id;
  const byPopularity = (a, b) => (b.total_rating_count || 0) - (a.total_rating_count || 0);

  const exact = results
    .filter((g) => g.name?.toLowerCase() === title.toLowerCase() && hasArt(g))
    .sort(byPopularity)[0];
  const pick = exact || results.filter(hasArt).sort(byPopularity)[0];

  if (!pick) throw new Error(`IGDB no devolvió un juego válido para "${title}"`);

  return {
    gameId: String(pick.id),
    gameName: pick.name,
    imageUrl:
      screenshotUrl(pick.screenshots?.[0]?.image_id) || coverUrl(pick.cover?.image_id),
  };
}

async function run() {
  if (!process.env.MONGO_URI) throw new Error("Falta MONGO_URI en el .env de api/");
  if (!process.env.IGDB_CLIENT_ID || !process.env.IGDB_CLIENT_SECRET) {
    throw new Error("Faltan IGDB_CLIENT_ID / IGDB_CLIENT_SECRET en el .env de api/");
  }

  await mongoose.connect(process.env.MONGO_URI);
  console.log("✓ Conectado a MongoDB");

  // 1) Users (upsert by username; password only set on insert) ---------------
  const passwordHash = bcrypt.hashSync(DEMO_PASSWORD, 10);
  const usersByName = {};
  for (const u of USERS) {
    const doc = await Users.findOneAndUpdate(
      { username: u.username },
      {
        $setOnInsert: {
          username: u.username,
          email: emailFor(u.username),
          name: u.name,
          bio: u.bio,
          imagen: avatarFor(u.username),
          password: passwordHash,
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    usersByName[u.username] = doc;
  }
  console.log(`✓ ${USERS.length} usuarios listos`);

  // 2) Games from IGDB -------------------------------------------------------
  const gamesByTitle = {};
  for (const title of GAME_TITLES) {
    gamesByTitle[title] = await fetchGame(title);
  }
  console.log(`✓ ${GAME_TITLES.length} juegos traídos de IGDB`);

  // 3) Reviews (upsert by userId+gameId) + likes -----------------------------
  const affectedGameIds = new Set();
  for (const r of REVIEWS) {
    const author = usersByName[r.user];
    const game = gamesByTitle[r.game];
    const createdAt = new Date(Date.now() - r.daysAgo * 24 * 60 * 60 * 1000);

    const post = await Post.findOneAndUpdate(
      { userId: author._id, gameId: game.gameId },
      {
        $setOnInsert: {
          gameId: game.gameId,
          gameName: game.gameName,
          imageUrl: game.imageUrl,
          userId: author._id,
          content: r.content,
          rating: r.rating,
          createdAt,
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    affectedGameIds.add(game.gameId);

    // Higher-rated reviews get a few more likes, from other demo users.
    const likerCount = Math.min(Math.max(r.rating - 6, 0), USERS.length - 1);
    const likers = USERS.map((u) => usersByName[u.username]._id)
      .filter((id) => !id.equals(author._id))
      .slice(0, likerCount);
    if (likers.length) {
      await Post.updateOne({ _id: post._id }, { $addToSet: { likes: { $each: likers } } });
    }
  }
  console.log(`✓ ${REVIEWS.length} reseñas listas`);

  // 4) Recompute GameScore aggregates from actual posts (self-healing) -------
  for (const gameId of affectedGameIds) {
    const posts = await Post.find({ gameId }, "rating");
    const totalReviews = posts.length;
    const scoreSum = posts.reduce((sum, p) => sum + (p.rating || 0), 0);
    const averageScore = totalReviews > 0 ? scoreSum / totalReviews : 0;
    await GameScore.findOneAndUpdate(
      { gameId },
      { $set: { totalReviews, scoreSum, averageScore } },
      { upsert: true }
    );
  }
  console.log(`✓ ${affectedGameIds.size} scores de juegos recalculados`);

  // 4b) Favorites: las reseñas mejor puntuadas de cada usuario ---------------
  const FAVORITES_PER_USER = 4;
  for (const u of USERS) {
    const author = usersByName[u.username];
    const top = await Post.find({ userId: author._id })
      .sort({ rating: -1, createdAt: -1 })
      .limit(FAVORITES_PER_USER)
      .select("_id");
    await Users.updateOne(
      { _id: author._id },
      { $set: { favorites: top.map((p) => p._id) } }
    );
  }
  console.log(`✓ favoritos asignados a ${USERS.length} usuarios`);

  // 5) Playlists (upsert by owner + name) ------------------------------------
  for (const pl of PLAYLISTS) {
    const owner = usersByName[pl.user];
    const games = pl.games.map((title) => {
      const g = gamesByTitle[title];
      return { gameId: g.gameId, gameName: g.gameName, imageUrl: g.imageUrl };
    });
    await Playlist.findOneAndUpdate(
      { userId: owner._id, name: pl.name },
      { $setOnInsert: { userId: owner._id, name: pl.name, description: pl.description, games } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }
  console.log(`✓ ${PLAYLISTS.length} playlists listas`);

  // 6) Follow graph (idempotent via $addToSet) -------------------------------
  for (const [followerName, followeeName] of FOLLOWS) {
    const follower = usersByName[followerName];
    const followee = usersByName[followeeName];
    await Users.updateOne({ _id: follower._id }, { $addToSet: { following: followee._id } });
    await Users.updateOne({ _id: followee._id }, { $addToSet: { followers: follower._id } });
  }
  console.log(`✓ ${FOLLOWS.length} relaciones de follow listas`);

  console.log("\n=== Datos de demo cargados ===");
  console.log(`Contraseña para todos los usuarios: ${DEMO_PASSWORD}`);
  console.log("Emails para loguearte:");
  for (const u of USERS) console.log(`  • ${emailFor(u.username)}  (${u.name})`);

  await mongoose.disconnect();
  console.log("\n✓ Listo. Desconectado de MongoDB.");
}

run().catch(async (err) => {
  console.error("\n✗ Error en el seeder:", err.message);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
