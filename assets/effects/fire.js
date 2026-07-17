const canvas = document.querySelector("#effect-canvas");
const context = canvas.getContext("2d", { alpha: false });

const pixelScale = 4;
const paletteSize = 16;
const maximumIntensity = paletteSize - 1;
const coolingProbability = pixelScale / 20;
const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)",
).matches;

const hsvToRgb = (hue, saturation, value) => {
  const normalizedSaturation = Math.max(0, Math.min(1, saturation));
  const normalizedValue = Math.max(0, Math.min(1, value));
  const sector = (hue / 60) % 6;
  const chroma = normalizedValue * normalizedSaturation;
  const secondary = chroma * (1 - Math.abs((sector % 2) - 1));
  const offset = normalizedValue - chroma;

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
  const hue = (index / paletteSize) * 65;
  const saturation = (300 - (index / paletteSize) * 300) / 100;
  const brightness = ((index / paletteSize) * 200) / 100;
  const [red, green, blue] = hsvToRgb(hue, saturation, brightness);
  const offset = index * 3;

  palette[offset] = red;
  palette[offset + 1] = green;
  palette[offset + 2] = blue;
}

let width = 0;
let height = 0;
let intensities;
let frame;

const resize = () => {
  width = Math.max(1, Math.floor(window.innerWidth / pixelScale));
  height = Math.max(1, Math.floor(window.innerHeight / pixelScale));
  canvas.width = width;
  canvas.height = height;
  intensities = new Float32Array(width * height);
  frame = context.createImageData(width, height);
};

const updateAndDraw = () => {
  const pixels = frame.data;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const index = x + y * width;

      if (y === height - 1) {
        intensities[index] = maximumIntensity;
      } else {
        intensities[index] =
          (intensities[index] + intensities[index + width]) / 2;

        if (Math.random() < coolingProbability) {
          intensities[index] -= 1;
        }
      }

      const paletteIndex = Math.max(
        0,
        Math.min(maximumIntensity, Math.floor(intensities[index])),
      );
      const paletteOffset = paletteIndex * 3;
      const pixelOffset = index * 4;

      pixels[pixelOffset] = palette[paletteOffset];
      pixels[pixelOffset + 1] = palette[paletteOffset + 1];
      pixels[pixelOffset + 2] = palette[paletteOffset + 2];
      pixels[pixelOffset + 3] = 255;
    }
  }

  context.putImageData(frame, 0, 0);
};

const render = () => {
  updateAndDraw();

  if (!prefersReducedMotion) {
    window.requestAnimationFrame(render);
  }
};

window.addEventListener("resize", resize);
resize();
render();
