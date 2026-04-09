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

    clickBurst *= 0.96; // 原为0.94，调大这个值（接近1）可以让飞速状态持续更久
    // 基础流动速度为负（离人而去），点击爆发速度为正（扑面而来）
    const speedCyan = -0.005 + clickBurst * 0.2; // 原为 0.08，调大这个值可以飞得更快
    const speedMagenta = -0.006 + clickBurst * 0.3; // 原为 0.1，调大这个值可以飞得更快
    
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

    // 维持柔和的整体旋转感 (移除原本会改变 Z 轴朝向的 rotation 累加)
    // 之前使用 elapsedTime 直接赋值或 += 会导致局部坐标系转动，使得 Z 轴位移不再指向屏幕
    
    // 鼠标偏移影响 (修正移动方向：将原本的 targetX/Y 符号反转)
    // 之前 targetX = mouseX * 0.0005 是正向跟随，但 camera.position.x += 会导致视口偏移使得物体向反方向运动
    // 或者是相反。现在我们确保相机跟随鼠标方向移动，从而让背景粒子看起来像是朝鼠标方向偏移。
    targetX = -mouseX * 0.0008; // 反转并微调灵敏度
    targetY = mouseY * 0.0008;
    
    // 让相机位置随鼠标轻微晃动
    camera.position.x += (targetX - camera.position.x) * 0.05;
    camera.position.y += (targetY - camera.position.y) * 0.05;
    camera.lookAt(scene.position);

    // 用扩大视野（FOV）代替缩放，爆发时有更强的光速拉伸感
    camera.fov = 75 + clickBurst * 40;
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