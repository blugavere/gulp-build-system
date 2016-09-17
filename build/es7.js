/*
  stage 0 - strawman - ideas people submit
  stage 1 - proposal
  stage 2 - draft - syntax / smantics
  stage 3 - candidate - spec complete, has at least 2 implementations
  stage 4 - finished

{
  "plugins": ["transform-runtime"],
  "presets": ["es2017"]
}
*/

/**
 * Exponentiation Operator
 * x ** y
 * let squared = 2 ** 2;
 * let cubed = 3
 * cubed **=3
 */

/**
 * Array.prototype.includes
 * ['a', 'b'] 
 * array.includes('a') -- works with nan
 */

/**
 * Object.values/Object.entries
 * Object.values => Object.keys(but for values)
 * returns array of the values of the Object
 * object.entries returns an array of the key value pairs.
 * 
 * String padding
 * '1'.padStart(3, '0');
 *  //10
 * 
 * returns the setters and get the getters as well as properties
 * Object.getOwnPropertyDescriptors()
 * const obj = {
 * [Symbol('foo')]: 123,
 * --object json + getters/setters;
 * get: undfeined}
 * 
 * 
 * Async Functions
 * function dosomethingAsync() {
 *  setTimeout(function() {
 *    if(typeof callback === 'function') {
 *    callback()   
 * }
 *  })
 * }
 * 
 * makes function return a promise - 
 * 
 * async funciton dowork(){
 *  
 * };
 * 
 * 
 * await async - it will wait until async function returns
 */
/*

async function doWork() {

  try {
    value = await doSomethingAsync();
  }
}
//ponyfoo.com/aerticles/understanding-javascript-async-await
*/
/**
 * 
 * SIMD.js - SIMD APIs + polyfill
 * https://www.npmjs.com/package/babel-preset-es2017
 * 
 */