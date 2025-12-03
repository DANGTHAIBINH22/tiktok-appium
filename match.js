
let a = [1,2,4,5,6,7,8,9,10, 11]
let b = [1,2,6,7,8,9,10]
// let results =  [1,2 ,6,7,8,9,10]
let results = a.filter( v => b.includes(v) )
console.log(results)
// expected output: [1,2,6,7,8,9,10]