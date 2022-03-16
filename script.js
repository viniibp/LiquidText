const params = new Proxy(new URLSearchParams(window.location.search), {
  get: (searchParams, prop) => searchParams.get(prop),
});


const canvas = document.getElementById('canvas1');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let particleArray = [];
let adjustX = 30;
let adjustY = 25;

let attract = false;

// handle mouse
const mouse = {
  x: null,
  y: null,
  radius: 255
};

window.addEventListener('mousemove', function (event) {
  mouse.x = event.x;
  mouse.y = event.y;
  // console.log(mouse.x, mouse.y);
});

window.addEventListener('mousedown', () => attract = !attract);

const text = params.text ? params.text : 'A';

ctx.fillStyle = 'white';
ctx.font = '30px Verdana';
ctx.fillText(text, 0, 30);
const textCoordinates = ctx.getImageData(0, 0, 300, 100);

class Particle {
  constructor(x, y, startX = 0, startY = 0) {
    this.x = startX === 0 ? x : startX;
    this.y = startY === 0 ? y : startY;
    this.size = 3;
    this.baseX = x;
    this.baseY = y;
    this.density = (Math.random() * 40) + 5;
    this.color = 'white'
  }

  draw() {
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fill();
  }

  update() {
    let dx = mouse.x - this.x;
    let dy = mouse.y - this.y;

    let distance = Math.sqrt(dx * dx + dy * dy);
    let forceDirectionX = dx / distance;
    let forceDirectionY = dy / distance;
    let maxDistance = mouse.radius;
    let force = (maxDistance - distance) / maxDistance;
    let directionX = forceDirectionX * force * this.density;
    let directionY = forceDirectionY * force * this.density;

    const movSpeed = 10;

    if (distance < mouse.radius) {
      this.color = `rgba(255,${distance % 255},${distance % 255},1)`;
      this.x -= !attract ? directionX / movSpeed : directionX * (-1) / movSpeed;
      this.y -= !attract ? directionY / movSpeed : directionY * (-1) / movSpeed;
    } else {
      if (this.x !== this.baseX) {
        let dx = this.x - this.baseX;
        this.x -= dx / movSpeed * .1;
      }
      if (this.y !== this.baseY) {
        let dy = this.y - this.baseY;
        this.y -= dy / movSpeed * .1;
      }
    }
  }

}

function init() {
  particleArray = [];
  for (let y = 0, y2 = textCoordinates.height; y < y2; y++) {
    for (let x = 0, x2 = textCoordinates.width; x < x2; x++) {
      // 128 é aproximadamente 50% de 255
      if (textCoordinates.data[(y * 4 * textCoordinates.width) + (x * 4) + 3] > 128) {
        let positionX = x + adjustX;
        let positionY = y + adjustY;
        let startX = (positionX * 10) + 300;
        let startY = (positionY * 10) - 300;
        particleArray.push(new Particle(positionX * 10, positionY * 10, startX, startY));
      }
    }
  }
}

init();

console.log(particleArray)

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particleArray.forEach(element => {
    element.draw();
    element.update();
  });
  connect();
  requestAnimationFrame(animate);
};

animate();

function connect() {
  let opacityValue = 1;
  const hypotenouse = (x, y) => Math.sqrt(x * x + y * y);
  for (let a = 0; a < particleArray.length; a++) {
    for (let b = a; b < particleArray.length; b++) {
      let dx = particleArray[a].x - particleArray[b].x;
      let dy = particleArray[a].y - particleArray[b].y;
      let distance = hypotenouse(dx, dy);
      opacityValue = 1 - (distance / 50);
      // ctx.strokeStyle = `rgba(255,${distance % 255},${distance % 255},` + opacityValue + ')';
      ctx.strokeStyle = 'rgba(255, 255, 255, ' + 1 + ')';
      if (distance < 50) {
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(particleArray[a].x, particleArray[a].y);
        ctx.lineTo(particleArray[b].x, particleArray[b].y);
        ctx.stroke();

      }
    }
  }
}