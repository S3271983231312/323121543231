let currentLanguage = 'pt';
let currentTranslations = {};
let currentProsConsTranslations = {};

const LANGUAGES = {
    pt: { name: 'Português', translations: LANGUAGE_PT, prosCons: PROS_CONS_PT },
    en: { name: 'English', translations: LANGUAGE_EN, prosCons: PROS_CONS_EN },
    es: { name: 'Español', translations: LANGUAGE_ES, prosCons: PROS_CONS_ES },
    ru: { name: 'Русский', translations: LANGUAGE_RU, prosCons: PROS_CONS_RU }
};

function translateProsCons(text) {
    if (currentLanguage === 'pt') return text;
    if (!currentProsConsTranslations) return text;
    return currentProsConsTranslations[text] || text;
}

function applyTranslations(lang) {
    const langData = LANGUAGES[lang];
    if (!langData) return;
    
    currentTranslations = langData.translations;
    currentProsConsTranslations = langData.prosCons;
    
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        if (currentTranslations[key]) {
            if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                element.placeholder = currentTranslations[key];
            } else {
                element.innerHTML = currentTranslations[key];
            }
        }
    });
    
    document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
        const key = element.getAttribute('data-i18n-placeholder');
        if (currentTranslations[key]) {
            element.placeholder = currentTranslations[key];
        }
    });
    
    const currentLabel = document.getElementById('currentLanguageLabel');
    if (currentLabel) currentLabel.textContent = langData.name;
    
    document.documentElement.lang = lang === 'pt' ? 'pt-BR' : lang;
    
    localStorage.setItem('siteLanguage', lang);
    
    refreshCatalogStats();
    refreshGuidesStats();
    refreshUtilitiesStats();
    renderSources();
    loadGuides();
    loadUtilities();
}

function refreshCatalogStats() {
    const catalogStats = document.getElementById('catalogStats');
    if (catalogStats && state && state.totalGames) {
        catalogStats.textContent = `${state.sources.length} ${currentTranslations?.catalogs_indexed || 'catálogos indexados'} | ${currentTranslations?.total_games || 'Total de Jogos'}: ${state.totalGames.toLocaleString('pt-BR')}`;
    }
}

function refreshGuidesStats() {
    const guidesStats = document.getElementById('guidesStats');
    if (guidesStats) {
        guidesStats.textContent = `${CONFIG.guides.length} ${currentTranslations?.guides_stats || 'guias disponíveis'}`;
    }
}

function refreshUtilitiesStats() {
    const utilitiesStats = document.getElementById('utilitiesStats');
    if (utilitiesStats) {
        utilitiesStats.textContent = `${CONFIG.utilities.length} ${currentTranslations?.utilities_stats || 'utilitários disponíveis'}`;
    }
}

function setupLanguageSelector() {
    const savedLang = localStorage.getItem('siteLanguage');
    if (savedLang && LANGUAGES[savedLang]) {
        currentLanguage = savedLang;
        applyTranslations(currentLanguage);
    } else {
        applyTranslations('pt');
    }
    
    const menuBtn = document.getElementById('languageMenuBtn');
    const dropdown = document.getElementById('languageDropdown');
    
    if (menuBtn && dropdown) {
        menuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdown.classList.toggle('show');
        });
        
        document.querySelectorAll('.language-option').forEach(option => {
            option.addEventListener('click', (e) => {
                const lang = option.getAttribute('data-lang');
                if (lang && LANGUAGES[lang]) {
                    currentLanguage = lang;
                    applyTranslations(currentLanguage);
                    dropdown.classList.remove('show');
                }
            });
        });
        
        document.addEventListener('click', (e) => {
            if (!menuBtn.contains(e.target) && !dropdown.contains(e.target)) {
                dropdown.classList.remove('show');
            }
        });
    }
}

