//Global Variables
const SIZE = 320;
const MINSEED = (-2) ** 63;
const MAXSEED = 2 ** 63;
const DEFAULTSEED = 12345;
const DEFAULTOCTAVES = 6;
const DEFAULTPERSISTENCE = 0.5;
const DEFAULTLACUNARITY = 2;
let octaves = DEFAULTOCTAVES;
let persistence = DEFAULTPERSISTENCE;
let lacunarity = DEFAULTLACUNARITY;
const borderToggle = document.getElementById("borderToggle");
let grid = false;
let hp = 1;
let lp = 0;
let colors = {
    'DW': [9, 10, 30],
    'W6': [9, 29, 55],
    'W5': [10, 60, 100],
    'W4': [14, 79, 117],
    'W3': [50, 116, 159],     
    'W2': [89, 165, 216],     
    'W1': [145, 229, 246],     
    'B3': [212, 163, 115],  
    'B2': [250, 237, 205],      
    'B1': [254, 250, 224],    
    'L4': [58, 90, 64], 
    'L3': [68, 119, 68],
    'L2': [88, 139, 87],      
    'L1': [163, 177, 138],  
    'D': [209, 205, 203],  
    'S': [255, 255, 255],
    'lp': [255, 0, 0],
    'hp': [255, 0, 0]
}

//canvas setup - default color black
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
ctx.fillStyle = "black"; 
ctx.fillRect(0, 0, canvas.width, canvas.height);

//Set and get seed
let seed = DEFAULTSEED;
let generator = new MersenneTwister(seed); 

function getSeed(seed){
    if (seed == null) {
        seed = randomSeed(MINSEED, MAXSEED);
    }
    return seed;
}

function randomSeed(min, max){
    min = Math.ceil(min); 
    max = Math.floor(max); 
    return Math.floor(generator.random() * (max - min + 1)) + min;
}

//retrieve perlin noise grid values
let perlinArr = createArray(SIZE);

function generate(){
    let landscapeArr = createTerrain(perlinArr);
    landscapeArr = makeLand(landscapeArr, SIZE);
}
//let landscapeArr = createTerrain(perlinArr);

generate();
function createTerrain(){
    let noiseArr = createArray(SIZE);
    noiseArr = assignVectors(noiseArr, SIZE);

    for (let y = 0; y < SIZE; y++) {
        let scale = 1.5;
        for (let x = 0; x < SIZE; x++) {
            perlinArr[y][x] = fractalPerlin(noiseArr, SIZE, x/SIZE * scale, y/SIZE * scale, octaves, persistence, lacunarity);
        }
    }
    perlinArr = normalize(perlinArr);
    hp = Math.max(...perlinArr.flat());
    console.log("highPoint: " + hp);
    lp = Math.min(...perlinArr.flat());
    console.log("lowPoint: " + lp);
    return perlinArr;
}

//Color the grid values
//landscapeArr = makeLand(landscapeArr, SIZE);

function makeLand(arr){
    const cellWidth = canvas.width / SIZE;  
    const cellHeight = canvas.height / SIZE; 
    for (let i = 0; i < SIZE; i++){
        for (let j = 0; j < SIZE; j++){
            let key;
            if(arr[i][j] == lp) key = 'lp';
            else if(arr[i][j] == hp) key = 'hp';
            else if(arr[i][j] < 0.1) key = 'S';
            else if(arr[i][j] < 0.15) key = 'D';
            else if(arr[i][j] < 0.2) key = 'L1';
            else if(arr[i][j] < 0.25) key = 'L2';
            else if(arr[i][j] < 0.28) key = 'L3';
            else if(arr[i][j] < 0.33) key = 'L4';
            else if(arr[i][j] < 0.36) key = 'B1';
            else if(arr[i][j] < 0.38) key = 'B2';
            else if(arr[i][j] < 0.40) key = 'B3';
            else if(arr[i][j] < 0.43) key = 'W1';
            else if(arr[i][j] < 0.5) key = 'W2';
            else if(arr[i][j] < 0.60) key = 'W3';
            else if(arr[i][j] < 0.70) key = 'W4';
            else if(arr[i][j] < 0.76) key = 'W5';
            else if(arr[i][j] < 0.85) key = 'W6';
            else key = 'DW';
            arr[i][j] = key;
            
            const c = colors[key];
            ctx.fillStyle = `rgb(${c[0]}, ${c[1]}, ${c[2]})`;
            //ctx.fillRect(j * cellWidth, i * cellHeight, cellWidth, cellHeight);
            ctx.fillRect(
                Math.floor(j * cellWidth),
                Math.floor(i * cellHeight),
                Math.ceil(cellWidth),
                Math.ceil(cellHeight)
            );
        }
    }
    return arr;
}


//********************* PERLIN NOISE ALGORITHM FUNCTIONS */

//create generic array
function createArray(SIZE){
    if (SIZE == null){
        SIZE = 10;
    }
    const arr = Array.from({length: SIZE}, () => Array.from({length: SIZE}, () => 0));
    return arr;
}

