function openModal(id) {
  document.getElementById(`modal-${id}`).style.display = 'flex';
}
function closeModal(id) {
  document.getElementById(`modal-${id}`).style.display = 'none';
}

// Close modal when clicking outside content
window.onclick = function(event) {
    document.querySelectorAll(".modal").forEach(modal => {
        if (event.target === modal) {
        modal.style.display = "none";
        }
    });
}

function toggleProfileMenu() {
document.getElementById("profileDropdown").classList.toggle("show");
}

  // Close dropdown if click outside
window.addEventListener("click", function(e) {
const dropdown = document.getElementById("profileDropdown");
const icon = document.querySelector(".profile-icon");
if (dropdown && !dropdown.contains(e.target) && !icon.contains(e.target)) {
    dropdown.classList.remove("show");
}
});