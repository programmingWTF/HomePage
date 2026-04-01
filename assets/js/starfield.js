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
    // 基础流动速度为负（离人而去），点击爆发速度为正（扑面而来）
    const speedCyan = -0.005 + clickBurst * 0.2; 
    const speedMagenta = -0.006 + clickBurst * 0.24;
    
    // 更新粒子坐标以确保均匀分布（双向包裹）
    function updateParticles(particles, speed) {
        const positions = particles.geometry.attributes.position.array;
        for(let i = 2; i < positions.length; i+=3) {
            positions[i] += speed;
            // 摄像机在 Z=3，所以粒子 Z 轴范围大致在 -12 到 3 之间
            if(positions[i] > +4) { 
                positions[i] -= 16; 
                positions[i-1] = (Math.random() - 0.5) * 15; // 重置 Y
                positions[i-2] = (Math.random() - 0.5) * 15; // 重置 X
            }
            if(positions[i] < -12) { 
                positions[i] += 16; 
                positions[i-1] = (Math.random() - 0.5) * 15;
                positions[i-2] = (Math.random() - 0.5) * 15;
            }
        }
        particles.geometry.attributes.position.needsUpdate = true;
    }
    
    updateParticles(particlesCyan, speedCyan);
    updateParticles(particlesMagenta, speedMagenta);

    // 维持柔和的整体旋转感
    particlesCyan.rotation.y = elapsedTime * 0.05;
    particlesCyan.rotation.x = elapsedTime * 0.02;
    
    particlesMagenta.rotation.y = elapsedTime * -0.03;
    particlesMagenta.rotation.x = elapsedTime * -0.01;

    // 依然响应鼠标轻微偏移
    targetX = mouseX * 0.001;
    targetY = mouseY * 0.001;
    
    particlesCyan.rotation.y += 0.5 * (targetX - particlesCyan.rotation.y);
    particlesCyan.rotation.x += 0.5 * (targetY - particlesCyan.rotation.x);
    
    particlesMagenta.rotation.y += 0.3 * (targetX - particlesMagenta.rotation.y);
    particlesMagenta.rotation.x += 0.3 * (targetY - particlesMagenta.rotation.x);

    // 用扩大视野（FOV）代替缩放，爆发时有更强的光速拉伸感
    camera.fov = 75 + clickBurst * 50;
    camera.updateProjectionMatrix();

    renderer.render(scene, camera);
};
animate();

// 5. 响应窗口大小变化
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});