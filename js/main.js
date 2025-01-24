import * as THREE from 'three';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector('#webgl'),
  antialias: true,
});
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const camera1 = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera1.position.set(0, 15, 15);
camera1.lookAt(0, 0, 0);

const camera2 = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera2.position.set(0, 15, -15);
camera2.lookAt(0, 0, 0);

let score1 = 0, score2 = 0, maxScore = 5;

const scoreDiv = document.createElement('div');
scoreDiv.style.position = 'absolute';
scoreDiv.style.top = '10px';
scoreDiv.style.left = '10px';
scoreDiv.style.color = '#fff';
scoreDiv.style.fontFamily = 'Arial, sans-serif';
scoreDiv.style.fontSize = '20px';
document.body.appendChild(scoreDiv);

function updateScore() {
  scoreDiv.textContent = `Score — Joueur 1: ${score1} | Joueur 2: ${score2}`;
}
updateScore();

scene.add(new THREE.AmbientLight(0xffffff, 0.5));
const light = new THREE.PointLight(0xffffff, 0.8);
light.position.set(0, 20, 10);
scene.add(light);

// Table
const floorGeo = new THREE.PlaneGeometry(10, 20);
const floorMat = new THREE.MeshStandardMaterial({ color: 0x555555 });
const floor = new THREE.Mesh(floorGeo, floorMat);
floor.rotation.x = -Math.PI / 2;
scene.add(floor);

// Murs
const wallMat = new THREE.MeshStandardMaterial({ color: 0x333333 });
const leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.2, 2, 20), wallMat);
leftWall.position.set(-5, 1, 0);
scene.add(leftWall);
const rightWall = new THREE.Mesh(new THREE.BoxGeometry(0.2, 2, 20), wallMat);
rightWall.position.set(5, 1, 0);
scene.add(rightWall);

// Raquettes horizontales (largeur x=2, profondeur z=1)
const padGeo = new THREE.BoxGeometry(2, 0.5, 1);

// Joueur 1 = bleu
const p1Mat = new THREE.MeshStandardMaterial({ color: 0x0000ff });
const paddle1 = new THREE.Mesh(padGeo, p1Mat);
paddle1.position.set(0, 0.25, 8);
scene.add(paddle1);

// Joueur 2 = rouge
const p2Mat = new THREE.MeshStandardMaterial({ color: 0xff0000 });
const paddle2 = new THREE.Mesh(padGeo, p2Mat);
paddle2.position.set(0, 0.25, -8);
scene.add(paddle2);

const ballGeo = new THREE.SphereGeometry(0.3, 16, 16);
const ballMat = new THREE.MeshStandardMaterial({ color: 0xff0000 });
const ball = new THREE.Mesh(ballGeo, ballMat);
ball.position.set(0, 0.3, 0);
scene.add(ball);

let bx = 0.1, bz = 0.1, dir1 = 0, dir2 = 0, speed = 0.2;

window.addEventListener('keydown', e => {
  if (e.key === 'q') dir1 = -1;
  if (e.key === 'd') dir1 = 1;
  if (e.key === 'ArrowLeft') dir2 = 1;
  if (e.key === 'ArrowRight') dir2 = -1;
});
window.addEventListener('keyup', e => {
  if (e.key === 'q' || e.key === 'd') dir1 = 0;
  if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') dir2 = 0;
});

function resetBall() {
  ball.position.set(0, 0.3, 0);
  bx = (Math.random() > 0.5 ? 1 : -1) * 0.1;
  bz = (Math.random() > 0.5 ? 1 : -1) * 0.1;
  if (score1 >= maxScore || score2 >= maxScore) {
    alert(score1 >= maxScore ? 'Joueur 1 gagne!' : 'Joueur 2 gagne!');
    score1 = 0;
    score2 = 0;
    updateScore();
  }
}

function update() {
  paddle1.position.x += dir1 * speed;
  paddle2.position.x += dir2 * speed;
  paddle1.position.x = Math.max(Math.min(paddle1.position.x, 4.3), -4.3);
  paddle2.position.x = Math.max(Math.min(paddle2.position.x, 4.3), -4.3);

  ball.position.x += bx;
  ball.position.z += bz;
  if (ball.position.x <= -4.7 || ball.position.x >= 4.7) bx *= -1;
  if (ball.position.z > 7.5 && Math.abs(ball.position.x - paddle1.position.x) < 1) bz *= -1;
  if (ball.position.z < -7.5 && Math.abs(ball.position.x - paddle2.position.x) < 1) bz *= -1;
  if (ball.position.z > 10) {
    score2++; updateScore(); resetBall();
  }
  if (ball.position.z < -10) {
    score1++; updateScore(); resetBall();
  }
}

function animate() {
  requestAnimationFrame(animate);
  update();

  renderer.setViewport(0, 0, window.innerWidth / 2, window.innerHeight);
  renderer.setScissor(0, 0, window.innerWidth / 2, window.innerHeight);
  renderer.setScissorTest(true);
  renderer.render(scene, camera1);

  renderer.setViewport(window.innerWidth / 2, 0, window.innerWidth / 2, window.innerHeight);
  renderer.setScissor(window.innerWidth / 2, 0, window.innerWidth / 2, window.innerHeight);
  renderer.setScissorTest(true);
  renderer.render(scene, camera2);
}

animate();

window.addEventListener('resize', () => {
  camera1.aspect = window.innerWidth / window.innerHeight;
  camera1.updateProjectionMatrix();
  camera2.aspect = window.innerWidth / window.innerHeight;
  camera2.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
