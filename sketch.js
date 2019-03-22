const canvasSketch = require('canvas-sketch');
const random = require('canvas-sketch-util/random');
const { inverseLerp, lerp } = require('canvas-sketch-util/math');
const Color = require('canvas-sketch-util/color');
const palettes = require('nice-color-palettes/1000.json');
const paletteSize = 5;

/**
 * Input
 */

const settings = {
  dimensions: [ 2048, 2048 ]
};

const gridCount = [ 13, 22 ];

// 0 to 1
const noiseFrequency = 0.04;
const noiseAmplitude = 0.8;

const seed = random.getRandomSeed();
random.setSeed(seed);

// eslint-disable-next-line no-console
console.log('seed:', seed);

const diamondDimensions = [
  settings.dimensions[0] / (gridCount[0] - 1),
  (settings.dimensions[1] * 2) / (gridCount[1] - 1)
];

const subDiamondCount = paletteSize;


/**
 * Process
 */

const palette = random.pick(palettes);

const diamondGrid = Array.from({ length: gridCount[0] }, (emptyColumn, columnIndex) => {
  return Array.from({ length: gridCount[1] }, (emptyRow, rowIndex) => {
    return Array.from({ length: subDiamondCount }, (emptyStack, stackIndex) => {
      const sizeNoise = inverseLerp(-1, 1, random.noise4D(columnIndex, rowIndex, stackIndex, 0, noiseFrequency, noiseAmplitude));
      
      const widthOffset = stackIndex * diamondDimensions[0] * sizeNoise / subDiamondCount;
      const width = diamondDimensions[0] - widthOffset;

      const heightOffset = stackIndex * diamondDimensions[1] * sizeNoise / subDiamondCount;
      const height = diamondDimensions[1] - heightOffset;
      
      const evenBottomX = columnIndex * diamondDimensions[0];
      const bottomX = rowIndex % 2 ? evenBottomX + diamondDimensions[0] / 2 : evenBottomX
      const bottomY = (rowIndex + 1) * diamondDimensions[1] / 2;

      const hueNoise = random.noise4D(columnIndex, rowIndex, stackIndex, 1, noiseFrequency, noiseAmplitude);
      const hueOffset = lerp(0, 360, inverseLerp(-1, 1, hueNoise));
      const saturationNoise = random.noise4D(columnIndex, rowIndex, stackIndex, 2, noiseFrequency, noiseAmplitude);
      const saturationOffset = lerp(-100, 100, inverseLerp(-1, 1, saturationNoise));
      const lightnessNoise = random.noise4D(columnIndex, rowIndex, stackIndex, 3, noiseFrequency, noiseAmplitude);
      const lightnessOffset = lerp(-100, 100, inverseLerp(-1, 1, lightnessNoise));

      const colorIndex = stackIndex;
      const pureColor = palette[colorIndex];
      const color = Color.offsetHSL(pureColor, hueOffset, saturationOffset, lightnessOffset).hex;
  
      return {
        bottomX,
        bottomY,
        width,
        height,
        color
      };
    });
  });
});

const drawDiamond = ({
  context,
  bottomX,
  bottomY,
  color,
  width,
  height
}) => {
  const bottom = [bottomX, bottomY];
  const left = [bottomX - width / 2, bottomY - height / 2];
  const top = [bottomX, bottomY - height];
  const right = [bottomX + width / 2, bottomY - height / 2];

  context.fillStyle = color;

  context.beginPath();
  context.moveTo(top[0], top[1]);
  context.lineTo(right[0], right[1]);
  context.lineTo(bottom[0], bottom[1]);
  context.lineTo(left[0], left[1]);
  context.fill();
};


/**
 * Output
 */

const sketch = () => {
  return ({ context }) => {
    diamondGrid.forEach(column => {
      column.forEach(row => {
        row.forEach(diamond => {
          drawDiamond({
            context,
            width: diamondDimensions[0],
            height: diamondDimensions[1],
            ...diamond
          });
        });
      });
    })
  };
};

canvasSketch(sketch, settings);
