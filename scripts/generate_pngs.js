const fs = require('fs');
const path = require('path');
const { Resvg } = require('@resvg/resvg-js');

const svgDir = path.join(__dirname, '../assets/logo');
const outDir = path.join(__dirname, '../assets/logo');
const publicDir = path.join(__dirname, '../frontend/public/logo');

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

const files = [
  { input: 'prep_ai_logo_full.svg', output: 'prep_ai_logo_full.png', width: 2400 },
  { input: 'prep_ai_logo_icon.svg', output: 'prep_ai_logo_icon.png', width: 2000 },
  { input: 'prep_ai_logo_horizontal.svg', output: 'prep_ai_logo_horizontal.png', width: 3280 },
  { input: 'prep_ai_logo_dark.svg', output: 'prep_ai_logo_dark.png', width: 2400 },
  { input: 'prep_ai_logo_transparent.svg', output: 'prep_ai_logo_transparent.png', width: 2400 }
];

files.forEach(({ input, output, width }) => {
  const svgPath = path.join(svgDir, input);
  if (!fs.existsSync(svgPath)) {
    console.error(`Missing SVG: ${svgPath}`);
    return;
  }
  const svgBuffer = fs.readFileSync(svgPath);
  const opts = {
    fitTo: {
      mode: 'width',
      value: width,
    },
  };
  const resvg = new Resvg(svgBuffer, opts);
  const pngData = resvg.render();
  const pngBuffer = pngData.asPng();

  const outPath = path.join(outDir, output);
  const publicPath = path.join(publicDir, output);

  fs.writeFileSync(outPath, pngBuffer);
  fs.writeFileSync(publicPath, pngBuffer);

  console.log(`Generated ${output} (${pngData.width}x${pngData.height} px)`);
});