const CONFIG = {
    statusLabels: {
        'trusted': { label: 'Confiável', class: 'status-trusted', icon: 'fa-shield-alt' },
        'verified': { label: 'Seguro para Usar', class: 'status-verified', icon: 'fa-check-circle' },
        'risk': { label: 'Com Risco', class: 'status-risk', icon: 'fa-exclamation-triangle' }
    },
    
    sourceTypes: {
        'byxatab': { type: 'repacks', icon: 'fa-gamepad' },
        'dodi': { type: 'repacks', icon: 'fa-gamepad' },
        'ecologica': { type: 'repacks', icon: 'fa-leaf' },
        'fitgirl': { type: 'repacks', icon: 'fa-gamepad' },
        'gog': { type: 'gog', icon: 'fa-gamepad' },
        'onlinefix': { type: 'online', icon: 'fa-wifi' },
        'insaneramzes': { type: 'folder', icon: 'fa-gamepad' }
    },
    
    sourceUrls: {
        'byxatab': 'https://0f7144ca.byxatab.pages.dev',
        'dodi': 'https://237c3ee4.dodi.pages.dev',
        'ecologica': 'https://56668f13.ecologica2verde.pages.dev',
        'fitgirl': 'https://e74037cf.ecofitgirl.pages.dev',
        'gog': 'https://3b60b3cf.freepcgoggames.pages.dev',
        'onlinefix': 'https://4c4e4c45.onlinefixme.pages.dev',
        'insaneramzes': 'https://981d2f21.insaneramzes.pages.dev'
    },
    
    sourceSafetyLinks: {
        'byxatab': 'https://www.urlvoid.com/scan/byxatab.com/',
        'dodi': 'https://www.urlvoid.com/scan/dodi-repacks.site/',
        'ecologica': 'https://www.urlvoid.com/scan/ecologica2verde.pages.dev/',
        'fitgirl': 'https://www.urlvoid.com/scan/fitgirl-repacks.site/',
        'gog': 'https://www.urlvoid.com/scan/freegogpcgames.com/',
        'onlinefix': 'https://www.urlvoid.com/scan/online-fix.me/',
        'insaneramzes': 'https://www.urlvoid.com/scan/rutracker.me/'
    },
    
    recommendations: {
        'byxatab': 5,
        'dodi': 4,
        'ecologica': 4,
        'fitgirl': 5,
        'gog': 4,
        'onlinefix': 5,
        'insaneramzes': 4
    },
    
    guides: [
        {
            id: 'all-guides',
            emoji: '📚',
            icon: 'fa-book',
            url: 'https://rentry.co/ECOLOGICA-VERDE-GUIAS'
        },
        {
            id: 'adobe-guide',
            emoji: '📙',
            icon: 'fa-paint-brush',
            url: 'https://rentry.co/adobe-creative-cloud-ecologica-verde'
        },
        {
            id: 'microsoft-guide',
            emoji: '📗',
            icon: 'fa-desktop',
            url: 'https://rentry.co/ATIVADOR-MICROSOFT-OFFICE-E-WINDOWS-ECOLOGICA-VERDE'
        },
        {
            id: 'sites-warning',
            emoji: '⛔',
            icon: 'fa-exclamation-triangle',
            url: 'https://rentry.co/sites-problematicos-ecologica-verde'
        },
        {
            id: 'digimon-guide',
            emoji: '🎮',
            icon: 'fa-gamepad',
            url: 'https://rentry.co/DIGIMON-STORY-TIME-STRANGER-ECOLOGICA-VERDE'
        },
        {
            id: 'elden-guide',
            emoji: '🎮',
            icon: 'fa-gamepad',
            url: 'https://rentry.co/elden-ring-nightreign-ecologica-verde'
        },
        {
            id: 'ffxv-guide',
            emoji: '🎮',
            icon: 'fa-gamepad',
            url: 'https://rentry.co/FINAL-FANTASY-XV-ECOLOGICA-VERDE'
        },
        {
            id: 'persona-guide',
            emoji: '🎮',
            icon: 'fa-gamepad',
            url: 'https://rentry.co/PERSONA-3-RELOAD-ECOLOGICA-VERDE'
        },
        {
            id: 'smt-guide',
            emoji: '🎮',
            icon: 'fa-gamepad',
            url: 'https://rentry.co/SHIN-MEGAMI-TENSEI-V-VENGEANCE-ECOLOGICA-VERDE'
        }
    ],
    
    utilities: [
        {
            id: 'fmhy',
            emoji: '➡️',
            icon: 'fa-external-link-alt',
            url: 'https://fmhy.net/'
        },
        {
            id: 'piracy-megathread',
            emoji: '💬',
            icon: 'fa-external-link-alt',
            url: 'https://www.reddit.com/r/Piracy/wiki/megathread/'
        },
        {
            id: 'annas-archive',
            emoji: '📖',
            icon: 'fa-book',
            url: 'https://annas-archive.gd/'
        },
        {
            id: 'adguard-vpn',
            emoji: '⛔',
            icon: 'fa-user-shield',
            url: 'https://chromewebstore.google.com/detail/adguard-vpn-proxy-gratuit/hhdobjgopfphlmjbmnpglhfcgppchgje'
        },
        {
            id: 'cobalt-tools',
            emoji: '😼',
            icon: 'fa-tools',
            url: 'https://cobalt.tools/'
        },
        {
            id: 'rentry',
            emoji: '📚',
            icon: 'fa-paste',
            url: 'https://rentry.co/'
        },
        {
            id: 'spotify-pc',
            emoji: '🎵',
            icon: 'fa-music',
            url: 'https://github.com/SpotX-Official/SpotX'
        },
        {
            id: 'temp-email',
            emoji: '✉️',
            icon: 'fa-envelope',
            url: 'https://adguard.com/pt_br/adguard-temp-mail/overview.html'
        },
        {
            id: 'ublock',
            emoji: '🚫',
            icon: 'fa-shield-alt',
            url: 'https://ublockorigin.com/'
        }
    ]
};

let state = {
    sources: [],
    filteredSources: [],
    filters: {
        search: '',
        status: 'all',
        type: 'all',
        sort: 'name'
    },
    currentSection: 'sources',
    filtersInitialized: false,
    isChangingSection: false,
    gameCounts: {},
    totalGames: 0
};

document.addEventListener('DOMContentLoaded', async () => {
    await initializeApp();
    setupEventListeners();
    setupNavigation();
    loadGuides();
    loadUtilities();
    setupCardEffects();
    updateScrollbarVisibility();
    setupGameSearch();
    setupMobileMenu();
    setupLanguageSelector();
    setupSourceModal();
});

