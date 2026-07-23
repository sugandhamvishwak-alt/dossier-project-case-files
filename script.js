// Global variables
let allCases = [];
let currentCaseId = null;
let currentPageIndex = 0;
let casePages = [];

// Load cases from JSON on page load
document.addEventListener('DOMContentLoaded', () => {
    console.log('Page loaded, starting loadCases()');
    loadCases();
    setupEventListeners();
});

// Load cases from cases.json
async function loadCases() {
    const casesList = document.getElementById('casesList');
    
    try {
        console.log('Fetching cases.json...');
        
        // Correct path for GitHub Pages
        const response = await fetch('./data/cases.json');
        
        console.log('Response status:', response.status);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        
        allCases = await response.json();
        console.log('Successfully loaded ' + allCases.length + ' cases');
        displayCases(allCases);
        
    } catch (error) {
        console.error('Error:', error);
        casesList.innerHTML = `<p class="no-results">Error loading cases: ${error.message}</p>`;
    }
}

// Display cases
function displayCases(cases) {
    const casesList = document.getElementById('casesList');
    const resultsTitle = document.getElementById('resultsTitle');

    if (!cases || cases.length === 0) {
        casesList.innerHTML = '<p class="no-results">No cases found.</p>';
        resultsTitle.textContent = 'No Results';
        return;
    }

    resultsTitle.textContent = `Cases Found: ${cases.length}`;
    
    casesList.innerHTML = cases.map(caseItem => `
        <div class="case-card" onclick="openCaseDetail('${caseItem.id}')">
            <h3>${caseItem.name}</h3>
            
            <div class="case-info">
                <span class="case-badge">${caseItem.country}</span>
                <span class="case-badge ${caseItem.status === 'solved' ? 'solved' : ''}">${caseItem.status.toUpperCase()}</span>
                <span class="case-badge">${caseItem.type.replace(/-/g, ' ').toUpperCase()}</span>
            </div>
            
            <div class="case-details-text">
                <strong>Location:</strong> ${caseItem.location}
            </div>
            <div class="case-details-text">
                <strong>Period:</strong> ${caseItem.year_start} - ${caseItem.year_end}
            </div>
            <div class="case-details-text">
                <strong>Victims:</strong> ${caseItem.victims_count}
            </div>
            
            <button class="view-details-btn">Open Case File →</button>
        </div>
    `).join('');
}

// Setup event listeners
function setupEventListeners() {
    document.getElementById('searchInput').addEventListener('input', filterCases);
    document.getElementById('countryFilter').addEventListener('change', filterCases);
    document.getElementById('typeFilter').addEventListener('change', filterCases);
    document.getElementById('statusFilter').addEventListener('change', filterCases);
    document.getElementById('resetFilters').addEventListener('click', resetFilters);
    
    document.querySelector('.close').addEventListener('click', closeCaseDetail);
    window.addEventListener('click', (event) => {
        const modal = document.getElementById('caseModal');
        if (event.target === modal) {
            closeCaseDetail();
        }
    });
}

// Filter cases
function filterCases() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const country = document.getElementById('countryFilter').value;
    const type = document.getElementById('typeFilter').value;
    const status = document.getElementById('statusFilter').value;

    const filtered = allCases.filter(caseItem => {
        const matchesSearch = caseItem.name.toLowerCase().includes(searchTerm) ||
                            caseItem.location.toLowerCase().includes(searchTerm);
        const matchesCountry = !country || caseItem.country === country;
        const matchesType = !type || caseItem.type === type;
        const matchesStatus = !status || caseItem.status === status;

        return matchesSearch && matchesCountry && matchesType && matchesStatus;
    });

    displayCases(filtered);
}

// Reset filters
function resetFilters() {
    document.getElementById('searchInput').value = '';
    document.getElementById('countryFilter').value = '';
    document.getElementById('typeFilter').value = '';
    document.getElementById('statusFilter').value = '';
    displayCases(allCases);
}

// Open case detail modal with multi-page view
function openCaseDetail(caseId) {
    const caseItem = allCases.find(c => c.id === caseId);
    if (!caseItem) return;

    currentCaseId = caseId;
    currentPageIndex = 0;
    casePages = generateCasePages(caseItem);
    
    displayCurrentPage();
    document.getElementById('caseModal').classList.add('show');
}

