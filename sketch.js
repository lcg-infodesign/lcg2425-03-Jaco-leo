let rivers = [];

function preload() {
  rivers = loadTable('Rivers in the world - Data.csv', 'csv', 'header');
}

function setup() {
  let totalWidth = calculateCanvasWidth();
  let totalHeight = calculateCanvasHeight();

  if (totalHeight > windowHeight * 2) {
    createCanvas(totalWidth, windowHeight); // Visualizzazione orizzontale
  } else {
    createCanvas(windowWidth, totalHeight); // Visualizzazione verticale
  }

  noLoop();
  drawVisualization();
}

function calculateCanvasWidth() {
  return rivers.getRowCount() * (windowWidth / 3); // Spaziatura tra i fiumi
}

function calculateCanvasHeight() {
  return rivers.getRowCount() * (windowHeight / 1.5); // Altezza dinamica
}

function removeDuplicates(data) {
  let uniqueNames = new Set();
  let uniqueRows = [];
  for (let i = 0; i < data.getRowCount(); i++) {
    let name = data.getString(i, 'name');
    if (!uniqueNames.has(name)) {
      uniqueNames.add(name);
      uniqueRows.push(data.getRow(i));
    }
  }
  return uniqueRows;
}

function drawVisualization() {
  background(60); // Grigio chiaro

  drawLegend(); // Disegna la legenda

  let rows = removeDuplicates(rivers);
  let maxLength = 0, minTemp = Infinity, maxTemp = -Infinity, maxTributaries = 0;

  // Trova i valori massimi e minimi
  for (let row of rows) {
    let length = float(row.get('length'));
    let avgTemp = float(row.get('avg_temp'));
    let tributaries = int(row.get('tributaries'));
    maxLength = max(maxLength, length);
    minTemp = min(minTemp, avgTemp);
    maxTemp = max(maxTemp, avgTemp);
    maxTributaries = max(maxTributaries, tributaries);
  }

  let maxCirclesPerRing = ceil(sqrt(maxTributaries) * 3); // Incremento della densità

  let maxDiameter = min(width, height) / 5;
  let spacing = maxDiameter + 300; // Spaziatura aumentata

  for (let i = 0; i < rows.length; i++) {
    let row = rows[i];
    let length = float(row.get('length'));
    let avgTemp = float(row.get('avg_temp'));
    let tributaries = int(row.get('tributaries'));
    let name = row.get('name');

    // Mappa valori
    let diameter = map(length, 0, maxLength, 50, maxDiameter);
    let colorValue = map(avgTemp, minTemp, maxTemp, 255, 0); // Bianco (freddo) a Blu (caldo)

    // Calcola posizione
    let isHorizontal = width > height;
    let x = isHorizontal ? (spacing * (i + 1)) : width / 2;
    let yOffset = (i % 2 === 0 ? -100 : 100); // Posizionamento sfalsato
    let y = (isHorizontal ? height / 2 : spacing * (i + 1)) + yOffset;

    // Disegna cerchio principale
    fill(colorValue, colorValue, 255);
    noStroke();
    ellipse(x, y, diameter);

    // Disegna cerchi per affluenti
    let tributaryRadius = 5; // Ridotto per maggiore spazio
    let ringSpacing = tributaryRadius * 2.5; // Maggiore distanza tra gli anelli
    let currentTributary = 0;

    while (currentTributary < tributaries) {
      let ringNumber = floor(currentTributary / maxCirclesPerRing);
      let tributariesInThisRing = min(maxCirclesPerRing, tributaries - currentTributary);
      let ringRadius = diameter / 2 + ringSpacing * (ringNumber + 1);

      for (let j = 0; j < tributariesInThisRing; j++) {
        let angle = map(j, 0, tributariesInThisRing, 0, TWO_PI);
        let tx = x + cos(angle) * ringRadius;
        let ty = y + sin(angle) * ringRadius;

        fill(180, 200, 240); // Colore tenue per gli affluenti
        ellipse(tx, ty, tributaryRadius);
      }

      currentTributary += tributariesInThisRing;
    }

    // Mostra nome del fiume
    textAlign(CENTER);
    textSize(14);
    fill(255); // Nome in bianco

    let nameOffset = diameter + 50 + (ringSpacing * ceil(tributaries / maxCirclesPerRing));
    if (y > height / 2) {
      // Nome sopra se il cerchio è più in basso
      text(name, x, y - nameOffset);
    } else {
      // Nome sotto se il cerchio è più in alto
      text(name, x, y + nameOffset);
    }
  }
}

function drawLegend() {
  textSize(16);
  textAlign(LEFT);
  fill(0);
  noStroke();

  // Box della legenda
  let legendX = 20;
  let legendY = 20;
  let legendWidth = 220;
  let legendHeight = 130;
  fill(215);
  rect(legendX, legendY, legendWidth, legendHeight, 10);

  // Titolo della legenda
  fill(0);
  textSize(16);
  text("Legenda:", legendX + 10, legendY + 20);

  // Colore per temperatura
  fill(0, 0, 255);
  rect(legendX + 10, legendY + 50, 40, 20);
  fill(255, 255, 255);
  rect(legendX + 10, legendY + 75, 40, 20);
  fill(0);
  textSize(12);
  text("Temperatura", legendX + 10, legendY + 45);
  text("Alta (blu)", legendX + 60, legendY + 64);
  text("Bassa (bianco)", legendX + 60, legendY + 89);

  // Icona affluenti
  fill(180, 200, 240);
  ellipse(legendX + 30, legendY + 110, 10);
  fill(0);
  text("Affluenti", legendX + 60, legendY + 115);

}

function windowResized() {
  let totalWidth = calculateCanvasWidth();
  let totalHeight = calculateCanvasHeight();

  if (totalHeight > windowHeight * 2) {
    resizeCanvas(totalWidth, windowHeight);
  } else {
    resizeCanvas(windowWidth, totalHeight);
  }

  drawVisualization();
}