//assign random vectors
function assignVectors(noiseArr, SIZE){
    for (let i = 0; i < SIZE; i++){
        for (let j = 0; j < SIZE; j++){
            let angle = generator.random() * (2 * Math.PI);
            let x = Math.cos(angle);
            let y = Math.sin(angle);
            noiseArr[i][j] = [x, y];
        }
    }
    return noiseArr;
}

//get dot product
function dotProduct(noiseArr, SIZE, x0, y0){
    let x1 = (Math.floor(x0)) % (SIZE);
    let y1 = (Math.floor(y0)) % (SIZE);

    let bottomLeft = [x1, y1];
    let bottomRight = [(x1 + 1) % SIZE, y1];
    let topLeft = [x1, (y1 + 1) % SIZE];
    let topRight = [(x1 + 1) % SIZE, (y1 + 1) % SIZE];

        
    let dxBl = x0 - bottomLeft[0];
    let dyBl = y0 - bottomLeft[1];
    let dxBr = x0 - bottomRight[0];
    let dyBr = y0 - bottomRight[1];
    let dxTl = x0 - topLeft[0];
    let dyTl = y0 - topLeft[1];
    let dxTr = x0 - topRight[0];
    let dyTr = y0 - topRight[1];

    let vectorBl = noiseArr[bottomLeft[1]][bottomLeft[0]];
    let vectorBr = noiseArr[bottomRight[1]][bottomRight[0]];
    let vectorTl = noiseArr[topLeft[1]][topLeft[0]];
    let vectorTr = noiseArr[topRight[1]][topRight[0]];

    let dotBl = vectorBl[0] * dxBl + vectorBl[1] * dyBl;
    let dotBr = vectorBr[0] * dxBr + vectorBr[1] * dyBr;
    let dotTl = vectorTl[0] * dxTl + vectorTl[1] * dyTl;
    let dotTr = vectorTr[0] * dxTr + vectorTr[1] * dyTr;

    return [dotBl, dotBr, dotTl, dotTr];
}

//lerp
function lerp(t, a, b){
    return a + t * (b - a);
}

//fade
function fade(t){
    return (6 * t ** 5) - (15 * t ** 4) + (10 * t ** 3);
}

//normalization
function normalize(noiseArr) {
    const vals = noiseArr.flat();
    const minVal = Math.min(...vals);
    const maxVal = Math.max(...vals);
  
    const normArr = noiseArr.map(row =>
      row.map(v => (v - minVal) / (maxVal - minVal))
    );
  
    return normArr;
}

//do perlin noise
function doPerlinNoise(noiseArr, SIZE, x0, y0){
    let [dotBl, dotBr, dotTl, dotTr] = dotProduct(noiseArr, SIZE, x0, y0);

    let dx = x0 - Math.floor(x0);
    let dy = y0 - Math.floor(y0);
    
    let u = fade(dx);
    let v = fade(dy);
      
    let ix0 = lerp(u, dotBl, dotBr);
    let ix1 = lerp(u, dotTl, dotTr);
    let value = lerp(v, ix0, ix1);
    return value;
}

//fractal perlin

function fractalPerlin(noiseArr, SIZE, x, y, octaves, persistence, lacunarity){
    let total = 0;
    let amplitude = 1;
    let maxVal = 0;

    for (let i = 0; i < octaves; i++){
        total += doPerlinNoise(noiseArr, SIZE, x * lacunarity, y * lacunarity) * amplitude;
        maxVal += amplitude;
        amplitude *= persistence;
        lacunarity *= 2;
    }

    return total / maxVal;
}

/*
todo 
1. clean and organize code
2. add vairables for adjustments
3. add working buttons that dont refresh page
4. adjust land values
5. generate chunks
6. use other things like heat maps, humidity
7. do random weather maps
8. add stats like highest and lowest point of chunk
9. fix squash and stretch
10. download picture of world
11.lighting
12. reset map
13. pan/drag map
14. grid toggle
15. fullscreen
16. shareable link
17. labels
18. minimap
19. coords
20. distance measuring
21. area/ perimeter
22. pins
23. path generator
24. rivers/lakes based on slope
25. valcanoes
26. seed at 0 = 12345 FIX!!!!!!


Variables:

- seed
- octaves
- scale -> zoom
- persistence
- lacunarity
- amplitude -> make useful, functionless rn
- custom colors based on level
- coordinates based on chunk and click
- grid based on chunk SIZE
- perlin numbers instead of color option
*/

/******** GET USER INPUTS*/

const inputSeed = document.getElementById("seedInput");
const inputOctaves = document.getElementById("octavesInput");
const inputPersistence = document.getElementById("persistenceInput");
const inputLacunarity = document.getElementById("lacunarityInput");
const btn = document.getElementById("btn");
inputSeed.value = seed;
inputOctaves.value = octaves;
inputPersistence.value = persistence;
inputLacunarity.value = lacunarity;
btn.addEventListener("click", () => {
    seed = parseInt(inputSeed.value) || DEFAULTSEED;

    // Re-create the generator with the seed
    generator = new MersenneTwister(seed);

    octaves = parseFloat(inputOctaves.value) || DEFAULTOCTAVES;
    persistence = parseFloat(inputPersistence.value) || DEFAULTPERSISTENCE;
    lacunarity = parseFloat(inputLacunarity.value) || DEFAULTLACUNARITY;
    
    generate();
});
