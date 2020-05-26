import {Mat4} from './math/Mat4';

const createProgram = (gl) => {
  const vertexShaderSource = `
      #version 100
      
      attribute vec3 a_position;
      attribute vec3 a_color;
      varying vec3 v_color;
      uniform mat4 u_ortho;
      
      void main() {
        gl_Position = u_ortho * vec4(a_position, 1.0);
        v_color = a_color;
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
      varying vec3 v_color;
      
      void main() {
        gl_FragColor = vec4(v_color, 1.0);
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
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  };

  const step = (timestamp) => {
    update();
    render();
    requestAnimationFrame(step);
  };

  const start = () => {
    resizeObserver.observe(canvas);

    const vertices = new Float32Array([
      -1.0, -1.0, 0.0, 1.0, 0.0, 0.0,
      1.0, -1.0, 0.0, 0.0, 1.0, 0.0,
      0.0, 1.0, 0.0, 0.0, 0.0, 1.0,
    ]);

    const program = createProgram(gl);
    gl.useProgram(program);

    const positionLocation = gl.getAttribLocation(program, `a_position`);
    const colorLocation = gl.getAttribLocation(program, `a_color`);
    gl.enableVertexAttribArray(positionLocation);
    gl.enableVertexAttribArray(colorLocation);
    const vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    const stride = 4 * 6;
    gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, stride, 0);
    gl.vertexAttribPointer(colorLocation, 3, gl.FLOAT, false, stride, 4 * 3);
    const orthoLocation = gl.getUniformLocation(program, `u_ortho`);
    const aspectRatio = canvas.clientWidth / canvas.clientHeight;
    gl.uniformMatrix4fv(orthoLocation, false, new Float32Array(Mat4.ortho(-aspectRatio, aspectRatio, -1.0, 1.0, -1.0, 1.0)));
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