async function initializeApp() {
    try {
        const [sourcesResponse, gameCountsResponse] = await Promise.all([
            fetch('sources.json'),
            fetch('games-count.json')
        ]);
        
        const sourcesData = await sourcesResponse.json();
        const gameCountsData = await gameCountsResponse.json();
        
        state.gameCounts = gameCountsData;
        
        state.totalGames = 0;
        for (const key in gameCountsData) {
            if (key !== 'totalGames' && key !== 'lastUpdated' && typeof gameCountsData[key] === 'number') {
                state.totalGames += gameCountsData[key];
            }
        }
        
        const catalogStats = document.getElementById('catalogStats');
        if (catalogStats) {
            catalogStats.textContent = `${sourcesData.sources.length} catálogos indexados | Total de Jogos: ${state.totalGames.toLocaleString('pt-BR')}`;
        }
        
        state.sources = sourcesData.sources.map(source => ({
            ...source,
            type: CONFIG.sourceTypes[source.id]?.type || 'other',
            icon: CONFIG.sourceTypes[source.id]?.icon || 'fa-gamepad',
            stars: CONFIG.recommendations[source.id] || 0,
            url: CONFIG.sourceUrls[source.id] || '#',
            safetyLink: CONFIG.sourceSafetyLinks[source.id] || '#',
            pros: (source.pros || []).slice(0, 3),
            cons: (source.cons || []).slice(0, 3),
            gameCount: state.gameCounts[source.id] || 0
        }));
        
        state.sources.sort((a, b) => a.name.localeCompare(b.name));
        
        state.filteredSources = [...state.sources];
        renderSources();
        
    } catch (error) {
        console.error('Erro ao inicializar:', error);
        showError('Falha ao carregar os dados. Verifique sua conexão.', 'sources');
    }
}

function setupSourceModal() {
    const modal = document.getElementById('sourceModal');
    const closeBtn = document.getElementById('closeSourceModalBtn');
    
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });
    }
    
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    }
}

function showSourceDetails(sourceId) {
    const source = state.sources.find(s => s.id === sourceId);
    if (!source) return;
    
    const statusInfo = CONFIG.statusLabels[source.status];
    const modal = document.getElementById('sourceModal');
    const statusSpan = document.getElementById('sourceModalStatus');
    const filenameSpan = document.getElementById('sourceModalFilename');
    const starsDiv = document.getElementById('sourceModalStars');
    const columnsDiv = document.getElementById('sourceModalColumns');
    
    if (statusSpan) {
        statusSpan.className = `status-indicator ${statusInfo.class}`;
        statusSpan.innerHTML = `<i class="fas ${statusInfo.icon}"></i> ${statusInfo.label}`;
    }
    
    if (filenameSpan) {
        filenameSpan.textContent = `${source.filename}.csv`;
    }
    
    if (starsDiv) {
        starsDiv.innerHTML = getStarsHTML(source.stars);
    }
    
    if (columnsDiv) {
        columnsDiv.innerHTML = source.csvColumns.map(col => `<span class="column-tag">${col}</span>`).join('');
    }
    
    if (modal) {
        modal.style.display = 'flex';
    }
}

function setupMobileMenu() {
    const menuToggle = document.getElementById('mobileMenuToggle');
    const filtersToggle = document.getElementById('mobileFiltersToggle');
    const leftSidebar = document.getElementById('leftSidebar');
    const filtersSidebar = document.getElementById('filtersSidebar');
    const closeSidebar = document.getElementById('mobileCloseSidebar');
    const closeFilters = document.getElementById('mobileCloseFilters');
    
    function closeAllSidebars() {
        if (leftSidebar) leftSidebar.classList.remove('open');
        if (filtersSidebar) filtersSidebar.classList.remove('open');
    }
    
    if (menuToggle) {
        menuToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            if (filtersSidebar && filtersSidebar.classList.contains('open')) {
                filtersSidebar.classList.remove('open');
            }
            leftSidebar.classList.toggle('open');
        });
    }
    
    if (filtersToggle) {
        filtersToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            if (leftSidebar && leftSidebar.classList.contains('open')) {
                leftSidebar.classList.remove('open');
            }
            if (state.currentSection === 'sources') {
                filtersSidebar.classList.toggle('open');
            }
        });
    }
    
    if (closeSidebar) {
        closeSidebar.addEventListener('click', () => {
            leftSidebar.classList.remove('open');
        });
    }
    
    if (closeFilters) {
        closeFilters.addEventListener('click', () => {
            filtersSidebar.classList.remove('open');
        });
    }
    
    document.addEventListener('click', (e) => {
        if (window.innerWidth <= 768) {
            if (leftSidebar && leftSidebar.classList.contains('open')) {
                if (!leftSidebar.contains(e.target) && !menuToggle.contains(e.target)) {
                    leftSidebar.classList.remove('open');
                }
            }
            if (filtersSidebar && filtersSidebar.classList.contains('open')) {
                if (!filtersSidebar.contains(e.target) && !filtersToggle.contains(e.target)) {
                    filtersSidebar.classList.remove('open');
                }
            }
        }
    });
}

