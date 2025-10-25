import { isPickedup, initMap, renderMap, setPickedup } from "./map.js";

document.addEventListener("DOMContentLoaded", () => {
  // Get all DOM elements
  const menuItems = document.querySelectorAll(".sidebar ul li");
  const statusBtn = document.getElementById("statusBtn");
  const statusText = statusBtn?.querySelector(".status-text");
  const messageItems = document.querySelectorAll(".message-item");
  const backButton = document.querySelector(".back-to-messages");
  const messagesSidebar = document.querySelector(".messages-sidebar");
  const chatArea = document.querySelector(".chat-area");
  const messageForm = document.getElementById("messageForm");
  const chatMessages = document.querySelector(".chat-messages");
  const detailsButtons = document.querySelectorAll("[id='details-btn']");
  const acceptButtons = document.querySelectorAll(".accept-btn");
  const modal = document.getElementById("detailsModal");

  // MESSAGE SENDING
  if (messageForm) {
    messageForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const input = messageForm.querySelector("input");
      const message = input.value.trim();

      if (message) {
        const newMessage = document.createElement("div");
        newMessage.className = "message-bubble sent";

        const time = new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });

        newMessage.innerHTML = `
          <p>${message}</p>
          <span class="message-time">${time}</span>
        `;

        chatMessages.appendChild(newMessage);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        input.value = "";
      }
    });
  }

  // ACTIVE LINK SWITCHING
  if (menuItems) {
    menuItems.forEach((item) => {
      item.addEventListener("click", () => {
        menuItems.forEach((i) => i.classList.remove("active"));
        item.classList.add("active");
      });
    });
  }

  if (statusBtn && statusText) {
    statusBtn.addEventListener("click", () => {
      statusBtn.classList.toggle("online");
      statusText.textContent = statusBtn.classList.contains("online")
        ? "Online"
        : "Offline";
    });
  }

  // RESPONSIVE MESSAGE AREA
  if (messageItems && backButton && messagesSidebar && chatArea) {

    function showChatArea() {
      messagesSidebar.classList.add("hide");
      chatArea.classList.add("show");
    }

    function showMessagesList() {
      messagesSidebar.classList.remove("hide");
      chatArea.classList.remove("show");
    }

    if (window.innerWidth <= 768) {
      showMessagesList();
    }

    messageItems.forEach((item, index) => {
      item.addEventListener("click", () => {
        if (window.innerWidth <= 768) {
          showChatArea();
        }
      });
    });

    backButton.addEventListener("click", () => {
      showMessagesList();
    });

    const chatInput = document.querySelector(".chat-input input");
    let isInputFocused = false;

    if (chatInput) {
      chatInput.addEventListener("focus", () => {
        isInputFocused = true;
      });

      chatInput.addEventListener("blur", () => {
        isInputFocused = false;
      });
    }

    let lastWidth = window.innerWidth;
    window.addEventListener("resize", () => {
      if (lastWidth !== window.innerWidth && !isInputFocused) {
        lastWidth = window.innerWidth;
        if (window.innerWidth > 768) {
          messagesSidebar.classList.remove("hide");
          chatArea.classList.remove("show");
        } else {
          if (!chatArea.classList.contains("show")) {
            showMessagesList();
          }
        }
      }
    });
  }

  // MODAL FUNCTIONALITY FOR DETAILS BUTTON
  if (detailsButtons && modal) {
    detailsButtons.forEach((button) => {
      button.addEventListener("click", function (e) {
        if (e.target.classList.contains("accept-btn")) {
          return;
        }
        modal.style.display = "flex";
        setTimeout(() => {
          initMap("map");
        }, 100);
      });
    });
  }

  // SCHEDULE TAB FUNCTIONALITY
  const scheduleTabGroup = document.querySelector(".pill-toggle-group");
  const bookingsSection = document.getElementById("bookings-section");
  const ongoingSection = document.getElementById("ongoing-section");
  const historySection = document.getElementById("history-section");

  function showScheduleSection(activeTab) {
    // Hide all sections
    if (bookingsSection) bookingsSection.style.display = "none";
    if (ongoingSection) ongoingSection.style.display = "none";
    if (historySection) historySection.style.display = "none";

    // Show the active section
    switch (activeTab) {
      case "bookings":
        if (bookingsSection) bookingsSection.style.display = "block";
        break;
      case "ongoing":
        if (ongoingSection) ongoingSection.style.display = "block";
        break;
      case "history":
        if (historySection) historySection.style.display = "block";
        break;
    }
  }

  // Add event listeners to schedule tabs
  if (scheduleTabGroup) {
    scheduleTabGroup.addEventListener("change", (e) => {
      if (e.target.type === "radio") {
        showScheduleSection(e.target.value);
      }
    });

    showScheduleSection("bookings");
  }
});

