// Global variables
let allCases = [];

// Load cases from JSON on page load
document.addEventListener('DOMContentLoaded', () => {
    loadCases();
    setupEventListeners();
});

// Load cases from cases.json
async function loadCases() {
    try {
        const response = await fetch('data/cases.json');
        allCases = await response.json();
        displayCases(allCases);
    } catch (error) {
        console.error('Error loading cases:', error);
        document.getElementById('casesList').innerHTML = 
            '<p class="no-results">Error loading cases. Please check that cases.json exists in the data folder.</p>';
    }
}

// Display cases
function displayCases(cases) {
    const casesList = document.getElementById('casesList');
    const resultsTitle = document.getElementById('resultsTitle');

    if (cases.length === 0) {
        casesList.innerHTML = '<p class="no-results">No cases found matching your filters.</p>';
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
    // Search
    document.getElementById('searchInput').addEventListener('input', filterCases);
    
    // Filters
    document.getElementById('countryFilter').addEventListener('change', filterCases);
    document.getElementById('typeFilter').addEventListener('change', filterCases);
    document.getElementById('statusFilter').addEventListener('change', filterCases);
    
    // Reset
    document.getElementById('resetFilters').addEventListener('click', resetFilters);
    
    // Modal
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
            ${caseItem.murder_story.psychological_profile ? `
                <h4>Psychological Profile:</h4>
                <p>${caseItem.murder_story.psychological_profile}</p>
            ` : ''}
        </div>

        <h3>🔍 Crime Scenes</h3>
        <div class="detail-section">
            ${Array.isArray(caseItem.murder_scene) ? 
                caseItem.murder_scene.map((incident, idx) => `
                    <h4>${incident.incident_name || 'Scene ' + (idx + 1)}</h4>
                    ${incident.scenes.map(scene => `
                        <p><strong>Location:</strong> ${scene.location}</p>
                        <p><strong>Date:</strong> ${scene.date}</p>
                        <p><strong>Description:</strong> ${scene.description}</p>
                        <p><strong>Evidence Found:</strong> ${scene.evidence_found.join(', ')}</p>
                    `).join('<hr style="margin: 15px 0; border: 1px solid rgba(233, 69, 96, 0.2);">')}
                `).join('')
                :
                caseItem.murder_scene.scenes.map((scene, idx) => `
                    <p><strong>Scene ${idx + 1}:</strong></p>
                    <p><strong>Location:</strong> ${scene.location}</p>
                    <p><strong>Date:</strong> ${scene.date}</p>
                    <p><strong>Description:</strong> ${scene.description}</p>
                    <p><strong>Evidence Found:</strong> ${scene.evidence_found.join(', ')}</p>
                    <hr style="margin: 15px 0; border: 1px solid rgba(233, 69, 96, 0.2);">
                `).join('')
            }
        </div>

        <h3>👥 Suspects (Family Names Redacted)</h3>
        <div class="detail-section">
            ${caseItem.suspects.map((suspect, idx) => `
                <h4>Suspect ${idx + 1}: ${suspect.first_name}</h4>
                <p><strong>Age at Time:</strong> ${suspect.age_at_time}</p>
                <p><strong>Occupation:</strong> ${suspect.occupation}</p>
                <p><strong>Background:</strong> ${suspect.background}</p>
                <p><strong>Reason Suspected:</strong> ${suspect.reason_suspected}</p>
                <p><strong>Status:</strong> ${suspect.status}</p>
                <p><em>${suspect.note}</em></p>
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
            ${caseItem.court_trials.map((trial, idx) => `
                <h4>Trial ${idx + 1}</h4>
                <p><strong>Defendant:</strong> ${trial.defendant_name}</p>
                <p><strong>Date:</strong> ${trial.trial_date}</p>
                <p><strong>Verdict:</strong> ${trial.verdict}</p>
                <p><strong>Charges:</strong> ${trial.charges}</p>
                <p><strong>Outcome:</strong> ${trial.outcome}</p>
                <p>${trial.notes || ''}</p>
            `).join('')}
        </div>

        <h3>✅ Case Conclusion</h3>
        <div class="detail-section">
            <p><strong>Status:</strong> <span style="color: #e94560; font-size: 1.2em;">${caseItem.conclusion.case_status}</span></p>
            <p><strong>Summary:</strong> ${caseItem.conclusion.summary}</p>
            <p><strong>Why Unsolved/Solved:</strong> ${caseItem.conclusion.why_unsolved}</p>
            <p><strong>Current Status:</strong> ${caseItem.conclusion.current_status}</p>
            <p><strong>Last Update:</strong> ${caseItem.conclusion.last_update}</p>
        </div>

        <h3>🔗 Official Source Links</h3>
        <div class="link-section">
            ${caseItem.official_links.map(link => `
                <a href="${link.url}" target="_blank" rel="noopener noreferrer">
                    📄 ${link.source_name} (${link.type})
                </a>
            `).join('')}
        </div>
    `;
}
