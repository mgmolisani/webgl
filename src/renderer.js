import {Mat4} from './math/Mat4';

const createProgram = (gl) => {
  const vertexShaderSource = `
      #version 100
      
      attribute vec3 a_position;
      uniform mat4 u_model;
      uniform mat4 u_view;
      uniform mat4 u_ortho;
      
      void main() {
        gl_Position = u_ortho * u_view * u_model * vec4(a_position, 1.0);
      }
    `;

  const vertexShader = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vertexShader, vertexShaderSource);
  gl.compileShader(vertexShader);

  if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
    console.log(gl.getShaderInfoLog(vertexShader));
  }

  const fragmentShaderSource = `
      #version 100
      
      precision mediump float;
      
      void main() {
        vec3 color = vec3(gl_FragCoord.z);
        gl_FragColor = vec4(color, 1.0);
      }
    `;

  const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(fragmentShader, fragmentShaderSource);
  gl.compileShader(fragmentShader);

  if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
    console.log(gl.getShaderInfoLog(fragmentShader));
  }

  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  gl.detachShader(program, vertexShader);
  gl.detachShader(program, fragmentShader);
  gl.deleteShader(vertexShader);
  gl.deleteShader(fragmentShader);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.log(gl.getProgramInfoLog(program));
  }

  return program;
}

export const WebGLRenderer = (canvas) => {
  const gl = canvas.getContext(`webgl`, {antialias: false});
  let animationFrameHandle = 0;

  const resizeObserver = new ResizeObserver(entries => {
    entries.forEach(({target}) => {
      target.width = target.clientWidth;
      target.height = target.clientHeight;
      gl.viewport(0, 0, target.clientWidth, target.clientHeight);
    });
  });

  const update = () => {
  };

  const render = () => {
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);
    gl.drawElements(gl.TRIANGLES, 3 * 12, gl.UNSIGNED_SHORT, 0);
  };

  const step = (timestamp) => {
    update();
    render();
    requestAnimationFrame(step);
  };

  const start = () => {
    resizeObserver.observe(canvas);

    const vertices = new Float32Array([
      0.0, 0.0, 0.0,
      0.0, 0.0, 1.0,
      0.0, 1.0, 0.0,
      0.0, 1.0, 1.0,
      1.0, 0.0, 0.0,
      1.0, 0.0, 1.0,
      1.0, 1.0, 0.0,
      1.0, 1.0, 1.0,
    ]);

    const indices = new Uint16Array([
      0, 6, 4,
      0, 2, 6,
      0, 3, 2,
      0, 1, 3,
      2, 7, 6,
      2, 3, 7,
      4, 6, 7,
      4, 7, 5,
      0, 4, 5,
      0, 5, 1,
      1, 5, 7,
      1, 7, 3
    ]);

    const program = createProgram(gl);
    gl.useProgram(program);

    const positionLocation = gl.getAttribLocation(program, `a_position`);
    gl.enableVertexAttribArray(positionLocation);
    const vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    const ebo = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ebo);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
    gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);
    const modelLocation = gl.getUniformLocation(program, `u_model`);
    const translationMatrix = Mat4.translate(-0.5, -0.5, -0.5);
    const scaleMatrix = Mat4.scale(0.5, 0.5, 0.5);
    const rotationMatrix = Mat4.rotate(Math.PI / 4, [0.0, 1.0, 0.0]);
    const modelMatrix = Mat4.multiply(Mat4.multiply(rotationMatrix, scaleMatrix), translationMatrix);
    gl.uniformMatrix4fv(modelLocation, false, new Float32Array(modelMatrix));
    const viewLocation = gl.getUniformLocation(program, `u_view`);
    const viewMatrix = Mat4.lookAt([0.0, 3.0, 3.0], [0.0, 0.0, 0.0], [0.0, 1.0, 0.0]);
    gl.uniformMatrix4fv(viewLocation, false, new Float32Array(viewMatrix));
    const orthoLocation = gl.getUniformLocation(program, `u_ortho`);
    const aspectRatio = canvas.clientWidth / canvas.clientHeight;
    const ortho = Mat4.ortho(-aspectRatio, aspectRatio, -1.0, 1.0, 0.1, 100);
    gl.uniformMatrix4fv(orthoLocation, false, new Float32Array(ortho));
    step(performance.now());
  };

  const stop = () => {
    resizeObserver.unobserve(canvas);
    cancelAnimationFrame(animationFrameHandle);
  };

  return {
    start,
    stop,
  };
};
