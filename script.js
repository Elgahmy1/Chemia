// Global variables
let isLoggedIn = false;
let currentData = {
    programs: [],
    achievements: [],
    administrators: []
};
let editingItem = null;
let editingType = null;

// Initialize the website
document.addEventListener('DOMContentLoaded', function () {
    loadAllData();
    initializeAnimations();
    setupEventListeners();
});

// Load all data from JSON files
// REPLACE the existing loadAllData() and loadFallbackData() functions with these:

async function loadAllData() {
    console.log("🔄 Loading data from JSON files...")

    try {
        // Add cache-busting parameter to prevent browser caching
        const timestamp = new Date().getTime()

        const [programsResponse, achievementsResponse, administratorsResponse] = await Promise.all([
            fetch(`./data/programs.json?v=${timestamp}`),
            fetch(`./data/achievements.json?v=${timestamp}`),
            fetch(`./data/administrators.json?v=${timestamp}`),
        ])

        // Check if all requests were successful
        if (!programsResponse.ok) {
            throw new Error(`Failed to load programs.json: ${programsResponse.status} ${programsResponse.statusText}`)
        }
        if (!achievementsResponse.ok) {
            throw new Error(
                `Failed to load achievements.json: ${achievementsResponse.status} ${achievementsResponse.statusText}`,
            )
        }
        if (!administratorsResponse.ok) {
            throw new Error(
                `Failed to load administrators.json: ${administratorsResponse.status} ${administratorsResponse.statusText}`,
            )
        }

        // Parse JSON data
        const programsData = await programsResponse.json()
        const achievementsData = await achievementsResponse.json()
        const administratorsData = await administratorsResponse.json()

        // Extract the arrays from the JSON structure
        currentData.programs = programsData.programs || []
        currentData.achievements = achievementsData.achievements || []
        currentData.administrators = administratorsData.administrators || []

        console.log("✅ Data loaded successfully from JSON files:")
        console.log("Programs:", currentData.programs.length)
        console.log("Achievements:", currentData.achievements.length)
        console.log("Administrators:", currentData.administrators.length)

        // Render the data
        renderPrograms()
        renderAchievements()

        if (isLoggedIn) {
            renderAdminContent()
        }
    } catch (error) {
        console.error("❌ Error loading data from JSON files:", error)
        console.log("🔄 Attempting to load from localStorage...")

        // Try to load from localStorage first
        const hasLocalStorage = loadFromLocalStorage()

        if (!hasLocalStorage) {
            console.log("📦 No localStorage data found, using minimal fallback data")
            loadMinimalFallbackData()
        }
    }
}

// Try to load data from localStorage
function loadFromLocalStorage() {
    try {
        const programsLocal = localStorage.getItem("bschemclub_programs")
        const achievementsLocal = localStorage.getItem("bschemclub_achievements")
        const administratorsLocal = localStorage.getItem("bschemclub_administrators")

        let hasData = false

        if (programsLocal) {
            currentData.programs = JSON.parse(programsLocal)
            hasData = true
            console.log("📦 Loaded programs from localStorage")
        }

        if (achievementsLocal) {
            currentData.achievements = JSON.parse(achievementsLocal)
            hasData = true
            console.log("📦 Loaded achievements from localStorage")
        }

        if (administratorsLocal) {
            currentData.administrators = JSON.parse(administratorsLocal)
            hasData = true
            console.log("📦 Loaded administrators from localStorage")
        }

        if (hasData) {
            renderPrograms()
            renderAchievements()

            if (isLoggedIn) {
                renderAdminContent()
            }
        }

        return hasData
    } catch (error) {
        console.error("❌ Error loading from localStorage:", error)
        return false
    }
}

