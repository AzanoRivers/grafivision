// WebGL2 Navier-Stokes fluid simulation — cursor trail
// Based on Pavel Dobryakov's WebGL Fluid Simulation
// Adapted: transparent canvas + mix-blend-mode:multiply for light theme

type GL = WebGL2RenderingContext

interface Prog { prog: WebGLProgram; u: Record<string, WebGLUniformLocation | null> }
interface FBO  { tex: WebGLTexture; fbo: WebGLFramebuffer; w: number; h: number; tx: number; ty: number; bind(unit: number): number }
interface DFBO { read: FBO; write: FBO; tx: number; ty: number; swap(): void }

// ── Shaders ──────────────────────────────────────────────────────

const VS = `#version 300 es
layout(location=0) in vec2 aPos;
out vec2 vUv,vL,vR,vT,vB;
uniform vec2 ts;
void main(){
  vUv=aPos*.5+.5; vL=vUv-vec2(ts.x,0); vR=vUv+vec2(ts.x,0);
  vT=vUv+vec2(0,ts.y); vB=vUv-vec2(0,ts.y);
  gl_Position=vec4(aPos,0,1);
}`

const CLEAR_F = `#version 300 es
precision mediump float;
in vec2 vUv; uniform sampler2D uT; uniform float val; out vec4 o;
void main(){ o=val*texture(uT,vUv); }`

const SPLAT_F = `#version 300 es
precision highp float;
in vec2 vUv; uniform sampler2D uT; uniform float ar,r; uniform vec3 col; uniform vec2 pt; out vec4 o;
void main(){
  vec2 p=vUv-pt; p.x*=ar;
  o=vec4(texture(uT,vUv).xyz+exp(-dot(p,p)/r)*col,1);
}`

const ADVECT_F = `#version 300 es
precision highp float;
in vec2 vUv; uniform sampler2D uVel,uSrc; uniform vec2 ts,dts; uniform float dt,diss; out vec4 o;
vec4 bl(sampler2D s,vec2 uv,vec2 t){
  vec2 st=uv/t-.5,i=floor(st),f=fract(st);
  return mix(mix(texture(s,(i+vec2(.5))*t),texture(s,(i+vec2(1.5,.5))*t),f.x),
             mix(texture(s,(i+vec2(.5,1.5))*t),texture(s,(i+vec2(1.5))*t),f.x),f.y);
}
void main(){ vec2 c=vUv-dt*bl(uVel,vUv,ts).xy*ts; o=bl(uSrc,c,dts)/(1.+diss*dt); }`

const DIV_F = `#version 300 es
precision mediump float;
in vec2 vUv,vL,vR,vT,vB; uniform sampler2D uVel; out vec4 o;
void main(){
  float L=texture(uVel,vL).x,R=texture(uVel,vR).x,T=texture(uVel,vT).y,B=texture(uVel,vB).y;
  vec2 C=texture(uVel,vUv).xy;
  if(vL.x<0.)L=-C.x; if(vR.x>1.)R=-C.x; if(vT.y>1.)T=-C.y; if(vB.y<0.)B=-C.y;
  o=vec4(.5*(R-L+T-B),0,0,1);
}`

const CURL_F = `#version 300 es
precision mediump float;
in vec2 vUv,vL,vR,vT,vB; uniform sampler2D uVel; out vec4 o;
void main(){ o=vec4(.5*(texture(uVel,vR).y-texture(uVel,vL).y-texture(uVel,vT).x+texture(uVel,vB).x),0,0,1); }`

const VORT_F = `#version 300 es
precision highp float;
in vec2 vUv,vL,vR,vT,vB; uniform sampler2D uVel,uCurl; uniform float curl,dt; out vec4 o;
void main(){
  float L=texture(uCurl,vL).x,R=texture(uCurl,vR).x,T=texture(uCurl,vT).x,B=texture(uCurl,vB).x,C=texture(uCurl,vUv).x;
  vec2 f=.5*vec2(abs(T)-abs(B),abs(R)-abs(L));
  f/=length(f)+.0001; f*=curl*C; f.y*=-1.;
  o=vec4(texture(uVel,vUv).xy+f*dt,0,1);
}`

const PRES_F = `#version 300 es
precision mediump float;
in vec2 vUv,vL,vR,vT,vB; uniform sampler2D uP,uDiv; out vec4 o;
void main(){ o=vec4((texture(uP,vL).x+texture(uP,vR).x+texture(uP,vB).x+texture(uP,vT).x-texture(uDiv,vUv).x)*.25,0,0,1); }`

