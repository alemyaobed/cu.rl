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