// Minimal fallback data (only if everything else fails)
function loadMinimalFallbackData() {
    // Only set fallback data if arrays are empty
    if (currentData.programs.length === 0) {
        currentData.programs = [
            {
                id: 1,
                title: "International Chemistry Competition for High School Students (ICCH)",
                description:
                    "This global competition tested deep understanding of core chemistry topics such as thermodynamics, kinetics, bonding, and real-world applications. It was a proud moment for the BS Chemistry Club as multiple members stood out on the international stage!",
                link: "https://forms.gle/Lqnj8vAUMRZ5zfBz6",
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            },
        ]
    }

    if (currentData.achievements.length === 0) {
        currentData.achievements = [
            {
                id: 1,
                title: "Green Chemistry Competition",
                description:
                    "Winners received a surprise opportunity to take part in an AUC tour. All participants were awarded electronic certificates for their efforts.",
                date: "2024-11-15",
                type: "competition",
                createdAt: new Date().toISOString(),
            },
            {
                id: 2,
                title: '"A Spark of Science" at Dar El Tarbiah IG Zamalek',
                description:
                    'Club members hosted an interactive session titled "A Spark of Science, A Moment of Pride" at Dar El Tarbiah School (IG Zamalek). The event aimed to spark curiosity and excitement for chemistry among younger students.',
                date: "2024-12-01",
                type: "outreach",
                createdAt: new Date().toISOString(),
            },
        ]
    }

    if (currentData.administrators.length === 0) {
        currentData.administrators = [
            {
                id: 1,
                name: "Ammar Yasser",
                position: "Club President",
                imageUrl: "/images/President.jpg",
                bio: "",
                orderIndex: 1,
            },
            {
                id: 2,
                name: "Ahmed Taher",
                position: "CO-President",
                imageUrl: "/images/Co-President.jpg",
                bio: "",
                orderIndex: 2,
            },
        ]
    }

    console.log("📋 Loaded minimal fallback data")
    renderPrograms()
    renderAchievements()
}

// Add a manual refresh function
function refreshData() {
    console.log("🔄 Manually refreshing data...")
    loadAllData()
}

// Add a debug function to check current data
function debugData() {
    console.log("🔍 Current data state:")
    console.log("Programs:", currentData.programs)
    console.log("Achievements:", currentData.achievements)
    console.log("Administrators:", currentData.administrators)

    // Also check localStorage
    console.log("📦 localStorage data:")
    console.log("Programs:", localStorage.getItem("bschemclub_programs"))
    console.log("Achievements:", localStorage.getItem("bschemclub_achievements"))
    console.log("Administrators:", localStorage.getItem("bschemclub_administrators"))
}

// Render programs on the main website
function renderPrograms() {
    const container = document.getElementById('programs-container');
    container.innerHTML = '';

    currentData.programs.forEach(program => {
        const programCard = document.createElement('div');
        programCard.className = 'program-card fade-in';
        programCard.innerHTML = `
                    <h3>${program.title}</h3>
                    <p>${program.description}</p>
                    ${program.link ? `<a href="${program.link}" class="learn-more" target="_blank" rel="noopener noreferrer">Learn More →</a>` : ''}
                `;
        container.appendChild(programCard);
    });

    // Trigger animations for new elements
    observeElements();
}

// Render achievements on the main website
function renderAchievements() {
    const container = document.getElementById('achievements-container');
    container.innerHTML = '';

    currentData.achievements.forEach(achievement => {
        const achievementItem = document.createElement('div');
        achievementItem.className = 'news-item fade-in';
        achievementItem.innerHTML = `
                    ${achievement.date ? `<div class="news-date">${new Date(achievement.date).toLocaleDateString()}</div>` : ''}
                    <h3>${achievement.title}</h3>
                    <p>${achievement.description}</p>
                `;
        container.appendChild(achievementItem);
    });

    // Trigger animations for new elements
    observeElements();
}

// Authentication functions
async function handleLogin(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const username = formData.get('username');
    const password = formData.get('password');

    try {
        // Load users from JSON file
        const response = await fetch('./data/users.json');
        const userData = await response.json();

        // Check credentials
        const user = userData.users.find(u =>
            u.username === username && u.passwordHash === password
        );

        if (user) {
            isLoggedIn = true;
            closeModal('login-modal');
            showAdminPanel();
            renderAdminContent();
        } else {
            showError('login-error', 'Invalid username or password');
        }
    } catch (error) {
        console.error('Error loading users:', error);
        // Fallback to hardcoded credentials
        if (username === 'admin' && password === 'admin123') {
            isLoggedIn = true;
            closeModal('login-modal');
            showAdminPanel();
            renderAdminContent();
        } else {
            showError('login-error', 'Invalid username or password');
        }
    }
}

function logout() {
    isLoggedIn = false;
    hideAdminPanel();
}

function showAdminLogin() {
    if (isLoggedIn) {
        showAdminPanel();
    } else {
        showModal('login-modal');
    }
}

function showAdminPanel() {
    document.getElementById('admin-panel').classList.add('show');
    document.getElementById('admin-panel').scrollIntoView({ behavior: 'smooth' });
}

function hideAdminPanel() {
    document.getElementById('admin-panel').classList.remove('show');
}

// Admin content management
function renderAdminContent() {
    renderAdminPrograms();
    renderAdminAchievements();
    renderAdminAdministrators();
}