function setupNavigation() {
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            if (state.isChangingSection) return;
            state.isChangingSection = true;
            
            const section = e.currentTarget.dataset.section;
            
            document.querySelectorAll('.nav-item').forEach(item => {
                item.classList.remove('active');
            });
            
            e.currentTarget.parentElement.classList.add('active');
            
            document.querySelectorAll('.content-section').forEach(section => {
                section.classList.remove('active');
            });
            
            document.getElementById(`${section}-section`).classList.add('active');
            
            const filtersSidebar = document.getElementById('filtersSidebar');
            
            if (section === 'sources') {
                filtersSidebar.classList.remove('hidden');
                if (window.innerWidth <= 768) {
                    filtersSidebar.classList.remove('open');
                }
                
                setTimeout(() => {
                    setupFilterListeners();
                    state.isChangingSection = false;
                }, 100);
            } else {
                filtersSidebar.classList.add('hidden');
                if (window.innerWidth <= 768 && filtersSidebar) {
                    filtersSidebar.classList.remove('open');
                }
                setTimeout(() => {
                    state.isChangingSection = false;
                }, 300);
            }
            
            state.currentSection = section;
            updateScrollbarVisibility();
            
            if (window.innerWidth <= 768) {
                const leftSidebar = document.getElementById('leftSidebar');
                if (leftSidebar) {
                    leftSidebar.classList.remove('open');
                }
            }
        });
    });
}

function updateScrollbarVisibility() {
    const sections = ['sources', 'guides', 'utilities', 'dmca'];
    
    sections.forEach(section => {
        const sectionEl = document.getElementById(`${section}-section`);
        if (sectionEl) {
            if (section === 'sources') {
                sectionEl.classList.remove('no-scrollbar');
            } else {
                sectionEl.classList.add('no-scrollbar');
            }
        }
    });
}

function setupFilterListeners() {
    const filterOptions = document.querySelectorAll('.filter-option');
    filterOptions.forEach(button => {
        const newButton = button.cloneNode(true);
        button.parentNode.replaceChild(newButton, button);
    });

    document.querySelectorAll('[data-sort]').forEach(button => {
        button.addEventListener('click', (e) => {
            const sort = e.currentTarget.dataset.sort;
            state.filters.sort = sort;
            
            document.querySelectorAll('[data-sort]').forEach(btn => {
                btn.classList.remove('active');
            });
            
            e.currentTarget.classList.add('active');
            
            applyFilters();
        });
    });
    
    document.querySelectorAll('[data-type]').forEach(button => {
        button.addEventListener('click', (e) => {
            const type = e.currentTarget.dataset.type;
            state.filters.type = type;
            
            document.querySelectorAll('[data-type]').forEach(btn => {
                btn.classList.remove('active');
            });
            
            e.currentTarget.classList.add('active');
            
            applyFilters();
        });
    });
    
    document.querySelectorAll('[data-status]').forEach(button => {
        button.addEventListener('click', (e) => {
            const status = e.currentTarget.dataset.status;
            state.filters.status = status;
            
            document.querySelectorAll('[data-status]').forEach(btn => {
                btn.classList.remove('active');
            });
            
            e.currentTarget.classList.add('active');
            
            applyFilters();
        });
    });
    
    const resetBtn = document.getElementById('resetFilters');
    const newResetBtn = resetBtn.cloneNode(true);
    resetBtn.parentNode.replaceChild(newResetBtn, resetBtn);
    
    newResetBtn.addEventListener('click', resetFilters);
    
    const searchInput = document.getElementById('searchInput');
    const newSearchInput = searchInput.cloneNode(true);
    searchInput.parentNode.replaceChild(newSearchInput, searchInput);
    
    newSearchInput.addEventListener('input', (e) => {
        state.filters.search = e.target.value.toLowerCase();
        applyFilters();
    });
}

function applyFilters() {
    let filtered = [...state.sources];
    
    if (state.filters.search) {
        filtered = filtered.filter(source => 
            source.name.toLowerCase().includes(state.filters.search) ||
            source.shortName.toLowerCase().includes(state.filters.search)
        );
    }
    
    if (state.filters.status !== 'all') {
        filtered = filtered.filter(source => source.status === state.filters.status);
    }
    
    if (state.filters.type !== 'all') {
        if (state.filters.type === 'folder') {
            filtered = filtered.filter(source => source.id === 'byxatab' || source.id === 'insaneramzes');
        } else if (state.filters.type === 'repacks') {
            filtered = filtered.filter(source => 
                source.id === 'fitgirl' || 
                source.id === 'dodi' || 
                source.id === 'byxatab' || 
                source.id === 'ecologica'
            );
        } else {
            filtered = filtered.filter(source => source.type === state.filters.type);
        }
    }
    
    filtered.sort((a, b) => {
        switch(state.filters.sort) {
            case 'name':
                return a.name.localeCompare(b.name);
            case 'status':
                return a.status.localeCompare(b.status);
            case 'recommended':
                return b.stars - a.stars;
            case 'games':
                return b.gameCount - a.gameCount;
            default:
                return 0;
        }
    });
    
    state.filteredSources = filtered;
    renderSources();
}

