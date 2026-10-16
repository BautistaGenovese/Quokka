export const MAX_QUOKKAS = 16;
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

/** Física acotada, sin colisiones ni suelo. Solo escribe transform y visibility. */
export function createQuokkaRain({ nodes, getViewport, requestFrame, cancelFrame, now, random = Math.random }) {
  let particles = [], frame = 0, last = 0;
  const hide = particle => { particle.active = false; nodes[particle.index].style.visibility = "hidden"; };
  const draw = particle => {
    const node = nodes[particle.index];
    node.style.visibility = "visible";
    node.style.transform = `translate3d(${particle.x}px,${particle.y}px,0) rotate(${particle.angle}deg)`;
  };
  const tick = time => {
    frame = 0;
    if (last && time - last < 1000 / 60 - .5) { frame = requestFrame(tick); return; }
    const dt = last ? Math.min(.033, Math.max(0, (time - last) / 1000)) : 1 / 60;
    last = time;
    const { width, height } = getViewport();
    for (const particle of particles) {
      if (!particle.active || time < particle.start) continue;
      if (time >= particle.expires) { hide(particle); continue; }
      if (!particle.held) {
        particle.vy += 620 * dt;
        particle.x += particle.vx * dt;
        particle.y += particle.vy * dt;
        particle.angle += particle.spin * dt;
      }
      if (particle.y > height + 80 || particle.x < -120 || particle.x > width + 120) hide(particle);
      else draw(particle);
    }
    if (particles.some(particle => particle.active)) frame = requestFrame(tick);
    else last = 0;
  };
  const clear = () => {
    cancelFrame(frame); frame = 0; last = 0;
    particles.forEach(hide); particles = [];
  };
  return {
    clear,
    launch() {
      clear();
      const { width } = getViewport();
      const count = Math.min(nodes.length, MAX_QUOKKAS, width < 640 ? 10 : MAX_QUOKKAS);
      const time = now();
      particles = Array.from({ length: count }, (_, index) => {
        const size = 34 + random() * 24;
        nodes[index].style.width = size + "px";
        nodes[index].style.height = size + "px";
        return { index, active: true, held: false, x: random() * Math.max(0, width - size), y: -size - 20,
          vx: (random() - .5) * 100, vy: 70 + random() * 140, angle: random() * 120 - 60,
          spin: random() * 180 - 90, start: time + index * 70, expires: time + 8000 };
      });
      if (count) frame = requestFrame(tick);
      return count;
    },
    grab(index, x, y) {
      const particle = particles[index];
      if (!particle?.active || now() < particle.start || now() >= particle.expires) return false;
      particle.held = true;
      particle.grabX = x - particle.x; particle.grabY = y - particle.y;
      particle.previousX = x; particle.previousY = y; particle.previousTime = now();
      particle.vx = 0; particle.vy = 0;
      return true;
    },
    move(index, x, y) {
      const particle = particles[index];
      if (!particle?.active || !particle.held) return;
      const time = now(), dt = Math.max(1 / 120, (time - particle.previousTime) / 1000);
      particle.vx = clamp((x - particle.previousX) / dt, -1600, 1600);
      particle.vy = clamp((y - particle.previousY) / dt, -1600, 1600);
      particle.x = x - particle.grabX; particle.y = y - particle.grabY;
      particle.previousX = x; particle.previousY = y; particle.previousTime = time;
    },
    release(index, cancelled = false) {
      const particle = particles[index];
      if (!particle?.active) return;
      particle.held = false;
      if (cancelled || now() - particle.previousTime > 100) { particle.vx = 0; particle.vy = 100; }
      particle.spin = clamp(particle.vx * .14, -220, 220);
    },
  };
}