function renderAdminPrograms() {
    const container = document.getElementById('admin-programs-list');
    container.innerHTML = '';

    currentData.programs.forEach(program => {
        const item = document.createElement('div');
        item.className = 'content-item';
        item.innerHTML = `
                    <h4>${program.title}</h4>
                    <p>${program.description.substring(0, 150)}...</p>
                    ${program.link ? `<p><strong>Link:</strong> <a href="${program.link}" target="_blank">${program.link}</a></p>` : ''}
                    <div class="content-actions">
                        <button class="btn btn-small btn-secondary" onclick="editProgram(${program.id})">Edit</button>
                        <button class="btn btn-small btn-danger" onclick="deleteProgram(${program.id})">Delete</button>
                    </div>
                `;
        container.appendChild(item);
    });
}

function renderAdminAchievements() {
    const container = document.getElementById('admin-achievements-list');
    container.innerHTML = '';

    currentData.achievements.forEach(achievement => {
        const item = document.createElement('div');
        item.className = 'content-item';
        item.innerHTML = `
                    <h4>${achievement.title}</h4>
                    <p>${achievement.description.substring(0, 150)}...</p>
                    <p><strong>Type:</strong> ${achievement.type} ${achievement.date ? `| <strong>Date:</strong> ${new Date(achievement.date).toLocaleDateString()}` : ''}</p>
                    <div class="content-actions">
                        <button class="btn btn-small btn-secondary" onclick="editAchievement(${achievement.id})">Edit</button>
                        <button class="btn btn-small btn-danger" onclick="deleteAchievement(${achievement.id})">Delete</button>
                    </div>
                `;
        container.appendChild(item);
    });
}

function renderAdminAdministrators() {
    const container = document.getElementById('admin-administrators-list');
    container.innerHTML = '';

    currentData.administrators.sort((a, b) => a.orderIndex - b.orderIndex).forEach(admin => {
        const item = document.createElement('div');
        item.className = 'content-item';
        item.innerHTML = `
                    <h4>${admin.name}</h4>
                    <p><strong>Position:</strong> ${admin.position}</p>
                    <p>${admin.bio ? admin.bio.substring(0, 150) + '...' : 'No bio available'}</p>
                    <div class="content-actions">
                        <button class="btn btn-small btn-secondary" onclick="editAdministrator(${admin.id})">Edit</button>
                        <button class="btn btn-small btn-danger" onclick="deleteAdministrator(${admin.id})">Delete</button>
                    </div>
                `;
        container.appendChild(item);
    });
}

// Content management functions
function showAddProgramForm() {
    editingItem = null;
    editingType = 'program';
    showContentForm('Add Program', [
        { name: 'title', label: 'Title', type: 'text', required: true },
        { name: 'description', label: 'Description', type: 'textarea', required: true },
        { name: 'link', label: 'Link (optional)', type: 'url', required: false }
    ]);
}

function showAddAchievementForm() {
    editingItem = null;
    editingType = 'achievement';
    showContentForm('Add Achievement', [
        { name: 'title', label: 'Title', type: 'text', required: true },
        { name: 'description', label: 'Description', type: 'textarea', required: true },
        { name: 'date', label: 'Date', type: 'date', required: false },
        { name: 'type', label: 'Type', type: 'select', options: ['competition', 'outreach', 'award', 'research', 'other'], required: true }
    ]);
}

function showAddAdminForm() {
    editingItem = null;
    editingType = 'administrator';
    showContentForm('Add Administrator', [
        { name: 'name', label: 'Name', type: 'text', required: true },
        { name: 'position', label: 'Position', type: 'text', required: true },
        { name: 'imageUrl', label: 'Image URL', type: 'url', required: false },
        { name: 'bio', label: 'Bio', type: 'textarea', required: false },
        { name: 'orderIndex', label: 'Display Order', type: 'number', required: true, value: currentData.administrators.length + 1 }
    ]);
}

function editProgram(id) {
    const program = currentData.programs.find(p => p.id === id);
    if (!program) return;

    editingItem = program;
    editingType = 'program';
    showContentForm('Edit Program', [
        { name: 'title', label: 'Title', type: 'text', required: true, value: program.title },
        { name: 'description', label: 'Description', type: 'textarea', required: true, value: program.description },
        { name: 'link', label: 'Link (optional)', type: 'url', required: false, value: program.link || '' }
    ]);
}