function resetFilters() {
    state.filters = {
        search: '',
        status: 'all',
        type: 'all',
        sort: 'name'
    };
    
    document.querySelectorAll('.filter-option').forEach(btn => {
        btn.classList.remove('active');
    });
    
    document.querySelectorAll('[data-sort="name"], [data-type="all"], [data-status="all"]').forEach(btn => {
        btn.classList.add('active');
    });
    
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.value = '';
    }
    
    applyFilters();
}

function setupEventListeners() {
    if (state.currentSection === 'sources') {
        setupFilterListeners();
    }
}

function renderSources() {
    const grid = document.getElementById('sourcesGrid');
    if (!grid) return;
    
    if (state.filteredSources.length === 0) {
        grid.innerHTML = `
            <div class="no-results">
                <i class="fas fa-search"></i>
                <h3>${currentTranslations?.no_results || 'Nenhum catálogo encontrado'}</h3>
                <p>${currentTranslations?.no_results_tip || 'Tente ajustar os filtros ou a pesquisa'}</p>
            </div>
        `;
        return;
    }
    
    grid.innerHTML = state.filteredSources.map(source => {
        const isEcologica = source.id === 'ecologica';
        
        const donateLinkText = currentTranslations?.donate_link || 'Link de Doação';
        const urlSafelyText = currentTranslations?.url_safely || 'Verificação da URL';
        
        let shortNameHtml = source.shortName;
        if (currentLanguage !== 'pt' && source.shortName.includes('Donate link')) {
            shortNameHtml = source.shortName.replace('Donate link', donateLinkText);
        } else if (currentLanguage === 'pt' && source.shortName.includes('Donate link')) {
            shortNameHtml = source.shortName.replace('Donate link', donateLinkText);
        }
        
        const translatedPros = source.pros.map(pro => translateProsCons(pro));
        const translatedCons = source.cons.map(con => translateProsCons(con));
        
        return `
        <article class="source-card" data-id="${source.id}">
            <div class="card-header">
                <div class="card-icon">
                    <i class="fas ${source.icon}"></i>
                </div>
                <div class="card-title">
                    <h3>${source.name}</h3>
                    <div class="card-subtitle">
                        <div class="donate-safety-links">
                            ${isEcologica ? 
                                `<span>${currentTranslations?.nonprofit || 'Projeto sem fins lucrativo'}</span>` : 
                                shortNameHtml
                            }
                            <span class="divider">|</span>
                            <a href="${source.safetyLink}" class="link-text" target="_blank">${urlSafelyText}</a>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="card-pros-cons">
                <div class="pros-cons-header">
                    <i class="fas fa-chart-line"></i>
                    <h4>${currentTranslations?.catalog_analysis || 'Análise do Catálogo'}</h4>
                </div>
                <div class="pros-cons-grid">
                    <div class="pros-section">
                        <div class="pros-title">
                            <i class="fas fa-check-circle"></i>
                            <span>${currentTranslations?.pros || 'Prós'}</span>
                        </div>
                        <ul class="pros-list">
                            ${translatedPros.map(pro => `<li>${pro}</li>`).join('')}
                        </ul>
                    </div>
                    <div class="cons-section">
                        <div class="cons-title">
                            <i class="fas fa-times-circle"></i>
                            <span>${currentTranslations?.cons || 'Contras'}</span>
                        </div>
                        <ul class="cons-list">
                            ${translatedCons.map(con => `<li>${con}</li>`).join('')}
                        </ul>
                    </div>
                </div>
            </div>
            
            <div class="card-meta">
                <div class="source-status">
                    <span class="status-indicator ${CONFIG.statusLabels[source.status]?.class || 'status-trusted'}">
                        <i class="fas ${CONFIG.statusLabels[source.status]?.icon || 'fa-shield-alt'}"></i>
                        ${CONFIG.statusLabels[source.status]?.label || 'Confiável'}
                    </span>
                </div>
                <div class="games-count">
                    <i class="fas fa-gamepad"></i>
                    <span>${source.gameCount.toLocaleString('pt-BR')} ${currentTranslations?.games_count || 'Jogos'}</span>
                </div>
                <div class="stars">
                    ${getStarsHTML(source.stars)}
                </div>
            </div>
            
            <div class="card-actions">
                <a href="${source.url}" class="btn btn-primary" target="_blank">
                    <i class="fas fa-external-link-alt"></i>
                    ${currentTranslations?.access_catalog || 'Acessar Catálogo'}
                </a>
            </div>
        </article>
    `}).join('');
    
    setupCardEffects();
}

function getStarsHTML(rating) {
    let stars = '';
    for (let i = 1; i <= 5; i++) {
        if (i <= rating) {
            stars += '<i class="fas fa-star star"></i>';
        } else {
            stars += '<i class="far fa-star star"></i>';
        }
    }
    return stars;
}