const GRAD_F = `#version 300 es
precision mediump float;
in vec2 vUv,vL,vR,vT,vB; uniform sampler2D uP,uVel; out vec4 o;
void main(){ vec2 v=texture(uVel,vUv).xy; o=vec4(v-vec2(texture(uP,vR).x-texture(uP,vL).x,texture(uP,vT).x-texture(uP,vB).x),0,1); }`

const DISP_F = `#version 300 es
precision highp float;
in vec2 vUv; uniform sampler2D uT; out vec4 o;
void main(){
  vec3 C=texture(uT,vUv).rgb;
  float a=max(C.r,max(C.g,C.b));
  o=vec4(C,a);
}`

// ── Helpers ───────────────────────────────────────────────────────

function mkShader(gl: GL, type: number, src: string) {
  const s = gl.createShader(type)!
  gl.shaderSource(s, src); gl.compileShader(s)
  return s
}

function mkProg(gl: GL, vs: string, fs: string): Prog {
  const prog = gl.createProgram()!
  gl.attachShader(prog, mkShader(gl, gl.VERTEX_SHADER,   vs))
  gl.attachShader(prog, mkShader(gl, gl.FRAGMENT_SHADER, fs))
  gl.linkProgram(prog)
  const u: Record<string, WebGLUniformLocation | null> = {}
  const n = gl.getProgramParameter(prog, gl.ACTIVE_UNIFORMS) as number
  for (let i = 0; i < n; i++) { const info = gl.getActiveUniform(prog, i)!; u[info.name] = gl.getUniformLocation(prog, info.name) }
  return { prog, u }
}

function mkFBO(gl: GL, w: number, h: number, iFmt: number, fmt: number, type: number, filter: number): FBO {
  gl.activeTexture(gl.TEXTURE0)
  const tex = gl.createTexture()!
  gl.bindTexture(gl.TEXTURE_2D, tex)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
  gl.texImage2D(gl.TEXTURE_2D, 0, iFmt, w, h, 0, fmt, type, null)
  const fbo = gl.createFramebuffer()!
  gl.bindFramebuffer(gl.FRAMEBUFFER, fbo)
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0)
  gl.viewport(0, 0, w, h); gl.clear(gl.COLOR_BUFFER_BIT)
  const tx = 1/w, ty = 1/h
  return { tex, fbo, w, h, tx, ty, bind(unit) { gl.activeTexture(gl.TEXTURE0+unit); gl.bindTexture(gl.TEXTURE_2D, tex); return unit } }
}

function mkDFBO(gl: GL, w: number, h: number, iF: number, f: number, t: number, filter: number): DFBO {
  let read = mkFBO(gl, w, h, iF, f, t, filter)
  let write = mkFBO(gl, w, h, iF, f, t, filter)
  return { get read(){ return read }, get write(){ return write }, get tx(){ return read.tx }, get ty(){ return read.ty }, swap(){ [read,write]=[write,read] } }
}

function hslToRgb(h: number, s: number, l: number): [number,number,number] {
  h/=360; s/=100; l/=100
  const q = l<.5 ? l*(1+s) : l+s-l*s, p = 2*l-q
  const f = (t: number) => { if(t<0)t+=1; if(t>1)t-=1; return t<1/6?p+(q-p)*6*t:t<.5?q:t<2/3?p+(q-p)*(2/3-t)*6:p }
  return [f(h+1/3), f(h), f(h-1/3)]
}

// ── Main ──────────────────────────────────────────────────────────

