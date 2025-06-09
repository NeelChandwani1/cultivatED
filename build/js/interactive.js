document.addEventListener('DOMContentLoaded', () => {
    const element = document.querySelector('.interactive-element');
    let mouseX = 0;
    let mouseY = 0;
    let currentX = 0;
    let currentY = 0;
    
    document.addEventListener('mousemove', (e) => {
        mouseX = (e.clientX - window.innerWidth / 2) * 0.1;
        mouseY = (e.clientY - window.innerHeight / 2) * 0.1;
    });

    const animate = () => {
        currentX += (mouseX - currentX) * 0.1;
        currentY += (mouseY - currentY) * 0.1;

        const transform = `translate(${currentX}px, ${currentY}px) rotate(${currentX * 0.5}deg)`;
        element.style.transform = transform;

        requestAnimationFrame(animate);
    };

    animate();
});