// Data Model
class LinkStore {
    constructor() {
        this.links = [];
        this.loadLinks();
    }

    saveLinks() {
        localStorage.setItem('savedLinks', JSON.stringify(this.links));
        this.render();
    }

    loadLinks() {
        const savedData = localStorage.getItem('savedLinks');
        if (savedData) {
            try {
                this.links = JSON.parse(savedData);
            } catch (e) {
                console.error("Failed to load links", e);
                this.links = [];
            }
        }
        this.render();
    }

    addLink(title, urlString) {
        const newLink = {
            id: crypto.randomUUID(),
            title: title,
            urlString: urlString
        };
        this.links.push(newLink);
        this.saveLinks();
    }

    updateLink(id, title, urlString) {
        const index = this.links.findIndex(l => l.id === id);
        if (index !== -1) {
            this.links[index].title = title;
            this.links[index].urlString = urlString;
            this.saveLinks();
        }
    }

    deleteLink(id) {
        this.links = this.links.filter(l => l.id !== id);
        this.saveLinks();
    }

    render() {
        const grid = document.getElementById('dashboard-grid');
        grid.innerHTML = '';

        this.links.forEach(link => {
            const card = document.createElement('div');
            card.className = 'link-card';
            card.onclick = (e) => handleLinkClick(e, link);

            // Icon
            const icon = document.createElement('div');
            icon.className = 'icon';
            icon.innerHTML = '<svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>'; // Simple globe/link icon

            // Title
            const title = document.createElement('div');
            title.className = 'title';
            title.textContent = link.title;

            // Delete Button
            const deleteBtn = document.createElement('div');
            deleteBtn.className = 'delete-btn';
            deleteBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>';
            deleteBtn.onclick = (e) => {
                e.stopPropagation();
                store.deleteLink(link.id);
            };

            card.appendChild(icon);
            card.appendChild(title);
            card.appendChild(deleteBtn);
            grid.appendChild(card);
        });
    }
}

// App State
const store = new LinkStore();
let isEditingMode = false;
let linkToEditId = null;

// DOM Elements
const editToggleBtn = document.getElementById('edit-toggle-btn');
const addBtn = document.getElementById('add-btn');
const modalOverlay = document.getElementById('modal-overlay');
const modalTitle = document.getElementById('modal-title');
const titleInput = document.getElementById('link-title');
const urlInput = document.getElementById('link-url');
const cancelBtn = document.getElementById('cancel-btn');
const saveBtn = document.getElementById('save-btn');
const dashboardGrid = document.getElementById('dashboard-grid');

// Event Listeners
editToggleBtn.addEventListener('click', () => {
    isEditingMode = !isEditingMode;
    updateEditModeUI();
});

addBtn.addEventListener('click', () => {
    openModal();
});

cancelBtn.addEventListener('click', () => {
    closeModal();
});

saveBtn.addEventListener('click', () => {
    const title = titleInput.value.trim();
    let url = urlInput.value.trim();

    if (!title || !url) return;

    if (!url.toLowerCase().startsWith('http')) {
        url = 'https://' + url;
    }

    if (linkToEditId) {
        store.updateLink(linkToEditId, title, url);
    } else {
        store.addLink(title, url);
    }
    closeModal();
});

// Input validation
[titleInput, urlInput].forEach(input => {
    input.addEventListener('input', () => {
        saveBtn.disabled = !titleInput.value.trim() || !urlInput.value.trim();
    });
});

// Functions
function updateEditModeUI() {
    editToggleBtn.textContent = isEditingMode ? "Færdig" : "Rediger";
    if (isEditingMode) {
        dashboardGrid.classList.add('editing');
    } else {
        dashboardGrid.classList.remove('editing');
    }
}

function handleLinkClick(e, link) {
    if (isEditingMode) {
        openModal(link);
    } else {
        let url = link.urlString;
        if (!url.toLowerCase().startsWith('http')) {
            url = 'https://' + url;
        }
        window.open(url, '_blank');
    }
}

function openModal(link = null) {
    if (link) {
        linkToEditId = link.id;
        modalTitle.textContent = "Rediger Knap";
        titleInput.value = link.title;
        urlInput.value = link.urlString;
    } else {
        linkToEditId = null;
        modalTitle.textContent = "Ny Knap";
        titleInput.value = "";
        urlInput.value = "";
    }
    saveBtn.disabled = !titleInput.value.trim() || !urlInput.value.trim();
    modalOverlay.classList.remove('hidden');
    titleInput.focus();
}

function closeModal() {
    modalOverlay.classList.add('hidden');
    linkToEditId = null;
}

// Initial Render
store.render();