function startFluid(canvas: HTMLCanvasElement, gl: GL): () => void {
  canvas.width  = window.innerWidth
  canvas.height = window.innerHeight

  // ── Simulation params ─────────────────────────────────────────
  // SIM/DYE: lower = fewer GPU pixels per pass = less bandwidth
  const SIM    = 48    // velocity field resolution (was 64, −44% area)
  const DYE    = 128   // dye field resolution     (was 256, −75% area)
  const PITER  = 4     // pressure iterations      (was 8,   −50%)
  const CURL   = 12    // vorticity confinement    (was 18)
  const DISS_V = 3.0   // velocity dissipation     (was 2.5)
  const DISS_D = 7.0   // dye dissipation          (was 5.5, faster fade → stop RAF sooner)
  const SRAD   = 0.1
  const SFORCE = 2500

  // Time after last splat with no activity → stop RAF (dye fully gone by then)
  const IDLE_STOP_MS = 2200

  const pClear = mkProg(gl, VS, CLEAR_F)
  const pSplat = mkProg(gl, VS, SPLAT_F)
  const pAdvct = mkProg(gl, VS, ADVECT_F)
  const pDiv   = mkProg(gl, VS, DIV_F)
  const pCurl  = mkProg(gl, VS, CURL_F)
  const pVort  = mkProg(gl, VS, VORT_F)
  const pPres  = mkProg(gl, VS, PRES_F)
  const pGrad  = mkProg(gl, VS, GRAD_F)
  const pDisp  = mkProg(gl, VS, DISP_F)

  const ar = canvas.width / canvas.height
  const simW = Math.round(SIM * ar), simH = SIM
  const dyeW = Math.round(DYE * ar), dyeH = DYE

  const R16F = gl.R16F, RG16F = gl.RG16F, RGBA16F = gl.RGBA16F
  const R = gl.RED, RG = gl.RG, RGBA = gl.RGBA, HF = gl.HALF_FLOAT

  const vel  = mkDFBO(gl, simW, simH, RG16F,   RG,   HF, gl.LINEAR)
  const dye  = mkDFBO(gl, dyeW, dyeH, RGBA16F, RGBA, HF, gl.LINEAR)
  const pres = mkDFBO(gl, simW, simH, R16F,    R,    HF, gl.NEAREST)
  const divB = mkFBO(gl, simW, simH, R16F,    R,    HF, gl.NEAREST)
  const curB = mkFBO(gl, simW, simH, R16F,    R,    HF, gl.NEAREST)

  const quad = gl.createBuffer()!
  gl.bindBuffer(gl.ARRAY_BUFFER, quad)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,-1,1,1,1,-1,-1,1,1,1,-1]), gl.STATIC_DRAW)
  gl.enableVertexAttribArray(0)

  function draw(target: FBO | null) {
    if (target) { gl.bindFramebuffer(gl.FRAMEBUFFER, target.fbo); gl.viewport(0,0,target.w,target.h) }
    else         { gl.bindFramebuffer(gl.FRAMEBUFFER, null);       gl.viewport(0,0,canvas.width,canvas.height) }
    gl.bindBuffer(gl.ARRAY_BUFFER, quad)
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0)
    gl.drawArrays(gl.TRIANGLES, 0, 6)
  }

  function set1f(p: Prog, n: string, v: number)  { gl.uniform1f(p.u[n]!, v) }
  function set1i(p: Prog, n: string, v: number)  { gl.uniform1i(p.u[n]!, v) }
  function set2f(p: Prog, n: string, x: number, y: number) { gl.uniform2f(p.u[n]!, x, y) }
  function set3f(p: Prog, n: string, x: number, y: number, z: number) { gl.uniform3f(p.u[n]!, x, y, z) }

  function splat(x: number, y: number, dx: number, dy: number, hue: number) {
    gl.useProgram(pSplat.prog)
    set1i(pSplat, 'uT', vel.read.bind(0))
    set1f(pSplat, 'ar', ar)
    set1f(pSplat, 'r', SRAD / 100)
    set3f(pSplat, 'col', dx * SFORCE, dy * SFORCE, 0)
    set2f(pSplat, 'pt', x, y)
    draw(vel.write); vel.swap()

    const [r,g,b] = hslToRgb(hue, 85, 52)
    set1i(pSplat, 'uT', dye.read.bind(0))
    set3f(pSplat, 'col', r*1.8, g*1.8, b*1.8)
    draw(dye.write); dye.swap()
  }

  let lastTime = performance.now(), rafId = 0
  let lastX = -1, lastY = -1, hue = 0
  let lastSplatTime = 0   // timestamp of last actual splat — drives idle stop

  function step(dt: number) {
    gl.disable(gl.BLEND)

    gl.useProgram(pCurl.prog)
    set2f(pCurl, 'ts', vel.tx, vel.ty)
    set1i(pCurl, 'uVel', vel.read.bind(0))
    draw(curB)

    gl.useProgram(pVort.prog)
    set2f(pVort, 'ts', vel.tx, vel.ty)
    set1i(pVort, 'uVel', vel.read.bind(0))
    set1i(pVort, 'uCurl', curB.bind(1))
    set1f(pVort, 'curl', CURL); set1f(pVort, 'dt', dt)
    draw(vel.write); vel.swap()

    gl.useProgram(pDiv.prog)
    set2f(pDiv, 'ts', vel.tx, vel.ty)
    set1i(pDiv, 'uVel', vel.read.bind(0))
    draw(divB)

    gl.useProgram(pClear.prog)
    set1i(pClear, 'uT', pres.read.bind(0))
    set1f(pClear, 'val', 0.8)
    draw(pres.write); pres.swap()

    gl.useProgram(pPres.prog)
    set2f(pPres, 'ts', vel.tx, vel.ty)
    set1i(pPres, 'uDiv', divB.bind(0))
    for (let i = 0; i < PITER; i++) {
      set1i(pPres, 'uP', pres.read.bind(1))
      draw(pres.write); pres.swap()
    }

    gl.useProgram(pGrad.prog)
    set2f(pGrad, 'ts', vel.tx, vel.ty)
    set1i(pGrad, 'uP',   pres.read.bind(0))
    set1i(pGrad, 'uVel', vel.read.bind(1))
    draw(vel.write); vel.swap()

    gl.useProgram(pAdvct.prog)
    set2f(pAdvct, 'ts',  vel.tx, vel.ty)
    set2f(pAdvct, 'dts', vel.tx, vel.ty)
    set1f(pAdvct, 'dt', dt); set1f(pAdvct, 'diss', DISS_V)
    set1i(pAdvct, 'uVel', vel.read.bind(0))
    set1i(pAdvct, 'uSrc', vel.read.bind(1))
    draw(vel.write); vel.swap()

    set2f(pAdvct, 'ts',  vel.tx, vel.ty)
    set2f(pAdvct, 'dts', dye.tx, dye.ty)
    set1f(pAdvct, 'diss', DISS_D)
    set1i(pAdvct, 'uVel', vel.read.bind(0))
    set1i(pAdvct, 'uSrc', dye.read.bind(1))
    draw(dye.write); dye.swap()
  }

  function render() {
    const now = performance.now()
    const dt  = Math.min((now - lastTime) / 1000, 0.016)
    lastTime  = now

    step(dt)

    gl.disable(gl.BLEND)
    gl.bindFramebuffer(gl.FRAMEBUFFER, null)
    gl.viewport(0, 0, canvas.width, canvas.height)
    gl.clearColor(0, 0, 0, 0)
    gl.clear(gl.COLOR_BUFFER_BIT)
    gl.useProgram(pDisp.prog)
    set1i(pDisp, 'uT', dye.read.bind(0))
    gl.bindBuffer(gl.ARRAY_BUFFER, quad)
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0)
    gl.drawArrays(gl.TRIANGLES, 0, 6)

    // Stop RAF once dye has fully dissipated — restarts on next mouse move
    if (lastSplatTime > 0 && now - lastSplatTime > IDLE_STOP_MS) {
      rafId = 0
      return
    }

    rafId = requestAnimationFrame(render)
  }

  const onResize = () => {
    canvas.width  = window.innerWidth
    canvas.height = window.innerHeight
  }

  const onMove = (e: MouseEvent) => {
    const el = e.target instanceof Element ? e.target : null
    if (el?.closest('[data-glow-exclude]')) return

    canvas.classList.add('is-active')

    // Decouple position from canvas buffer size — always use viewport dimensions
    const x  = e.clientX / window.innerWidth
    const y  = 1 - e.clientY / window.innerHeight
    const dx = lastX < 0 ? 0 : (e.clientX - lastX) / window.innerWidth
    const dy = lastX < 0 ? 0 : -(e.clientY - lastY) / window.innerHeight

    lastX = e.clientX; lastY = e.clientY
    hue   = (hue + 1.8) % 360

    if (Math.abs(dx) > 0.012 || Math.abs(dy) > 0.012) {
      splat(x, y, dx, dy, hue)
      lastSplatTime = performance.now()
      // Restart RAF if it was stopped by idle timeout
      if (!rafId) { lastTime = performance.now(); render() }
    }
  }

  const onLeave = () => { canvas.classList.remove('is-active'); lastX = -1; lastY = -1 }

  const onVisibility = () => {
    if (document.hidden) { cancelAnimationFrame(rafId); rafId = 0 }
    else if (!rafId && lastSplatTime > 0) { lastTime = performance.now(); render() }
  }

  window.addEventListener('resize', onResize, { passive: true })
  document.addEventListener('mousemove', onMove)
  document.addEventListener('mouseleave', onLeave)
  document.addEventListener('visibilitychange', onVisibility)

  render()

  return () => {
    cancelAnimationFrame(rafId)
    window.removeEventListener('resize', onResize)
    document.removeEventListener('mousemove', onMove)
    document.removeEventListener('mouseleave', onLeave)
    document.removeEventListener('visibilitychange', onVisibility)
  }
}

export function initFluidTrail(): (() => void) | undefined {
  if (typeof window === 'undefined') return
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  if (!window.matchMedia('(hover: hover)').matches) return

  const canvas = document.getElementById('cursor-trail') as HTMLCanvasElement | null
  if (!canvas) return

  const gl = canvas.getContext('webgl2', { alpha: true, premultipliedAlpha: false, antialias: false, depth: false }) as GL | null
  if (!gl) return

  if (!gl.getExtension('EXT_color_buffer_float')) return

  return startFluid(canvas, gl)
}
