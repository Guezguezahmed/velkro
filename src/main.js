import './style.css';
import Lenis from 'lenis';
import Matter from 'matter-js';

// Initialize Lucide Icons if available (from CDN script in index.html)
document.addEventListener('DOMContentLoaded', () => {
  if (window.lucide) {
    window.lucide.createIcons();
  }
});

/* ==========================================================================
   1. SMOOTH SCROLLING (Lenis)
   ========================================================================== */
const lenis = new Lenis({
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  direction: 'vertical',
  gestureDirection: 'vertical',
  smooth: true,
  mouseMultiplier: 1,
  smoothTouch: false,
  touchMultiplier: 2,
  infinite: false,
});

function raf(time) {
  lenis.raf(time);
  requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

// Anchor Links smooth scroll navigation
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    e.preventDefault();
    const targetId = this.getAttribute('href');
    if (targetId === '#') return;
    const targetElement = document.querySelector(targetId);
    if (targetElement) {
      // Offset scrolling slightly to account for the sticky header if target is not hero
      const offset = targetId === '#hero' ? 0 : 70;
      lenis.scrollTo(targetElement, { offset: -offset });
    }
  });
});

/* ==========================================================================
   2. SCROLL REVEAL & PARALLAX TRANSITIONS
   ========================================================================= */
const heroHeader = document.querySelector('.hero-header-scrolling');
const heroContent = document.querySelector('.hero-content-parallax');
const stickyHeader = document.querySelector('.sticky-header-fixed');
const cardsTrack = document.getElementById('approach-cards-track');
const cardsStrip = document.querySelector('.approach-cards-strip');

window.addEventListener('scroll', () => {
  const y = window.scrollY;

  // 1. Hero Header scrolls up at normal speed
  if (heroHeader) {
    heroHeader.style.transform = `translate3d(0, ${-y}px, 0)`;
  }

  // 2. Hero Content scrolls slower (Parallax Reveal)
  if (heroContent) {
    heroContent.style.transform = `translate3d(0, ${-y * 0.45}px, 0)`;
    // Smoothly fade out content as it gets overlapped by the main content flow
    const opacity = Math.max(0, 1 - y / (window.innerHeight * 0.8));
    heroContent.style.opacity = opacity;
  }

  // 3. Sticky Header fades/slides in
  if (stickyHeader) {
    if (y > 60) {
      stickyHeader.classList.add('visible');
    } else {
      stickyHeader.classList.remove('visible');
    }
  }

  // 4. Horizontal scroll parallax for approach cards
  if (cardsTrack && cardsStrip) {
    const stripRect = cardsStrip.getBoundingClientRect();
    const windowH = window.innerHeight;
    // Calculate progress: 0 when strip enters viewport bottom, 1 when it leaves top
    const progress = (windowH - stripRect.top) / (windowH + stripRect.height);
    const clampedProgress = Math.max(0, Math.min(1, progress));
    // Translate cards from right (positive X) to left (negative X) as you scroll down
    const maxShift = 300; // px total horizontal travel
    const translateX = (1 - clampedProgress) * maxShift - maxShift * 0.3;
    cardsTrack.style.transform = `translate3d(${translateX}px, 0, 0)`;
  }
});

/* ==========================================================================
   3. CUSTOM CURSOR & MAGNETIC SNAPPING
   ========================================================================== */
const cursorDot = document.getElementById('custom-cursor');
const cursorFollower = document.getElementById('custom-cursor-follower');
const cursorText = cursorFollower.querySelector('.cursor-text');

let mouseX = 0;
let mouseY = 0;
let followerX = 0;
let followerY = 0;
let isHovering = false;
let isViewing = false;

window.addEventListener('mousemove', (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
});

// Lerp loop for smooth cursor follower
function updateCursor() {
  const lerpFactor = 0.15;
  followerX += (mouseX - followerX) * lerpFactor;
  followerY += (mouseY - followerY) * lerpFactor;

  if (cursorDot) {
    cursorDot.style.left = `${mouseX}px`;
    cursorDot.style.top = `${mouseY}px`;
  }

  if (cursorFollower) {
    cursorFollower.style.left = `${followerX}px`;
    cursorFollower.style.top = `${followerY}px`;
  }

  requestAnimationFrame(updateCursor);
}
requestAnimationFrame(updateCursor);

