var myIndex = 0;
var content = !{JSON.stringify(Content)};
console.log(content);
function carousel() {
    var i;
    var x = document.getElementsByClassName("slideshow");
    console.log(x)
    console.log(x.length)
    for (i = 0; i < x.length; i++) {
       x[i].style.display = "none";
    }
    myIndex++;
    if (myIndex > x.length) {myIndex = 1}
    x[myIndex-1].style.display = "block";
    if (content[myIndex-1].type == "video") {
      //document.getElementById("myVideo").load();
    } else {
      //document.getElementById("myVideo").pause();
    }
    setTimeout(carousel, content[myIndex-1].delay * 1000); // Change image every 2 seconds
}
carousel();