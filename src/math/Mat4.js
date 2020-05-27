const identity = () => {
  return [
    1.0, 0.0, 0.0, 0.0,
    0.0, 1.0, 0.0, 0.0,
    0.0, 0.0, 1.0, 0.0,
    0.0, 0.0, 0.0, 1.0,
  ];
};

const scale = (scaleX, scaleY, scaleZ) => {
  return [
    scaleX, 0.0, 0.0, 0.0,
    0.0, scaleY, 0.0, 0.0,
    0.0, 0.0, scaleZ, 0.0,
    0.0, 0.0, 0.0, 1.0,
  ];
};

const translate = (translateX, translateY, translateZ) => {
  return [
    1.0, 0.0, 0.0, 0.0,
    0.0, 1.0, 0.0, 0.0,
    0.0, 0.0, 1.0, 0.0,
    translateX, translateY, translateZ, 1.0,
  ];
};

const rotate = (angle, axis) => {
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  const cc = 1 - c;
  const [x, y, z] = axis;

  return [
    c + x * x * cc,     y * x * cc + z * s, z * x * cc - y * s, 0.0,
    x * y * cc - z * s, c + y * y * cc,     z * y * cc + x * s, 0.0,
    x * z * cc + y * s, y * z * cc - x * s, c + z * z * cc, 0.0,
    0.0, 0.0, 0.0, 1.0,
  ];
};

const ortho = (left, right, bottom, top, near, far) => {
  const x = right - left;
  const y = top - bottom;
  const z = far - near;
  const w1 = (left + right) / -x;
  const w2 = (bottom + top) / -y;
  const w3 = (near + far) / -z;

  return [
    2 / x, 0.0, 0.0, 0.0,
    0.0, 2 / y, 0.0, 0.0,
    0.0, 0.0, -2 / z, 0.0,
    w1, w2, w3, 1.0
  ];
};

const multiply = (a, b) => {
  return [
    b[0] * a[0] + b[1] * a[4] + b[2] * a[8] + b[3] * a[12], b[0] * a[1] + b[1] * a[5] + b[2] * a[9] + b[3] * a[13], b[0] * a[2] + b[1] * a[6] + b[2] * a[10] + b[3] * a[14], b[0] * a[3] + b[1] * a[7] + b[2] * a[11] + b[3] * a[15],
    b[4] * a[0] + b[5] * a[4] + b[6] * a[8] + b[7] * a[12], b[4] * a[1] + b[5] * a[5] + b[6] * a[9] + b[7] * a[13], b[4] * a[2] + b[5] * a[6] + b[6] * a[10] + b[7] * a[14], b[4] * a[3] + b[5] * a[7] + b[6] * a[11] + b[7] * a[15],
    b[8] * a[0] + b[9] * a[4] + b[10] * a[8] + b[11] * a[12], b[8] * a[1] + b[9] * a[5] + b[10] * a[9] + b[11] * a[13], b[8] * a[2] + b[9] * a[6] + b[10] * a[10] + b[11] * a[14], b[8] * a[3] + b[9] * a[7] + b[10] * a[11] + b[11] * a[15],
    b[12] * a[0] + b[13] * a[4] + b[14] * a[8] + b[15] * a[12], b[12] * a[1] + b[13] * a[5] + b[14] * a[9] + b[15] * a[13], b[12] * a[2] + b[13] * a[6] + b[14] * a[10] + b[15] * a[14], b[12] * a[3] + b[13] * a[7] + b[14] * a[11] + b[15] * a[15],
  ];
};

const cross = (a, b) => {
  const [ax, ay, az] = a;
  const [bx, by, bz] = b;

  return [
    ay * bz - az * by,
    az * bx - ax * bz,
    ax * by - ay * bx,
  ]
};

const dot = (a, b) => {
  const [ax, ay, az] = a;
  const [bx, by, bz] = b;

  return ax * bx + ay * by + az * bz;
};

const normalize = (v) => {
  const [x, y, z] = v;
  const magnitude = Math.sqrt(x * x + y * y + z * z);
  return v.map(c => c / magnitude);
};

const subtract = (a, b) => {
  return [
    a[0] - b[0],
    a[1] - b[1],
    a[2] - b[2],
  ]
};

const lookAt = (position, target, up) => {
  const z = normalize(subtract(position, target));
  const x = normalize(cross(up, z));
  const y = cross(z, x);
  const rotateMatrix = [
    x[0], y[0], z[0], 0.0,
    x[1], y[1], z[1], 0.0,
    x[2], y[2], z[2], 0.0,
    0.0, 0.0, 0.0, 1.0,
  ]

  const translateMatrix = translate(-position[0], -position[1], -position[2]);

  return multiply(rotateMatrix, translateMatrix)
};

export const Mat4 = {
  ortho,
  multiply,
  translate,
  rotate,
  scale,
  identity,
  lookAt,
};
