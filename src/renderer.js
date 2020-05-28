import {Mat4} from './math/Mat4';
import {ObjLoader} from './loaders/objLoader';
import {object} from './objects/cube';

const createProgram = (gl) => {
  const vertexShaderSource = `
      #version 100
      
      attribute vec3 a_position;
      attribute vec3 a_normal;
      uniform mat4 u_model;
      uniform mat4 u_view;
      uniform mat4 u_ortho;
      varying vec3 v_normal;
      varying vec3 v_world_position;
      
      mat4 transpose(mat4 m) {
        return mat4(m[0][0], m[1][0], m[2][0], m[3][0],
                    m[0][1], m[1][1], m[2][1], m[3][1],
                    m[0][2], m[1][2], m[2][2], m[3][2],
                    m[0][3], m[1][3], m[2][3], m[3][3]);
      }
      
      mat4 inverse(mat4 m) {
        float
            a00 = m[0][0], a01 = m[0][1], a02 = m[0][2], a03 = m[0][3],
            a10 = m[1][0], a11 = m[1][1], a12 = m[1][2], a13 = m[1][3],
            a20 = m[2][0], a21 = m[2][1], a22 = m[2][2], a23 = m[2][3],
            a30 = m[3][0], a31 = m[3][1], a32 = m[3][2], a33 = m[3][3],
      
            b00 = a00 * a11 - a01 * a10,
            b01 = a00 * a12 - a02 * a10,
            b02 = a00 * a13 - a03 * a10,
            b03 = a01 * a12 - a02 * a11,
            b04 = a01 * a13 - a03 * a11,
            b05 = a02 * a13 - a03 * a12,
            b06 = a20 * a31 - a21 * a30,
            b07 = a20 * a32 - a22 * a30,
            b08 = a20 * a33 - a23 * a30,
            b09 = a21 * a32 - a22 * a31,
            b10 = a21 * a33 - a23 * a31,
            b11 = a22 * a33 - a23 * a32,
      
            det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;
      
        return mat4(
            a11 * b11 - a12 * b10 + a13 * b09,
            a02 * b10 - a01 * b11 - a03 * b09,
            a31 * b05 - a32 * b04 + a33 * b03,
            a22 * b04 - a21 * b05 - a23 * b03,
            a12 * b08 - a10 * b11 - a13 * b07,
            a00 * b11 - a02 * b08 + a03 * b07,
            a32 * b02 - a30 * b05 - a33 * b01,
            a20 * b05 - a22 * b02 + a23 * b01,
            a10 * b10 - a11 * b08 + a13 * b06,
            a01 * b08 - a00 * b10 - a03 * b06,
            a30 * b04 - a31 * b02 + a33 * b00,
            a21 * b02 - a20 * b04 - a23 * b00,
            a11 * b07 - a10 * b09 - a12 * b06,
            a00 * b09 - a01 * b07 + a02 * b06,
            a31 * b01 - a30 * b03 - a32 * b00,
            a20 * b03 - a21 * b01 + a22 * b00) / det;
      }
      
      void main() {
        v_normal = a_normal;
        v_world_position = vec3(u_model * vec4(a_position, 1.0));
        gl_Position = u_ortho * u_view * vec4(v_world_position, 1.0);
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
      
      uniform vec3 u_light_position;
      uniform vec3 u_view_position;
      //uniform vec3 u_color;
      varying vec3 v_normal;
      varying vec3 v_world_position;
      
      void main() {
        vec3 model_color = vec3(1.0, 0.5, 0.25);
        vec3 light_color = vec3(1.0);
        vec3 ambient = 0.1 * light_color;
        vec3 normal = normalize(v_normal);
        vec3 light_direction = normalize(u_light_position - v_world_position);
        float diff = max(dot(normal, light_direction), 0.0);
        vec3 diffuse = diff * light_color;
        float specular_strength = 0.5;
        vec3 view_direction = normalize(u_view_position - v_world_position);
        vec3 reflect_direction = reflect(-light_direction, normal);  
        float shininess = pow(max(dot(view_direction, reflect_direction), 0.0), 256.0);
        vec3 specular = specular_strength * shininess * light_color;
        vec3 light = ambient + diffuse + specular;
        // gl_FragColor = vec4(light * vec3(1.0, 0.5, 0.25), 1.0);
        gl_FragColor = vec4(model_color, 1.0);
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
    const cube = ObjLoader.load(object);
    console.log(cube);
    const vertices = new Float32Array(cube.vertices);
    const indices = new Uint16Array(cube.indices);
    const stride = 6 * 4;
    const program = createProgram(gl);
    gl.useProgram(program);

    const positionLocation = gl.getAttribLocation(program, `a_position`);
    const normalLocation = gl.getAttribLocation(program, `a_normal`);
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
    const modelLocation = gl.getUniformLocation(program, `u_model`);
    const modelMatrix = Mat4.identity();
    gl.uniformMatrix4fv(modelLocation, false, new Float32Array(modelMatrix));
    const cameraPosition = [3.0, 3.0, 3.0];
    const lightPosition = [-3.0, 3.0, 3.0];
    const viewLocation = gl.getUniformLocation(program, `u_view`);
    const viewMatrix = Mat4.lookAt(cameraPosition, [0.0, 0.0, 0.0], [0.0, 1.0, 0.0]);
    gl.uniformMatrix4fv(viewLocation, false, new Float32Array(viewMatrix));
    const orthoLocation = gl.getUniformLocation(program, `u_ortho`);
    const aspectRatio = canvas.clientWidth / canvas.clientHeight;
    const ortho = Mat4.ortho(-aspectRatio, aspectRatio, -1.0, 1.0, 0.1, 100);
    gl.uniformMatrix4fv(orthoLocation, false, new Float32Array(ortho));
    const lightPositionLocation = gl.getUniformLocation(program, `u_light_position`);
    gl.uniform3fv(lightPositionLocation, new Float32Array(lightPosition));
    const viewPositionLocation = gl.getUniformLocation(program, `u_view_position`);
    gl.uniform3fv(viewPositionLocation, new Float32Array(cameraPosition));
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
