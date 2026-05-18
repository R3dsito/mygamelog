import GameScore from "../models/GameScore.js";

// Todas las operaciones son O(1): usamos scoreSum en lugar de recalcular desde cero.

export const onReviewCreated = async (gameId, rating) => {
  const doc = await GameScore.findOneAndUpdate(
    { gameId },
    { $inc: { totalReviews: 1, scoreSum: rating } },
    { upsert: true, new: true }
  );
  doc.averageScore = doc.scoreSum / doc.totalReviews;
  await doc.save();
};

export const onReviewUpdated = async (gameId, oldRating, newRating) => {
  if (oldRating === newRating) return;
  const doc = await GameScore.findOne({ gameId });
  if (!doc) return;
  doc.scoreSum = doc.scoreSum - oldRating + newRating;
  doc.averageScore = doc.totalReviews > 0 ? doc.scoreSum / doc.totalReviews : 0;
  await doc.save();
};

export const onReviewDeleted = async (gameId, rating) => {
  const doc = await GameScore.findOne({ gameId });
  if (!doc) return;
  doc.totalReviews = Math.max(0, doc.totalReviews - 1);
  doc.scoreSum = Math.max(0, doc.scoreSum - rating);
  doc.averageScore = doc.totalReviews > 0 ? doc.scoreSum / doc.totalReviews : 0;
  await doc.save();
};

export const getGameScore = async (gameId) => {
  const doc = await GameScore.findOne({ gameId });
  if (!doc) return { averageScore: 0, totalReviews: 0 };
  return { averageScore: doc.averageScore, totalReviews: doc.totalReviews };
};
