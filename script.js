const woodTexture = "https://assets.codepen.io/163598/tile01.jpg";
const stoneTexture = "https://assets.codepen.io/163598/tile012.jpg"; //st_bw_noise.png";
const textureList = [stoneTexture, woodTexture];
// Mouse Class for movments and attaching to dom //
class Mouse {
  constructor(element) {
    this.element = element || window;
    this.drag = false;
    this.x =
      ~~(document.documentElement.clientWidth, window.innerWidth || 0) / 2;
    this.y =
      ~~(document.documentElement.clientHeight, window.innerHeight || 0) / 2;
    this.getCoordinates = this.getCoordinates.bind(this);
    this.events = ["mouseenter", "mousemove"];
    this.events.forEach((eventName) => {
      this.element.addEventListener(eventName, this.getCoordinates);
    });
    this.element.addEventListener("mousedown", () => {
      this.drag = true;
    });
    this.element.addEventListener("mouseup", () => {
      this.drag = false;
    });
    window.addEventListener("resize", this.reset);
  }
  reset = () => {
    this.x =
      ~~(document.documentElement.clientWidth, window.innerWidth || 0) / 2;
    this.y =
      ~~(document.documentElement.clientHeight, window.innerHeight || 0) / 2;
  };
  getCoordinates(event) {
    event.preventDefault();
    if (this.drag) {
      this.x = event.pageX;
      this.y = event.pageY;
    }
  }
}

// WEBGL BOOTSTRAP TWGL.js
const glcanvas = document.getElementById("canvas");
const gl = glcanvas.getContext("webgl2");

// Fractal code in HTML window - Fragment Shader //
const programInfo = twgl.createProgramInfo(gl, [
  "vertexShader",
  "fragmentShader"
]);

const arrays = {
  position: [-1, -1, 0, 1, -1, 0, -1, 1, 0, -1, 1, 0, 1, -1, 0, 1, 1, 0]
};

const bufferInfo = twgl.createBufferInfoFromArrays(gl, arrays);
const mouse = new Mouse(glcanvas);
let umouse = [gl.canvas.width / 2, gl.canvas.height / 2, 0, 0];
let tmouse = umouse;

// TEXTURE LOADING
let texts;
const getImage = (url) => {
  return new Promise((resolve, reject) => {
    let img = new Image();
    img.crossOrigin = "anonymous";
    img.addEventListener("load", (e) => resolve(img));
    img.addEventListener("error", () => {
      reject(new Error(`Failed to load image's URL: ${url}`));
    });
    img.src = url;
  });
};
const loadTexture = (imageList) => {
  console.log("loading images");
  let promises = imageList.map((item) => getImage(item));

  Promise.all(promises).then((images) => {
    const txtImages = images.map((item) => {
      return { src: item, mag: gl.NEAREST };
    });
    texts = twgl.createTextures(gl, {
      iChannel0: txtImages[0],
      iChannel1: txtImages[1]
    });
    let uniforms = {
      iChannel0: texts.iChannel0,
      iChannel1: texts.iChannel1
    };
    gl.useProgram(programInfo.program);
    twgl.setBuffersAndAttributes(gl, programInfo, bufferInfo);
    twgl.setUniforms(programInfo, uniforms);
    twgl.drawBufferInfo(gl, bufferInfo);
  });
};

// RENDER LOOP
const render = (time) => {
  twgl.resizeCanvasToDisplaySize(gl.canvas, 1.0);

  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  let uniforms;
  const factor = 0.15;
  umouse = [mouse.x, mouse.y, 0];
  tmouse[0] = tmouse[0] - (tmouse[0] - umouse[0]) * factor;
  tmouse[1] = tmouse[1] - (tmouse[1] - umouse[1]) * factor;
  tmouse[2] = mouse.drag ? 1 : -1;

  uniforms = {
    u_time: time * 0.001,
    u_mouse: tmouse,
    u_resolution: [gl.canvas.width, gl.canvas.height]
  };

  gl.useProgram(programInfo.program);
  twgl.setBuffersAndAttributes(gl, programInfo, bufferInfo);
  twgl.setUniforms(programInfo, uniforms);
  twgl.drawBufferInfo(gl, bufferInfo);

  requestAnimationFrame(render);
};

// DOM READY
window.addEventListener("DOMContentLoaded", (event) => {
  loadTexture(textureList);
  requestAnimationFrame(render);
});
