// Event Loop Practice 19/10/2025

console.log("program started");

setTimeout(() => {
  console.log("setTimeout");
}, 0);

setImmediate(() => console.log("setImmediate"));

process.nextTick(() => {
  console.log("nextTick");
});

Promise.resolve().then(() => {
  console.log("promise resolved");
});

/*
OUTPUT:
program started
program ended   
nextTick        
promise resolved
setTimeout      
setImmediate
*/

//WHY??

/*
Synchronous codes run first...therefore both console logs gets outputted first, followed by microtask queue which includes (promises, process.nextTick) and finally macrotask queue which includes (setTimeout, setImmediate))
*/

//USE CASE

const forLoopFunc = () => {
  const arr = [];

  console.time("program");

  for (let i = 0; i < 100000000; i++) {
    arr.push(Math.floor(Math.random() * i));
  }

  console.timeEnd("program");
};

//forLoopFunc();

/*
OUTPUT:
program started
program: 4.336s // It takes approx 4s to run the for loop which was done synchronously, affecting the output time of the other synchronous console.log...
program ended
nextTick
promise resolved
setTimeout
setImmediate
*/

// Now to apply the knowledge gained from how event loop works it would be more optimized if the for loop function is written in a way that the loop is done asynchronously. i.e added to the event loop thereby not affecting the runing of the synchronous code.

const asyncForLoopFunc = () => {
  const arr = [];

  console.time("program");

  const asyncLoop = (i, arr) => {
    if (i >= 100000000) {
        console.timeEnd("program");
        return;
    };
    arr.push(Math.floor(Math.random() * i));
    setImmediate(() => asyncLoop(i + 1, arr));
  }

  asyncLoop(0, arr);
};

asyncForLoopFunc();

/*
OUTPUT:
program started
program ended   
nextTick        
promise resolved
setTimeout      
setImmediate    
program: 4.403s // Now the operation takes same time to run (though the setImmediate might add some overhead) but it doesn't block the synchronous code from running first. which means the delay caused by the for loop is no longer affecting the output time of the other synchronous console.log...
*/

console.log("program ended");


// PS: Please don't run this on your laptop...mine's pretty dancing in tanjiro's hinokami Kagura's flame at the moment 😂😂