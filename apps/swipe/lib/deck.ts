const WASH = ["#2e6178", "#4a4e46", "#4c3d70", "#657b4f", "#41526e", "#4c3f52"];

export function avatarWash(id: string): string {
  let hash = 0;
  for (let index = 0; index < id.length; index += 1) {
    hash = (hash * 31 + id.charCodeAt(index)) >>> 0;
  }
  return WASH[hash % WASH.length];
}
