function openModal(id) {
    document.getElementById("modal-" + id).style.display = "flex";
}

function closeModal(id) {
    document.getElementById("modal-" + id).style.display = "none";
}

// Close modal when clicking outside content
window.onclick = function(event) {
    document.querySelectorAll(".modal").forEach(modal => {
        if (event.target === modal) {
        modal.style.display = "none";
        }
    });
}

