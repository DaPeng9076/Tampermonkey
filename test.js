var arr = [10,21,[13,14,[25]],56,[47,[28,19,[15,16,[23]]]]]


const fun = function(arr) {
  arr.forEach(element => {
    if(typeof element == "object") {
      fun(element)
    }
    else {
      console.log(element)
    }
  });
}

fun(arr)