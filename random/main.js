var random = require('pex-random');

console.log(random.int(0, 5));
console.log(random.float());
console.log(random.vec2());
console.log(random.vec3());
console.log(random.vec2InRect([[-1,-1], [1,1]]));
console.log(random.vec3InAABB([[-1,-1,-1], [1,1,1]]));
console.log(random.element(['a', 'b', 'c']));
console.log(random.noise2(1, 2))
console.log(random.noise3(1, 2, 3))
console.log(random.noise4(1, 2, 3, 4))