function loadGuides() {
    const grid = document.getElementById('guidesGrid');
    if (!grid) return;
    
    if (CONFIG.guides.length === 0) {
        grid.innerHTML = `
            <div class="no-results">
                <i class="fas fa-book"></i>
                <h3>${currentTranslations?.no_guides || 'Nenhum guia disponível'}</h3>
                <p>${currentTranslations?.coming_soon || 'Os guias serão adicionados em breve'}</p>
            </div>
        `;
        return;
    }
    
    const guidesTranslations = currentTranslations?.guides_translations || {};
    
    const guidesList = CONFIG.guides.map(guide => {
        const translation = guidesTranslations[guide.id];
        const title = translation?.title || guide.id;
        const description = translation?.description || '';
        
        return `
        <article class="guide-card" data-id="${guide.id}">
            <div class="card-header">
                <div class="card-icon">
                    <i class="fas ${guide.icon}"></i>
                </div>
                <div class="card-title">
                    <h3>${title}</h3>
                </div>
            </div>
            
            <p class="card-description">${description}</p>
            
            <div class="card-actions">
                <a href="${guide.url}" class="btn btn-primary btn-guide" target="_blank">
                    <i class="fas fa-external-link-alt"></i>
                    ${currentTranslations?.access_guide || 'Acessar Guia'}
                </a>
            </div>
        </article>
    `}).join('');
    
    grid.innerHTML = guidesList;
    setupCardEffects();
}

function loadUtilities() {
    const grid = document.getElementById('utilitiesGrid');
    if (!grid) return;
    
    if (CONFIG.utilities.length === 0) {
        grid.innerHTML = `
            <div class="no-results">
                <i class="fas fa-tools"></i>
                <h3>${currentTranslations?.no_utilities || 'Nenhum utilitário disponível'}</h3>
                <p>${currentTranslations?.coming_soon || 'Os utilitários serão adicionados em breve'}</p>
            </div>
        `;
        return;
    }
    
    const utilitiesTranslations = currentTranslations?.utilities_translations || {};
    
    const sortedUtilities = [...CONFIG.utilities].sort((a, b) => {
        if (a.id === 'fmhy') return -1;
        if (b.id === 'fmhy') return 1;
        if (a.id === 'piracy-megathread') return -1;
        if (b.id === 'piracy-megathread') return 1;
        return a.id.localeCompare(b.id);
    });
    
    const utilitiesList = sortedUtilities.map(utility => {
        const translation = utilitiesTranslations[utility.id];
        const title = translation?.title || utility.id;
        const description = translation?.description || '';
        
        return `
        <article class="utility-card" data-id="${utility.id}">
            <div class="card-header">
                <div class="card-icon">
                    <i class="fas ${utility.icon}"></i>
                </div>
                <div class="card-title">
                    <h3>${title}</h3>
                </div>
            </div>
            
            <p class="card-description">${description}</p>
            
            <div class="card-actions">
                <a href="${utility.url}" class="btn btn-primary btn-utility" target="_blank">
                    <i class="fas fa-external-link-alt"></i>
                    ${currentTranslations?.access_utility || 'Acessar Utilitário'}
                </a>
            </div>
        </article>
    `}).join('');
    
    grid.innerHTML = utilitiesList;
    setupCardEffects();
}

function setupCardEffects() {
    const cards = document.querySelectorAll('.source-card, .guide-card, .utility-card');
    
    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            card.style.setProperty('--mouse-x', `${(x / rect.width) * 100}%`);
            card.style.setProperty('--mouse-y', `${(y / rect.height) * 100}%`);
        });
    });
}

function handleAccessSource(sourceId) {
    const source = state.sources.find(s => s.id === sourceId);
    
    if (source.status === 'risk') {
        showNotification('⚠️ Aviso', 'Este catálogo é classificado como "Com Risco". Proceda com cautela.', 'warning');
    }
    
    showNotification(
        '🌿 Redirecionando...',
        `Abrindo catálogo ${source.name}...`,
        'info'
    );
}

function showError(message, section) {
    const grid = document.getElementById(`${section}-section`).querySelector('.sources-grid');
    if (grid) {
        grid.innerHTML = `
            <div class="no-results">
                <i class="fas fa-exclamation-circle"></i>
                <h3>Erro ao Carregar</h3>
                <p>${message}</p>
                <button class="btn btn-primary" onclick="location.reload()" style="margin-top: 1rem;">
                    <i class="fas fa-redo"></i> Tentar Novamente
                </button>
            </div>
        `;
    }
}