// Close case detail modal
function closeCaseDetail() {
    document.getElementById('caseModal').classList.remove('show');
    currentPageIndex = 0;
    casePages = [];
}

// Generate case pages (8 sections as specified)
function generateCasePages(caseItem) {
    const pages = [];

    // PAGE 1: VICTIM INFORMATION
    pages.push({
        title: 'VICTIM INFORMATION',
        content: `
            <h2>${caseItem.name}</h2>
            <div style="margin: 20px 0;">
                <span class="detail-badge">${caseItem.country}</span>
                <span class="detail-badge ${caseItem.status === 'solved' ? 'solved' : ''}">${caseItem.status.toUpperCase()}</span>
                <span class="detail-badge">${caseItem.type.replace(/-/g, ' ').toUpperCase()}</span>
            </div>
            <h3>Primary Victim Details</h3>
            <p><strong>Location:</strong> ${caseItem.location}</p>
            <p><strong>Time Period:</strong> ${caseItem.year_start} - ${caseItem.year_end}</p>
            <p><strong>Confirmed Victims:</strong> ${caseItem.victims_count}</p>
            ${caseItem.claimed_victims ? `<p><strong>Claimed Victims:</strong> ${caseItem.claimed_victims}</p>` : ''}
            
            <h3>Victim Photo (CENSORED)</h3>
            <div class="censored-image">
                <div class="censored-overlay">⚠️ FACE CENSORED</div>
            </div>
            <p><em>Note: Victim identity protected. Family name redacted for privacy.</em></p>
        `
    });

    // PAGE 2: MURDER STORY & METHODOLOGY
    pages.push({
        title: 'MURDER STORY & METHODOLOGY',
        content: `
            <h2>Murder Story</h2>
            <p>${caseItem.murder_story.description}</p>
            
            <h3>How It Happened</h3>
            <p>${caseItem.murder_story.how_it_happened}</p>
            
            <h3>Modus Operandi</h3>
            <p>${caseItem.murder_story.modus_operandi}</p>
        `
    });

    // PAGE 3: CRIME SCENE
    pages.push({
        title: 'CRIME SCENE INFORMATION',
        content: `
            <h2>Crime Scene Details</h2>
            ${caseItem.murder_scene.scenes.map((scene, idx) => `
                <h3>Scene ${idx + 1}</h3>
                <p><strong>Location:</strong> ${scene.location}</p>
                <p><strong>Date:</strong> ${scene.date}</p>
                <p><strong>Description:</strong> ${scene.description}</p>
                <p><strong>Evidence Found:</strong></p>
                <ul>
                    ${scene.evidence_found.map(e => `<li>${e}</li>`).join('')}
                </ul>
                <hr style="margin: 20px 0; border: 1px solid rgba(255, 255, 0, 0.2);">
            `).join('')}
            <p><em>Note: Only declassified and police-approved scene documentation included.</em></p>
        `
    });

    // PAGE 4: SUSPECTS HISTORY
    pages.push({
        title: 'SUSPECTS INFORMATION',
        content: `
            <h2>Suspects History</h2>
            ${caseItem.suspects.map((suspect, idx) => `
                <h3>Suspect ${idx + 1}: ${suspect.first_name}</h3>
                <p><strong>Age at Time:</strong> ${suspect.age_at_time}</p>
                <p><strong>Background:</strong> ${suspect.background}</p>
                <p><strong>Reason Suspected:</strong> ${suspect.reason_suspected}</p>
                <p><strong>Status:</strong> ${suspect.status}</p>
                <p><em>Family name redacted for privacy</em></p>
                <hr style="margin: 20px 0; border: 1px solid rgba(255, 255, 0, 0.2);">
            `).join('')}
            <p><em>Note: Suspect faces and family names censored/redacted.</em></p>
        `
    });

    // PAGE 5: EVIDENCE
    pages.push({
        title: 'DECLASSIFIED EVIDENCE',
        content: `
            <h2>Evidence & Findings</h2>
            ${caseItem.evidence_weapons.map((evidence, idx) => `
                <h3>${evidence.name}</h3>
                <p><strong>Type:</strong> ${evidence.type}</p>
                <p><strong>Description:</strong> ${evidence.description}</p>
                <p><strong>Recovered:</strong> ${evidence.recovered ? 'Yes ✓' : 'No'}</p>
                <p><strong>Significance:</strong> ${evidence.significance}</p>
                <hr style="margin: 20px 0; border: 1px solid rgba(255, 255, 0, 0.2);">
            `).join('')}
            <p><em>Note: Only declassified evidence included in this file.</em></p>
        `
    });

    // PAGE 6: MURDER WEAPONS
    pages.push({
        title: 'MURDER WEAPONS & TOOLS',
        content: `
            <h2>Weapons & Murder Tools</h2>
            ${caseItem.evidence_weapons.filter(e => e.type.toLowerCase().includes('weapon') || e.type.toLowerCase().includes('tool')).length > 0 
                ? caseItem.evidence_weapons.filter(e => e.type.toLowerCase().includes('weapon') || e.type.toLowerCase().includes('tool')).map((weapon, idx) => `
                    <h3>Weapon ${idx + 1}: ${weapon.name}</h3>
                    <p><strong>Type:</strong> ${weapon.type}</p>
                    <p><strong>Description:</strong> ${weapon.description}</p>
                    <p><strong>Recovered:</strong> ${weapon.recovered ? 'Yes ✓' : 'No'}</p>
                    <p><strong>Forensic Significance:</strong> ${weapon.significance}</p>
                    <hr style="margin: 20px 0; border: 1px solid rgba(255, 255, 0, 0.2);">
                `).join('')
                : '<p>Weapon details classified or not available.</p>'
            }
        `
    });

    // PAGE 7: COURT TRIALS
    pages.push({
        title: 'COURT TRIALS & LEGAL PROCEEDINGS',
        content: `
            <h2>Court Trials</h2>
            ${caseItem.court_trials && caseItem.court_trials.length > 0
                ? caseItem.court_trials.map((trial, idx) => `
                    <h3>Trial ${idx + 1}</h3>
                    <p><strong>Defendant:</strong> ${trial.defendant_name}</p>
                    <p><strong>Outcome:</strong> ${trial.outcome}</p>
                    <hr style="margin: 20px 0; border: 1px solid rgba(255, 255, 0, 0.2);">
                `).join('')
                : '<p>Trial information not available or case is unsolved.</p>'
            }
        `
    });

    // PAGE 8: CASE CONCLUSION
    pages.push({
        title: 'CASE CONCLUSION & STATUS',
        content: `
            <h2>Case Status: ${caseItem.conclusion.case_status.toUpperCase()}</h2>
            <p>${caseItem.conclusion.summary}</p>
            
            <h3>Official Sources & Links</h3>
            ${caseItem.official_links && caseItem.official_links.length > 0
                ? caseItem.official_links.map(link => `
                    <p>
                        <a href="${link.url}" target="_blank" style="color: #1a1a1a; text-decoration: underline; font-weight: bold;">
                            📄 ${link.source_name}
                        </a>
                    </p>
                `).join('')
                : '<p>No official links available.</p>'
            }
        `
    });

    return pages;
}

