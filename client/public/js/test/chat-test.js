"use strict";

function setDefaultDialogPage(pageName) {
	const defaultTab = document.querySelector(`#${pageName}-tab`);
	const defaultPage = document.querySelector(`#${pageName}-page`);
	if (defaultPage && defaultTab) {
		defaultTab.setAttribute("selected", "");
		defaultPage.setAttribute("selected", "");
	} else {
		console.error("Could not find the default page for", pageName);
	}
}

function unsetPage() {
	const tab = document.querySelector(".dialog-tab[selected]");
	const page = document.querySelector(".dialog-page[selected]");
	if (tab && page) {
		tab.removeAttribute("selected");
		page.removeAttribute("selected");
	}
}

function outsideClickHandler(event) {
	const dialog = event.target;
	const rect = dialog.getBoundingClientRect();
	const isInDialog =
		rect.top <= event.clientY &&
		event.clientY <= rect.top + rect.height &&
		rect.left <= event.clientX &&
		event.clientX <= rect.left + rect.width;
	if (!isInDialog) {
		dialog.close();
		unsetPage();
	}
}

const dialogs = document.querySelectorAll("dialog");
dialogs.forEach((dialog) => {
	dialog.addEventListener("click", outsideClickHandler);
});

const closeButtons = document.querySelectorAll(".dialog-footer > button");
closeButtons.forEach((closeButton) => {
	closeButton.addEventListener("click", (event) => {
		// Does this count as too much?
		event.target.parentElement.parentElement.parentElement.close();
		unsetPage();
	});
});

const dialogTabs = document.querySelectorAll(".dialog-tab");
dialogTabs.forEach((dialogTab) => {
	dialogTab.addEventListener("click", function (event) {
		unsetPage();
		console.log(event.target.id);
		const nameComponents = event.target.id.split("-");
		nameComponents.pop();
		const pageName = nameComponents.join("-");
		const newPage = document.querySelector(`#${pageName}-page`);
		if (newPage) {
			newPage.setAttribute("selected", "");
			event.target.setAttribute("selected", "");
		}
	});
});

const settingsDialog = document.querySelector("dialog#main-settings");
const showButton = document.querySelector("#settings-button");

// "Show the dialog" button opens the dialog modally
showButton.addEventListener("click", () => {
	settingsDialog.showModal();
	setDefaultDialogPage("account");
});

const roomSettingsDialog = document.querySelector("dialog#room-settings");
const roomSettingsBtn = document.querySelector("#room-settings-button");

roomSettingsBtn.addEventListener("click", () => {
	roomSettingsDialog.showModal();
	setDefaultDialogPage("room-main");
});

document.querySelector("#new-room-button").addEventListener("click", () => {
	document.querySelector("dialog#new-room-dialog").showModal();
});

/* Navbar tab setup */
const collapsibles = document.querySelectorAll(".collapsible-group");
collapsibles.forEach((collapsiblesTab) => {
	collapsiblesTab.addEventListener("click", (event) => {
		const parent = event.target.parentElement;
		const isCollapsed = parent.classList.contains("collapsed");
		if (isCollapsed) {
			parent.classList.remove("collapsed");
		} else {
			parent.classList.add("collapsed");
		}
	});
});

document.querySelector("#hide-nav-button").addEventListener("click", () => {
	const navbar = document.querySelector("#right-navbar");
	if (navbar.style.display == "none") {
		navbar.style.display = "block";
	} else {
		navbar.style.display = "none";
	}
});

const userItems = document.querySelectorAll(".user-item ");
userItems.forEach((user) => {
	user.addEventListener("contextmenu", (event) => {
		event.preventDefault();
		const contextMenu = document.querySelector("#user-context-menu");
		const xPos = event.clientX + 240 > window.innerWidth ? window.innerWidth - 240 : event.clientX;
		contextMenu.style.left = `${xPos}px`;
		contextMenu.style.top = `${event.clientY}px`;
		contextMenu.classList.toggle("context-menu-active");
		contextMenu.focus();
	});
});

document.querySelector("#user-context-menu").addEventListener(
	"blur",
	(event) => {
		event.target.classList.remove("context-menu-active");
	},
	true
);
