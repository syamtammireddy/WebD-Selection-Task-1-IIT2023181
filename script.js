const api = "https://test-data-gules.vercel.app/data.json";
let questions = 0;
let completed = 0;
let bookmarks = JSON.parse(localStorage.getItem('bookmarks')) || [];
let darkMode = localStorage.getItem('darkMode') === 'true';

// DOM Elements
const searchInput = document.getElementById('search_bar');
const searchBtn = document.getElementById('search');
const themeToggle = document.getElementById('dk');
const progressBar = document.getElementById('progressbar');
const progressText = document.getElementById('progress-text');
const progressCount = document.getElementById('progress-count');
const questionsList = document.getElementById('questionsl');
const bookmarksBtn = document.getElementById('bookmarkbtn');
const bookmarksList = document.getElementById('bookmarklist');
const dropdownContent = document.querySelector('.dropdown-content');

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    // Set dark mode if enabled
    if (darkMode) {
        document.body.classList.add('dark-mode');
    }
    
    // Load popular topics into dropdown
    loadPopularTopics();
    
    // Load bookmarks from localStorage
    renderBookmarks();
    
    // Set up event listeners
    setupEventListeners();
    
    // Update progress bar
    updateProgress();
});

function setupEventListeners() {
    // Search functionality
    searchBtn.addEventListener('click', () => fetching(searchInput.value));
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') fetching(searchInput.value);
    });
    
    // Theme toggle
    themeToggle.addEventListener('click', toggleDarkMode);
    
    // Bookmarks toggle
    bookmarksBtn.addEventListener('click', toggleBookmarks);
    
    // Load sample data on initial load
    fetching('basics');
}

async function loadPopularTopics() {
    try {
        const response = await fetch(api);
        const result = await response.json();
        
        if (result.status) {
            // Get all unique topics
            const topics = result.data.map(item => item.title);
            
            // Add topics to dropdown
            topics.forEach(topic => {
                const topicItem = document.createElement('div');
                topicItem.className = 'dropdown-item';
                topicItem.textContent = topic;
                topicItem.addEventListener('click', () => {
                    searchInput.value = topic;
                    fetching(topic);
                });
                dropdownContent.appendChild(topicItem);
            });
        }
    } catch (error) {
        console.error('Error loading topics:', error);
    }
}

async function fetching(searching) {
    if (searching.trim() === '') {
        showAlert('Please enter a search term', 'error');
        return;
    }
    
    try {
        const response = await fetch(api);
        const result = await response.json();
        
        if (result.status) {
            questions = 0;
            completed = 0;
            
            // Calculate total questions for progress
            result.data.forEach(obj => {
                if (obj.title && obj.title.toLowerCase().includes(searching.toLowerCase())) {
                    questions += obj.ques.length;
                }
            });
            
            // Filter matched topics
            const matched = result.data.filter(obj => 
                obj.title && obj.title.toLowerCase().includes(searching.toLowerCase())
            );
            
            // Clear previous results
            questionsList.innerHTML = '';
            
            if (matched.length > 0) {
                matched.forEach(obj => {
                    const topicItem = document.createElement('li');
                    topicItem.className = 'topic-item';
                    
                    const topicHeader = document.createElement('div');
                    topicHeader.className = 'topic-header';
                    topicHeader.innerHTML = `
                        <span>${obj.title}</span>
                        <i class="fas fa-chevron-down topic-icon"></i>
                    `;
                    
                    const questionPanel = document.createElement('div');
                    questionPanel.className = 'question-panel';
                    
                    obj.ques.forEach((q, index) => {
                        const isBookmarked = bookmarks.some(b => b.title === q.title);
                        const isCompleted = localStorage.getItem(`completed-${q.title}`) === 'true';
                        
                        if (isCompleted) completed++;
                        
                        const questionItem = document.createElement('div');
                        questionItem.className = `question-item ${isCompleted ? 'completed' : ''}`;
                        questionItem.innerHTML = `
                            <div class="question-content">
                                <input type="checkbox" class="question-checkbox" 
                                    id="check-${index}" ${isCompleted ? 'checked' : ''}
                                    data-title="${q.title}">
                                <a href="${q.p1_link}" target="_blank" class="question-link question-title">
                                    ${q.title}
                                </a>
                            </div>
                            <div class="question-actions">
                                <a href="${q.yt_link}" target="_blank" class="action-btn" title="Watch Video">
                                    <i class="fas fa-video"></i>
                                </a>
                                <button class="action-btn bookmark-btn" title="Bookmark" data-title="${q.title}" 
                                    data-yt="${q.yt_link}" data-link="${q.p1_link}">
                                    <i class="fas ${isBookmarked ? 'fa-bookmark' : 'fa-bookmark-o'}"></i>
                                </button>
                            </div>
                        `;
                        
                        questionPanel.appendChild(questionItem);
                    });
                    
                    topicItem.appendChild(topicHeader);
                    topicItem.appendChild(questionPanel);
                    questionsList.appendChild(topicItem);
                    
                    // Add click event to toggle topic
                    topicHeader.addEventListener('click', () => {
                        topicItem.classList.toggle('active');
                    });
                });
                
                // Add event listeners to checkboxes and bookmark buttons
                addQuestionEventListeners();
            } else {
                questionsList.innerHTML = `
                    <div class="no-results">
                        <i class="fas fa-search"></i>
                        <p>No topics found matching "${searching}"</p>
                    </div>
                `;
            }
            
            updateProgress();
        }
    } catch (error) {
        console.error('Error fetching data:', error);
        showAlert('Failed to load data. Please try again later.', 'error');
    }
}

