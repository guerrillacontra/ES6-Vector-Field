import { lerp } from "./Math.js";

export const RGBToHex = (r, g, b, a) => {
  r = Math.round(r * 255).toString(16);
  g = Math.round(g * 255).toString(16);
  b = Math.round(b * 255).toString(16);
  a = Math.round(a * 255).toString(16);

  if (r.length == 1) r = "0" + r;
  if (g.length == 1) g = "0" + g;
  if (b.length == 1) b = "0" + b;
  if (a.length == 1) a = "0" + a;

  return "#" + r + g + b + a;
};

export const blendRGB = (first, last, amount) => {
  let final = { r: 0, g: 0, b: 0, a: 0 };
  final.r = lerp(first.r, last.r, amount);
  final.g = lerp(first.g, last.g, amount);
  final.b = lerp(first.b, last.b, amount);
  final.a = lerp(first.a, last.a, amount);
  return final;
};
