import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

// Configuración de carpetas
// Asumimos que estás ejecutando esto desde la carpeta /scripts
const inputFolder = './plantillas/entra';
const outputFolder = './plantillas/sale';

// Crear carpeta de destino si no existe
if (!fs.existsSync(outputFolder)){
fs.mkdirSync(outputFolder);
}

// Asegurarse de que la carpeta de origen existe
if (!fs.existsSync(inputFolder)){
console.error(`❌ Error: No encuentro la carpeta "${inputFolder}". Por favor créala dentro de 'scripts' y pon tus fotos ahí.`);
process.exit(1);
}

console.log(`🚀 Iniciando optimización...`);

const files = fs.readdirSync(inputFolder);

for (const file of files) {
if (file.match(/\.(png|jpg|jpeg)$/i)) {
const inputPath = path.join(inputFolder, file);
// Cambiamos la extensión a .webp
const outputName = file.replace(/\.[^/.]+$/, "") + ".webp";
const outputPath = path.join(outputFolder, outputName);

sharp(inputPath)
.resize(1200, 1200, {
fit: 'inside', // Mantiene la proporción, no deforma
withoutEnlargement: true // No estira si la imagen es pequeña
})
.webp({ quality: 80 }) // Convierte a WebP calidad 80
.toFile(outputPath)
.then(info => {
console.log(`✅ ${file} -> ${(info.size / 1024).toFixed(2)} KB`);
})
.catch(err => {
console.error(`❌ Error con ${file}:`, err);
});
}
}