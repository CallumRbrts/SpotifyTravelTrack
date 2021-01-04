function deletePlaylist() {
    let deleteBtn = document.getElementById("delete-button");
    deleteBtn.classList.add("delete-button-active");

    setTimeout(function () {
        // Clear the "confirm" option if the user hasn't done so after 5 seconds
        deleteBtn.classList.remove("delete-button-active");
    }, 3000);
}

function deleteJourney() {
    let deleteBtn = document.getElementById("delete-button-journey");
    deleteBtn.classList.add("delete-button-active");

    setTimeout(function () {
        // Clear the "confirm" option if the user hasn't done so after 5 seconds
        deleteBtn.classList.remove("delete-button-active");
    }, 3000);
}

function confirmDelete() {
    let playlistItem = document.getElementsByClassName("vertical-container-item")[0];
    playlistItem.classList.add("item-deleted");

    let emptyMessage = document.getElementById("pv-message");
    if (emptyMessage != null)
        emptyMessage.style.visibility = "visible";
    // after animating, actually remove it.. parent id = playlist-items-container
}

// Modal for generate playlist button
function showLinkSpotifyModal() {
    toggleModal()
}

var modal = document.querySelector(".modal");
var closeButton = document.querySelector(".close-button");

function toggleModal() {
    modal.classList.toggle("show-modal");
}

function windowOnClick(event) {
    if (event.target === modal) {
        toggleModal();
    }
}

closeButton.addEventListener("click", toggleModal);
window.addEventListener("click", windowOnClick);