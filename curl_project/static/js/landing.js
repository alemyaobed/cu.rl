// Bootstrap js for activating tooltip functionality everywhere
var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl);
});

// Exhibiting the copy functionality of the shortened URL
function copyToClipboard() {
    var copyText = document.getElementById("shortened-url");
   
    navigator.clipboard.writeText(copyText.value);
    
    var tooltip = document.getElementById("copy-btn");
    console.log(tooltip);
    tooltip["data-bs-original-title"] = "Copied!";
  }

