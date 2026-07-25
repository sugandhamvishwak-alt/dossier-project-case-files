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

        // Relative path — works whether the site is served from root or a subpath
        const response = await fetch('./data/cases.json');

        console.log('Response status:', response.status);

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        console.log('Successfully loaded ' + data.length + ' cases');

        allCases = data;
        displayCases(allCases);

    } catch (error) {
        console.error('FULL ERROR:', error);
        casesList.innerHTML = `
            <p class="no-results">
                FILE NOT FOUND<br><br>
                Error: ${error.message}<br><br>
                <span style="font-size:0.7em; opacity:0.7;">
                Current URL: ${window.location.href}<br>
                Attempted fetch: ./data/cases.json<br><br>
                Check that cases.json exists inside a /data folder in this repo.
                </span>
            </p>
        `;
    }
}

// Display cases
function displayCases(cases) {
    const casesList = document.getElementById('casesList');
    const resultsTitle = document.getElementById('resultsTitle');

    if (!cases || cases.length === 0) {
        casesList.innerHTML = '<p class="no-results">NO MATCHING FILES ON RECORD</p>';
        resultsTitle.textContent = 'No Results';
        return;
    }

    resultsTitle.textContent = `${cases.length} File${cases.length !== 1 ? 's' : ''} on Record`;

    casesList.innerHTML = cases.map(caseItem => `
        <div class="case-card" onclick="openCaseDetail('${caseItem.id}')">
            <div class="case-card-tab"></div>
            <h3>${caseItem.name}</h3>

            <div class="case-info">
                <span class="case-badge">${caseItem.country}</span>
                <span class="case-badge ${caseItem.status === 'solved' ? 'solved' : 'unsolved'}">${caseItem.status.toUpperCase()}</span>
                <span class="case-badge">${caseItem.type.replace(/-/g, ' ').toUpperCase()}</span>
            </div>

            <div class="case-details-text">
                <strong>Location:</strong> ${caseItem.location}
            </div>
            <div class="case-details-text">
                <strong>Period:</strong> ${caseItem.year_start} – ${caseItem.year_end}
            </div>
            <div class="case-details-text">
                <strong>Victims:</strong> ${caseItem.victims_count}
            </div>

            <button class="view-details-btn">Open File →</button>
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
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') closeCaseDetail();
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
    document.body.style.overflow = 'hidden';
}

// Close case detail modal
function closeCaseDetail() {
    document.getElementById('caseModal').classList.remove('show');
    document.body.style.overflow = '';
}

// Generate case detail HTML
function generateCaseDetailHTML(caseItem) {
    const statusClass = caseItem.status === 'solved' ? 'solved' : 'unsolved';
    return `
        <div class="case-stamp ${statusClass}">${caseItem.status.toUpperCase()}</div>
        <h2>${caseItem.name}</h2>

        <div class="badge-group">
            <span class="case-badge">${caseItem.country}</span>
            <span class="case-badge ${statusClass}">${caseItem.status.toUpperCase()}</span>
            <span class="case-badge">${caseItem.type.replace(/-/g, ' ').toUpperCase()}</span>
        </div>

        <h3>01 · Basic Information</h3>
        <div class="detail-section">
            <p><strong>Location:</strong> ${caseItem.location}</p>
            <p><strong>Period:</strong> ${caseItem.year_start} – ${caseItem.year_end}</p>
            <p><strong>Confirmed Victims:</strong> ${caseItem.victims_count}</p>
            ${caseItem.claimed_victims ? `<p><strong>Claimed Victims:</strong> ${caseItem.claimed_victims}</p>` : ''}
        </div>

        <h3>02 · Complaint / FIR</h3>
        <div class="detail-section">
            <p><strong>Filed Date:</strong> ${caseItem.fir_complaint.filed_date}</p>
            <p><strong>Filed By:</strong> ${caseItem.fir_complaint.filed_by}</p>
            <p><strong>Classification:</strong> ${caseItem.fir_complaint.initial_classification}</p>
            <p>${caseItem.fir_complaint.complaint_summary}</p>
        </div>

        <h3>03 · The Murder</h3>
        <div class="detail-section">
            <p>${caseItem.murder_story.description}</p>
            <h4>How It Happened</h4>
            <p>${caseItem.murder_story.how_it_happened}</p>
            <h4>Modus Operandi</h4>
            <p>${caseItem.murder_story.modus_operandi}</p>
        </div>

        <h3>04 · Crime Scene</h3>
        <div class="detail-section">
            ${caseItem.murder_scene.scenes.map((scene, idx) => `
                <p class="scene-label">Scene ${idx + 1}</p>
                <p><strong>Location:</strong> ${scene.location}</p>
                <p><strong>Date:</strong> ${scene.date}</p>
                <p><strong>Description:</strong> ${scene.description}</p>
                <p><strong>Evidence Found:</strong> ${scene.evidence_found.join(', ')}</p>
            `).join('<hr class="tear-divider">')}
        </div>

        <h3>05 · Suspects <span class="redacted-note">(surnames redacted)</span></h3>
        <div class="detail-section">
            ${caseItem.suspects.map((suspect, idx) => `
                <h4>Suspect ${idx + 1}: ${suspect.first_name} <span class="redacted-bar">SURNAME</span></h4>
                <p><strong>Age at time:</strong> ${suspect.age_at_time}</p>
                <p><strong>Background:</strong> ${suspect.background}</p>
                <p><strong>Reason Suspected:</strong> ${suspect.reason_suspected}</p>
                <p><strong>Status:</strong> <span class="suspect-status">${suspect.status}</span></p>
            `).join('<hr class="tear-divider">')}
        </div>

        <h3>06 · Evidence &amp; Murder Weapons</h3>
        <div class="detail-section">
            ${caseItem.evidence_weapons.map((evidence) => `
                <h4>${evidence.name}</h4>
                <p><strong>Type:</strong> ${evidence.type}</p>
                <p><strong>Description:</strong> ${evidence.description}</p>
                <p><strong>Recovered:</strong> ${evidence.recovered ? 'Yes' : 'No'}</p>
                <p><strong>Significance:</strong> ${evidence.significance}</p>
            `).join('<hr class="tear-divider">')}
        </div>

        <h3>07 · Court Trial</h3>
        <div class="detail-section">
            ${caseItem.court_trials.map((trial) => `
                <p><strong>Defendant:</strong> ${trial.defendant_name}</p>
                <p><strong>Outcome:</strong> ${trial.outcome}</p>
            `).join('<hr class="tear-divider">')}
        </div>

        <h3>08 · Conclusion</h3>
        <div class="detail-section conclusion-section">
            <div class="conclusion-stamp ${statusClass}">${caseItem.conclusion.case_status}</div>
            <p>${caseItem.conclusion.summary}</p>
        </div>

        <h3>09 · Sources</h3>
        <div class="link-section">
            ${caseItem.official_links.map(link => `
                <a href="${link.url}" target="_blank" rel="noopener">${link.source_name}</a>
            `).join('')}
        </div>
    `;
}
