// assets/js/starfield.js

// 1. 场景初始化
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x050505, 0.15);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); 

// 将渲染器生成的 canvas 挂载到 body
document.body.appendChild(renderer.domElement);

// 2. 创建 3D 点云系统
function createParticles(count, color, size) {
    const geometry = new THREE.BufferGeometry();
    const posArray = new Float32Array(count * 3);
    for(let i = 0; i < count * 3; i++) {
        posArray[i] = (Math.random() - 0.5) * 15; 
    }
    geometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const material = new THREE.PointsMaterial({
        size: size,
        color: color,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending
    });
    return new THREE.Points(geometry, material);
}

const particlesCyan = createParticles(3500, 0x00ffff, 0.02);
const particlesMagenta = createParticles(2500, 0xff00ff, 0.015);
scene.add(particlesCyan);
scene.add(particlesMagenta);

camera.position.z = 3;

// 3. 鼠标交互跟踪
let mouseX = 0;
let mouseY = 0;
let targetX = 0;
let targetY = 0;
const windowHalfX = window.innerWidth / 2;
const windowHalfY = window.innerHeight / 2;

document.addEventListener('mousemove', (event) => {
    mouseX = (event.clientX - windowHalfX);
    mouseY = (event.clientY - windowHalfY);
});

let clickBurst = 0;
document.addEventListener('mousedown', () => {
    clickBurst = 1.0; 
});

// 4. 动画循环渲染
const clock = new THREE.Clock();

const animate = () => {
    requestAnimationFrame(animate);
    const elapsedTime = clock.getElapsedTime();

    clickBurst *= 0.92;

    particlesCyan.rotation.y = elapsedTime * 0.05;
    particlesCyan.rotation.x = elapsedTime * 0.02;
    
    particlesMagenta.rotation.y = elapsedTime * -0.03;
    particlesMagenta.rotation.x = elapsedTime * -0.01;

    particlesCyan.position.y = Math.sin(elapsedTime * 0.5) * 0.1;
    particlesMagenta.position.x = Math.cos(elapsedTime * 0.4) * 0.1;

    targetX = mouseX * 0.001;
    targetY = mouseY * 0.001;
    
    particlesCyan.rotation.y += 0.5 * (targetX - particlesCyan.rotation.y);
    particlesCyan.rotation.x += 0.5 * (targetY - particlesCyan.rotation.x);
    
    particlesMagenta.rotation.y += 0.3 * (targetX - particlesMagenta.rotation.y);
    particlesMagenta.rotation.x += 0.3 * (targetY - particlesMagenta.rotation.x);

    const scaleCyan = 1 + clickBurst * 0.5;
    const scaleMagenta = 1 + clickBurst * 0.8;
    particlesCyan.scale.set(scaleCyan, scaleCyan, scaleCyan);
    particlesMagenta.scale.set(scaleMagenta, scaleMagenta, scaleMagenta);
    
    camera.position.z = 3 - clickBurst * 1.5;

    renderer.render(scene, camera);
};
animate();

// 5. 响应窗口大小变化
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});