function editAchievement(id) {
    const achievement = currentData.achievements.find(a => a.id === id);
    if (!achievement) return;

    editingItem = achievement;
    editingType = 'achievement';
    showContentForm('Edit Achievement', [
        { name: 'title', label: 'Title', type: 'text', required: true, value: achievement.title },
        { name: 'description', label: 'Description', type: 'textarea', required: true, value: achievement.description },
        { name: 'date', label: 'Date', type: 'date', required: false, value: achievement.date || '' },
        { name: 'type', label: 'Type', type: 'select', options: ['competition', 'outreach', 'award', 'research', 'other'], required: true, value: achievement.type }
    ]);
}

function editAdministrator(id) {
    const admin = currentData.administrators.find(a => a.id === id);
    if (!admin) return;

    editingItem = admin;
    editingType = 'administrator';
    showContentForm('Edit Administrator', [
        { name: 'name', label: 'Name', type: 'text', required: true, value: admin.name },
        { name: 'position', label: 'Position', type: 'text', required: true, value: admin.position },
        { name: 'imageUrl', label: 'Image URL', type: 'url', required: false, value: admin.imageUrl || '' },
        { name: 'bio', label: 'Bio', type: 'textarea', required: false, value: admin.bio || '' },
        { name: 'orderIndex', label: 'Display Order', type: 'number', required: true, value: admin.orderIndex }
    ]);
}

function deleteProgram(id) {
    if (confirm('Are you sure you want to delete this program?')) {
        currentData.programs = currentData.programs.filter(p => p.id !== id);
        renderPrograms();
        renderAdminPrograms();
        saveData('programs');
    }
}

function deleteAchievement(id) {
    if (confirm('Are you sure you want to delete this achievement?')) {
        currentData.achievements = currentData.achievements.filter(a => a.id !== id);
        renderAchievements();
        renderAdminAchievements();
        saveData('achievements');
    }
}

function deleteAdministrator(id) {
    if (confirm('Are you sure you want to delete this administrator?')) {
        currentData.administrators = currentData.administrators.filter(a => a.id !== id);
        renderAdminAdministrators();
        saveData('administrators');
    }
}

// Content form handling
function showContentForm(title, fields) {
    document.getElementById('content-modal-title').textContent = title;
    const fieldsContainer = document.getElementById('content-form-fields');
    fieldsContainer.innerHTML = '';

    fields.forEach(field => {
        const formGroup = document.createElement('div');
        formGroup.className = 'form-group';

        const label = document.createElement('label');
        label.textContent = field.label;
        label.setAttribute('for', field.name);
        formGroup.appendChild(label);

        let input;
        if (field.type === 'textarea') {
            input = document.createElement('textarea');
            input.rows = 4;
        } else if (field.type === 'select') {
            input = document.createElement('select');
            field.options.forEach(option => {
                const optionElement = document.createElement('option');
                optionElement.value = option;
                optionElement.textContent = option.charAt(0).toUpperCase() + option.slice(1);
                if (field.value === option) {
                    optionElement.selected = true;
                }
                input.appendChild(optionElement);
            });
        } else {
            input = document.createElement('input');
            input.type = field.type;
        }

        input.id = field.name;
        input.name = field.name;
        input.required = field.required;
        if (field.value !== undefined && field.type !== 'select') {
            input.value = field.value;
        }

        formGroup.appendChild(input);
        fieldsContainer.appendChild(formGroup);
    });

    showModal('content-modal');
}

function handleContentSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const data = {};

    for (let [key, value] of formData.entries()) {
        data[key] = value;
    }

    if (editingItem) {
        // Update existing item
        Object.assign(editingItem, data);
        editingItem.updatedAt = new Date().toISOString();
    } else {
        // Create new item
        const newId = Math.max(...currentData[editingType + 's'].map(item => item.id), 0) + 1;
        const newItem = {
            id: newId,
            ...data,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        currentData[editingType + 's'].push(newItem);
    }

    // Re-render content
    if (editingType === 'program') {
        renderPrograms();
        renderAdminPrograms();
    } else if (editingType === 'achievement') {
        renderAchievements();
        renderAdminAchievements();
    } else if (editingType === 'administrator') {
        renderAdminAdministrators();
    }

    saveData(editingType + 's');
    closeModal('content-modal');
}

// Data persistence (simulated - in a real implementation, this would save to server)
// REPLACE the existing saveData() function in your HTML file with this corrected version:

// Assuming currentData and isLoggedIn are defined elsewhere in your code
// For example:
// let currentData = {};
// let isLoggedIn = false;

