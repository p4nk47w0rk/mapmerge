
class Rectangle {
  constructor(height, width) {
    this.height = height;
    this.width = width;
  }
}

let a = 4;

console.log(a)

hoisted(); // logs "foo"

function hoisted() {
  console.log("foo");
}
