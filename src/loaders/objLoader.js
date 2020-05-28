const load = (obj) => {
    const positions = [null];
    const normals = [null];
    const vertices_ = [];
    const indices_ = [];

    obj.split(`\n`).forEach(line => {
      const [key, ...data] = line.split(/\s+/).filter(item => item !== ``);
      if (key === `v`) {
        positions.push(data);
      } else if (key === `vn`) {
        normals.push(data);
      } else if (key === `f`) {
        data.forEach(vertex => {
          const [p, t, n] = vertex.split(`/`);
          const found = vertices_.findIndex(v =>
            v[0] === positions[p] && v[1] === normals[n]
          );

          if (found === -1) {
            indices_.push(vertices_.length);
            vertices_.push([
              positions[p],
              normals[n]
            ]);
          } else {
            indices_.push(found);
          }
        });
      }
    });

    return {
      vertices: vertices_.flat(2),
      indices: indices_,
    }
}

export const ObjLoader = {
  load,
}
