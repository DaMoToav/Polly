document.addEventListener('DOMContentLoaded', () => {
    // --- State Management ---
    const state = {
        currentView: 'feed', // feed, trending, livePollsPage, analytics, messagesPage, answerPolls, groupPage
        userCredits: 1250,
        currentUserId: 100, // JohnDoe
        polls: [],
        originalPolls: [],
        users: {
            100: { username: "JohnDoe", avatar: "https://randomuser.me/api/portraits/men/32.jpg", followers: 428, following: 156, age: 30, gender: 'male' },
            101: { username: "TechGuru", avatar: "https://randomuser.me/api/portraits/men/43.jpg", age: 45, gender: 'male', followers: 250, following: 50 },
            102: { username: "DesignFan", avatar: "https://randomuser.me/api/portraits/women/65.jpg", age: 28, gender: 'female', followers: 600, following: 120 },
            103: { username: "JaneSmith", avatar: "https://randomuser.me/api/portraits/women/44.jpg", age: 35, gender: 'female', followers: 150, following: 90 },
            104: { username: "SportsNut", avatar: "https://randomuser.me/api/portraits/men/51.jpg", age: 22, gender: 'male', followers: 300, following: 70 },
            105: { username: "MusicMaven", avatar: "https://randomuser.me/api/portraits/women/76.jpg", age: 29, gender: 'female', followers: 180, following: 60 },
            106: { username: "CodeWizard", avatar: "https://randomuser.me/api/portraits/lego/1.jpg", age: 40, gender: 'other', followers: 500, following: 200 },
            107: { username: "TravelBug", avatar: "https://randomuser.me/api/portraits/women/33.jpg", age: 25, gender: 'female', followers: 220, following: 80 },
            108: { username: "Foodie", avatar: "https://randomuser.me/api/portraits/men/88.jpg", age: 38, gender: 'male', followers: 400, following: 150 },
            109: { username: "ArtLover", avatar: "https://randomuser.me/api/portraits/women/50.jpg", age: 32, gender: 'female', followers: 350, following: 100 },
            110: { username: "GameDev", avatar: "https://randomuser.me/api/portraits/men/60.jpg", age: 27, gender: 'male', followers: 450, following: 180 },
            111: { username: "EcoWarrior", avatar: "https://randomuser.me/api/portraits/women/70.jpg", age: 31, gender: 'female', followers: 200, following: 50 },
        },
        groups: [], // Will be populated by loadSamplePollsAndGroups
        dummyChats: [
            { id: 'chat1', userId: 101, unread: 2, lastMessage: "Hey, did you see that new JS framework?", timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(), messages: [{sender:101, text:"Hey, did you see that new JS framework?", time: new Date(Date.now() - 30 * 60 * 1000).toISOString()}, {sender:100, text:"Not yet, which one?", time: new Date(Date.now() - 29 * 60 * 1000).toISOString()}] },
            { id: 'chat2', userId: 103, unread: 0, lastMessage: "Let's catch up soon!", timestamp: new Date(Date.now() - 2 * 3600 * 1000).toISOString(), messages: [] },
            { id: 'chat3', userId: 105, unread: 5, lastMessage: "OMG, that concert was amazing! You should have been there...", timestamp: new Date(Date.now() - 24 * 3600 * 1000).toISOString(), messages: [] },
            { id: 'chat4', userId: 104, unread: 0, lastMessage: "Game night this Friday?", timestamp: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(), messages: [] }
        ],
        selectedChatId: null,
        selectedGroupId: null, // NEW: For group page view
        userVotes: {},
        userInteractions: {},
        followedUsers: new Set(['104','101']),
        joinedGroups: new Set(['g1']), // JohnDoe joins "Tech Enthusiasts" by default
        theme: localStorage.getItem('polly-theme') || 'light',
        notificationTimeout: null,
        activeTagFilter: null, 
        lastFocusedElement: null, 
        analyticsChart: null, 
    };

    // --- DOM References ---
    const elements = {
        themeToggle: document.getElementById('themeToggle'),
        htmlElement: document.documentElement,
        logoIcon: document.querySelector('.logo-icon'), // NEW: For logo change
        newPollButton: document.getElementById('newPollButton'),
        answerPollsButton: document.getElementById('answerPollsButton'),
        searchInput: document.getElementById('searchInput'),
        searchButton: document.getElementById('searchButton'),
        searchClearButton: document.getElementById('searchClearButton'), 
        navButtonsContainer: document.querySelector('.nav-buttons-container'),
        navButtons: document.querySelectorAll('.nav-btn'),
        feedTitle: document.getElementById('feedTitle'),
        feedSortSelect: document.getElementById('feedSortSelect'),
        mainPollsContainer: document.getElementById('mainPollsContainer'),
        groupList: document.getElementById('groupList'),
        createGroupBtn: document.getElementById('createGroupBtn'),
        tagsContainer: document.getElementById('tagsContainer'), 
        userProfilePic: document.getElementById('userProfilePic'),
        userProfileName: document.getElementById('userProfileName'),
        userCreditsValue: document.getElementById('userCreditsValue'),
        userFollowersValue: document.getElementById('userFollowersValue'),
        userFollowingValue: document.getElementById('userFollowingValue'),
        userActivePollsList: document.getElementById('userActivePollsList'),
        suggestedUsersList: document.getElementById('suggestedUsersList'),
        newPollModal: document.getElementById('newPollModal'),
        newPollModalTitle: document.getElementById('newPollModalTitle'), 
        closePollModalBtn: document.getElementById('closePollModalBtn'),
        pollForm: document.getElementById('pollForm'),
        pollQuestion: document.getElementById('pollQuestion'),
        pollOption1: document.getElementById('pollOption1'),
        pollOption2: document.getElementById('pollOption2'),
        pollOption3: document.getElementById('pollOption3'),
        pollOption4: document.getElementById('pollOption4'),
        targetGender: document.getElementById('targetGender'),
        targetAge: document.getElementById('targetAge'),
        pollCredits: document.getElementById('pollCredits'),
        creditsValue: document.getElementById('creditsValue'),
        pollTags: document.getElementById('pollTags'),
        pollDuration: document.getElementById('pollDuration'),
        createGroupModal: document.getElementById('createGroupModal'),
        createGroupModalTitle: document.getElementById('createGroupModalTitle'), 
        closeGroupModalBtn: document.getElementById('closeGroupModalBtn'),
        groupForm: document.getElementById('groupForm'),
        groupName: document.getElementById('groupName'),
        groupDescription: document.getElementById('groupDescription'),
        groupIconSelect: document.getElementById('groupIconSelect'),
        groupInvites: document.getElementById('groupInvites'),
        creditNotification: document.getElementById('creditNotification'),
    };

    // --- Initialization ---
    function init() {
        elements.logoIcon.className = 'fas fa-kiwi-bird logo-icon'; // NEW: Set logo icon
        applyInitialTheme();
        loadDataFromLocalStorage();
        loadSamplePollsAndGroups(); // This will now smartly add data
        setupEventListeners();
        renderUserProfile();
        renderGroups();
        renderTrendingTagsSidebar(); 
        renderSuggestedUsers();
        renderUI(); 
        updateActiveNavButton();
        document.addEventListener('keydown', handleGlobalKeyDown);
    }

    function loadDataFromLocalStorage() {
        const storedVotes = localStorage.getItem('polly_userVotes');
        if (storedVotes) state.userVotes = JSON.parse(storedVotes);
        const storedInteractions = localStorage.getItem('polly_userInteractions');
        if (storedInteractions) state.userInteractions = JSON.parse(storedInteractions);
        const storedFollows = localStorage.getItem('polly_followedUsers');
        if (storedFollows) state.followedUsers = new Set(JSON.parse(storedFollows));
        const storedJoins = localStorage.getItem('polly_joinedGroups');
        if (storedJoins) state.joinedGroups = new Set(JSON.parse(storedJoins));
        const storedUserCredits = localStorage.getItem('polly_userCredits');
        if (storedUserCredits) state.userCredits = parseInt(storedUserCredits);

        const storedPolls = localStorage.getItem('polly_polls');
        if (storedPolls) {
            state.polls = JSON.parse(storedPolls).map(p => ({
                 ...p,
                 createdAt: new Date(p.createdAt),
                 comments: (p.comments || []).map(c => ({...c, timestamp: new Date(c.timestamp)})) // Ensure comment timestamps are dates
                }));
        }
        const storedOriginalPolls = localStorage.getItem('polly_originalPolls');
         if (storedOriginalPolls) {
            state.originalPolls = JSON.parse(storedOriginalPolls).map(p => ({
                ...p,
                createdAt: new Date(p.createdAt),
                comments: (p.comments || []).map(c => ({...c, timestamp: new Date(c.timestamp)}))
            }));
        } else if (state.polls.length > 0) { // If polls loaded but no original, copy from polls
            state.originalPolls = JSON.parse(JSON.stringify(state.polls)).map(p => ({
                ...p,
                createdAt: new Date(p.createdAt),
                comments: (p.comments || []).map(c => ({...c, timestamp: new Date(c.timestamp)}))
            }));
        }

        const storedGroups = localStorage.getItem('polly_groups');
        if (storedGroups) {
            state.groups = JSON.parse(storedGroups);
        }
    }

    function saveDataToLocalStorage() {
        localStorage.setItem('polly_userVotes', JSON.stringify(state.userVotes));
        localStorage.setItem('polly_userInteractions', JSON.stringify(state.userInteractions));
        localStorage.setItem('polly_followedUsers', JSON.stringify(Array.from(state.followedUsers)));
        localStorage.setItem('polly_joinedGroups', JSON.stringify(Array.from(state.joinedGroups)));
        localStorage.setItem('polly_userCredits', state.userCredits.toString());
        localStorage.setItem('polly_polls', JSON.stringify(state.polls));
        localStorage.setItem('polly_originalPolls', JSON.stringify(state.originalPolls));
        localStorage.setItem('polly_groups', JSON.stringify(state.groups));
    }

    function loadSamplePollsAndGroups() {
        let pollsLoaded = false;
        if (state.polls.length === 0) {
            pollsLoaded = true;
            state.polls = [
                // --- Polls for JohnDoe (currentUserId = 100) - for Analytics & Feed ---
                { id: 201, userId: 100, question: "What's your favorite hobby to unwind after work?", options: [{ id: 'h1', text: "Reading", votes: 25 }, { id: 'h2', text: "Gaming", votes: 40 }, { id: 'h3', text: "Exercising", votes: 30 }, { id: 'h4', text: "Cooking", votes: 15 }], tags: ["hobbies", "lifestyle", "relaxation"], createdAt: new Date(Date.now() - 2 * 24 * 3600 * 1000), isLive: false, isCompleted: false, isPublic: true, isTargeted: false, likes: 22, dislikes: 2, durationDays: 7, comments: [ {userId: 101, text: "Definitely gaming for me!", timestamp: new Date(Date.now() - 2 * 24 * 3500 * 1000).toISOString()}, {userId: 102, text: "A good book is unbeatable.", timestamp: new Date(Date.now() - 2 * 24 * 3400 * 1000).toISOString()} ], groupId: 'g1'},
                { id: 202, userId: 100, question: "Dream vacation destination for next year?", options: [{ id: 'v1', text: "Tropical Beach", votes: 55 }, { id: 'v2', text: "Mountain Retreat", votes: 30 }, { id: 'v3', text: "City Exploration", votes: 25 }, { id: 'v4', text: "Cruise", votes: 10 }], tags: ["travel", "vacation", "dreams"], createdAt: new Date(Date.now() - 5 * 24 * 3600 * 1000), isLive: false, isCompleted: true, isPublic: true, isTargeted: false, likes: 40, dislikes: 1, durationDays: 3, comments: [] },
                { id: 203, userId: 100, question: "Best programming language for beginners in 2024?", options: [{ id: 'l1', text: "Python", votes: 70 }, { id: 'l2', text: "JavaScript", votes: 50 }, { id: 'l3', text: "Java", votes: 20 }], tags: ["coding", "tech", "learning"], createdAt: new Date(Date.now() - 1 * 24 * 3600 * 1000), isLive: false, isCompleted: false, isPublic: true, isTargeted: false, likes: 35, dislikes: 3, durationDays: 5, comments: [ {userId: 106, text: "Python's syntax is very readable.", timestamp: new Date(Date.now() - 1 * 24 * 3000 * 1000).toISOString()} ], groupId: 'g1'},


                // --- LIVE Polls - For Live Page & Feed ---
                { id: 5, userId: 105, question: "Best music streaming service right now?", options: [ { id: 'm1', text: "Spotify", votes: 150 }, { id: 'm2', text: "Apple Music", votes: 110 }, { id: 'm3', text: "YouTube Music", votes: 70 }, { id: 'm4', text: "Tidal", votes: 30 }], tags: ["music", "streaming", "entertainment"], createdAt: new Date(Date.now() - 10 * 60 * 1000), isLive: true, isCompleted: false, isPublic: true, isTargeted: false, likes: 15, dislikes: 0, comments: [] },
                { id: 6, userId: 108, question: "Favorite type of cuisine for a night out?", options: [ { id: 'f1', text: "Italian", votes: 22 }, { id: 'f2', text: "Mexican", votes: 18 }, { id: 'f3', text: "Japanese", votes: 35 }, { id: 'f4', text: "Indian", votes: 15 }, { id: 'f5', text: "Thai", votes: 20 }], tags: ["food", "dining", "lifestyle"], createdAt: new Date(Date.now() - 30 * 60 * 1000), isLive: true, isCompleted: false, isPublic: true, isTargeted: false, likes: 8, dislikes: 1, comments: [{userId: 100, text: "Japanese, for sure!", timestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString()}] },
                { id: 7, userId: 101, question: "What new tech are you most excited about in 2024?", options: [{id: 't1', text: "AI Advancements", votes: 60},{id: 't2', text: "VR/AR Mainstream", votes: 40},{id: 't3', text: "Quantum Computing", votes: 20}], tags: ["tech", "future", "innovation"], createdAt: new Date(Date.now() - 5 * 60 * 1000), isLive: true, isCompleted: false, isPublic: true, likes: 25, dislikes: 1, comments: [], groupId: 'g1'},


                // --- Regular Public Polls (Completed / Ongoing) - For Feed & Trending ---
                { id: 1, userId: 101, question: "Which frontend framework do you prefer for new projects?", options: [ { id: 'opt1', text: "React", votes: 45 }, { id: 'opt2', text: "Vue", votes: 30 }, { id: 'opt3', text: "Angular", votes: 25 }, { id: 'opt4', text: "Svelte", votes: 18 }, { id: 'opt5', text: "SolidJS", votes: 10 } ], tags: ["tech", "webdev", "frontend"], createdAt: new Date(Date.now() - 3 * 24 * 3600 * 1000), isLive: false, isCompleted: true, isPublic: true, isTargeted: false, likes: 15, dislikes: 2, durationDays: 7, comments: [{userId: 106, text: "Svelte is underrated!", timestamp: new Date(Date.now() - 3 * 24 * 3500 * 1000).toISOString()}], groupId: 'g1' },
                { id: 4, userId: 106, question: "What's your go-to cloud provider?", options: [ { id: 'cl1', text: "AWS", votes: 90 }, { id: 'cl2', text: "Azure", votes: 65 }, { id: 'cl3', text: "Google Cloud", votes: 55 }, { id: 'cl4', text: "Other", votes: 15 }], tags: ["cloud", "devops", "tech"], createdAt: new Date(Date.now() - 10 * 24 * 3600 * 1000), isLive: false, isCompleted: true, isPublic: true, isTargeted: false, likes: 22, dislikes: 1, durationDays: 10, comments: [], groupId: 'g1' },
                { id: 2, userId: 102, question: "What's your favorite primary color for UI design?", options: [ { id: 'optA', text: "Blue", votes: 60 }, { id: 'optB', text: "Purple", votes: 40 }, { id: 'optC', text: "Green", votes: 20 } ], tags: ["design", "ui", "ux"], createdAt: new Date(Date.now() - 15 * 24 * 3600 * 1000), isLive: false, isCompleted: true, isPublic: true, isTargeted: false, likes: 30, dislikes: 5, durationDays: 5, comments: [], groupId: 'g2' },
                { id: 3, userId: 103, question: "Which social media platform do you use most professionally?", options: [ { id: 'optD', text: "LinkedIn", votes: 180 }, { id: 'optE', text: "Twitter/X", votes: 85 }, { id: 'optF', text: "Instagram", votes: 40 }, { id: 'optG', text: "None", votes: 25 } ], tags: ["social", "business", "career"], createdAt: new Date(Date.now() - 8 * 24 * 3600 * 1000), isLive: false, isCompleted: true, isPublic: true, isTargeted: false, likes: 45, dislikes: 8, durationDays: 7, comments: [] },
                { id: 8, userId: 107, question: "Most effective way to learn a new skill?", options: [{id: 's1', text: "Online Courses", votes: 120},{id: 's2', text: "Books", votes: 50},{id: 's3', text: "Hands-on Projects", votes: 150}, {id: 's4', text: "Mentorship", votes: 80}], tags: ["learning", "skills", "education"], createdAt: new Date(Date.now() - 4 * 24 * 3600 * 1000), isLive: false, isCompleted: false, isPublic: true, likes: 60, dislikes: 3, durationDays: 7, comments: [{userId: 100, text: "Hands-on projects are key for me.", timestamp: new Date(Date.now() - 4 * 24 * 3200 * 1000).toISOString()}] },
                { id: 9, userId: 102, question: "Favorite design tool for wireframing?", options: [{id: 'd1', text: "Figma", votes: 180},{id: 'd2', text: "Adobe XD", votes: 90},{id: 'd3', text: "Sketch", votes: 60}, {id: 'd4', text: "Pen & Paper", votes: 40}], tags: ["design", "tools", "ui", "ux"], createdAt: new Date(Date.now() - 6 * 24 * 3600 * 1000), isLive: false, isCompleted: false, isPublic: true, likes: 75, dislikes: 2, durationDays: 7, comments: [], groupId: 'g2'},


                // --- Targeted Polls (for "Answer Polls" page for JohnDoe) ---
                { id: 1001, userId: 107, question: "Female (26-35): Travel destination appeal?", options: [ { id: 't1', text: "Bali", votes: 0 }, { id: 't2', text: "Paris", votes: 0 }, { id: 't3', text: "Costa Rica", votes: 0 }, { id: 't4', text: "Tokyo", votes: 0 }], tags: ["travel", "survey"], createdAt: new Date(Date.now() - 60 * 60 * 1000), isLive: false, isCompleted: false, isPublic: false, isTargeted: true, targetGender: 'female', targetAge: '26-35', likes: 0, dislikes: 0, comments: [] },
                { id: 1004, userId: 106, question: "Men (26-35): Code outside work/study?", options: [ { id: 'c1', text: "Daily", votes: 0 }, { id: 'c2', text: "Few times a week", votes: 0 }, { id: 'c3', text: "Rarely", votes: 0 }, { id: 'c4', text: "Never", votes: 0 }], tags: ["coding", "tech", "hobby", "survey"], createdAt: new Date(Date.now() - 45 * 60 * 1000), isLive: false, isCompleted: false, isPublic: false, isTargeted: true, targetGender: 'male', targetAge: '26-35', likes: 0, dislikes: 0, comments: [] },
                { id: 1005, userId: 102, question: "Men (26-35): Favorite weekend activity?", options: [ { id: 'w1', text: "Sports/Outdoors", votes: 0 }, { id: 'w2', text: "Gaming", votes: 0 }, { id: 'w3', text: "Socializing", votes: 0 }, { id: 'w4', text: "Relaxing at Home", votes: 0 }], tags: ["lifestyle", "survey", "weekend"], createdAt: new Date(Date.now() - 15 * 60 * 1000), isLive: false, isCompleted: false, isPublic: false, isTargeted: true, targetGender: 'male', targetAge: '26-35', likes: 0, dislikes: 0, comments: [] },
            ];
        }

        let groupsLoaded = false;
        if (state.groups.length === 0) {
            groupsLoaded = true;
            state.groups = [
                 { id: 'g1', name: "Tech Enthusiasts", members: 1205, icon: 'fas fa-laptop-code', description: "All about the latest in technology and development." },
                 { id: 'g2', name: "Design Thinkers", members: 850, icon: 'fas fa-palette', description: "A space for UI/UX designers and creative minds." },
                 { id: 'g3', name: "Sports Fans", members: 2100, icon: 'fas fa-futbol', description: "Discussing everything sports!" },
                 { id: 'g4', name: "Movie Buffs", members: 670, icon: 'fas fa-film', description: "For lovers of cinema and film discussions." },
                 { id: 'g5', name: "Book Worms", members: 450, icon: 'fas fa-book-open', description: "Sharing thoughts on our favorite reads." }, // MODIFIED: Icon instead of photo
            ];
        }

        state.polls.forEach(poll => {
            poll.isCompleted = poll.isCompleted || false;
            poll.durationDays = poll.durationDays === undefined ? (poll.isLive ? null : 7) : poll.durationDays;
            poll.likes = poll.likes || 0;
            poll.dislikes = poll.dislikes || 0;
            poll.comments = (poll.comments || []).map(c => ({...c, timestamp: new Date(c.timestamp)})); // Ensure timestamps are Date objects
            poll.commentsCount = poll.comments.length; 
            checkPollCompletion(poll);
            calculatePollMetrics(poll);
        });

        if (pollsLoaded || state.originalPolls.length === 0) {
            state.originalPolls = JSON.parse(JSON.stringify(state.polls)).map(p => ({
                ...p,
                createdAt: new Date(p.createdAt),
                comments: (p.comments || []).map(c => ({...c, timestamp: new Date(c.timestamp)}))
            }));
        }
        
        if (pollsLoaded || groupsLoaded) {
            saveDataToLocalStorage();
        }
    }

    function checkPollCompletion(poll) {
        if (!poll.isLive && !poll.isCompleted && poll.durationDays) {
            const creationDate = new Date(poll.createdAt);
            const completionTimestamp = creationDate.getTime() + (poll.durationDays * 24 * 3600 * 1000);
            if (Date.now() > completionTimestamp) {
                poll.isCompleted = true;
            }
        }
    }

    function calculatePollMetrics(poll) {
        poll.totalVotes = poll.options.reduce((sum, opt) => sum + (opt.votes || 0), 0);
        poll.options.forEach(opt => {
            opt.percentage = poll.totalVotes > 0 ? Math.round(((opt.votes || 0) / poll.totalVotes) * 100) : 0;
        });
        const timeSinceCreationMs = Date.now() - new Date(poll.createdAt).getTime();
        const sevenDaysMs = 7 * 24 * 3600 * 1000;
        const timeDecayFactor = Math.max(0, 1 - (timeSinceCreationMs / sevenDaysMs));
        poll.commentsCount = (poll.comments || []).length; // Ensure commentsCount is accurate
        poll.trendingScore = ((poll.totalVotes || 0) * 0.5 + (poll.likes || 0) * 0.3 + (poll.commentsCount || 0) * 0.2) * timeDecayFactor;
    }

    // --- Rendering Functions ---
    function renderUI() {
        filterAndRenderPolls();
        renderUserActivePolls();
    }

    function filterAndRenderPolls() {
        const currentView = state.currentView;
        elements.mainPollsContainer.innerHTML = ''; 

        const sortOptionsContainer = elements.feedSortSelect.closest('.sort-options');

        if (currentView === 'analytics') {
            renderAnalyticsPage(); 
            if (sortOptionsContainer) sortOptionsContainer.style.display = 'none';
            return;
        }
        if (currentView === 'messagesPage') {
            renderMessagesPage();
            elements.feedTitle.textContent = 'Your Messages';
            if (sortOptionsContainer) sortOptionsContainer.style.display = 'none';
            return;
        }

        if (sortOptionsContainer) sortOptionsContainer.style.display = ''; 

        let pollsToDisplay;
        const searchTerm = elements.searchInput.value.toLowerCase().trim();
        let basePolls = [...state.originalPolls];

        // Apply search filter if active
        if (searchTerm) {
            basePolls = basePolls.filter(poll =>
                poll.question.toLowerCase().includes(searchTerm) ||
                (poll.tags || []).some(tag => tag.toLowerCase().includes(searchTerm)) || // Ensure poll.tags exists
                (state.users[poll.userId]?.username.toLowerCase().includes(searchTerm))
            );
            elements.feedTitle.textContent = `Search Results for "${searchTerm}"`;
        }
        // Apply tag filter if active (and not searching)
        else if (state.activeTagFilter) {
            basePolls = basePolls.filter(poll => (poll.tags || []).includes(state.activeTagFilter)); // Ensure poll.tags exists
            elements.feedTitle.textContent = `Polls tagged #${state.activeTagFilter}`;
        }
        // Apply group filter if in groupPage view (and not searching or tag filtering)
        else if (currentView === 'groupPage' && state.selectedGroupId) {
            basePolls = basePolls.filter(poll => poll.groupId === state.selectedGroupId && poll.isPublic);
            const group = state.groups.find(g => g.id === state.selectedGroupId);
            elements.feedTitle.textContent = group ? `${group.name} Group Polls` : 'Group Polls';
        }
        // Default title if no search or tag filter
        else {
             elements.feedTitle.textContent = 'Your Feed'; // Default, will be overridden by view-specific titles
        }


        pollsToDisplay = basePolls; 
        pollsToDisplay.forEach(checkPollCompletion); // Update completion status before filtering view-specific

        switch (currentView) {
            case 'livePollsPage':
                pollsToDisplay = pollsToDisplay.filter(poll => poll.isLive && poll.isPublic && !poll.isCompleted);
                if (!searchTerm && !state.activeTagFilter) elements.feedTitle.textContent = 'Live Polls';
                break;
            case 'answerPolls':
                const currentUser = state.users[state.currentUserId];
                pollsToDisplay = pollsToDisplay.filter(poll => {
                    if (!poll.isTargeted || poll.isPublic || poll.isCompleted || state.userVotes[poll.id]) return false;
                    if (currentUser) {
                        if (poll.targetGender && poll.targetGender !== 'any' && poll.targetGender !== currentUser.gender) return false;
                        if (poll.targetAge && poll.targetAge !== 'any') {
                            const age = currentUser.age;
                            const range = poll.targetAge.split('-');
                            if (range.length === 2) {
                                if (age < parseInt(range[0]) || age > parseInt(range[1])) return false;
                            } else if (poll.targetAge === '46+' && age < 46) return false;
                            else if (poll.targetAge === '18-25' && (age < 18 || age > 25)) return false;
                            else if (poll.targetAge === '26-35' && (age < 26 || age > 35)) return false;
                            else if (poll.targetAge === '36-45' && (age < 36 || age > 45)) return false;
                        }
                    }
                    return true;
                });
                if (!searchTerm && !state.activeTagFilter) elements.feedTitle.textContent = 'Polls For You';
                break;
            case 'feed':
                // If not already filtered by tag or search, filter for public polls
                if (!state.activeTagFilter && !searchTerm) {
                    pollsToDisplay = pollsToDisplay.filter(poll => poll.isPublic);
                    elements.feedTitle.textContent = 'Your Feed';
                }
                break;
            case 'trending':
                pollsToDisplay = pollsToDisplay.filter(poll => poll.isPublic && poll.isCompleted);
                 if (!searchTerm && !state.activeTagFilter) elements.feedTitle.textContent = 'Trending Polls';
                break;
            case 'groupPage': // Already filtered above, title set above
                break;
            default: // Includes 'search' view if searchTerm is set
                if (!searchTerm && !state.activeTagFilter && currentView !== 'groupPage') { 
                     pollsToDisplay = pollsToDisplay.filter(poll => poll.isPublic);
                     elements.feedTitle.textContent = 'Your Feed';
                }
                break;
        }
        
        if (currentView !== 'answerPolls') {
            const sortBy = elements.feedSortSelect.value;
            switch (sortBy) {
                case 'recent': pollsToDisplay.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); break;
                case 'popular': pollsToDisplay.sort((a, b) => (b.totalVotes || 0) - (a.totalVotes || 0)); break;
                case 'trending': pollsToDisplay.sort((a, b) => (b.trendingScore || 0) - (a.trendingScore || 0)); break;
                case 'live':
                    pollsToDisplay.sort((a, b) => {
                        const aIsActiveLive = a.isLive && a.isPublic && !a.isCompleted;
                        const bIsActiveLive = b.isLive && b.isPublic && !b.isCompleted;
                        if (aIsActiveLive && !bIsActiveLive) return -1;
                        if (!aIsActiveLive && bIsActiveLive) return 1;
                        return new Date(b.createdAt) - new Date(a.createdAt);
                    });
                    break;
            }
        } else { 
            pollsToDisplay.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }
        
        renderPolls(pollsToDisplay);
    }

    function renderAnalyticsPage() {
        elements.feedTitle.textContent = 'Your Poll Analytics'; 
        const userPolls = state.originalPolls.filter(p => p.userId === state.currentUserId);
        const totalPolls = userPolls.length;
        const totalVotesReceived = userPolls.reduce((sum, p) => sum + (p.totalVotes || 0), 0);
        const totalLikes = userPolls.reduce((sum, p) => sum + (p.likes || 0), 0);
        const totalComments = userPolls.reduce((sum, p) => sum + (p.commentsCount || 0), 0);

        elements.mainPollsContainer.innerHTML = `
            <div class="analytics-placeholder">
                <h3>Your Poll Performance Overview</h3>
                <div class="analytics-section">
                    <h4>Overall Summary</h4>
                    <div class="analytics-summary">
                        <div class="summary-card"><span class="value">${totalPolls}</span><span class="label">Polls Created</span></div>
                        <div class="summary-card"><span class="value">${totalVotesReceived.toLocaleString()}</span><span class="label">Total Votes Received</span></div>
                        <div class="summary-card"><span class="value">${totalLikes.toLocaleString()}</span><span class="label">Total Likes</span></div>
                        <div class="summary-card"><span class="value">${totalComments.toLocaleString()}</span><span class="label">Total Comments</span></div>
                    </div>
                </div>
                <div class="analytics-section">
                    <h4>Votes per Poll (Your Polls)</h4>
                    <div class="chart-placeholder">
                        ${userPolls.length > 0 ? '<canvas id="analyticsChartCanvas"></canvas>' : '<p>Create some polls to see chart data!</p>'}
                    </div>
                </div>
                <div class="analytics-section">
                    <h4>Top Performing Polls (by Votes)</h4>
                    <div class="comments-list">
                        ${userPolls.length > 0 ? userPolls.sort((a,b) => (b.totalVotes || 0) - (a.totalVotes || 0)).slice(0, 3).map(p => `<p><strong>"${p.question.substring(0,50)}${p.question.length > 50 ? '...' : ''}"</strong> - ${(p.totalVotes || 0).toLocaleString()} votes</p>`).join('') : '<p>You haven\'t created any polls yet.</p>'}
                    </div>
                </div>
            </div>
        `;
        
        const chartCanvas = document.getElementById('analyticsChartCanvas');
        if (chartCanvas && userPolls.length > 0) {
            renderAnalyticsChart(chartCanvas, userPolls);
        }
    }

    function renderAnalyticsChart(canvasElement, pollsData) {
        if (state.analyticsChart) {
            state.analyticsChart.destroy(); 
        }
        const chartLabels = pollsData.map(p => p.question.substring(0, 20) + (p.question.length > 20 ? '...' : ''));
        const chartValues = pollsData.map(p => p.totalVotes || 0);

        const isDarkMode = state.theme === 'dark';
        const gridColor = isDarkMode ? 'rgba(236, 240, 241, 0.2)' : 'rgba(52, 73, 94, 0.1)';
        const labelColor = isDarkMode ? '#ecf0f1' : '#34495e';
        const barColor = isDarkMode ? 'rgba(165, 105, 189, 0.7)' : 'rgba(142, 68, 173, 0.6)'; 
        const borderColor = isDarkMode ? 'rgba(165, 105, 189, 1)' : 'rgba(142, 68, 173, 1)';


        state.analyticsChart = new Chart(canvasElement, {
            type: 'bar',
            data: {
                labels: chartLabels,
                datasets: [{
                    label: 'Total Votes',
                    data: chartValues,
                    backgroundColor: barColor, 
                    borderColor: borderColor,
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: { color: labelColor, stepSize: 1 }, // Ensure integer steps if votes are always whole numbers
                        grid: { color: gridColor }
                    },
                    x: {
                        ticks: { color: labelColor },
                        grid: { color: gridColor }
                    }
                },
                plugins: {
                    legend: {
                        display: false 
                    },
                    tooltip: {
                        callbacks: {
                            title: function(tooltipItems) {
                                const pollIndex = tooltipItems[0].dataIndex;
                                return pollsData[pollIndex].question; 
                            }
                        }
                    }
                }
            }
        });
    }


    function renderMessagesPage() {
        let chatListHtml = '<p class="no-polls-message--small" style="padding:1rem;">No chats yet.</p>';
        if (state.dummyChats.length > 0) {
            chatListHtml = state.dummyChats.map(chat => {
                const user = state.users[chat.userId];
                if (!user) return '';
                return `
                    <li class="chat-list-item ${state.selectedChatId === chat.id ? 'active' : ''}" data-chat-id="${chat.id}">
                        <img src="${user.avatar}" alt="${user.username}" class="chat-avatar">
                        <div class="chat-info">
                            <span class="chat-username">${user.username}</span>
                            <span class="chat-last-message">${chat.lastMessage}</span>
                        </div>
                        <div class="chat-meta">
                            <span class="chat-timestamp">${formatTimeAgo(new Date(chat.timestamp))}</span>
                            ${chat.unread > 0 ? `<span class="chat-unread-count">${chat.unread}</span>` : ''}
                        </div>
                    </li>`;
            }).join('');
        }

        let messageViewHtml = `
            <div class="message-view-placeholder">
                <i class="fas fa-comments"></i>
                <p>Select a chat to view messages.</p>
                <span>Or start a new conversation!</span>
            </div>`;

        if (state.selectedChatId) {
            const selectedChat = state.dummyChats.find(c => c.id === state.selectedChatId);
            const chatUser = state.users[selectedChat.userId];
            if (selectedChat && chatUser) {
                let messagesHtml = selectedChat.messages && selectedChat.messages.length > 0
                    ? selectedChat.messages.map(msg => `
                        <div class="message-item ${msg.sender === state.currentUserId ? 'sent' : 'received'}">
                            <p>${msg.text}</p>
                            <span class="msg-time">${formatTimeAgo(new Date(msg.time))}</span>
                        </div>`).join('')
                    : '<p style="text-align:center; color: var(--text-secondary); margin-top:1rem;">No messages yet in this chat.</p>';

                messageViewHtml = `
                    <div class="message-view-header">
                        <img src="${chatUser.avatar}" alt="${chatUser.username}">
                        <h3>${chatUser.username}</h3>
                    </div>
                    <div class="message-list" id="messageListContainer">
                        ${messagesHtml}
                    </div>
                    <form class="message-input-area" id="messageInputForm" data-chat-id="${selectedChat.id}">
                        <input type="text" placeholder="Type a message..." aria-label="Type a message" name="messageText" required>
                        <button type="submit"><i class="fas fa-paper-plane"></i> Send</button>
                    </form>
                `;
            }
        }

        elements.mainPollsContainer.innerHTML = `
            <div class="messages-page-layout">
                <aside class="chat-list-sidebar">
                    <div class="chat-list-header">
                        <h3>Chats</h3>
                        <button title="New Message" class="new-message-btn"><i class="fas fa-edit"></i></button>
                    </div>
                    <ul id="chatListContainer">
                        ${chatListHtml}
                    </ul>
                </aside>
                <section class="message-view-area">
                    ${messageViewHtml}
                </section>
            </div>
        `;

        const chatListItems = elements.mainPollsContainer.querySelectorAll('.chat-list-item');
        chatListItems.forEach(item => item.addEventListener('click', handleChatListItemClick));
        
        const messageInputForm = document.getElementById('messageInputForm');
        if (messageInputForm) {
            messageInputForm.addEventListener('submit', handleMessageSend);
        }
        const messageListContainer = document.getElementById('messageListContainer');
        if (messageListContainer) {
            messageListContainer.scrollTop = messageListContainer.scrollHeight;
        }
    }
    
    function handleMessageSend(event) {
        event.preventDefault();
        const form = event.target;
        const messageText = form.messageText.value.trim();
        const chatId = form.dataset.chatId;

        if (!messageText || !chatId) return;

        const messageListContainer = document.getElementById('messageListContainer');
        if (messageListContainer) {
            const messageItem = document.createElement('div');
            messageItem.classList.add('message-item', 'sent');
            messageItem.innerHTML = `
                <p>${messageText}</p>
                <span class="msg-time">${formatTimeAgo(new Date())}</span>
            `;
            const noMessagesP = messageListContainer.querySelector('p[style*="text-align:center"]');
            if (noMessagesP) noMessagesP.remove();
            
            messageListContainer.appendChild(messageItem);
            messageListContainer.scrollTop = messageListContainer.scrollHeight; 

            const chat = state.dummyChats.find(c => c.id === chatId);
            if (chat) {
                chat.lastMessage = messageText;
                chat.timestamp = new Date().toISOString(); 
                if (!chat.messages) chat.messages = [];
                chat.messages.push({ sender: state.currentUserId, text: messageText, time: new Date().toISOString() });
            }
        }
        form.reset();
        form.messageText.focus();
    }


    function handleChatListItemClick(event) {
        const listItem = event.currentTarget;
        state.selectedChatId = listItem.dataset.chatId;
        const chat = state.dummyChats.find(c => c.id === state.selectedChatId);
        if(chat) chat.unread = 0;
        renderMessagesPage();
    }


    function renderPolls(pollsToRender) {
        elements.mainPollsContainer.innerHTML = '';
        if (pollsToRender.length === 0) { // Modified empty state message logic
             let message = "No polls to display in this view.";
             if (state.currentView === 'answerPolls') message = "No new polls available for you to answer. Check back later!";
             else if (state.currentView === 'search' && elements.searchInput.value.trim()) message = `No polls found for your search term.`;
             else if (state.activeTagFilter) message = `No polls found for tag #${state.activeTagFilter}.`;
             else if (state.currentView === 'groupPage' && state.selectedGroupId) {
                const group = state.groups.find(g => g.id === state.selectedGroupId);
                message = group ? `No polls found in the "${group.name}" group yet.` : "No polls found in this group yet.";
             }
             elements.mainPollsContainer.innerHTML = `<p class="no-polls-message">${message}</p>`;
             return;
        }
        pollsToRender.forEach(poll => {
            const pollEl = createPollElement(poll);
            elements.mainPollsContainer.appendChild(pollEl);
        });
    }

    function createPollElement(poll) {
        const article = document.createElement('article');
        // MODIFIED: Removed 'live-poll' class here as the status chip is sufficient
        article.className = `poll ${poll.isTargeted ? 'targeted-poll' : ''} ${poll.isCompleted ? 'completed-poll' : ''}`;
        article.dataset.pollId = poll.id;

        const user = state.users[poll.userId] || { username: "Polly System", avatar: "https://via.placeholder.com/45/8e44ad/ffffff?text=P" };
        const timeAgo = formatTimeAgo(new Date(poll.createdAt));
        const userVote = state.userVotes[poll.id];
        const resultsShown = !!userVote || poll.isCompleted;
        const userInteraction = state.userInteractions[poll.id];
        const canVote = !userVote && !poll.isCompleted;

        let statusChip = '';
        if (poll.isCompleted) {
            statusChip = `<span class="poll-status-chip completed">Completed</span>`;
        } else if (poll.isLive && poll.isPublic) { // Check isLive and isPublic for live chip
            statusChip = `<span class="poll-status-chip live">Live</span>`;
        }
        
        let commentsHtml = '<p class="no-polls-message--small">No comments yet. Be the first!</p>';
        if (poll.comments && poll.comments.length > 0) {
            commentsHtml = poll.comments.map(comment => {
                const commenter = state.users[comment.userId] || { username: "User" }; 
                const authorName = comment.userId === state.currentUserId ? "You" : commenter.username;
                return `
                <div class="comment-item">
                    <p>${comment.text}</p>
                    <div class="comment-meta">
                        <span class="comment-author">${authorName}</span> - 
                        <span class="comment-time">${formatTimeAgo(new Date(comment.timestamp))}</span>
                    </div>
                </div>`;
            }).join('');
        }


        article.innerHTML = `
            <div class="poll-top">
                <img src="${user.avatar}" alt="${user.username}'s avatar" class="poll-author-avatar">
                <div class="poll-content">
                    <div class="poll-header">
                        <h3 class="poll-question">${poll.question}</h3>
                         ${statusChip}
                    </div>
                     <div class="poll-meta">
                        <a href="#" class="user-link">${user.username}</a>
                        <span class="time-ago">${timeAgo}</span>
                        ${resultsShown ? `<span class="total-votes">${(poll.totalVotes || 0).toLocaleString()} votes</span>` : ''}
                    </div>
                    <ul class="poll-options ${resultsShown ? 'results-shown' : ''}" data-poll-id="${poll.id}">
                        ${poll.options.map(option => createOptionElement(option, poll.id, userVote, resultsShown, canVote)).join('')}
                    </ul>
                </div>
            </div>
            <div class="poll-footer">
                <div class="poll-tags">
                     ${(poll.tags || []).map(tag => `<button class="tag poll-tag-btn ${state.activeTagFilter === tag ? 'active-tag-filter' : ''}" data-tag="${tag}">#${tag}</button>`).join(' ')}
                </div>
                 ${(!poll.isTargeted || userVote || poll.isCompleted) ? `
                    <div class="poll-actions">
                        {/* MODIFIED: Removed disabled attribute for completed polls */}
                        <button title="Like" data-action="like" class="${userInteraction === 'like' ? 'active' : ''}"> <i class="fas fa-thumbs-up"></i> <span class="action-count">${poll.likes || 0}</span> </button>
                        <button title="Dislike" data-action="dislike" class="${userInteraction === 'dislike' ? 'active' : ''}"> <i class="fas fa-thumbs-down"></i> <span class="action-count">${poll.dislikes || 0}</span> </button>
                        <button title="Comments" data-action="comment"> <i class="fas fa-comment"></i> <span class="action-count">${poll.commentsCount || 0}</span> </button>
                        <button title="Share" data-action="share"><i class="fas fa-share-alt"></i></button>
                    </div>
                 ` : '<div class="poll-actions-placeholder" style="color: var(--text-secondary); font-size: 0.85rem;">Vote to see results & actions</div>'}
            </div>
            ${poll.isPublic ? `
            <div class="comment-section" style="display: none;">
                 <h4>Comments</h4>
                 <form class="comment-input-area" data-poll-id="${poll.id}">
                    <input type="text" name="commentText" placeholder="Add a comment..." aria-label="Add comment" required>
                    <button type="submit">Post</button>
                 </form>
                 <div class="comments-list">
                    ${commentsHtml}
                 </div>
            </div>
            ` : ''}
        `;

        const optionsList = article.querySelector('.poll-options');
        if (canVote && optionsList) {
             optionsList.addEventListener('click', handleVote);
        }

         const actionsContainer = article.querySelector('.poll-actions');
         if (actionsContainer) {
             actionsContainer.addEventListener('click', handlePollActions);
         }
         
         const commentForm = article.querySelector('.comment-input-area');
         if (commentForm) {
             commentForm.addEventListener('submit', handleCommentSubmit);
         }
        const pollTagButtons = article.querySelectorAll('.poll-tag-btn');
        pollTagButtons.forEach(button => button.addEventListener('click', handleTagClick));

        return article;
    }

    function createOptionElement(option, pollId, userVote, resultsShown, canVote) {
        const isVotedOption = userVote === option.id;
        const progressWidth = resultsShown ? `style="width: ${option.percentage}%"` : 'style="width: 0%"';
        const votedClass = isVotedOption ? 'voted' : '';
        const clickableClass = canVote ? 'clickable' : '';

        return `
            <li class="poll-option ${votedClass} ${clickableClass}" data-option-id="${option.id}" role="button" tabindex="${canVote ? '0' : '-1'}">
                <span class="option-text">${option.text}</span>
                ${resultsShown ? `<span class="option-votes">(${(option.votes || 0).toLocaleString()} votes, ${option.percentage}%)</span>` : ''}
                <div class="option-progress" ${progressWidth}></div>
            </li>
        `;
     }

    function renderUserProfile() {
        const user = state.users[state.currentUserId]; if (!user) return;
        elements.userProfilePic.src = user.avatar;
        elements.userProfilePic.alt = `${user.username}'s Profile Picture`;
        elements.userProfileName.textContent = user.username;
        elements.userCreditsValue.textContent = state.userCredits.toLocaleString();
        elements.userFollowersValue.textContent = (user.followers || 0).toLocaleString();
        elements.userFollowingValue.textContent = (user.following || 0).toLocaleString();
    }
    function renderGroups() { // MODIFIED: Add active class for group page
        elements.groupList.innerHTML = '';
        state.groups.forEach(group => {
            const groupEl = document.createElement('div');
            const isActiveGroup = state.currentView === 'groupPage' && state.selectedGroupId === group.id;
            groupEl.className = `group-item ${isActiveGroup ? 'active-group-item' : ''}`; // Add active class styling if needed in CSS
            groupEl.dataset.groupId = group.id;
            const isJoined = state.joinedGroups.has(group.id);
            let iconHtml = '';
            if (group.photo) {
                iconHtml = `<img src="${group.photo}" alt="${group.name}" class="group-icon">`;
            } else if (group.icon) {
                iconHtml = `<div class="group-icon fa-icon"><i class="${group.icon}"></i></div>`;
            } else {
                iconHtml = `<div class="group-icon fa-icon"><i class="fas fa-users"></i></div>`;
            }
            groupEl.innerHTML = `
                ${iconHtml}
                <div class="group-info">
                    <span class="group-name">${group.name}</span>
                    <span class="group-members">${(group.members || 0).toLocaleString()} members</span>
                </div>
                <button class="join-group-btn ${isJoined ? 'leave' : ''}" data-group-id="${group.id}" data-action="${isJoined ? 'leave' : 'join'}">${isJoined ? 'Leave' : 'Join'}</button>
            `;
            elements.groupList.appendChild(groupEl);
        });
        // Add '.active-group-item { background-color: var(--color-primary-light); }' to CSS if desired
    }

    function renderTrendingTagsSidebar() {
        const allTags = state.originalPolls.reduce((acc, poll) => {
            (poll.tags || []).forEach(tag => { 
                acc[tag] = (acc[tag] || 0) + (poll.trendingScore || 1); 
            });
            return acc;
        }, {});

        const sortedTags = Object.entries(allTags)
            .sort(([, scoreA], [, scoreB]) => scoreB - scoreA)
            .slice(0, 7) 
            .map(([tag]) => tag);
        
        const displayTags = sortedTags.length > 0 ? sortedTags : ["tech", "design", "lifestyle", "fun", "news"];


        elements.tagsContainer.innerHTML = displayTags.map(tag =>
            `<button class="tag sidebar-tag-btn ${state.activeTagFilter === tag ? 'active-tag-filter' : ''}" data-tag="${tag}">#${tag}</button>`
        ).join('');
        
        const tagButtons = elements.tagsContainer.querySelectorAll('.sidebar-tag-btn');
        tagButtons.forEach(button => button.addEventListener('click', handleTagClick));
    }


    function renderSuggestedUsers() {
        elements.suggestedUsersList.innerHTML = '';
        const suggested = Object.entries(state.users)
            .filter(([id, user]) => parseInt(id) !== state.currentUserId && !state.followedUsers.has(id.toString()))
            .slice(0, 5); // Show up to 5
        
        if (suggested.length === 0) {
            elements.suggestedUsersList.innerHTML = '<p class="no-polls-message--small">No new suggestions.</p>';
            return;
        }
        suggested.forEach(([id, user]) => {
            const userEl = document.createElement('div');
            userEl.className = 'user-item';
            userEl.dataset.userId = id;
            userEl.innerHTML = `<img src="${user.avatar}" alt="${user.username}" class="user-pic"><span class="username">${user.username}</span><button class="follow-btn" data-user-id="${id}">Follow</button>`;
            elements.suggestedUsersList.appendChild(userEl);
        });
    }
    function renderUserActivePolls() {
        elements.userActivePollsList.innerHTML = '';
        const activeUserPolls = state.polls.filter(p => p.userId === state.currentUserId && p.isLive && !p.isCompleted).slice(0, 3);
        if (activeUserPolls.length === 0) {
            elements.userActivePollsList.innerHTML = '<p class="no-polls-message--small">No active polls.</p>'; return;
        }
        activeUserPolls.forEach(poll => {
            const pollItemEl = document.createElement('div');
            pollItemEl.className = 'poll-item';
            pollItemEl.dataset.pollId = poll.id;
            const timeLeft = poll.durationDays ? `${poll.durationDays}d left (simulated)` : 'Ongoing';
            pollItemEl.innerHTML = `<div class="poll-question">${poll.question.substring(0,35)}${poll.question.length > 35 ? '...' : ''}</div><div class="poll-stats"><span><i class="fas fa-users"></i> ${(poll.totalVotes || 0).toLocaleString()}</span><span><i class="fas fa-clock"></i> ${timeLeft}</span></div>`;
            elements.userActivePollsList.appendChild(pollItemEl);
        });
    }


    // --- Event Handlers ---
    function setupEventListeners() {
        elements.themeToggle.addEventListener('click', toggleTheme);
        elements.newPollButton.addEventListener('click', showNewPollModal);
        elements.closePollModalBtn.addEventListener('click', closeNewPollModal);
        elements.closePollModalBtn.addEventListener('keydown', (e) => { if(e.key === 'Enter' || e.key === ' ') closeNewPollModal(); }); 

        window.addEventListener('click', (e) => { if (e.target === elements.newPollModal) closeNewPollModal(); });
        elements.pollForm.addEventListener('submit', handlePollSubmit);
        elements.pollCredits.addEventListener('input', updateCreditsDisplay);
        
        elements.createGroupBtn.addEventListener('click', showCreateGroupModal);
        elements.closeGroupModalBtn.addEventListener('click', closeCreateGroupModal);
        elements.closeGroupModalBtn.addEventListener('keydown', (e) => { if(e.key === 'Enter' || e.key === ' ') closeCreateGroupModal(); });


        window.addEventListener('click', (e) => { if (e.target === elements.createGroupModal) closeCreateGroupModal(); });
        elements.groupForm.addEventListener('submit', handleCreateGroupSubmit);
        
        elements.searchButton.addEventListener('click', handleSearch);
        elements.searchInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') handleSearch(); });
        elements.searchInput.addEventListener('input', () => { 
            elements.searchClearButton.style.display = elements.searchInput.value ? 'inline-block' : 'none';
            if (!elements.searchInput.value && (state.currentView === 'search' || state.activeTagFilter || state.currentView === 'groupPage')) { 
                handleClearSearch(); // If search is cleared, revert to default feed
            }
        });
        elements.searchClearButton.addEventListener('click', handleClearSearch); 

        elements.feedSortSelect.addEventListener('change', filterAndRenderPolls);
        
        elements.navButtons.forEach(button => {
            button.addEventListener('click', handleNavClick);
        });
        elements.answerPollsButton.addEventListener('click', handleAnswerPollsClick);

        elements.groupList.addEventListener('click', handleGroupListClick); // MODIFIED: To handle group navigation and join/leave
        elements.suggestedUsersList.addEventListener('click', handleFollowAction);
    }
    
    function handleTagClick(event) {
        const clickedTag = event.currentTarget.dataset.tag;
        if (!clickedTag) return;

        elements.searchInput.value = ''; 
        elements.searchClearButton.style.display = 'none';
        state.selectedGroupId = null; // Clear selected group if any

        if (state.activeTagFilter === clickedTag) { 
            state.activeTagFilter = null;
            state.currentView = 'feed'; 
        } else {
            state.activeTagFilter = clickedTag;
            state.currentView = 'feed'; 
        }
        
        updateActiveNavButton();
        renderTrendingTagsSidebar(); 
        renderGroups(); // Re-render groups to remove active state
        filterAndRenderPolls();
    }

    function handleCommentSubmit(event) {
        event.preventDefault();
        const form = event.target;
        const pollId = parseInt(form.dataset.pollId);
        const commentText = form.commentText.value.trim();

        if (!commentText) return;

        const poll = state.polls.find(p => p.id === pollId);
        const originalPoll = state.originalPolls.find(p => p.id === pollId);

        if (poll && originalPoll) {
            const newComment = {
                userId: state.currentUserId, 
                text: commentText,
                timestamp: new Date().toISOString()
            };
            poll.comments.push(newComment);
            originalPoll.comments.push(JSON.parse(JSON.stringify(newComment))); 
            
            // Update comment counts after adding
            poll.commentsCount = poll.comments.length;
            originalPoll.commentsCount = originalPoll.comments.length;

            calculatePollMetrics(poll); 
            calculatePollMetrics(originalPoll);

            saveDataToLocalStorage();
            
            const pollElement = elements.mainPollsContainer.querySelector(`.poll[data-poll-id="${pollId}"]`);
            if (pollElement) {
                const commentSectionDiv = pollElement.querySelector('.comment-section');
                if (commentSectionDiv) {
                    let commentsHtml = poll.comments.map(comment => {
                         const commenter = state.users[comment.userId] || { username: "User" };
                         const authorName = comment.userId === state.currentUserId ? "You" : commenter.username;
                         return `
                         <div class="comment-item">
                             <p>${comment.text}</p>
                             <div class="comment-meta">
                                 <span class="comment-author">${authorName}</span> - 
                                 <span class="comment-time">${formatTimeAgo(new Date(comment.timestamp))}</span>
                             </div>
                         </div>`;
                     }).join('');
                    if (poll.comments.length === 0) {
                        commentsHtml = '<p class="no-polls-message--small">No comments yet. Be the first!</p>';
                    }
                    commentSectionDiv.querySelector('.comments-list').innerHTML = commentsHtml;
                    updatePollActionCounts(pollId, poll); 
                }
            }
            form.reset();
        }
    }


    function handleVote(event) {
        const optionElement = event.target.closest('.poll-option');
        if (!optionElement || !optionElement.classList.contains('clickable')) return;

        const pollOptionsContainer = optionElement.closest('.poll-options');
        if (!pollOptionsContainer) return;
        const pollId = parseInt(pollOptionsContainer.dataset.pollId);
        const optionId = optionElement.dataset.optionId;

        const poll = state.polls.find(p => p.id === pollId);
        const originalPoll = state.originalPolls.find(p => p.id === pollId); 
        if (!poll || !originalPoll || state.userVotes[pollId] || poll.isCompleted) return; 
        
        const option = poll.options.find(o => o.id === optionId);
        const originalOption = originalPoll.options.find(o => o.id === optionId);
        if (!option || !originalOption) return;

        option.votes = (option.votes || 0) + 1;
        originalOption.votes = (originalOption.votes || 0) + 1;
        state.userVotes[pollId] = optionId;
        
        state.userCredits += 10; 
        showCreditNotification();
        updateUserCreditsDisplay();

        calculatePollMetrics(poll); 
        calculatePollMetrics(originalPoll);

        saveDataToLocalStorage();

        const pollElement = elements.mainPollsContainer.querySelector(`.poll[data-poll-id="${pollId}"]`);
        if (pollElement) {
            const optionsContainer = pollElement.querySelector('.poll-options');
            optionsContainer.innerHTML = poll.options.map(opt => createOptionElement(opt, poll.id, optionId, true, false)).join('');
            optionsContainer.classList.add('results-shown');
            optionsContainer.removeEventListener('click', handleVote); 

            const pollMetaContainer = pollElement.querySelector('.poll-meta .total-votes');
            if(pollMetaContainer) pollMetaContainer.textContent = `${(poll.totalVotes || 0).toLocaleString()} votes`;
            else {
                const metaContainer = pollElement.querySelector('.poll-meta');
                if(metaContainer) {
                    const voteSpan = document.createElement('span');
                    voteSpan.className = 'total-votes';
                    voteSpan.textContent = ` · ${(poll.totalVotes || 0).toLocaleString()} votes`;
                    metaContainer.appendChild(voteSpan);
                }
            }
            
            if (poll.isTargeted && pollElement.querySelector('.poll-actions-placeholder')) {
                const footer = pollElement.querySelector('.poll-footer');
                const userInteraction = state.userInteractions[poll.id];
                const tagsHtml = (poll.tags || []).map(tag => `<button class="tag poll-tag-btn ${state.activeTagFilter === tag ? 'active-tag-filter' : ''}" data-tag="${tag}">#${tag}</button>`).join(' ');
                const actionsHtml = `
                   <div class="poll-actions">
                       <button title="Like" data-action="like" class="${userInteraction === 'like' ? 'active' : ''}"> <i class="fas fa-thumbs-up"></i> <span class="action-count">${poll.likes || 0}</span> </button>
                       <button title="Dislike" data-action="dislike" class="${userInteraction === 'dislike' ? 'active' : ''}"> <i class="fas fa-thumbs-down"></i> <span class="action-count">${poll.dislikes || 0}</span> </button>
                       <button title="Comments" data-action="comment"> <i class="fas fa-comment"></i> <span class="action-count">${poll.commentsCount || 0}</span> </button>
                       <button title="Share" data-action="share"><i class="fas fa-share-alt"></i></button>
                   </div>`;
                footer.innerHTML = `<div class="poll-tags">${tagsHtml}</div> ${actionsHtml}`;
                const newActionsContainer = footer.querySelector('.poll-actions');
                if (newActionsContainer) newActionsContainer.addEventListener('click', handlePollActions);
                const pollTagButtons = footer.querySelectorAll('.poll-tag-btn'); 
                pollTagButtons.forEach(button => button.addEventListener('click', handleTagClick));
            }


            if (state.currentView === 'answerPolls') {
                 pollElement.style.transition = 'opacity 0.5s ease-out, transform 0.5s ease-out';
                 pollElement.style.opacity = '0';
                 pollElement.style.transform = 'scale(0.95)';
                 setTimeout(() => {
                    pollElement.remove();
                    if (elements.mainPollsContainer.childElementCount === 0) {
                        filterAndRenderPolls(); 
                    }
                }, 500);
             }
        } else {
            filterAndRenderPolls(); 
        }
    }

    function handlePollActions(event) {
        const button = event.target.closest('button[data-action]');
        if (!button) return; // MODIFIED: Removed disabled check, handled by CSS/UI logic potentially

        const pollElement = button.closest('.poll');
        if (!pollElement) return;
        const pollId = parseInt(pollElement.dataset.pollId);
        const action = button.dataset.action;

        const poll = state.polls.find(p => p.id === pollId);
        const originalPoll = state.originalPolls.find(p => p.id === pollId);
        if (!poll || !originalPoll) return;
        
        // MODIFIED: Allow liking/disliking completed polls
        // if (poll.isCompleted && (action === 'like' || action === 'dislike')) return; 

        const currentInteraction = state.userInteractions[pollId];

        switch (action) {
            case 'like':
                if (currentInteraction === 'like') { 
                    poll.likes = Math.max(0, (poll.likes || 0) - 1);
                    state.userInteractions[pollId] = null;
                } else { 
                    poll.likes = (poll.likes || 0) + 1;
                    if (currentInteraction === 'dislike') poll.dislikes = Math.max(0, (poll.dislikes || 0) - 1);
                    state.userInteractions[pollId] = 'like';
                }
                originalPoll.likes = poll.likes; 
                originalPoll.dislikes = poll.dislikes;
                break;
            case 'dislike':
                if (currentInteraction === 'dislike') { 
                    poll.dislikes = Math.max(0, (poll.dislikes || 0) - 1);
                    state.userInteractions[pollId] = null;
                } else { 
                    poll.dislikes = (poll.dislikes || 0) + 1;
                    if (currentInteraction === 'like') poll.likes = Math.max(0, (poll.likes || 0) - 1);
                    state.userInteractions[pollId] = 'dislike';
                }
                originalPoll.likes = poll.likes;
                originalPoll.dislikes = poll.dislikes;
                break;
            case 'comment':
                const commentSection = pollElement.querySelector('.comment-section');
                if (commentSection) {
                    const isDisplayed = commentSection.style.display === 'block';
                    commentSection.style.display = isDisplayed ? 'none' : 'block';
                    if (!isDisplayed && commentSection.querySelector('input[name="commentText"]')) {
                         commentSection.querySelector('input[name="commentText"]').focus();
                    }
                }
                return; 
            case 'share':
                const pollLink = `${window.location.origin}${window.location.pathname}?pollId=${poll.id}`; 
                if (navigator.share) {
                    navigator.share({ title: 'Check out this poll on Polly!', text: poll.question, url: pollLink})
                    .then(() => console.log('Poll shared successfully'))
                    .catch((error) => console.log('Error sharing poll:', error));
                } else {
                    navigator.clipboard.writeText(pollLink)
                        .then(() => alert(`Poll link copied to clipboard: ${pollLink}`))
                        .catch(err => alert(`Could not copy link. Share manually: ${pollLink}`));
                }
                return; 
        }
        calculatePollMetrics(poll);
        calculatePollMetrics(originalPoll);
        updatePollActionCounts(pollId, poll); 
        saveDataToLocalStorage();
    }
    function handleFollowAction(event) {
        const button = event.target.closest('.follow-btn');
        if (!button) return;
        const userIdToToggle = button.dataset.userId; 
        const currentUser = state.users[state.currentUserId];
        const targetUser = state.users[userIdToToggle];

        if (state.followedUsers.has(userIdToToggle)) {
            state.followedUsers.delete(userIdToToggle);
            if(currentUser) currentUser.following = Math.max(0, (currentUser.following || 0) - 1);
            if(targetUser) targetUser.followers = Math.max(0, (targetUser.followers || 0) - 1);
        } else {
            state.followedUsers.add(userIdToToggle);
            if(currentUser) currentUser.following = (currentUser.following || 0) + 1;
            if(targetUser) targetUser.followers = (targetUser.followers || 0) + 1;
        }
        saveDataToLocalStorage();
        renderUserProfile(); 
        renderSuggestedUsers(); 
    }

    // MODIFIED: To handle group click for navigation or join/leave button
    function handleGroupListClick(event) {
        const groupItem = event.target.closest('.group-item');
        if (!groupItem) return;

        const groupId = groupItem.dataset.groupId;
        const joinButton = event.target.closest('.join-group-btn');

        if (joinButton) { // Click was on join/leave button
            const group = state.groups.find(g => g.id === groupId);
            if (!group) return;

            if (state.joinedGroups.has(groupId)) {
                state.joinedGroups.delete(groupId);
                group.members = Math.max(0, (group.members || 0) - 1);
            } else {
                state.joinedGroups.add(groupId);
                group.members = (group.members || 0) + 1;
            }
            saveDataToLocalStorage();
            renderGroups();
        } else { // Click was on the group item itself (for navigation)
            state.currentView = 'groupPage';
            state.selectedGroupId = groupId;
            state.activeTagFilter = null;
            elements.searchInput.value = '';
            elements.searchClearButton.style.display = 'none';
            
            updateActiveNavButton();
            renderGroups(); // Re-render to highlight active group
            renderTrendingTagsSidebar(); // Clear active tag
            filterAndRenderPolls();
        }
    }

    function updatePollActionCounts(pollId, poll) {
        const pollElement = elements.mainPollsContainer.querySelector(`.poll[data-poll-id="${pollId}"]`);
        if (!pollElement) return;
        const likeButtonCount = pollElement.querySelector('button[data-action="like"] .action-count');
        const dislikeButtonCount = pollElement.querySelector('button[data-action="dislike"] .action-count');
        const commentButtonCount = pollElement.querySelector('button[data-action="comment"] .action-count');
        const likeButtonElement = pollElement.querySelector('button[data-action="like"]');
        const dislikeButtonElement = pollElement.querySelector('button[data-action="dislike"]');
        if (likeButtonCount) likeButtonCount.textContent = poll.likes || 0;
        if (dislikeButtonCount) dislikeButtonCount.textContent = poll.dislikes || 0;
        if (commentButtonCount) commentButtonCount.textContent = poll.commentsCount || 0; 
        if(likeButtonElement) likeButtonElement.classList.toggle('active', state.userInteractions[pollId] === 'like');
        if(dislikeButtonElement) dislikeButtonElement.classList.toggle('active', state.userInteractions[pollId] === 'dislike');
    }

    // --- Navigation ---
    function handleNavClick(event) {
        const clickedButton = event.currentTarget; 
        const view = clickedButton.id.replace('Button', ''); 
        if (view === state.currentView && view !== 'search' && !state.activeTagFilter && !state.selectedGroupId) return; 

        state.currentView = view;
        state.activeTagFilter = null; 
        state.selectedGroupId = null; // Clear selected group when using main nav
        elements.searchInput.value = ''; 
        elements.searchClearButton.style.display = 'none';

        updateActiveNavButton();
        renderTrendingTagsSidebar(); 
        renderGroups(); // Re-render groups to remove active state
        filterAndRenderPolls(); 
    }
    function handleAnswerPollsClick() {
        if ('answerPolls' === state.currentView && !state.activeTagFilter && !elements.searchInput.value && !state.selectedGroupId) return;
        state.currentView = 'answerPolls';
        elements.searchInput.value = '';
        elements.searchClearButton.style.display = 'none';
        state.activeTagFilter = null;
        state.selectedGroupId = null;
        updateActiveNavButton();
        renderTrendingTagsSidebar();
        renderGroups();
        filterAndRenderPolls();
    }
    function handleSearch() {
        const searchTerm = elements.searchInput.value.toLowerCase().trim();
        if (!searchTerm && (state.currentView === 'search' || state.activeTagFilter || state.currentView === 'groupPage')) { 
            state.currentView = 'feed'; 
            state.activeTagFilter = null;
            state.selectedGroupId = null;
            updateActiveNavButton();
            renderTrendingTagsSidebar();
            renderGroups();
            filterAndRenderPolls();
            return;
        }
        if (!searchTerm) return; 

        state.currentView = 'search'; 
        state.activeTagFilter = null; 
        state.selectedGroupId = null;
        updateActiveNavButton();
        renderTrendingTagsSidebar();
        renderGroups();
        filterAndRenderPolls(); 
    }

    function handleClearSearch() {
        elements.searchInput.value = '';
        elements.searchClearButton.style.display = 'none';
        if (state.currentView === 'search' || state.activeTagFilter || state.currentView === 'groupPage') { 
            state.currentView = 'feed';
            state.activeTagFilter = null;
            state.selectedGroupId = null;
        }
        updateActiveNavButton();
        renderTrendingTagsSidebar();
        renderGroups();
        filterAndRenderPolls();
        elements.searchInput.focus();
    }

    // --- Modal Functions ---
    function showNewPollModal() {
        state.lastFocusedElement = document.activeElement; 
        elements.newPollModal.style.display = 'block';
        elements.pollQuestion.focus(); 
    }
    function closeNewPollModal() {
        elements.newPollModal.style.display = 'none';
        elements.pollForm.reset();
        updateCreditsDisplay();
        if (state.lastFocusedElement) state.lastFocusedElement.focus(); 
    }
    function showCreateGroupModal() {
        state.lastFocusedElement = document.activeElement;
        elements.createGroupModal.style.display = 'block';
        elements.groupName.focus();
    }
    function closeCreateGroupModal() {
        elements.createGroupModal.style.display = 'none';
        elements.groupForm.reset();
        if (state.lastFocusedElement) state.lastFocusedElement.focus();
    }

    function handleGlobalKeyDown(event) {
        if (event.key === 'Escape') {
            if (elements.newPollModal.style.display === 'block') {
                closeNewPollModal();
            }
            if (elements.createGroupModal.style.display === 'block') {
                closeCreateGroupModal();
            }
        }
    }

    function handlePollSubmit(e) {
        e.preventDefault();
        const question = elements.pollQuestion.value.trim();
        const opt1 = elements.pollOption1.value.trim();
        const opt2 = elements.pollOption2.value.trim();
        const opt3 = elements.pollOption3.value.trim();
        const opt4 = elements.pollOption4.value.trim();
        const optionsInput = [opt1, opt2, opt3, opt4].filter(opt => opt);
        const tagsText = elements.pollTags.value.trim();
        const tags = tagsText ? tagsText.split(',').map(t => t.trim().toLowerCase().replace(/^#/, '')).filter(t => t) : [];
        const credits = parseInt(elements.pollCredits.value);
        const duration = elements.pollDuration.value;

        if (question.length < 5 || optionsInput.length < 2) {
            alert("Please enter a valid question (min 5 chars) and fill at least 2 option fields."); return;
        }
        if (state.userCredits < credits) {
            alert("You don't have enough credits to spend to boost this poll."); return;
        }
        state.userCredits -= credits; 

        const newPoll = {
            id: Date.now(), userId: state.currentUserId, question: question,
            options: optionsInput.map((text, i) => ({ id: `newopt${i}_${Date.now()}`, text: text, votes: 0 })),
            tags: tags, createdAt: new Date(), isLive: duration === 'live',
            isCompleted: false, isPublic: true, isTargeted: false,
            targetGender: elements.targetGender.value, targetAge: elements.targetAge.value,
            creditsSpent: credits, durationDays: duration !== 'live' ? parseInt(duration) : null,
            likes: 0, dislikes: 0, commentsCount: 0, comments: [],
            groupId: state.currentView === 'groupPage' ? state.selectedGroupId : null // Assign groupId if creating from group page
        };
        calculatePollMetrics(newPoll); 
        state.polls.unshift(newPoll); 
        state.originalPolls.unshift(JSON.parse(JSON.stringify(newPoll))); 
        
        // If not in a specific filtered view (tag, group, search), switch to feed to show the new poll.
        // If in groupPage, it will re-render and show the poll if it belongs to that group.
        if (state.currentView !== 'feed' && state.currentView !== 'search' && !state.activeTagFilter && state.currentView !== 'groupPage') {
            state.currentView = 'feed'; 
        }
        closeNewPollModal();
        renderUI(); 
        updateActiveNavButton();
        updateUserCreditsDisplay(); 
        renderTrendingTagsSidebar(); 
        saveDataToLocalStorage();
    }
    function handleCreateGroupSubmit(e) {
        e.preventDefault();
        const name = elements.groupName.value.trim();
        const description = elements.groupDescription.value.trim();
        const icon = elements.groupIconSelect.value;
        const invitesText = elements.groupInvites.value.trim();
        const invitedUsernames = invitesText ? invitesText.split(',').map(u => u.trim()).filter(u => u) : [];
        if (!name) { alert("Group name is required."); return; }
        const newGroup = {
            id: 'g' + Date.now(), name: name, description: description,
            icon: icon || 'fas fa-users', members: 1, 
            ownerId: state.currentUserId, invited: invitedUsernames
        };
        state.groups.push(newGroup);
        state.joinedGroups.add(newGroup.id); 
        saveDataToLocalStorage();
        closeCreateGroupModal();
        renderGroups(); 
        alert(`Group "${name}" created! ${invitedUsernames.length > 0 ? 'Invitations sent (simulated).' : ''}`);
    }

    function updateCreditsDisplay() {
        const credits = elements.pollCredits.value;
        const estimatedPeople = Math.floor(credits / 2); 
        elements.creditsValue.textContent = `${credits} credits (approx. ${estimatedPeople} people)`;
    }
    function updateUserCreditsDisplay() {
        elements.userCreditsValue.textContent = state.userCredits.toLocaleString();
     }
    function showCreditNotification() {
        if (state.notificationTimeout) {
            clearTimeout(state.notificationTimeout);
            elements.creditNotification.classList.remove('show');
        }
        void elements.creditNotification.offsetWidth; 
        elements.creditNotification.textContent = `+10 Credits Earned!`;
        elements.creditNotification.classList.add('show');
        state.notificationTimeout = setTimeout(() => {
            elements.creditNotification.classList.remove('show');
            state.notificationTimeout = null;
        }, 2000); 
    }

    // --- Theme Functions ---
    function applyInitialTheme() {
        elements.htmlElement.setAttribute('data-theme', state.theme);
        updateThemeIcon(state.theme);
    }
    function toggleTheme() {
        state.theme = state.theme === 'light' ? 'dark' : 'light';
        localStorage.setItem('polly-theme', state.theme);
        elements.htmlElement.setAttribute('data-theme', state.theme);
        updateThemeIcon(state.theme);
        if (state.currentView === 'analytics' && state.analyticsChart) {
            renderAnalyticsPage(); 
        }
    }
    function updateThemeIcon(theme) {
        const icon = elements.themeToggle.querySelector('i');
        if (theme === 'dark') {
            icon.classList.remove('fa-moon'); icon.classList.add('fa-sun');
            elements.themeToggle.title = "Switch to Light Theme";
        } else {
            icon.classList.remove('fa-sun'); icon.classList.add('fa-moon');
            elements.themeToggle.title = "Switch to Dark Theme";
        }
    }

    // --- Utility Functions ---
    function formatTimeAgo(dateInput) {
        const date = (typeof dateInput === 'string') ? new Date(dateInput) : dateInput;
        if (!(date instanceof Date) || isNaN(date.valueOf())) {
            // console.warn("Invalid date provided to formatTimeAgo:", dateInput);
            return 'some time ago'; // Fallback for invalid dates
        }

        const now = new Date();
        const secondsPast = (now.getTime() - date.getTime()) / 1000;
        if (secondsPast < 5) return `just now`;
        if (secondsPast < 60) return `${Math.round(secondsPast)}s ago`;
        if (secondsPast < 3600) return `${Math.round(secondsPast / 60)}m ago`;
        if (secondsPast < 86400) return `${Math.round(secondsPast / 3600)}h ago`;
        const days = Math.round(secondsPast / 86400);
        if (days < 7) return `${days}d ago`;
        return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    }
    function updateActiveNavButton() {
        elements.navButtons.forEach(button => button.classList.remove('active-nav'));
        elements.newPollButton.classList.remove('active-header-btn');
        elements.answerPollsButton.classList.remove('active-header-btn');

        if (state.currentView === 'answerPolls') {
            elements.answerPollsButton.classList.add('active-header-btn');
        } else if (state.currentView === 'search' || state.activeTagFilter || state.currentView === 'groupPage') {
            elements.newPollButton.classList.add('active-header-btn');
            // If filtering by tag or viewing a group page, and the logical base view is 'feed', keep feed button visually active
            if ((state.activeTagFilter || state.currentView === 'groupPage') && (state.currentView === 'feed' || state.currentView === 'groupPage')) {
                const feedButton = document.getElementById('feedButton');
                if (feedButton) feedButton.classList.add('active-nav');
            }
        } else { 
            elements.newPollButton.classList.add('active-header-btn'); 
            const activeNavButton = document.getElementById(`${state.currentView}Button`);
            if (activeNavButton && elements.navButtonsContainer.contains(activeNavButton)) { 
                activeNavButton.classList.add('active-nav');
            }
        }
    }

    // --- Run Initialization ---
    init();
});