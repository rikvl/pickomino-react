
export function getRandomIntIncl(minVal, maxVal, randFunc = Math.random) {
  return Math.floor(randFunc() * (maxVal - minVal + 1)) + minVal;
}

export function distance(pos1, pos2) {
  return Math.sqrt( (pos1.x - pos2.x)**2 + (pos1.y - pos2.y)**2 );
}

export function checkCircleCollision(circles, radius, pos) {
  return circles.every(circle => distance(circle.pos, pos) > radius);
}
