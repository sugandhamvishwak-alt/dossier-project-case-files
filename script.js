// Global variables
let allCases = [];

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

        
        const data = await response.json();
        console.log('JSON parsed successfully, cases count:', data.length);
        
        allCases = data;
        console.log('Cases assigned to allCases');
        
        displayCases(allCases);
        console.log('displayCases() called');
        
    } catch (error) {
        console.error('FULL ERROR:', error);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        
        casesList.innerHTML = `
            <p class="no-results">
                ❌ Failed to load cases<br><br>
                Error: ${error.message}<br><br>
                <strong>Debug Info:</strong><br>
                Current URL: ${window.location.href}<br>
                Fetch attempted: /dossier-project-case-files/data/cases.json<br><br>
                <strong>Solution:</strong> Check that cases.json exists in the data folder
            </p>
        `;
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
            
            <button class="view-details-btn">View Full Details →</button>
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

// Open case detail modal
function openCaseDetail(caseId) {
    const caseItem = allCases.find(c => c.id === caseId);
    if (!caseItem) return;

    const detailHTML = generateCaseDetailHTML(caseItem);
    document.getElementById('caseDetail').innerHTML = detailHTML;
    document.getElementById('caseModal').classList.add('show');
}

// Close case detail modal
function closeCaseDetail() {
    document.getElementById('caseModal').classList.remove('show');
}

// Generate case detail HTML
function generateCaseDetailHTML(caseItem) {
    return `
        <h2>${caseItem.name}</h2>
        
        <div class="badge-group">
            <span class="case-badge">${caseItem.country}</span>
            <span class="case-badge ${caseItem.status === 'solved' ? 'solved' : ''}">${caseItem.status.toUpperCase()}</span>
            <span class="case-badge">${caseItem.type.replace(/-/g, ' ').toUpperCase()}</span>
        </div>

        <h3>📍 Basic Information</h3>
        <div class="detail-section">
            <p><strong>Location:</strong> ${caseItem.location}</p>
            <p><strong>Period:</strong> ${caseItem.year_start} - ${caseItem.year_end}</p>
            <p><strong>Confirmed Victims:</strong> ${caseItem.victims_count}</p>
            ${caseItem.claimed_victims ? `<p><strong>Claimed Victims:</strong> ${caseItem.claimed_victims}</p>` : ''}
        </div>

        <h3>🚔 FIR / Police Complaint</h3>
        <div class="detail-section">
            <p><strong>Filed Date:</strong> ${caseItem.fir_complaint.filed_date}</p>
            <p><strong>Filed By:</strong> ${caseItem.fir_complaint.filed_by}</p>
            <p><strong>Classification:</strong> ${caseItem.fir_complaint.initial_classification}</p>
            <p>${caseItem.fir_complaint.complaint_summary}</p>
        </div>

        <h3>📖 Murder Story & Methodology</h3>
        <div class="detail-section">
            <p>${caseItem.murder_story.description}</p>
            <h4>How It Happened:</h4>
            <p>${caseItem.murder_story.how_it_happened}</p>
            <h4>Modus Operandi:</h4>
            <p>${caseItem.murder_story.modus_operandi}</p>
        </div>

        <h3>🔍 Crime Scenes</h3>
        <div class="detail-section">
            ${caseItem.murder_scene.scenes.map((scene, idx) => `
                <p><strong>Scene ${idx + 1}:</strong></p>
                <p><strong>Location:</strong> ${scene.location}</p>
                <p><strong>Date:</strong> ${scene.date}</p>
                <p><strong>Description:</strong> ${scene.description}</p>
                <p><strong>Evidence Found:</strong> ${scene.evidence_found.join(', ')}</p>
            `).join('<hr style="margin: 15px 0; border: 1px solid rgba(233, 69, 96, 0.2);">')}
        </div>

        <h3>👥 Suspects (Family Names Redacted)</h3>
        <div class="detail-section">
            ${caseItem.suspects.map((suspect, idx) => `
                <h4>Suspect ${idx + 1}: ${suspect.first_name}</h4>
                <p><strong>Age:</strong> ${suspect.age_at_time}</p>
                <p><strong>Background:</strong> ${suspect.background}</p>
                <p><strong>Reason Suspected:</strong> ${suspect.reason_suspected}</p>
                <p><strong>Status:</strong> ${suspect.status}</p>
            `).join('<hr style="margin: 15px 0; border: 1px solid rgba(233, 69, 96, 0.2);">')}
        </div>

        <h3>🔨 Evidence & Murder Weapons</h3>
        <div class="detail-section">
            ${caseItem.evidence_weapons.map((evidence, idx) => `
                <h4>${evidence.name}</h4>
                <p><strong>Type:</strong> ${evidence.type}</p>
                <p><strong>Description:</strong> ${evidence.description}</p>
                <p><strong>Recovered:</strong> ${evidence.recovered ? 'Yes' : 'No'}</p>
                <p><strong>Significance:</strong> ${evidence.significance}</p>
            `).join('<hr style="margin: 15px 0; border: 1px solid rgba(233, 69, 96, 0.2);">')}
        </div>

        <h3>⚖️ Court Trials</h3>
        <div class="detail-section">
            ${caseItem.court_trials.map((trial) => `
                <p><strong>Defendant:</strong> ${trial.defendant_name}</p>
                <p><strong>Outcome:</strong> ${trial.outcome}</p>
            `).join('')}
        </div>

        <h3>✅ Case Conclusion</h3>
        <div class="detail-section">
            <p><strong>Status:</strong> ${caseItem.conclusion.case_status}</p>
            <p>${caseItem.conclusion.summary}</p>
        </div>

        <h3>🔗 Official Links</h3>
        <div class="link-section">
            ${caseItem.official_links.map(link => `
                <a href="${link.url}" target="_blank">📄 ${link.source_name}</a>
            `).join('')}
        </div>
    `;
}
