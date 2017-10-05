export const bypass = f => a => { f(a); return a }
export const combine = fs => a => fs.reduce((b, f) => f(b), a)
export const chain = fs => (a, ...rest) => fs.reduce((b, f) => b.then(c => f(c, ...rest)), a)
export const toProp = prop => object => object[prop]