async function saveData(type) {
    try {
        // Prepare the data to send
        const dataToSave = {
            type: type,
            data: currentData[type],
            authenticated: isLoggedIn, // Simple authentication flag
        }

        // Send data to the PHP script
        const response = await fetch("./save-data.php", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(dataToSave),
        })

        const result = await response.json()

        if (result.success) {
            console.log(`✅ ${type} data saved successfully to JSON file`)

            // Also save to localStorage as backup
            localStorage.setItem(`bschemclub_${type}`, JSON.stringify(currentData[type]))

            // Show success message to user (optional)
            showSuccessMessage(`${type.charAt(0).toUpperCase() + type.slice(1)} saved successfully!`)
        } else {
            console.error(`❌ Failed to save ${type}:`, result.error)

            // Fallback to localStorage only
            localStorage.setItem(`bschemclub_${type}`, JSON.stringify(currentData[type]))
            console.log(`📦 ${type} data saved to localStorage as fallback`)

            showErrorMessage(`Warning: Changes saved locally but may not persist. Error: ${result.error}`)
        }
    } catch (error) {
        console.error(`❌ Error saving ${type}:`, error)

        // Fallback to localStorage
        localStorage.setItem(`bschemclub_${type}`, JSON.stringify(currentData[type]))
        console.log(`📦 ${type} data saved to localStorage as fallback`)

        showErrorMessage("Warning: Changes saved locally but may not persist. Server connection failed.")
    }
}

// Helper functions for user feedback (add these to your HTML file)
function showSuccessMessage(message) {
    // Create a temporary success notification
    const notification = document.createElement("div")
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background-color: #10b981;
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10001;
        font-weight: 600;
        animation: slideInRight 0.3s ease;
    `
    notification.textContent = message

    document.body.appendChild(notification)

    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = "slideOutRight 0.3s ease"
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification)
            }
        }, 300)
    }, 3000)
}

function showErrorMessage(message) {
    // Create a temporary error notification
    const notification = document.createElement("div")
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background-color: #ef4444;
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10001;
        font-weight: 600;
        animation: slideInRight 0.3s ease;
    `
    notification.textContent = message

    document.body.appendChild(notification)

    // Remove after 5 seconds (longer for error messages)
    setTimeout(() => {
        notification.style.animation = "slideOutRight 0.3s ease"
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification)
            }
        }, 300)
    }, 5000)
}

// Administrators popup
function showAdministrators() {
    const grid = document.getElementById('administrators-grid');
    grid.innerHTML = '';

    currentData.administrators.sort((a, b) => a.orderIndex - b.orderIndex).forEach(admin => {
        const adminCard = document.createElement('div');
        adminCard.className = 'admin-card';
        adminCard.innerHTML = `
                    <img src="${admin.imageUrl || '/placeholder.svg?height=200&width=200'}" alt="${admin.name}">
                    <h3>${admin.name}</h3>
                    <div class="position">${admin.position}</div>
                    <div class="bio">${admin.bio || ''}</div>
                `;
        grid.appendChild(adminCard);
    });

    showModal('administrators-modal');
}

// Admin tabs
function showTab(tabName) {
    // Remove active class from all tabs and content
    document.querySelectorAll('.admin-tab').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

    // Add active class to selected tab and content
    event.target.classList.add('active');
    document.getElementById(tabName + '-tab').classList.add('active');
}

// Modal functions
function showModal(modalId) {
    document.getElementById(modalId).classList.add('show');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('show');
    hideError('login-error');
    hideError('content-error');
}

// Utility functions
function showError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    errorElement.textContent = message;
    errorElement.style.display = 'block';
}

function hideError(elementId) {
    const errorElement = document.getElementById(elementId);
    errorElement.style.display = 'none';
}

// Navigation and animations
function toggleNav() {
    const nav = document.getElementById('nav');
    nav.classList.toggle('active');
}

function initializeAnimations() {
    // Intersection Observer for animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    observeElements();

    function observeElements() {
        document.querySelectorAll('.fade-in').forEach(el => {
            observer.observe(el);
        });
    }

    // Make observeElements available globally
    window.observeElements = observeElements;
}

function setupEventListeners() {
    // Smooth scrolling
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
            // Close mobile nav if open
            document.getElementById('nav').classList.remove('active');
        });
    });

    // Close modals when clicking outside
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', function (e) {
            if (e.target === this) {
                this.classList.remove('show');
            }
        });
    });

    // Close mobile nav when clicking outside
    document.addEventListener('click', (e) => {
        const nav = document.getElementById('nav');
        const navToggle = document.querySelector('.nav-toggle');

        if (!nav.contains(e.target) && !navToggle.contains(e.target)) {
            nav.classList.remove('active');
        }
    });
}

// Make functions available globally
window.observeElements = function () {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    document.querySelectorAll('.fade-in:not(.visible)').forEach(el => {
        observer.observe(el);
    });
};