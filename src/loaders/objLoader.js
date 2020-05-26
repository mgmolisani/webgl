export const objLoader = (obj) => {
  const geometries = [null];
  const normals = [null];
  const textures = [null];
  let object = [];

  obj.split(`\n`).forEach(line => {
    const [key, ...data] = line.split(` `);

    if (key === `v`) {
      geometries.push(data);
    } else if (key === `vt`) {
      textures.push(data);
    } else if (key === `vn`) {
      normals.push(data);
    } else if (key === `f`) {
      data.forEach(vertex => {
        const [g, t, n] = vertex.split(`/`);
        object = object.concat(g && geometries[g], t && textures[t], n && normals[n]);
      })
    }
  })

  return object;
}