// Set up event listeners for hover states
const setupCursorListeners = () => {
  const hoverElements = document.querySelectorAll('a:not(.cursor-handled), button:not(.cursor-handled), .faq-trigger:not(.cursor-handled), .btn:not(.cursor-handled)');
  const viewElements = document.querySelectorAll('.work-card:not(.cursor-handled)');

  hoverElements.forEach(el => {
    el.classList.add('cursor-handled');
    el.addEventListener('mouseenter', () => {
      document.body.classList.add('cursor-hover');
      isHovering = true;
    });
    el.addEventListener('mouseleave', () => {
      document.body.classList.remove('cursor-hover');
      isHovering = false;
    });
  });

  viewElements.forEach(el => {
    el.classList.add('cursor-handled');
    el.addEventListener('mouseenter', () => {
      document.body.classList.add('cursor-view');
      if (cursorText && cursorText.textContent !== 'VIEW') cursorText.textContent = 'VIEW';
      isViewing = true;
    });
    el.addEventListener('mouseleave', () => {
      document.body.classList.remove('cursor-view');
      isViewing = false;
    });
  });
};

setupCursorListeners();

// Re-run listener setup when dynamic components modify DOM
const observer = new MutationObserver(setupCursorListeners);
observer.observe(document.body, { childList: true, subtree: true });

// Magnetic Snapping Effect for Buttons
const magneticElements = document.querySelectorAll('.btn-magnetic');

