import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import axios from "axios";

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

// --- Games to pull from RAWG (real ids + images) ----------------------------
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
];

// --- Playlists (owner + name + game titles) ---------------------------------
const PLAYLISTS = [
  { user: "luci_plays", name: "Mis GOTY personales", description: "Los que me marcaron de verdad.", games: ["Elden Ring", "The Witcher 3: Wild Hunt", "Hades"] },
  { user: "tincho.gg", name: "Para sufrir 🗡️", description: "Soulslike y compañía. Traé paciencia.", games: ["Hollow Knight", "Elden Ring", "Celeste"] },
  { user: "sofi_pixel", name: "Joyitas indie", description: "Presupuesto chico, corazón enorme.", games: ["Hollow Knight", "Celeste", "Stardew Valley"] },
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
  const res = await axios.get("https://api.rawg.io/api/games", {
    params: { key: process.env.API_KEY, search: title, search_precise: true, page_size: 5 },
  });
  const results = res.data?.results || [];
  const pick = results.find((g) => g.background_image) || results[0];
  if (!pick || !pick.background_image) {
    throw new Error(`RAWG no devolvió un juego válido para "${title}"`);
  }
  return { gameId: String(pick.id), gameName: pick.name, imageUrl: pick.background_image };
}

async function run() {
  if (!process.env.MONGO_URI) throw new Error("Falta MONGO_URI en el .env de api/");
  if (!process.env.API_KEY) throw new Error("Falta API_KEY (RAWG) en el .env de api/");

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

  // 2) Games from RAWG -------------------------------------------------------
  const gamesByTitle = {};
  for (const title of GAME_TITLES) {
    gamesByTitle[title] = await fetchGame(title);
  }
  console.log(`✓ ${GAME_TITLES.length} juegos traídos de RAWG`);

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
