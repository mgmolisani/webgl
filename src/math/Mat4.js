const identity = () => {
  return [
    1.0, 0.0, 0.0, 0.0,
    0.0, 1.0, 0.0, 0.0,
    0.0, 0.0, 1.0, 0.0,
    0.0, 0.0, 0.0, 1.0,
  ]
}

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
}


export const Mat4 = {
  ortho,
  identity,
}