magneticElements.forEach((el) => {
  el.addEventListener('mousemove', (e) => {
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    
    el.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
    const span = el.querySelector('span');
    if (span) {
      span.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`;
    }
  });

  el.addEventListener('mouseleave', () => {
    el.style.transform = 'translate(0, 0)';
    const span = el.querySelector('span');
    if (span) {
      span.style.transform = 'translate(0, 0)';
    }
  });
});

/* ==========================================================================
   4. INTERACTIVE ASCII GRID CANVAS (Hero Background)
   ========================================================================== */
const heroCanvas = document.getElementById('hero-canvas');
const ctx = heroCanvas.getContext('2d');

let canvasWidth = 0;
let canvasHeight = 0;
let cols = 0;
let rows = 0;
const fontSize = 14;
const charSpacingX = 16;
const charSpacingY = 20;

const asciiChars = ['$', '#', '@', '%', '*', '=', '+', '-', ':', '.', ' '];

function resizeCanvas() {
  canvasWidth = heroCanvas.parentElement.clientWidth;
  canvasHeight = heroCanvas.parentElement.clientHeight;
  heroCanvas.width = canvasWidth;
  heroCanvas.height = canvasHeight;

  cols = Math.ceil(canvasWidth / charSpacingX) + 1;
  rows = Math.ceil(canvasHeight / charSpacingY) + 1;
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

let animTime = 0;

function drawAsciiGrid() {
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  ctx.font = `${fontSize}px 'Space Grotesk', monospace`;
  animTime += 0.005;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = c * charSpacingX;
      const y = r * charSpacingY;

      // Base wavy grid movement
      const waveVal = Math.sin(c * 0.08 + animTime) * Math.cos(r * 0.08 + animTime * 0.5);
      
      // Distance to cursor
      const dx = x - mouseX;
      const dy = y - mouseY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Light up radius: 320px
      const proximity = Math.max(0, 1 - dist / 320);

      // Interpolate character based on proximity and wave
      const intensity = Math.min(1, Math.max(0, (waveVal + 1) * 0.3 + proximity * 0.75));
      const charIndex = Math.floor((1 - intensity) * (asciiChars.length - 1));
      const char = asciiChars[charIndex];

      if (proximity > 0) {
        const redFactor = Math.max(0, 1 - dist / 120);
        ctx.fillStyle = `rgba(${Math.floor(255 * redFactor) + 60}, ${Math.floor(10 * (1 - redFactor))}, ${Math.floor(10 * (1 - redFactor))}, ${0.08 + proximity * 0.65})`;
      } else {
        ctx.fillStyle = `rgba(255, 255, 255, ${0.035 + (waveVal + 1) * 0.015})`;
      }

      ctx.fillText(char, x, y);
    }
  }

  requestAnimationFrame(drawAsciiGrid);
}
requestAnimationFrame(drawAsciiGrid);

/* ==========================================================================
   5. MATTER.JS 2D PHYSICS SIMULATION (Skill Pills)
   ========================================================================== */
const physicsContainer = document.getElementById('physics-container');

if (physicsContainer) {
  const skillsData = [
    { text: 'Web Developer', color: '#3388ff', px: 0.25, py: 0.7 },
    { text: 'UI/UX Designer', color: '#00e6e6', px: 0.2, py: 0.5 },
    { text: 'Brand Designer', color: '#ffcc00', px: 0.35, py: 0.3 },
    { text: 'Illustrator', color: '#00cc88', px: 0.55, py: 0.25 },
    { text: '3D Designer', color: '#d9d9d9', px: 0.75, py: 0.35 },
    { text: 'Motion Designer', color: '#ff8833', px: 0.85, py: 0.55 },
    { text: 'Creative Director', color: '#ff4d4d', px: 0.75, py: 0.75 },
    { text: 'Product Designer', color: '#ff66b3', px: 0.5, py: 0.85 },
    { text: 'Fullstack Developer', color: '#884dff', px: 0.15, py: 0.65 },
    { text: 'Mobile Developer', color: '#000000', textColor: '#ffffff', px: 0.45, py: 0.2 },
    { text: 'Product Manager', color: '#c266ff', px: 0.85, py: 0.45 },
    { text: 'DevOps Engineer', color: '#b3e600', px: 0.65, py: 0.85 }
  ];

  const { Engine, World, Bodies, Runner, Body, Vector } = Matter;

  const engine = Engine.create({
    gravity: { y: 0, x: 0 }
  });

  const width = physicsContainer.clientWidth;
  const height = physicsContainer.clientHeight;

  const wallThickness = 100;
  const walls = [
    Bodies.rectangle(width / 2, -wallThickness / 2, width + wallThickness * 2, wallThickness, { isStatic: true }),
    Bodies.rectangle(width / 2, height + wallThickness / 2, width + wallThickness * 2, wallThickness, { isStatic: true }),
    Bodies.rectangle(-wallThickness / 2, height / 2, wallThickness, height + wallThickness * 2, { isStatic: true }),
    Bodies.rectangle(width + wallThickness / 2, height / 2, wallThickness, height + wallThickness * 2, { isStatic: true })
  ];
  World.add(engine.world, walls);

  const pillElements = [];
  const pillBodies = [];

  skillsData.forEach((skill, idx) => {
    const el = document.createElement('div');
    el.className = 'skill-pill';
    el.textContent = skill.text;
    el.style.position = 'absolute';
    el.style.backgroundColor = skill.color;
    el.style.color = skill.textColor || '#000000';
    el.style.padding = '0.75rem 1.75rem';
    el.style.borderRadius = '50px';
    el.style.fontSize = '1.05rem';
    el.style.fontWeight = '500';
    el.style.fontFamily = "'Space Grotesk', sans-serif";
    el.style.whiteSpace = 'nowrap';
    el.style.userSelect = 'none';
    el.style.pointerEvents = 'none';
    el.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.15)';
    el.style.border = '1px solid rgba(0, 0, 0, 0.1)';
    el.style.transformOrigin = 'center center';
    
    physicsContainer.appendChild(el);

    const pillWidth = el.clientWidth || 160;
    const pillHeight = el.clientHeight || 45;

    const px = skill.px * width;
    const py = skill.py * height;

    const body = Bodies.rectangle(px, py, pillWidth, pillHeight, {
      chamfer: { radius: pillHeight / 2 },
      frictionAir: 0.02,
      restitution: 0.85,
      density: 0.001,
      inertia: Infinity
    });

    // Give them an initial kick in the direction of their orbit
    const cx = width / 2;
    const cy = height / 2;
    const dx = px - cx;
    const dy = py - cy;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const tangentX = -dy / dist;
    const tangentY = dx / dist;

    Body.setVelocity(body, {
      x: tangentX * 2.0,
      y: tangentY * 2.0
    });

    World.add(engine.world, body);

    pillElements.push(el);
    pillBodies.push({ body, width: pillWidth, height: pillHeight });
  });

  const mouseBodyRadius = 60;
  const cursorPhysicsBody = Bodies.circle(-200, -200, mouseBodyRadius, {
    isStatic: true
  });
  World.add(engine.world, cursorPhysicsBody);

  let containerMouseX = -1000;
  let containerMouseY = -1000;

  physicsContainer.addEventListener('mousemove', (e) => {
    const rect = physicsContainer.getBoundingClientRect();
    containerMouseX = e.clientX - rect.left;
    containerMouseY = e.clientY - rect.top;
  });

  physicsContainer.addEventListener('mouseleave', () => {
    containerMouseX = -1000;
    containerMouseY = -1000;
  });

  const runner = Runner.create();
  Runner.run(runner, engine);

  // --- Scroll Velocity Logic ---
  let lastScrollY = window.scrollY;
  let targetMarqueeSpeed = 1;
  let currentMarqueeSpeed = 1;
  let targetTagSpeed = 1;
  let currentTagSpeed = 1;

  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    const delta = scrollY - lastScrollY;
    lastScrollY = scrollY;
    
    // Smooth threshold to prevent micro-jitters
    if (Math.abs(delta) > 2) {
      if (delta > 0) {
        targetMarqueeSpeed = 21; // +2000% speed down
        targetTagSpeed = 31;     // +3000% speed down
      } else {
        targetMarqueeSpeed = -21; // Reverse at +2000% speed up
        targetTagSpeed = -31;     // Reverse at +3000% speed up
      }
      
      clearTimeout(window.scrollSpeedTimeout);
      window.scrollSpeedTimeout = setTimeout(() => {
        targetMarqueeSpeed = 1;
        targetTagSpeed = 1;
      }, 150);
    }
  });

  const marqueeTrack = document.querySelector('.scrolling-screens-track');
  let marqueeX = 0;

  function updatePhysics() {
    Body.setPosition(cursorPhysicsBody, { x: containerMouseX, y: containerMouseY });

    // Smoothly interpolate the speed multipliers
    currentMarqueeSpeed += (targetMarqueeSpeed - currentMarqueeSpeed) * 0.08;
    currentTagSpeed += (targetTagSpeed - currentTagSpeed) * 0.08;

    // --- Update Marquee Track ---
    if (marqueeTrack) {
      marqueeX -= 1.5 * currentMarqueeSpeed; // base 1.5px per frame
      
      const trackWidth = marqueeTrack.scrollWidth;
      const halfWidth = trackWidth / 2;
      
      // Handle seamless wrapping in both directions
      if (marqueeX <= -halfWidth) {
        marqueeX += halfWidth;
      } else if (marqueeX > 0) {
        marqueeX -= halfWidth;
      }
      
      marqueeTrack.style.transform = `translate3d(${marqueeX}px, 0, 0)`;
    }

    pillBodies.forEach((item, idx) => {
      const { body, width: pW, height: pH } = item;
      const el = pillElements[idx];

      // Continuous orbital physics
      const cx = width / 2;
      const cy = height / 2;
      const dx = body.position.x - cx;
      const dy = body.position.y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist > 50) {
        const dirX = dx / dist;
        const dirY = dy / dist;
        // Tangent for clockwise rotation
        const tangentX = -dirY;
        const tangentY = dirX;

        const orbitStr = 0.0002 * currentTagSpeed;
        const pullStr = 0.00006 * Math.abs(currentTagSpeed);

        Body.applyForce(body, body.position, {
          x: (tangentX * orbitStr) - (dirX * pullStr) + (Math.random() - 0.5) * 0.00002,
          y: (tangentY * orbitStr) - (dirY * pullStr) + (Math.random() - 0.5) * 0.00002
        });
      }

      const buffer = 10;
      if (body.position.x < pW / 2 + buffer) {
        Body.applyForce(body, body.position, { x: 0.0005, y: 0 });
      }
      if (body.position.x > width - pW / 2 - buffer) {
        Body.applyForce(body, body.position, { x: -0.0005, y: 0 });
      }
      if (body.position.y < pH / 2 + buffer) {
        Body.applyForce(body, body.position, { x: 0, y: 0.0005 });
      }
      if (body.position.y > height - pH / 2 - buffer) {
        Body.applyForce(body, body.position, { x: 0, y: -0.0005 });
      }

      const tx = body.position.x - pW / 2;
      const ty = body.position.y - pH / 2;
      el.style.transform = `translate3d(${tx}px, ${ty}px, 0)`;
    });

    requestAnimationFrame(updatePhysics);
  }
  requestAnimationFrame(updatePhysics);

  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      const newWidth = physicsContainer.clientWidth;
      const newHeight = physicsContainer.clientHeight;
      
      Body.setPosition(walls[0], { x: newWidth / 2, y: -wallThickness / 2 });
      Body.setPosition(walls[1], { x: newWidth / 2, y: newHeight + wallThickness / 2 });
      Body.setPosition(walls[2], { x: -wallThickness / 2, y: newHeight / 2 });
      Body.setPosition(walls[3], { x: newWidth + wallThickness / 2, y: newHeight / 2 });
    }, 150);
  });
}

/* ==========================================================================
   6. FAQ ACCORDION TRANSITIONS
   ========================================================================== */
const faqItems = document.querySelectorAll('.faq-item');

faqItems.forEach((item) => {
  const trigger = item.querySelector('.faq-trigger');
  
  trigger.addEventListener('click', () => {
    const isActive = item.classList.contains('active');
    
    faqItems.forEach((innerItem) => {
      innerItem.classList.remove('active');
    });
    
    if (!isActive) {
      item.classList.add('active');
    }
    
    setTimeout(() => {
      lenis.resize();
    }, 350);
  });
});

/* ==========================================================================
   7. SCROLL TRIGGER REVEAL ANIMATIONS
   ========================================================================== */
const observerOptions = {
  root: null,
  rootMargin: '0px',
  threshold: 0.1
};

const revealCallback = (entries, obs) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('revealed');
      obs.unobserve(entry.target);
    }
  });
};

const revealObserver = new IntersectionObserver(revealCallback, observerOptions);

document.querySelectorAll('.reveal-text, .approach-card, .why-feature, .work-card-wrapper, .stats-block, .pricing-col').forEach(el => {
  el.classList.add('reveal-init');
  revealObserver.observe(el);
});

const styleSheet = document.createElement("style");
styleSheet.innerText = `
  .reveal-init {
    opacity: 0;
    transform: translateY(30px);
    transition: opacity 0.8s cubic-bezier(0.25, 1, 0.5, 1), transform 0.8s cubic-bezier(0.25, 1, 0.5, 1);
  }
  .reveal-init.revealed {
    opacity: 1;
    transform: translateY(0);
  }
  .reveal-text.reveal-init {
    transform: translateY(15px);
  }
  .approach-card:nth-child(1) { transition-delay: 0.0s; }
  .approach-card:nth-child(2) { transition-delay: 0.1s; }
  .approach-card:nth-child(3) { transition-delay: 0.2s; }
  .approach-card:nth-child(4) { transition-delay: 0.3s; }
  .stats-block:nth-child(1) { transition-delay: 0.0s; }
  .stats-block:nth-child(2) { transition-delay: 0.1s; }
  .stats-block:nth-child(3) { transition-delay: 0.2s; }
  .stats-block:nth-child(4) { transition-delay: 0.3s; }
`;
document.head.appendChild(styleSheet);

// Dynamic local time updates in Porto/Lisbon
const timeContainer = document.querySelector('.location-time');
if (timeContainer) {
  const updateLocalTime = () => {
    const date = new Date();
    const options = { timeZone: 'Africa/Tunis', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false };
    const timeString = date.toLocaleTimeString('en-US', options);
    timeContainer.textContent = `Ariana, Tunisia — ${timeString}`;
  };
  updateLocalTime();
  setInterval(updateLocalTime, 1000);
}
