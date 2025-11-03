// ==================== GLOBAL VARIABLES ====================
let socket;
let currentSummary = null;
let currentFilename = null;
let selectedSummaryType = 'standard';

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    initializeWebSocket();
    loadTheme();
    loadStats();
    loadHistory();
});

function initializeApp() {
    // Theme toggle
    document.getElementById('themeToggle').addEventListener('click', toggleTheme);
    
    // File upload
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');
    
    uploadArea.addEventListener('click', () => fileInput.click());
    uploadArea.addEventListener('dragover', handleDragOver);
    uploadArea.addEventListener('dragleave', handleDragLeave);
    uploadArea.addEventListener('drop', handleDrop);
    fileInput.addEventListener('change', handleFileSelect);
    
    // Summary type selection
    document.querySelectorAll('.summary-type-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.summary-type-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            selectedSummaryType = this.dataset.type;
        });
    });
    
    // Summarize button
    document.getElementById('summarizeBtn').addEventListener('click', summarizePDF);
    
    // Copy to clipboard
    document.getElementById('copyBtn').addEventListener('click', copyToClipboard);
    
    // Download buttons
    document.getElementById('downloadTxt').addEventListener('click', () => downloadSummary('txt'));
    document.getElementById('downloadPdf').addEventListener('click', () => downloadSummary('pdf'));
    document.getElementById('downloadDocx').addEventListener('click', () => downloadSummary('docx'));
    
    // History toggle
    document.getElementById('historyToggle').addEventListener('click', toggleHistory);
    document.getElementById('historyClose').addEventListener('click', toggleHistory);
    
    // Rating stars
    document.querySelectorAll('.star').forEach((star, index) => {
        star.addEventListener('click', () => rateSummary(index + 1));
        star.addEventListener('mouseenter', () => highlightStars(index + 1));
    });
    
    document.querySelector('.rating-stars').addEventListener('mouseleave', resetStars);
}

// ==================== WEBSOCKET ====================
function initializeWebSocket() {
    socket = io();
    
    socket.on('connect', function() {
        console.log('Connected to server');
    });
    
    socket.on('extraction_progress', function(data) {
        updateProgress(data.current, data.total, data.status);
    });
    
    socket.on('summarization_progress', function(data) {
        showStatus(data.status);
    });
    
    socket.on('process_complete', function(data) {
        showStatus(data.status, 'success');
    });
}

// ==================== THEME ====================
function loadTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
    
    // Save to server
    fetch('/theme', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme: newTheme })
    });
}

function updateThemeIcon(theme) {
    const icon = document.querySelector('.theme-icon');
    icon.textContent = theme === 'light' ? '🌙' : '☀️';
}

// ==================== FILE HANDLING ====================
function handleDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
    this.classList.add('drag-over');
}

function handleDragLeave(e) {
    e.preventDefault();
    e.stopPropagation();
    this.classList.remove('drag-over');
}

function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    this.classList.remove('drag-over');
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        handleFile(files[0]);
    }
}

function handleFileSelect(e) {
    const files = e.target.files;
    if (files.length > 0) {
        handleFile(files[0]);
    }
}