// Display current page
function displayCurrentPage() {
    if (casePages.length === 0) return;

    const page = casePages[currentPageIndex];
    const caseDetailDiv = document.getElementById('caseDetail');
    
    // Create page HTML
    const pageHTML = `
        <div class="case-page">
            ${page.content}
        </div>
    `;
    
    caseDetailDiv.innerHTML = pageHTML;
    
    // Update navigation
    updatePageNavigation();
}

// Update page navigation buttons
function updatePageNavigation() {
    const navDiv = document.getElementById('pageNavigation');
    const totalPages = casePages.length;
    const currentPage = currentPageIndex + 1;

    navDiv.innerHTML = `
        <button class="nav-btn" onclick="previousPage()" ${currentPageIndex === 0 ? 'disabled' : ''}>
            ← Previous Page
        </button>
        <span class="page-indicator">Page ${currentPage} / ${totalPages}</span>
        <button class="nav-btn" onclick="nextPage()" ${currentPageIndex === totalPages - 1 ? 'disabled' : ''}>
            Next Page →
        </button>
    `;
}

// Navigate to next page
function nextPage() {
    if (currentPageIndex < casePages.length - 1) {
        currentPageIndex++;
        displayCurrentPage();
        // Scroll to top of page
        document.querySelector('.case-page').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

// Navigate to previous page
function previousPage() {
    if (currentPageIndex > 0) {
        currentPageIndex--;
        displayCurrentPage();
        // Scroll to top of page
        document.querySelector('.case-page').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}
