const vessels = [
  { name: 'S/EXP', lat: -2.36, lng: 173.15, locationText: 'S0222 E17309 (KI)', dailyCatch: '-', load: '211(92)' },
  { name: 'S/PIO', lat: -3.46, lng: 175.11, locationText: 'S0328 E17507 (KI)', dailyCatch: '125', load: '270' },
  { name: 'S/CHA', lat: -3.50, lng: 175.91, locationText: 'S0330 E17555 (KI)', dailyCatch: '-', load: '760' },
  { name: 'S/HAR', lat: -2.68, lng: 173.75, locationText: 'S0241 E17345 (KI)', dailyCatch: '-', load: '190' },
  { name: 'S/JUP', lat: -3.50, lng: 175.60, locationText: 'S0330 E17536 (KI)', dailyCatch: '-', load: '420' },
  { name: 'S/SPR', lat: -3.50, lng: 176.11, locationText: 'S0330 E17607 (KI)', dailyCatch: '-', load: '680(20)' },
  { name: 'MOAMARI', lat: -2.13, lng: 173.71, locationText: 'S0208 E17343 (KI)', dailyCatch: '-', load: '300' },
  { name: 'MOAKONA', lat: -3.41, lng: 175.05, locationText: 'S0325 E17503 (KI)', dailyCatch: '-', load: '509(49)' },
  { name: 'NAOERO SUN', lat: 5.51, lng: 156.13, locationText: 'N0531 E15608 (FM)', dailyCatch: '-', load: '-' },
  { name: 'NAOERO STAR', lat: -3.51, lng: 175.66, locationText: 'S0331 E17540 (KI)', dailyCatch: '-', load: '515' },
];

function seedRandom(seed) {
    let x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
}

const out = vessels.map((v, i) => {
    let totalLoadStr = v.load.split('(')[0];
    let totalLoad = parseInt(totalLoadStr);
    if(isNaN(totalLoad)) totalLoad = 0;
    
    // Distribute load into 10 holds
    let holds = [];
    let remaining = totalLoad;
    let seed = i * 100;
    for(let h=1; h<=5; h++) {
        for(let side of ['P','S']) {
            let cap = 100; // max 100t per hold
            let fill = 0;
            let species = 'EMPTY';
            if(remaining > 0) {
               fill = remaining > cap ? cap : remaining;
               remaining -= fill;
               // Determine species
               let rand = seedRandom(seed++);
               if(rand > 0.8) species = 'MIX';
               else if(rand > 0.5) species = 'YFT';
               else species = 'SKJ';
            }
            holds.push({ id: h + side, fill, species, capacity: cap });
        }
    }
    return { ...v, holds };
});
console.log("const PACIFIC_VESSELS = " + JSON.stringify(out, null, 2).replace(/"([^"]+)":/g, '$1:') + ";");
