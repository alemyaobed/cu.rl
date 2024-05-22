function clearCache() {
    window.location.reload(true); // Reloads the page, forcing a cache refresh
    console.log('refreshed')
}

    // Toggle customize input field
    document.getElementById('customizeToggle').addEventListener('change', function() {
        var customizeInput = document.getElementById('customizeInput');
        if (this.checked) {
            customizeInput.style.display = 'block';
        } else {
            customizeInput.style.display = 'none';
        }
    });

    // Update hidden input value when custom slug is entered
    document.getElementById('customSlug').addEventListener('input', function() {
        document.getElementById('customSlug').value = this.value;
    });

// Frontend validation for custom slug
document.getElementById('customSlugInput').addEventListener('input', function() {
    var customSlugInput = this.value.trim();
    var regex = /^[a-zA-Z0-9-_]+$/; // Regular expression to allow alphanumeric characters, hyphens, and underscores
    
    if (!regex.test(customSlugInput)) {
        // Show an error message or change the input style to indicate invalid input
        // For example:
        document.getElementById('customSlugError').innerText = 'Invalid custom slug. Please use only letters, numbers, hyphens, and underscores.';
        document.getElementById('customSlugError').classList.add('text-danger');
        // Disable the form submission button
        document.getElementById('submitButton').disabled = true;
    } else {
        // Clear any existing error message and enable the form submission button
        document.getElementById('customSlugError').innerText = '';
        document.getElementById('customSlugError').classList.remove('text-danger');
        document.getElementById('submitButton').disabled = false;
    }
});


 // Attach event listener to browser form
 document.getElementById("browserForm").addEventListener("submit", function(event) {
    event.preventDefault(); // Prevent default form submission
    
    // Get selected browser name
    var browserName = document.getElementById("browserSelect").value;
    
    // Send AJAX request to server
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
      if (xhr.readyState === XMLHttpRequest.DONE) {
        if (xhr.status === 200) {
          // Update filtered clicks
          document.getElementById("filteredClicks").innerHTML = xhr.responseText;
        } else {
          // Handle error
          console.error("Error:", xhr.status);
        }
      }
    };
    xhr.open("GET", "{% url 'filtered_clicks' %}?browser=" + encodeURIComponent(browserName), true);
    xhr.send();
  });
  
  // Attach event listener to platform form
  document.getElementById("platformForm").addEventListener("submit", function(event) {
    event.preventDefault(); // Prevent default form submission
    
    // Get selected platform name
    var platformName = document.getElementById("platformSelect").value;
    
    // Send AJAX request to server
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
      if (xhr.readyState === XMLHttpRequest.DONE) {
        if (xhr.status === 200) {
          // Update filtered clicks
          document.getElementById("filteredClicks").innerHTML = xhr.responseText;
        } else {
          // Handle error
          console.error("Error:", xhr.status);
        }
      }
    };
    xhr.open("GET", "{% url 'filtered_clicks' %}?platform=" + encodeURIComponent(platformName), true);
    xhr.send();
  });

// A function to show the logout modal
function showLogoutModal() {
    var modal = new bootstrap.Modal(document.getElementById('logoutModal'));
    modal.show();
  }

// A function to show the delete modal
document.addEventListener('DOMContentLoaded', function () {
    var deleteModal = document.getElementById('deleteModal');
    deleteModal.addEventListener('show.bs.modal', function (event) {
        var button = event.relatedTarget;
        var urlId = button.getAttribute('data-url-id');
        var form = deleteModal.querySelector('#deleteForm');
        form.action = "{% url 'delete_url' 0 %}".replace('0', urlId);
    });
});