function handleFile(file) {
    if (file.type !== 'application/pdf') {
        showNotification('Please select a PDF file', 'error');
        return;
    }
    
    currentFilename = file.name;
    document.getElementById('fileName').textContent = file.name;
    document.getElementById('fileSize').textContent = formatFileSize(file.size);
    document.getElementById('fileInfo').classList.add('active');
    document.getElementById('summarizeBtn').disabled = false;
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// ==================== SUMMARIZATION ====================
async function summarizePDF() {
    const fileInput = document.getElementById('fileInput');
    if (!fileInput.files.length) {
        showNotification('Please select a file first', 'error');
        return;
    }
    
    const formData = new FormData();
    formData.append('pdf_file', fileInput.files[0]);
    formData.append('summary_type', selectedSummaryType);
    
    // Show progress
    document.getElementById('progressContainer').classList.add('active');
    document.getElementById('summarizeBtn').disabled = true;
    updateProgress(0, 100, 'Starting...');
    
    try {
        const response = await fetch('/summarize', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (data.error) {
            showNotification(data.error, 'error');
            return;
        }
        
        currentSummary = data;
        displaySummary(data);
        loadHistory();
        loadStats();
        showNotification('Summary generated successfully!', 'success');
        
    } catch (error) {
        showNotification('An error occurred: ' + error.message, 'error');
    } finally {
        document.getElementById('progressContainer').classList.remove('active');
        document.getElementById('summarizeBtn').disabled = false;
    }
}

function displaySummary(data) {
    document.getElementById('summaryFilename').textContent = data.filename;
    document.getElementById('summaryPages').textContent = `${data.page_count} pages`;
    document.getElementById('summaryWords').textContent = `${data.word_count} words`;
    document.getElementById('summaryType').textContent = data.summary_type;
    document.getElementById('summaryText').innerHTML = formatSummaryText(data.summary);
    document.getElementById('summaryContainer').classList.add('active');
    
    // Scroll to summary
    document.getElementById('summaryContainer').scrollIntoView({ behavior: 'smooth' });
}

function formatSummaryText(text) {
    // Convert bullet points and newlines to HTML
    return text
        .split('\n')
        .map(line => {
            line = line.trim();
            if (line.startsWith('-') || line.startsWith('•') || /^\d+\./.test(line)) {
                return `<p style="margin-left: 1.5rem;">✓ ${line.replace(/^[-•\d+\.]/, '').trim()}</p>`;
            }
            return line ? `<p>${line}</p>` : '';
        })
        .join('');
}

// ==================== PROGRESS ====================
function updateProgress(current, total, status) {
    const percent = Math.round((current / total) * 100);
    document.getElementById('progressBar').style.width = percent + '%';
    document.getElementById('progressText').textContent = status;
}

function showStatus(message, type = 'info') {
    document.getElementById('progressText').textContent = message;
}

// ==================== ACTIONS ====================
function copyToClipboard() {
    const text = document.getElementById('summaryText').innerText;
    navigator.clipboard.writeText(text).then(() => {
        showNotification('Copied to clipboard!', 'success');
    });
}

function downloadSummary(format) {
    if (!currentSummary) return;
    
    const summary = document.getElementById('summaryText').innerText;
    const filename = currentFilename.replace('.pdf', '');
    
    window.location.href = `/download/${format}?summary=${encodeURIComponent(summary)}&filename=${encodeURIComponent(filename)}`;
}

// ==================== RATING ====================
function rateSummary(rating) {
    if (!currentSummary) return;
    
    fetch(`/history/${currentSummary.history_id}/rate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating })
    }).then(() => {
        showNotification('Rating saved!', 'success');
        setStarRating(rating);
    });
}

function highlightStars(count) {
    document.querySelectorAll('.star').forEach((star, index) => {
        star.classList.toggle('active', index < count);
    });
}

function resetStars() {
    // Reset to current rating if exists
    if (currentSummary && currentSummary.rating) {
        setStarRating(currentSummary.rating);
    } else {
        document.querySelectorAll('.star').forEach(star => star.classList.remove('active'));
    }
}

function setStarRating(rating) {
    document.querySelectorAll('.star').forEach((star, index) => {
        star.classList.toggle('active', index < rating);
    });
}

// ==================== HISTORY ====================
function toggleHistory() {
    document.getElementById('historySidebar').classList.toggle('open');
}

async function loadHistory() {
    try {
        const response = await fetch('/history');
        const histories = await response.json();
        
        const historyList = document.getElementById('historyList');
        historyList.innerHTML = '';
        
        histories.forEach(item => {
            const historyItem = createHistoryItem(item);
            historyList.appendChild(historyItem);
        });
    } catch (error) {
        console.error('Error loading history:', error);
    }
}

function createHistoryItem(item) {
    const div = document.createElement('div');
    div.className = 'history-item';
    div.innerHTML = `
        <div class="history-item-header">
            <div class="history-item-title">📄 ${item.filename}</div>
            <div class="history-item-date">${formatDate(item.created_at)}</div>
        </div>
        <div class="history-item-meta">
            <span>${item.page_count} pages</span>
            <span>${item.word_count} words</span>
            <span>${item.summary_type}</span>
        </div>
    `;
    
    div.addEventListener('click', () => loadHistoryItem(item.id));
    return div;
}

async function loadHistoryItem(id) {
    try {
        const response = await fetch(`/history/${id}`);
        const data = await response.json();
        
        currentSummary = data;
        displaySummary({
            filename: data.filename,
            summary: data.summary_text,
            page_count: data.page_count,
            word_count: data.word_count,
            summary_type: data.summary_type,
            history_id: data.id
        });
        
        toggleHistory();
    } catch (error) {
        console.error('Error loading history item:', error);
    }
}

// ==================== STATS ====================
async function loadStats() {
    try {
        const response = await fetch('/stats');
        const stats = await response.json();
        
        document.getElementById('statTotal').textContent = stats.total_summaries;
        document.getElementById('statRating').textContent = stats.avg_rating.toFixed(1);
        document.getElementById('statPages').textContent = stats.total_pages_processed;
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

// ==================== NOTIFICATIONS ====================
function showNotification(message, type = 'info') {
    // Simple notification system (you can enhance this with a library)
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
        color: white;
        border-radius: 10px;
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        z-index: 10000;
        animation: slideInRight 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// ==================== UTILITIES ====================
function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
}
