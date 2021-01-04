window.addEventListener('load', function() {
  document.querySelector('input[type="file"]').addEventListener('change', function() {
    if (this.files && this.files[0]) {
        var img = document.querySelector('#image');  // $('img')[0]
        img.src = URL.createObjectURL(this.files[0]); // set src to file url
    }
  });
});
