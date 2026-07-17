const canvas = document.querySelector("#effect-canvas");
const context = canvas.getContext("2d", { alpha: false });

const pixelScale = 4;
const paletteSize = 256;
const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)",
).matches;

const hsvToRgb = (hue, saturation = 1, value = 1) => {
  const sector = (hue / 60) % 6;
  const chroma = value * saturation;
  const secondary = chroma * (1 - Math.abs((sector % 2) - 1));
  const offset = value - chroma;

  const [red, green, blue] = [
    [chroma, secondary, 0],
    [secondary, chroma, 0],
    [0, chroma, secondary],
    [0, secondary, chroma],
    [secondary, 0, chroma],
    [chroma, 0, secondary],
  ][Math.floor(sector)];

  return [red, green, blue].map((channel) =>
    Math.round((channel + offset) * 255),
  );
};

const palette = new Uint8ClampedArray(paletteSize * 3);

for (let index = 0; index < paletteSize; index += 1) {
  const [red, green, blue] = hsvToRgb((index / paletteSize) * 360);
  const offset = index * 3;

  palette[offset] = red;
  palette[offset + 1] = green;
  palette[offset + 2] = blue;
}

let width = 0;
let height = 0;
let frame;

const resize = () => {
  width = Math.max(1, Math.floor(window.innerWidth / pixelScale));
  height = Math.max(1, Math.floor(window.innerHeight / pixelScale));
  canvas.width = width;
  canvas.height = height;
  frame = context.createImageData(width, height);
};

const render = (timestamp = 0) => {
  const time = timestamp / 1000;
  const centerX = width / 2;
  const centerY = height / 2;
  const frequency = 0.075;
  const pixels = frame.data;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const horizontal = Math.sin(x * frequency + time * 1.4);
      const vertical = Math.sin(y * frequency + time * 0.9);
      const radial = Math.sin(
        Math.hypot(x - centerX, y - centerY) * frequency - time * 1.2,
      );

      const intensity = Math.round(
        ((horizontal + vertical + radial + 3) / 6) * (paletteSize - 1),
      );
      const paletteOffset = intensity * 3;
      const pixelOffset = (x + y * width) * 4;

      pixels[pixelOffset] = palette[paletteOffset];
      pixels[pixelOffset + 1] = palette[paletteOffset + 1];
      pixels[pixelOffset + 2] = palette[paletteOffset + 2];
      pixels[pixelOffset + 3] = 255;
    }
  }

  context.putImageData(frame, 0, 0);

  if (!prefersReducedMotion) {
    window.requestAnimationFrame(render);
  }
};

window.addEventListener("resize", resize);
resize();
render();
