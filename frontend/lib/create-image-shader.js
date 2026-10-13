// Renderer pequeño y aislado: WebGL nativo, sin añadir Three.js al bundle.
// Referencia conceptual: GSAP «Shader on Scroll», GreenSock/EaVbXeM
// (ondas y separación RGB según velocidad). Aquí la entrada es horizontal.
const VERTEX = `
attribute vec2 aPosition;
varying vec2 vUv;
void main() {
  vUv = (aPosition + 1.0) * 0.5;
  gl_Position = vec4(aPosition, 0.0, 1.0);
}`;
const FRAGMENT = `
precision mediump float;
varying vec2 vUv;
uniform sampler2D uImage;
uniform vec2 uCover;
uniform float uMotion;
uniform float uTime;
void main() {
  float strength = abs(uMotion);
  vec2 uv = (vUv - 0.5) * uCover + 0.5;
  // La deformación desaparece completamente cuando la card se detiene.
  uv.x += sin(vUv.y * 11.0 + uTime * 1.7) * uMotion * 0.025;
  uv.y += sin(vUv.x * 8.0 - uTime) * strength * 0.012;
  vec2 split = vec2(uMotion * 0.012, 0.0);
  gl_FragColor = vec4(texture2D(uImage, uv + split).r,
    texture2D(uImage, uv).g, texture2D(uImage, uv - split).b, 1.0);
}`;

/** El <img> sigue debajo como fallback. Si falla WebGL, no lo sustituimos.
 * El caller controla carga, movimiento, visibilidad y ciclo de vida. */
export default function createImageShader(canvas, image) {
  const gl = canvas.getContext("webgl", { alpha: false, antialias: false, depth: false });
  if (!gl) return null;
  const shaders = [], buffers = [], textures = [];
  let program;
  const dispose = () => {
    textures.forEach(texture => gl.deleteTexture(texture));
    buffers.forEach(buffer => gl.deleteBuffer(buffer));
    shaders.forEach(shader => gl.deleteShader(shader));
    if (program) gl.deleteProgram(program);
  };
  try {
    const compile = (type, source) => {
      const shader = gl.createShader(type);
      shaders.push(shader); gl.shaderSource(shader, source); gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error("Shader no disponible");
      return shader;
    };
    program = gl.createProgram();
    gl.attachShader(program, compile(gl.VERTEX_SHADER, VERTEX));
    gl.attachShader(program, compile(gl.FRAGMENT_SHADER, FRAGMENT));
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error("WebGL no disponible");
    gl.useProgram(program);
    const buffer = gl.createBuffer(); buffers.push(buffer);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const position = gl.getAttribLocation(program, "aPosition");
    gl.enableVertexAttribArray(position); gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
    const texture = gl.createTexture(); textures.push(texture);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
    // Algunas imágenes SVG inválidas para textura generan un error GL sin
    // lanzar excepción. Conservar el <img> en lugar de taparlo de negro.
    if (gl.getError() !== gl.NO_ERROR) throw new Error("Textura no disponible");
    const cover = gl.getUniformLocation(program, "uCover");
    const motion = gl.getUniformLocation(program, "uMotion");
    const time = gl.getUniformLocation(program, "uTime");
    gl.uniform1i(gl.getUniformLocation(program, "uImage"), 0);
    return {
      resize(width, height) {
        // clientWidth evita que el scale/tilt del slider cambie la resolución.
        const ratio = Math.min(devicePixelRatio || 1, 2);
        canvas.width = Math.max(1, Math.round(width * ratio));
        canvas.height = Math.max(1, Math.round(height * ratio));
        gl.viewport(0, 0, canvas.width, canvas.height);
        const imageRatio = image.naturalWidth / image.naturalHeight;
        const frameRatio = width / height;
        // Mismo recorte centrado que object-fit: cover, sin bandas vacías.
        gl.uniform2f(cover, Math.min(1, frameRatio / imageRatio), Math.min(1, imageRatio / frameRatio));
      },
      render(velocity) {
        gl.uniform1f(motion, velocity);
        gl.uniform1f(time, performance.now() / 1000);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      },
      dispose,
    };
  } catch {
    dispose(); return null;
  }
}