function addQuestionEventListeners() {
    // Checkbox event listeners
    document.querySelectorAll('.question-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const questionItem = this.closest('.question-item');
            const title = this.dataset.title;
            
            if (this.checked) {
                questionItem.classList.add('completed');
                localStorage.setItem(`completed-${title}`, 'true');
                completed++;
            } else {
                questionItem.classList.remove('completed');
                localStorage.removeItem(`completed-${title}`);
                completed--;
            }
            
            updateProgress();
        });
    });
    
    // Bookmark event listeners
    document.querySelectorAll('.bookmark-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const title = this.dataset.title;
            const ytLink = this.dataset.yt;
            const p1Link = this.dataset.link;
            
            toggleBookmark(title, ytLink, p1Link, this);
        });
    });
}

function toggleBookmark(title, ytLink, p1Link, button) {
    const bookmarkIndex = bookmarks.findIndex(b => b.title === title);
    
    if (bookmarkIndex === -1) {
        // Add bookmark
        bookmarks.push({ title, yt_link: ytLink, p1_link: p1Link });
        if (button) {
            button.innerHTML = '<i class="fas fa-bookmark"></i>';
        }
        showAlert('Question bookmarked!', 'success');
    } else {
        // Remove bookmark
        bookmarks.splice(bookmarkIndex, 1);
        if (button) {
            button.innerHTML = '<i class="fas fa-bookmark-o"></i>';
        }
        showAlert('Bookmark removed', 'info');
    }
    
    // Save to localStorage
    localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
    
    // Update bookmarks list
    renderBookmarks();
}

function renderBookmarks() {
    bookmarksList.innerHTML = '';
    
    if (bookmarks.length === 0) {
        bookmarksList.innerHTML = `
            <div class="no-bookmarks">
                <i class="fas fa-bookmark"></i>
                <p>No bookmarks yet. Click the bookmark icon to save questions.</p>
            </div>
        `;
        return;
    }
    
    bookmarks.forEach((bookmark, index) => {
        const bookmarkItem = document.createElement('li');
        bookmarkItem.className = 'bookmark-item';
        bookmarkItem.innerHTML = `
            <a href="${bookmark.p1_link}" target="_blank" class="question-link">
                ${bookmark.title}
            </a>
            <div class="bookmark-actions">
                <a href="${bookmark.yt_link}" target="_blank" class="action-btn" title="Watch Video">
                    <i class="fas fa-video"></i>
                </a>
                <button class="action-btn remove-bookmark" title="Remove Bookmark" data-index="${index}">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        bookmarksList.appendChild(bookmarkItem);
    });
    
    // Add event listeners to remove buttons
    document.querySelectorAll('.remove-bookmark').forEach(btn => {
        btn.addEventListener('click', function() {
            const index = parseInt(this.dataset.index);
            bookmarks.splice(index, 1);
            localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
            renderBookmarks();
            
            // Also update bookmark icons in questions list
            updateBookmarkIcons();
        });
    });
}

function updateBookmarkIcons() {
    document.querySelectorAll('.bookmark-btn').forEach(btn => {
        const title = btn.dataset.title;
        const isBookmarked = bookmarks.some(b => b.title === title);
        btn.innerHTML = `<i class="fas ${isBookmarked ? 'fa-bookmark' : 'fa-bookmark-o'}"></i>`;
    });
}

function toggleBookmarks() {
    bookmarksList.classList.toggle('show');
    bookmarksBtn.querySelector('.show-text').classList.toggle('hide');
    bookmarksBtn.querySelector('.hide-text').classList.toggle('show');
}

function toggleDarkMode() {
    darkMode = !darkMode;
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('darkMode', darkMode);
}

function updateProgress() {
    const percentage = questions > 0 ? Math.round((completed / questions) * 100) : 0;
    progressBar.style.width = `${percentage}%`;
    progressBar.textContent = `${percentage}%`;
    progressText.textContent = `${percentage}% Completed`;
    progressCount.textContent = `${completed}/${questions} questions`;
}

function showAlert(message, type) {
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.textContent = message;
    
    document.body.appendChild(alert);
    
    setTimeout(() => {
        alert.classList.add('fade-out');
        setTimeout(() => alert.remove(), 500);
    }, 3000);
}

// Utility function to debounce search input
function debounce(func, delay) {
    let timeout;
    return function() {
        const context = this;
        const args = arguments;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), delay);
    };
}

// Add debounced search
searchInput.addEventListener('input', debounce(function() {
    if (this.value.trim().length >= 3) {
        fetching(this.value);
    }
}, 500));
