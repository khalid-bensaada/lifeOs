export const LEVEL_NAMES = ["Beginner", "Intermediate", "Advanced", "Expert"];

export const skillProgress = (k) => {
  const all = k.levels.flatMap((l) => l.milestones);
  return all.length
    ? Math.round((100 * all.filter((m) => m.done).length) / all.length)
    : 0;
};

export const levelComplete = (l) =>
  l.milestones.length > 0 && l.milestones.every((m) => m.done);

export const currentLevel = (k) => {
  const i = k.levels.findIndex((l) => !levelComplete(l));
  return i === -1
    ? { index: 3, mastered: true }
    : { index: i, mastered: false };
};