function showNotification(title, message, type = 'info') {
    document.querySelectorAll('.notification').forEach(n => n.remove());
    
    const icons = {
        info: 'fa-info-circle',
        success: 'fa-check-circle',
        warning: 'fa-exclamation-triangle',
        error: 'fa-times-circle'
    };
    
    const colors = {
        info: '#4caf50',
        success: '#4caf50',
        warning: '#ff9800',
        error: '#f44336'
    };
    
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #111111;
        border: 1px solid #1a1a1a;
        border-radius: 8px;
        padding: 16px;
        max-width: 300px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        display: flex;
        align-items: flex-start;
        gap: 12px;
        z-index: 1000;
        animation: slideIn 0.3s ease;
    `;
    
    notification.innerHTML = `
        <i class="fas ${icons[type]}" style="color: ${colors[type]}; font-size: 16px; margin-top: 2px;"></i>
        <div>
            <strong style="font-size: 14px; color: #ffffff; display: block; margin-bottom: 4px;">${title}</strong>
            <p style="font-size: 13px; color: #b0b0b0; margin: 0;">${message}</p>
        </div>
        <button onclick="this.parentElement.remove()" style="background: transparent; border: none; color: #888888; font-size: 18px; cursor: pointer; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; border-radius: 4px; transition: all 0.2s ease;">
            &times;
        </button>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

function setupGameSearch() {
    const modal = document.getElementById('gameSearchModal');
    const openBtn = document.getElementById('openSearchModalBtn');
    const closeBtn = document.getElementById('closeModalBtn');
    const searchInput = document.getElementById('gameSearchInput');
    const searchBtn = document.getElementById('searchGameBtn');
    const resultsContainer = document.getElementById('searchResults');
    const modalBody = document.getElementById('modalBody');

    function getCatalogsFromSourceUrls() {
        const catalogs = [];
        const csvFiles = {
            'byxatab': 'ByXATAB.csv.gz',
            'dodi': 'DODI%20Repack.csv.gz',
            'ecologica': 'Ecol%C3%B3gica%20Verde.csv.gz',
            'fitgirl': 'FitGirl%20Repack.csv.gz',
            'gog': 'Free%20PC%20GOG%20Games.csv.gz',
            'onlinefix': 'OnlineFixMe.csv.gz',
            'insaneramzes': 'InsaneRamzes.csv.gz'
        };
        
        const icons = {
            'byxatab': 'fa-gamepad',
            'dodi': 'fa-gamepad',
            'ecologica': 'fa-leaf',
            'fitgirl': 'fa-gamepad',
            'gog': 'fa-gamepad',
            'onlinefix': 'fa-wifi',
            'insaneramzes': 'fa-gamepad'
        };
        
        const names = {
            'byxatab': 'ByXATAB',
            'dodi': 'DODI Repacks',
            'ecologica': 'Ecológica Verde',
            'fitgirl': 'FitGirl Repacks',
            'gog': 'Free PC GOG Games',
            'onlinefix': 'OnlineFixMe',
            'insaneramzes': 'InsaneRamZes'
        };
        
        for (const [id, baseUrl] of Object.entries(CONFIG.sourceUrls)) {
            const csvFile = csvFiles[id];
            if (csvFile) {
                let url = baseUrl;
                if (!url.endsWith('/')) {
                    url = url + '/';
                }
                catalogs.push({
                    id: id,
                    name: names[id],
                    csvUrl: url + csvFile,
                    icon: icons[id]
                });
            }
        }
        
        return catalogs;
    }

    if (openBtn) {
        openBtn.addEventListener('click', () => {
            modal.style.display = 'flex';
            if (modalBody) {
                modalBody.scrollTop = 0;
            }
            if (resultsContainer) {
                resultsContainer.scrollTop = 0;
            }
            setTimeout(() => {
                searchInput.focus();
            }, 100);
        });
    }

    function closeSearchModal() {
        modal.style.display = 'none';
        searchInput.value = '';
        resultsContainer.innerHTML = `
            <div class="search-placeholder">
                <i class="fas fa-gamepad"></i>
                <p>${currentTranslations?.modal_placeholder || 'Digite o nome de um jogo para ver em qual(is) catálogo(s) ele está'}</p>
            </div>
        `;
        if (modalBody) {
            modalBody.scrollTop = 0;
        }
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', closeSearchModal);
    }

    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeSearchModal();
        });
    }

    async function searchInCatalog(catalog, gameName) {
        try {
            const response = await fetch(catalog.csvUrl);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            
            const arrayBuffer = await response.arrayBuffer();
            
            let csvText;
            
            if (catalog.csvUrl.endsWith('.gz')) {
                const decompressed = pako.ungzip(new Uint8Array(arrayBuffer), { to: 'string' });
                csvText = decompressed;
            } else {
                const decoder = new TextDecoder('utf-8');
                csvText = decoder.decode(arrayBuffer);
            }
            
            const lines = csvText.split('\n');
            if (lines.length === 0) return [];
            
            const headers = lines[0].split(',');
            
            const nameColumnIndex = headers.findIndex(h => 
                h.toLowerCase().includes('nome') || 
                h.toLowerCase().includes('name') ||
                h.toLowerCase().includes('game')
            );
            
            const magnetColumnIndex = headers.findIndex(h => 
                h.toLowerCase().includes('url') || 
                h.toLowerCase().includes('magnet') ||
                h.toLowerCase().includes('link')
            );
            
            if (nameColumnIndex === -1) return [];
            
            const matches = [];
            const searchTerm = gameName.toLowerCase();
            
            for (let i = 1; i < lines.length; i++) {
                const line = lines[i].trim();
                if (!line) continue;
                
                let columns;
                if (line.includes('"')) {
                    const regex = /"([^"]*)"|([^,]+)/g;
                    columns = [];
                    let match;
                    while ((match = regex.exec(line)) !== null) {
                        columns.push(match[1] || match[2] || '');
                    }
                } else {
                    columns = line.split(',');
                }
                
                const gameName_raw = columns[nameColumnIndex] || '';
                const gameName_clean = gameName_raw.replace(/^"|"$/g, '').trim();
                
                let magnetLink = '';
                if (magnetColumnIndex !== -1 && columns[magnetColumnIndex]) {
                    magnetLink = columns[magnetColumnIndex].replace(/^"|"$/g, '').trim();
                }
                
                if (gameName_clean.toLowerCase().includes(searchTerm)) {
                    if (!matches.some(m => m.name === gameName_clean)) {
                        matches.push({
                            name: gameName_clean,
                            magnet: magnetLink
                        });
                    }
                }
            }
            
            return matches;
            
        } catch (error) {
            console.error(`Erro ao buscar em ${catalog.name}:`, error);
            return [];
        }
    }

    async function performSearch() {
        const gameName = searchInput.value.trim();
        
        if (!gameName) {
            resultsContainer.innerHTML = `
                <div class="search-placeholder">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>${currentTranslations?.modal_search_error || 'Digite o nome de um jogo para buscar'}</p>
                </div>
            `;
            return;
        }
        
        const catalogs = getCatalogsFromSourceUrls();
        
        resultsContainer.innerHTML = `
            <div class="search-loading">
                <div class="loading-spinner-small"></div>
                <p>${currentTranslations?.searching || 'Buscando em'} ${catalogs.length} ${currentTranslations?.catalogs || 'catálogos'}...</p>
            </div>
        `;
        
        if (modalBody) {
            modalBody.scrollTop = 0;
        }
        
        const searchPromises = catalogs.map(catalog => 
            searchInCatalog(catalog, gameName).then(matches => ({ catalog, matches }))
        );
        
        const results = await Promise.all(searchPromises);
        
        const catalogsWithMatches = results.filter(r => r.matches.length > 0);
        
        if (catalogsWithMatches.length === 0) {
            resultsContainer.innerHTML = `
                <div class="search-no-results">
                    <i class="fas fa-face-frown"></i>
                    <h4>${currentTranslations?.no_games || 'Nenhum jogo encontrado'}</h4>
                    <p>${currentTranslations?.no_games_message || 'Não encontramos'} "${gameName}" ${currentTranslations?.in_catalogs || 'em nenhum catálogo'}.</p>
                    <p class="search-tip">${currentTranslations?.search_tip || 'Dica: Tente usar apenas parte do nome ou verifique a ortografia.'}</p>
                </div>
            `;
            return;
        }
        
        resultsContainer.innerHTML = `
            <div class="search-results-header">
                <i class="fas fa-check-circle"></i>
                <span>${currentTranslations?.found_in || 'Encontrado em'} ${catalogsWithMatches.length} ${currentTranslations?.catalog || 'catálogo(s)'}</span>
            </div>
            <div class="catalogs-list">
                ${catalogsWithMatches.map(({ catalog, matches }) => `
                    <div class="catalog-result" data-catalog-id="${catalog.id}">
                        <div class="catalog-result-header" data-catalog-id="${catalog.id}">
                            <i class="fas ${catalog.icon}"></i>
                            <strong>${catalog.name}</strong>
                            <span class="match-count">${matches.length} ${currentTranslations?.games_found || 'jogo(s)'}</span>
                            <i class="fas fa-chevron-down dropdown-icon" data-catalog-id="${catalog.id}"></i>
                        </div>
                        <ul class="games-list" id="games-list-${catalog.id}">
                            ${matches.map(game => `
                                <li>
                                    <div class="game-info">
                                        <i class="fas fa-gamepad"></i>
                                        <span class="game-name">${escapeHtml(game.name)}</span>
                                    </div>
                                    ${game.magnet ? `<a href="${escapeHtml(game.magnet)}" class="game-link-btn" target="_blank"><i class="fas fa-magnet"></i> ${currentTranslations?.link_btn || 'Link'}</a>` : `<span class="game-link-btn disabled" style="opacity:0.5; cursor:not-allowed;"><i class="fas fa-magnet"></i> ${currentTranslations?.no_link || 'Sem Link'}</span>`}
                                </li>
                            `).join('')}
                        </ul>
                    </div>
                `).join('')}
            </div>
        `;
        
        document.querySelectorAll('.catalog-result-header').forEach(header => {
            header.addEventListener('click', (e) => {
                e.stopPropagation();
                const catalogId = header.dataset.catalogId;
                const gamesList = document.getElementById(`games-list-${catalogId}`);
                const dropdownIcon = header.querySelector('.dropdown-icon');
                
                if (gamesList) {
                    gamesList.classList.toggle('collapsed');
                    if (dropdownIcon) {
                        if (gamesList.classList.contains('collapsed')) {
                            dropdownIcon.style.transform = 'rotate(-90deg)';
                        } else {
                            dropdownIcon.style.transform = 'rotate(0deg)';
                        }
                    }
                }
            });
        });
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    if (searchBtn) {
        searchBtn.addEventListener('click', performSearch);
    }

    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') performSearch();
        });
    }
}

window.handleAccessSource = handleAccessSource;
window.showSourceDetails = showSourceDetails;
window.closeModal = closeModal;