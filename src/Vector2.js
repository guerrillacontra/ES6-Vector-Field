export const zero = () => {
  return { x: 0, y: 0 };
};

export const sub = (a, b) => {
  return { x: a.x - b.x, y: a.y - b.y };
};
export const add = (a, b) => {
  return { x: a.x + b.x, y: a.y + b.y };
};

export const mult = (a, b) => {
  return { x: a.x * b.x, y: a.y * b.y };
};

export const scale = (v, scaleFactor) => {
  return { x: v.x * scaleFactor, y: v.y * scaleFactor };
};

export const mag = v => {
  return Math.sqrt(v.x * v.x + v.y * v.y);
};

export const dot =  (a, b) => {
  return (a.x * b.x + a.y * b.y);
};

export const normalized = v => {
  const m = mag(v);

  if (m === 0) {
    return { x: 0, y: 0 };
  }
  return { x: v.x / m, y: v.y / m };
};
