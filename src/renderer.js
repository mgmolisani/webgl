import {Mat4} from './math/Mat4';
import {ObjLoader} from './loaders/objLoader';
import {object} from './objects/cube';
import {createFragmentShader, createVertexShader} from './shader';

const createProgram = (gl) => {
  const vertexShader = createVertexShader(gl);
  vertexShader.logCompileStatus();
  const fragmentShader = createFragmentShader(gl);
  fragmentShader.logCompileStatus();
  const program = gl.createProgram();
  gl.attachShader(program, vertexShader.shader);
  gl.attachShader(program, fragmentShader.shader);
  gl.linkProgram(program);
  gl.detachShader(program, vertexShader.shader);
  gl.detachShader(program, fragmentShader.shader);
  gl.deleteShader(vertexShader.shader);
  gl.deleteShader(fragmentShader.shader);

  const logLinkStatus = () => {
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.log(`Link Status: ${gl.getProgramInfoLog(program)}`);
    }
  }

  const mapUniforms = (uniformMaps) => {
    return uniformMaps.reduce((combinedUniformMaps, uniforms) => {
      const uniformMap = uniforms.reduce((uniformSetterMap, {variableType, name}) => {
        const location = gl.getUniformLocation(program, name);
        let setter = () => {};

        if (variableType === `mat4`) {
          setter = value => gl.uniformMatrix4fv(location, false, new Float32Array(value));
        } else if (variableType === `vec3`) {
          setter = value => gl.uniform3fv(location, new Float32Array(value))
        }

        uniformSetterMap.set(name, setter);
        return uniformSetterMap;
      }, new Map());

      return new Map([...combinedUniformMaps, ...uniformMap])
    }, new Map())
  }

  const uniformsMap = mapUniforms([vertexShader.uniforms, fragmentShader.uniforms]);
  const uniforms = {
    set: (key, value) => uniformsMap.get(key)(value),
  }

  return {
    program,
    uniforms,
    logLinkStatus,
  };
};

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
    const cube = ObjLoader.load(object);
    console.log(cube);
    const vertices = new Float32Array(cube.vertices);
    const indices = new Uint16Array(cube.indices);
    const stride = 6 * 4;
    const program = createProgram(gl);
    gl.useProgram(program.program);

    const positionLocation = gl.getAttribLocation(program.program, `a_position`);
    const normalLocation = gl.getAttribLocation(program.program, `a_normal`);
    gl.enableVertexAttribArray(positionLocation);
    gl.enableVertexAttribArray(normalLocation);
    const vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    const ebo = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ebo);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
    gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, true, stride, 0);
    gl.vertexAttribPointer(normalLocation, 3, gl.FLOAT, false, stride, 3 * 4);
    const modelMatrix = Mat4.scale(1, 1, 1);
    program.uniforms.set(`u_model`, modelMatrix);
    const cameraPosition = [1.0, 2.0, 2.0];
    const lightPosition = [0.75, 1.0, -1.0];
    const viewMatrix = Mat4.lookAt(cameraPosition, [0.0, 0.0, 0.0], [0.0, 1.0, 0.0]);
    program.uniforms.set(`u_view`, viewMatrix);
    const aspectRatio = canvas.clientWidth / canvas.clientHeight;
    //const ortho = Mat4.ortho(-aspectRatio, aspectRatio, -1.0, 1.0, 0.1, 100);
    const ortho = Mat4.perspective(Math.PI / 3, aspectRatio, 0.1, 1000);
    program.uniforms.set(`u_ortho`, ortho);
    program.uniforms.set(`u_light_position`, lightPosition);
    program.uniforms.set(`u_view_position`, cameraPosition);
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
