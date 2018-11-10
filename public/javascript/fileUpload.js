// Initialize Firebase

firebase.initializeApp(config);

var storageRef = firebase.storage().ref();

function uploadFile()
{
  if (window.FileReader) {
    var fileInput = document.getElementById("fileDocument")
    var filename = document.getElementById("filename")
    if (fileInput.files.length != 1) {
      alert("Please select one file.")
      filename.innerHTML = "Choose file"
      return;
    }

    console.log(fileInput.files[0])

    if (fileInput.files[0].type == "image/jpeg") {
      filename.innerHTML = fileInput.files[0].name
      var imageRef = storageRef.child("images/" + fileInput.files[0].name);
      var file = fileInput.files[0]
      imageRef.put(file).then(function(snapshot) {
        console.log('Uploaded a blob or file!');
        imageRef.getDownloadURL().then(function(url) {
          var URL_Input = document.getElementById('urlLink');
          URL_Input.value = url;
        }).catch(function(error) {
          alert("Error Uploading to the bucket.")
        });
      });

    } else if (fileInput.files[0].type == "video/mp4") {
      alert("I currently disable video upload due to bandwidth limit.")
      /*
      filename.innerHTML = fileInput.files[0].name
      var videoRef = storageRef.child("videos/" + fileInput.files[0].name);
      var file = fileInput.files[0]
      videoRef.put(file).then(function(snapshot) {
        console.log('Uploaded a blob or file!');
        videoRef.getDownloadURL().then(function(url) {
          var URL_Input = document.getElementById('urlLink');
          URL_Input.value = url;
        }).catch(function(error) {
          alert("Error Uploading to the bucket.")
        });
      });
      */
    } else {
      fileInput.files = null
      alert("This is not an image file.")
      filename.innerHTML = "Choose file"
      return;
    }

  }
}