const confirmArrivalBtn = document.getElementById("confirmArrivalBtn");
const confirmDropoffBtn = document.getElementById("confirmDropoffBtn");
const confirmationText = document.getElementById("confirmationText");
const headerText = document.getElementById("headerText");
const cancelArrivalBtn = document.getElementById("cancelArrivalBtn");
const toggleBtn = document.getElementById("togglePickup");

// FUNCTIONS
function openInGoogleMaps(button) {
  if (!button) return;
  const locationNameElem = button
    .closest(".route-item")
    ?.querySelector(".location-name");
  if (!locationNameElem) return;
  const locationName = locationNameElem.innerText.trim();
  if (!locationName) return;

  const encodedLocation = encodeURIComponent(locationName);
  const url = `https://www.google.com/maps/search/?api=1&query=${encodedLocation}`;

  // Open in a new tab
  window.open(url, "_blank");
}

// MODAL FUNCTIONS
function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (!modal) return;
  modal.classList.remove("show");
  modal.style.display = "";
  document.body.classList.remove("modal-open");
}

function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (!modal) return;
  modal.style.display = "flex";
  modal.classList.add("show");
  document.body.classList.add("modal-open");
}

if (toggleBtn) {
  toggleBtn.addEventListener("click", () => {
    openModal("arrivedPickupModal");
  });
}

function confirmArrival() {
  closeModal("arrivedPickupModal");
  setPickedup(true);
  renderMap("map");
  const toggleBtn = document.getElementById("togglePickup");
  if (toggleBtn) toggleBtn.textContent = "Arrived at Destination";
  if (confirmArrivalBtn) confirmArrivalBtn.style.display = "none";
  if (confirmDropoffBtn) confirmDropoffBtn.style.display = "inline-block";
  if (confirmationText) {
    confirmationText.textContent =
      "Are you sure you’ve arrived at the passenger’s drop-off location?";
  }
}

function confirmDropoffArrival() {
  closeModal("arrivedDropoffModal");
  setPickedup(false);
  renderMap("map");
  const toggleBtn = document.getElementById("togglePickup");
  if (toggleBtn) {
    confirmDropoffBtn.disabled = true;

    toggleBtn.textContent = "Completed";
  }
  if (confirmDropoffBtn) confirmDropoffBtn.style.display = "none";
  if (confirmationText) {
    confirmationText.textContent = "Your trip has been successfully completed!";
  }
  if (headerText) {
    headerText.textContent = "Trip Completed";
  }
  if (cancelArrivalBtn) {
    cancelArrivalBtn.textContent = "Okay";
  }
}

function openBookingAcceptedModal() {
  toggleModal("bookingAccepted", true);
}

function confirmBookingAndShowDetails() {
  closeModal("bookingAccepted");
  const detailsmodal = document.getElementById("detailsModal");
  if (!detailsmodal) return;

  detailsmodal.style.display = "flex";
  detailsmodal.classList.add("show");
  document.body.classList.add("modal-open");

  setTimeout(() => initMap("map"), 100);
}

// Make functions globally available
window.closeModal = closeModal;
window.openModal = openModal;
window.confirmArrival = confirmArrival;
window.confirmDropoffArrival = confirmDropoffArrival;
window.openInGoogleMaps = openInGoogleMaps;
window.openBookingAcceptedModal = openBookingAcceptedModal;
window.confirmBookingAndShowDetails = confirmBookingAndShowDetails;
