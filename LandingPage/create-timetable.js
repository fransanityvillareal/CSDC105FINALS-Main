//Store current state of the timetable
let currentCell = null;
let hasUnsavedChanges = false;

//Main data structure for timetable
let timetableData = {
    title: '',
    sections: 0,
    startTime: '',
    endTime: '',
    timeInterval: 0,
    cells: [],
    gradeLevel: null,
    days: [],
    timeSlots: [],
    sectionTimeSlots: {} // New field to store section-specific time slots
};

let currentSchoolYear = localStorage.getItem('currentSchoolYear') || '2023-2024';
let availableSections = [];
let timetables = JSON.parse(localStorage.getItem(`timetables_${currentSchoolYear}`)) || [];

// Global variables
let currentEditingTimeSlot = null;
let currentEditingSectionId = '';
let timeSlotIdCounter = 0;

// Function to format time for display
function formatTime(date) {
    return date.toTimeString().substring(0, 5);
}

// Function to get all subjects from localStorage
function getAllSubjects() {
    return JSON.parse(localStorage.getItem(`subjects_${currentSchoolYear}`)) || [];
}

// Function to get all teachers from localStorage
function getAllTeachers() {
    return JSON.parse(localStorage.getItem(`teachers_${currentSchoolYear}`)) || [];
}

function loadSections() {
    // Get sections from localStorage
    const sections = JSON.parse(localStorage.getItem(`sections_${currentSchoolYear}`)) || [];
    return sections;
}

function updateSectionsList() {
    const gradeLevel = document.getElementById('gradeLevel').value;
    const sectionsContainer = document.getElementById('sectionsContainer');
    
    // Load sections from base table management
    const sections = JSON.parse(localStorage.getItem(`sections_${currentSchoolYear}`)) || [];
    availableSections = sections.filter(section => 
        parseInt(section.gradeLevel) === parseInt(gradeLevel)
    ).sort((a, b) => a.name.localeCompare(b.name));
    
    // Check for existing timetable
    const existingTimetable = timetables.find(t => 
        t.gradeLevel === parseInt(gradeLevel) && 
        t.schoolYear === currentSchoolYear
    );
    
    if (existingTimetable) {
        // Load existing timetable
        document.getElementById('startTime').value = existingTimetable.startTime;
        document.getElementById('endTime').value = existingTimetable.endTime;
        document.getElementById('timeInterval').value = existingTimetable.timeInterval;
        
        // Generate timetable with existing data
        generateTimetable(existingTimetable);
        
        // Update UI state
        document.querySelector('.create-button').textContent = 'Update Timetable';
        document.querySelector('.save-button').disabled = true;
    } else {
        // Reset form for new timetable
        document.getElementById('startTime').value = '08:00';
        document.getElementById('endTime').value = '17:00';
        document.getElementById('timeInterval').value = '60';
        document.querySelector('.create-button').textContent = 'Create Timetable';
        document.getElementById('timetableContainer').style.display = 'none';
    }
    
    // Display sections list
    if (availableSections.length > 0) {
        sectionsContainer.innerHTML = availableSections.map(section => `
            <div class="section-item">
                <div class="section-info">
                    <span>${section.name}</span>
                    <small>Adviser: ${section.adviserName}</small>
                </div>
                <div class="section-status">
                    ${existingTimetable?.sections.includes(section.id) 
                        ? '<span class="status-badge included">Added to Timetable</span>'
                        : '<span class="status-badge new">New Section</span>'
                    }
                </div>
            </div>
        `).join('');
    } else {
        sectionsContainer.innerHTML = `
            <div class="empty-state">
                No sections found for Grade ${gradeLevel}. 
                Please add sections in Base Table Management.
            </div>
        `;
    }
}

//Ensures grade level is between 7-12
function validateGradeLevel(input) {
    const value = parseInt(input.value);
    if (value < 7) {
        input.value = 7;
    } else if (value > 12) {
        input.value = 12;
    }
    
    hasUnsavedChanges = true;
    timetableData.gradeLevel = input.value;
    updateSectionsList();
}

//Makes section names editable in the header
function editSectionName(element) {
    const currentText = element.textContent.trim();
    const input = document.createElement('input');
    input.type = 'text';
    input.value = currentText;
    input.className = 'section-input';
    
    input.onblur = () => {
        element.innerHTML = `
            ${input.value}
            <svg class="edit-icon" width="12" height="12" viewBox="0 0 24 24">
                <path d="M16 3l5 5L8 21H3v-5L16 3z" fill="none" stroke="currentColor" stroke-width="2"/>
            </svg>`; //svg icon for saving changes
        hasUnsavedChanges = true;
        document.querySelector('.save-button').disabled = false;
    };
    
    input.onkeydown = (e) => { //accepts for enter key in keyboard
        if (e.key === 'Enter') {
            input.blur();
        }
    };
    
    element.textContent = '';
    element.appendChild(input);
    input.focus();
}

//Starts the timetable creation process
function generateTimetable(existingTimetable = null) {
    const gradeLevel = parseInt(document.getElementById('gradeLevel').value);
    
    if (availableSections.length === 0) {
        showCustomAlert('Please add sections in Base Table Management first.');
        return;
    }
    
    // Create initial time slot if none exist
    if (!timetableData.timeSlots || timetableData.timeSlots.length === 0) {
        const startTime = document.getElementById('startTime').value;
        const endTime = document.getElementById('endTime').value;
        
        // Add a default time slot based on start time and end time
        timetableData.timeSlots = [{
            id: 'timeslot_0',
            start: startTime,
            end: endTime,
            isDefault: true
        }];
    }
    
    // Sort time slots by start time
    timetableData.timeSlots.sort((a, b) => {
        const aDate = new Date(`2000/01/01 ${a.start}`);
        const bDate = new Date(`2000/01/01 ${b.start}`);
        return aDate - bDate;
    });
    
    // Create header row with section names for daily view
    const thead = document.getElementById('timetable-header');
    thead.innerHTML = `
        <tr>
            <th>Time <button class="add-time-btn" onclick="addNewTimeRow()">+</button></th>
            ${availableSections.map(section => 
                `<th>${section.name}</th>`
            ).join('')}
        </tr>
    `;
    
    // Get selected day for daily view
    const selectedDays = Array.from(document.querySelectorAll('#dailyView input[name="schoolDays"]:checked'))
        .map(checkbox => checkbox.value);
    
    // Default to Monday if no day is selected
    const currentDay = selectedDays.length > 0 ? selectedDays[0] : 'Monday';
    
    // Create time slot rows for daily view
    const tbody = document.getElementById('timetable-body');
    tbody.innerHTML = timetableData.timeSlots.map((timeSlot, index) => `
        <tr>
            <td class="time-cell" onclick="editTimeSlot('${timeSlot.id}')">
                <div class="time-slot-display">
                    <span>${timeSlot.start} - ${timeSlot.end}</span>
                    <div class="time-actions">
                        <button type="button" class="time-edit-btn" title="Edit this time slot">
                            <span class="material-icons">edit</span>
                        </button>
                        ${index > 0 ? `
                        <button type="button" class="time-delete-btn" 
                                onclick="event.stopPropagation(); deleteTimeRow('${timeSlot.id}')" 
                                title="Delete this time slot">
                            <span class="material-icons">delete</span>
                        </button>
                        ` : ''}
                    </div>
                </div>
            </td>
            ${availableSections.map(section => {
                const cellData = existingTimetable?.cells?.find(cell => 
                    cell.sectionId === section.id && 
                    cell.timeSlot === timeSlot.id &&
                    (cell.day === currentDay || !cell.day)
                ) || timetableData.cells?.find(cell => 
                    cell.sectionId === section.id && 
                    cell.timeSlot === timeSlot.id &&
                    (cell.day === currentDay || !cell.day)
                );
                
                const cellContent = cellData ? JSON.stringify(cellData.content) : '';
                const cellClass = cellContent ? 'schedule-cell filled' : 'schedule-cell';
                
                return `
                    <td class="${cellClass}" 
                        onclick="openEditDialog(this)" 
                        data-section="${section.id}" 
                        data-day="${currentDay}"
                        data-time="${timeSlot.id}"
                        ${cellContent ? `data-content='${cellContent}'` : ''}>
                        ${cellContent ? formatCellContent(JSON.parse(cellContent)) : ''}
                    </td>
                `;
            }).join('')}
        </tr>
    `).join('');

    // Show timetable container
    document.getElementById('timetableContainer').style.display = 'block';
}

function formatCellContent(content) {
    if (content.isCustom) {
        return `
            <div class="cell-content custom-content">
                <div class="subject">${content.customSubject}</div>
            </div>
        `;
    } else {
        return `
            <div class="cell-content">
                <div class="subject">${content.subject}</div>
                <div class="teacher">${content.teacher}</div>
                <div class="room">${content.room}</div>
            </div>
        `;
    }
}

//Creates array of time slots for the timetable
function generateTimeSlots(start, end, interval) {
    const timeSlots = [];
    let currentTime = new Date(`2000/01/01 ${start}`);
    const endTime = new Date(`2000/01/01 ${end}`);
    
    while (currentTime < endTime) {
        timeSlots.push(formatTime(currentTime));
        currentTime.setMinutes(currentTime.getMinutes() + interval);
    }
    
    return timeSlots;
}

//Formats time to 12-hour format with better readability
function formatTime(date) {
    return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit', 
        hour12: true 
    });
}

//Opens dialog for editing cell contents
let currentEditingCell = null;

// Update the open edit dialog function to work in both views
function openEditDialog(cell) {
    currentEditingCell = cell;
    const dialog = document.getElementById('editCellDialog');
    const subjectSelect = document.getElementById('subjectSelect');
    const teacherSelect = document.getElementById('teacherSelect');
    const roomInput = document.getElementById('roomInput');
    const customSubject = document.getElementById('customSubject');
    const customToggle = document.getElementById('customToggle');
    const deleteBtn = dialog.querySelector('.delete-btn');
    
    // Show/hide delete button based on existing content
    deleteBtn.style.display = cell.dataset.content ? 'block' : 'none';
    
    // Load subjects for current grade level
    const gradeLevel = document.getElementById('gradeLevel').value;
    const subjects = JSON.parse(localStorage.getItem(`subjects_${currentSchoolYear}`)) || [];
    const gradeSubjects = subjects.filter(s => s.gradeLevel === parseInt(gradeLevel));
    
    subjectSelect.innerHTML = '<option value="">Select Subject</option>' +
        gradeSubjects.map(subject => 
            `<option value="${subject.id}">${subject.name}</option>`
        ).join('');
    
    // Load all teachers
    const teachers = JSON.parse(localStorage.getItem(`teachers_${currentSchoolYear}`)) || [];
    teacherSelect.innerHTML = '<option value="">Select Teacher</option>' +
        teachers.map(teacher => 
            `<option value="${teacher.id}">${teacher.name}</option>`
        ).join('');
    
    // Reset inputs
    customToggle.checked = false;
    toggleCustomInput();
    customSubject.value = '';
    
    // Load existing data if any
    if (cell.dataset.content) {
        const content = JSON.parse(cell.dataset.content);
        
        if (content.isCustom) {
            // This is a custom entry
            customToggle.checked = true;
            toggleCustomInput();
            customSubject.value = content.customSubject || '';
        } else {
            // This is a standard entry
            subjectSelect.value = content.subjectId || '';
            teacherSelect.value = content.teacherId || '';
            roomInput.value = content.room || '';
        }
    } else {
        subjectSelect.value = '';
        teacherSelect.value = '';
        roomInput.value = '';
    }
    
    dialog.style.display = 'flex';
}

function closeEditDialog() {
    document.getElementById('editCellDialog').style.display = 'none';
    currentEditingCell = null;
}

// Enhanced saveCellData function to handle days
function saveCellData() {
    const isCustom = document.getElementById('customToggle').checked;
    let cellContent;
    
    if (isCustom) {
        // Custom input mode
        const customSubject = document.getElementById('customSubject').value.trim();
        
        if (!customSubject) {
            showCustomAlert('Please enter a custom subject or activity');
            return;
        }
        
        cellContent = {
            isCustom: true,
            customSubject: customSubject
        };
    } else {
        // Standard input mode
        const subjectSelect = document.getElementById('subjectSelect');
        const teacherSelect = document.getElementById('teacherSelect');
        const roomInput = document.getElementById('roomInput');
        
        if (!subjectSelect.value || !teacherSelect.value || !roomInput.value.trim()) {
            showCustomAlert('Please fill in all fields');
            return;
        }
        
        // Get selected subject and teacher names
        const subjects = getAllSubjects();
        const teachers = getAllTeachers();
        
        const subject = subjects.find(s => s.id === subjectSelect.value);
        const teacher = teachers.find(t => t.id === teacherSelect.value);
        
        if (!subject || !teacher) {
            showCustomAlert('Subject or teacher not found');
            return;
        }
        
        cellContent = {
            isCustom: false,
            subjectId: subjectSelect.value,
            subject: subject.name,
            teacherId: teacherSelect.value,
            teacher: teacher.name,
            room: roomInput.value.trim()
        };
    }
    
    // Update cell in DOM
    currentEditingCell.dataset.content = JSON.stringify(cellContent);
    currentEditingCell.innerHTML = formatCellContent(cellContent);
    currentEditingCell.classList.add('filled');
    
    // Update timetable data
    const sectionId = currentEditingCell.dataset.section;
    const timeSlot = currentEditingCell.dataset.time;
    const day = currentEditingCell.dataset.day;
    
    // Find if cell already exists in data
    const existingCellIndex = timetableData.cells.findIndex(cell => 
        cell.sectionId === sectionId && 
        cell.timeSlot === timeSlot && 
        cell.day === day
    );
    
    if (existingCellIndex >= 0) {
        // Update existing cell
        timetableData.cells[existingCellIndex].content = cellContent;
    } else {
        // Add new cell
        timetableData.cells.push({
            sectionId,
            timeSlot,
            day,
            content: cellContent
        });
    }
    
    // Enable save button
    document.querySelector('.save-button').disabled = false;
    hasUnsavedChanges = true;
    
    closeEditDialog();
}

//Deletes cell data
function deleteCellData() {
    if (confirm('Are you sure you want to delete this schedule?')) {
        // Remove cell content
        currentEditingCell.dataset.content = '';
        currentEditingCell.innerHTML = '';
        currentEditingCell.classList.remove('filled');
        
        // Enable save button for timetable changes
        document.querySelector('.save-button').disabled = false;
        hasUnsavedChanges = true;
        
        closeEditDialog();
        showCustomAlert('Schedule deleted successfully');
    }
}

//Closes the cell edit dialog
function closeDialog() {
    const dialog = document.getElementById('editDialog');
    dialog.style.display = 'none';
    currentCell = null;
}

//Validates time interval input (30-120 minutes)
function validateTimeInterval(input) {
    if (input.value < 30 || input.value > 120) {
        showCustomAlert('Please enter a value between 30 and 120 minutes');
        input.value = 60; // Reset to default
    }
}

//Handles back button click with save prompt
function handleBackButton(event) {
    event.preventDefault();
    showSavePrompt();
}

//Shows save confirmation dialog
function showSavePrompt(callback) {
    const confirmDialog = document.createElement('div');
    confirmDialog.className = 'confirm-dialog';
    confirmDialog.innerHTML = `
        <div class="dialog-content">
            <h3>Save Changes?</h3>
            <p>Do you want to save your changes before leaving?</p>
            <div class="dialog-buttons">
                <button onclick="handleSaveAndExit()">Save & Exit</button>
                <button onclick="handleDontSave()">Don't Save</button>
                <button onclick="closeConfirmDialog()">Cancel</button>
            </div>
        </div>
    `;
    document.body.appendChild(confirmDialog);
    if (callback) callback();
}

//Closes confirmation dialog
function closeConfirmDialog() {
    const dialog = document.querySelector('.confirm-dialog');
    if (dialog) {
        dialog.remove();
    }
}

//Saves and returns to dashboard
function handleSaveAndExit() {
    saveTimetable();
    closeConfirmDialog();
    window.location.href = './dashboard.html';
}

//Returns to dashboard without saving
function handleDontSave() {
    closeConfirmDialog();
    window.location.href = './dashboard.html';
}

//Saves timetable to localStorage for testing
function saveTimetable(timetableData) {
    
    // Create a timetable for each selected day
    selectedDays.forEach(day => {
        const timetable = {
            id: Date.now().toString() + '_' + day.toLowerCase(),
            schoolYear: currentSchoolYear,
            gradeLevel: parseInt(document.getElementById('gradeLevel').value),
            startTime: document.getElementById('startTime').value,
            endTime: document.getElementById('endTime').value,
            timeInterval: parseInt(document.getElementById('timeInterval').value),
            day: day,
            sections: availableSections.map(s => s.id),
            cells: [], // Will be populated with cell data
            createdAt: new Date().toISOString()
        };
        
        timetables.push(timetable);
    });
    
    localStorage.setItem(`timetables_${currentSchoolYear}`, JSON.stringify(timetables));
    updateTimetableList();
}

function deleteTimetable(timetableId) {
    if (confirm('Are you sure you want to delete this timetable?')) {
        timetables = timetables.filter(t => t.id !== timetableId);
        localStorage.setItem(`timetables_${currentSchoolYear}`, JSON.stringify(timetables));
        updateTimetableList();
    }
}

//Handles changes to timetable title
function handleTitleChange() {
    const titleInput = document.getElementById('timetableTitle');
    const value = titleInput.value.trim();
    
    if (value === '') {
        titleInput.value = 'New Timetable';
        return;
    }
    
    hasUnsavedChanges = true;
    timetableData.title = value;
}

//Toggles saved timetables dropdown
function toggleTimetableList() {
    const timetableList = document.getElementById('timetableList');
    timetableList.classList.toggle('show');
    updateTimetableList();
}

function updateTimetableList() {
    const timetableList = document.getElementById('timetableList');
    const emptyTimetables = document.getElementById('emptyTimetables');
    
    if (timetables.length === 0) {
        emptyTimetables.style.display = 'flex';
        return;
    }
    
    emptyTimetables.style.display = 'none';
    
    // First group by school year, then by grade level
    const groupedByYear = timetables.reduce((yearAcc, timetable) => {
        const year = timetable.schoolYear;
        if (!yearAcc[year]) yearAcc[year] = [];
        yearAcc[year].push(timetable);
        return yearAcc;
    }, {});
    
    // Sort school years in descending order
    const sortedYears = Object.keys(groupedByYear).sort().reverse();
    
    timetableList.innerHTML = sortedYears.map(schoolYear => {
        // Group timetables by grade level within each school year
        const gradeTimetables = groupedByYear[schoolYear].reduce((gradeAcc, timetable) => {
            const key = `Grade ${timetable.gradeLevel}`;
            if (!gradeAcc[key]) gradeAcc[key] = [];
            gradeAcc[key].push(timetable);
            return gradeAcc;
        }, {});
        
        // Sort grades numerically
        const sortedGrades = Object.keys(gradeTimetables).sort((a, b) => {
            return parseInt(a.replace('Grade ', '')) - parseInt(b.replace('Grade ', ''));
        });
        
        return `
            <div class="school-year-group">
                <h2 class="year-header">School Year ${schoolYear}</h2>
                ${sortedGrades.map(grade => `
                    <div class="grade-group">
                        <h3>${grade}</h3>
                        ${gradeTimetables[grade].map(timetable => `
                            <div class="timetable-item">
                                <div class="timetable-info">
                                    <span class="timetable-name">${timetable.day}</span>
                                    <small>${timetable.sections.length} sections</small>
                                </div>
                                <div class="timetable-actions">
                                    <button onclick="loadTimetable('${timetable.id}')" class="load-button">
                                        <span class="material-icons">edit</span>
                                    </button>
                                    <button onclick="deleteTimetable('${timetable.id}')" class="delete-button">
                                        <span class="material-icons">delete</span>
                                    </button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                `).join('')}
            </div>
        `;
    }).join('');
}

//Displays list of saved timetables
function displayTimetables(timetables) {
    const dropdown = document.getElementById('timetableList');
    
    if (timetables.length === 0) {
        dropdown.innerHTML = `
            <div class="timetable-item">
                <div class="timetable-info">
                    <span class="timetable-name">No timetables found</span>
                </div>
            </div>
        `;
        return;
    }
    
    dropdown.innerHTML = timetables.map(timetable => `
        <div class="timetable-item" onclick="loadTimetable('${timetable.title}')">
            <div class="timetable-info">
                <span class="timetable-name">${timetable.title}</span>
                <span class="timetable-date">Created: ${new Date().toLocaleDateString()}</span>
            </div>
        </div>
    `).join('');
}

//Navbar scroll effect
let lastScroll = 0;
const navbar = document.querySelector('.navTop');

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    //Add/remove scrolled class based on scroll position
    if (currentScroll > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
    
    lastScroll = currentScroll;
});

function toggleMenu() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    sidebar.classList.toggle('active');
    overlay.classList.toggle('active');
    
    // Prevent body scrolling when sidebar is open
    document.body.style.overflow = sidebar.classList.contains('active') ? 'hidden' : '';
}

// Update the input handlers
function updateTimeSettings(event) {
    if (event.type === 'change' || (event.type === 'keyup' && event.key === 'Enter')) {
        const startTime = document.getElementById('startTime').value;
        const endTime = document.getElementById('endTime').value;
        const timeInterval = parseInt(document.getElementById('timeInterval').value);

        // Validate inputs
        if (!startTime || !endTime || !timeInterval) return;
        if (timeInterval < 30 || timeInterval > 120) {
            showCustomAlert('Time interval must be between 30 and 120 minutes');
            return;
        }

        // Update timetable data
        timetableData.startTime = startTime;
        timetableData.endTime = endTime;
        timetableData.timeInterval = timeInterval;

        // Enable save button
        document.querySelector('.save-button').disabled = false;
        hasUnsavedChanges = true;

        // Regenerate timetable if it exists
        if (document.getElementById('timetableContainer').style.display === 'block') {
            generateTimetable();
        }
    }
}

// Update the HTML input elements to add event listeners
function initializeTimeInputs() {
    const timeInputs = ['startTime', 'endTime', 'timeInterval'];
    timeInputs.forEach(id => {
        const input = document.getElementById(id);
        input.addEventListener('change', updateTimeSettings);
        input.addEventListener('keyup', updateTimeSettings);
    });
}

// Update the save changes functionality
function saveTimetableChanges() {
    if (!hasUnsavedChanges) return;

    const timetableContent = [];
    const cells = document.querySelectorAll('.schedule-cell');
    cells.forEach(cell => {
        if (cell.dataset.content) {
            timetableContent.push({
                sectionId: cell.dataset.section,
                timeSlot: cell.dataset.time,
                content: JSON.parse(cell.dataset.content)
            });
        }
    });

    const updatedTimetable = {
        ...timetableData,
        cells: timetableContent,
        lastModified: new Date().toISOString()
    };

    // Save to localStorage
    saveTimetable(updatedTimetable);
    
    // Reset state
    hasUnsavedChanges = false;
    document.querySelector('.save-button').disabled = true;
    showCustomAlert('Changes saved successfully!');
}

// Tab switching functionality
function switchTimetableTab(tabName) {
    // Hide all tab contents
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Deactivate all tab buttons
    const tabButtons = document.querySelectorAll('.tab-button');
    tabButtons.forEach(button => {
        button.classList.remove('active');
    });
    
    // Show selected tab content and activate button
    document.getElementById(`${tabName}View`).classList.add('active');
    document.getElementById(`${tabName}TabBtn`).classList.add('active');
    
    // Generate the view for the selected tab
    switch(tabName) {
        case 'daily':
            // Daily view is the default, already generated
            break;
        case 'weekly':
            generateWeeklyView();
            break;
    }
}

// Weekly view generation with custom subject support
function generateWeeklyView() {
    const weeklySelect = document.getElementById('weeklyViewSelect');
    const header = document.getElementById('weekly-header');
    const body = document.getElementById('weekly-body');
    
    // Populate section dropdown if empty
    if (weeklySelect.childElementCount <= 1) {
        availableSections.forEach(section => {
            const option = document.createElement('option');
            option.value = section.id;
            option.textContent = section.name;
            weeklySelect.appendChild(option);
        });
    }
    
    const selectedSectionId = weeklySelect.value;
    if (!selectedSectionId) {
        body.innerHTML = `<tr><td colspan="6" class="empty-state">Please select a section to view the weekly schedule.</td></tr>`;
        return;
    }
    
    // Initialize section time slots if needed
    initializeSectionTimeSlots();
    
    // Get the selected section's time slots or fall back to global
    const timeSlots = timetableData.sectionTimeSlots[selectedSectionId] || timetableData.timeSlots;
    
    if (!timeSlots || timeSlots.length === 0) {
        body.innerHTML = `<tr><td colspan="6" class="empty-state">No time slots defined. Please add time slots first.</td></tr>`;
        return;
    }
    
    // Sort time slots by start time
    const sortedTimeSlots = [...timeSlots].sort((a, b) => {
        const aDate = new Date(`2000/01/01 ${a.start}`);
        const bDate = new Date(`2000/01/01 ${b.start}`);
        return aDate - bDate;
    });
    
    // Generate the weekly timetable header
    const hasCustomTimeSlots = timetableData.sectionTimeSlots[selectedSectionId] && timetableData.sectionTimeSlots[selectedSectionId].length > 0;
    
    // Add a reset button if using custom time slots
    const resetButton = hasCustomTimeSlots ? 
        `<button class="reset-timeslots-btn" onclick="resetSectionTimeSlots('${selectedSectionId}')" title="Reset to global time slots">
            <span class="material-icons">restart_alt</span>
        </button>` : '';
    
    // Add this to UI where appropriate
    const viewControls = document.querySelector('#weeklyView .view-controls');
    const resetButtonContainer = document.createElement('div');
    resetButtonContainer.className = 'reset-button-container';
    resetButtonContainer.innerHTML = resetButton;
    
    // Only append if we have custom time slots
    if (hasCustomTimeSlots) {
        viewControls.appendChild(resetButtonContainer);
    }
    
    header.innerHTML = `
        <tr>
            <th>
                Time 
                <button class="add-time-btn" onclick="addNewTimeRow('${selectedSectionId}')">+</button>
                ${hasCustomTimeSlots ? 
                    `<span class="custom-time-badge" title="This section has custom time slots">Custom</span>` : 
                    `<span class="global-time-badge" title="This section uses global time slots">Global</span>`
                }
            </th>
            <th>Monday</th>
            <th>Tuesday</th>
            <th>Wednesday</th>
            <th>Thursday</th>
            <th>Friday</th>
        </tr>
    `;
    
    // Generate the weekly timetable body
    body.innerHTML = sortedTimeSlots.map(timeSlot => {
        return `
            <tr>
                <td class="time-cell" onclick="editTimeSlot('${timeSlot.id}', '${selectedSectionId}')">
                    <div class="time-slot-display">
                        <span>${timeSlot.start} - ${timeSlot.end}</span>
                        <div class="time-actions">
                            <button type="button" class="time-edit-btn" title="Edit this time slot">
                                <span class="material-icons">edit</span>
                            </button>
                            <button type="button" class="time-delete-btn" 
                                    onclick="event.stopPropagation(); deleteTimeRow('${timeSlot.id}', '${selectedSectionId}')" 
                                    title="Delete this time slot">
                                <span class="material-icons">delete</span>
                            </button>
                        </div>
                    </div>
                </td>
                ${['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map(day => {
                    const cell = getCellForSectionTimeDay(selectedSectionId, timeSlot.id, day);
                    const cellClass = cell ? 'schedule-cell filled' : 'schedule-cell';
                    
                    return `
                        <td class="${cellClass}" 
                            onclick="openEditDialog(this)" 
                            data-section="${selectedSectionId}" 
                            data-time="${timeSlot.id}"
                            data-day="${day}"
                            ${cell ? `data-content='${JSON.stringify(cell.content)}'` : ''}>
                            ${cell ? formatCellContent(cell.content) : ''}
                        </td>
                    `;
                }).join('')}
            </tr>
        `;
    }).join('');
}

// Update addNewTimeRow to support section-specific time slots
function addNewTimeRow(sectionId = '') {
    // Get the target time slots array
    const targetTimeSlots = sectionId ? 
        (timetableData.sectionTimeSlots[sectionId] || []) : 
        timetableData.timeSlots;
    
    // Calculate a sensible default time for a new row
    let startTime = "08:00";
    let endTime = "09:00";
    
    if (targetTimeSlots.length > 0) {
        // Get the last time slot
        const lastSlot = targetTimeSlots[targetTimeSlots.length - 1];
        
        // Calculate a new time slot that starts when the last one ends
        startTime = lastSlot.end;
        
        // End time is 1 hour after start
        const startDate = new Date(`2000/01/01 ${startTime}`);
        startDate.setHours(startDate.getHours() + 1);
        endTime = formatTime(startDate);
    }
    
    // Create a new time slot
    const newTimeSlot = {
        id: `timeslot_${Date.now()}`,
        start: startTime,
        end: endTime
    };
    
    // Add to the appropriate time slots array
    if (sectionId) {
        if (!timetableData.sectionTimeSlots[sectionId]) {
            timetableData.sectionTimeSlots[sectionId] = [];
        }
        timetableData.sectionTimeSlots[sectionId].push(newTimeSlot);
    } else {
        timetableData.timeSlots.push(newTimeSlot);
    }
    
    // Regenerate the appropriate view
    if (document.getElementById('dailyView').classList.contains('active')) {
        generateTimetable();
    } else if (document.getElementById('weeklyView').classList.contains('active')) {
        generateWeeklyView();
    }
    
    // Enable save button
    document.querySelector('.save-button').disabled = false;
    hasUnsavedChanges = true;
}

// Update editTimeSlot to handle section-specific slots
function editTimeSlot(timeSlotId, sectionId = '') {
    // Store the current section ID for later use when saving
    currentEditingSectionId = sectionId;
    
    // Get the target time slots array
    const targetTimeSlots = sectionId ? 
        (timetableData.sectionTimeSlots[sectionId] || []) : 
        timetableData.timeSlots;
    
    const timeSlot = targetTimeSlots.find(slot => slot.id === timeSlotId);
    if (!timeSlot) return;
    
    document.getElementById('timeSlotDialogTitle').textContent = sectionId ? 
        `Edit Time Slot for ${getSection(sectionId)?.name || 'Section'}` : 
        'Edit Time Slot for All Sections';
    
    document.getElementById('timeSlotStart').value = timeSlot.start;
    document.getElementById('timeSlotEnd').value = timeSlot.end;
    
    // Store reference to current editing time slot
    currentEditingTimeSlot = timeSlot;
    
    // Display the time slot dialog
    document.getElementById('timeSlotDialog').style.display = 'flex';
}

// Helper function to get section by ID
function getSection(sectionId) {
    return availableSections.find(section => section.id === sectionId);
}

// Update deleteTimeRow to handle section-specific slots
function deleteTimeRow(timeSlotId, sectionId = '') {
    // Confirm before deleting
    if (!confirm('Are you sure you want to delete this time slot? This will remove all schedules set for this time.')) {
        return;
    }
    
    // Get the target time slots array
    let targetTimeSlots;
    if (sectionId) {
        targetTimeSlots = timetableData.sectionTimeSlots[sectionId];
        if (!targetTimeSlots) return;
    } else {
        targetTimeSlots = timetableData.timeSlots;
    }
    
    // Find the index of the time slot
    const index = targetTimeSlots.findIndex(slot => slot.id === timeSlotId);
    if (index === -1) return;
    
    // Remove the time slot
    targetTimeSlots.splice(index, 1);
    
    // Remove all cells associated with this time slot
    timetableData.cells = timetableData.cells.filter(cell => {
        if (sectionId) {
            return !(cell.timeSlot === timeSlotId && cell.sectionId === sectionId);
        } else {
            return cell.timeSlot !== timeSlotId;
        }
    });
    
    // Regenerate the appropriate view
    if (document.getElementById('dailyView').classList.contains('active')) {
        generateTimetable();
    } else if (document.getElementById('weeklyView').classList.contains('active')) {
        generateWeeklyView();
    }
    
    // Enable save button
    document.querySelector('.save-button').disabled = false;
    hasUnsavedChanges = true;
}

// Save time slot (new or edited)
function saveTimeSlot() {
    const startTime = document.getElementById('timeSlotStart').value;
    const endTime = document.getElementById('timeSlotEnd').value;
    
    if (!startTime || !endTime) {
        showCustomAlert('Please enter both start and end times');
        return;
    }
    
    // Validate that end time is after start time
    const startDate = new Date(`2000/01/01 ${startTime}`);
    const endDate = new Date(`2000/01/01 ${endTime}`);
    
    if (endDate <= startDate) {
        showCustomAlert('End time must be after start time');
        return;
    }
    
    // Get the correct time slots array based on stored section ID
    let targetTimeSlots = currentEditingSectionId ? 
        timetableData.sectionTimeSlots[currentEditingSectionId] : 
        timetableData.timeSlots;
    
    if (!targetTimeSlots) {
        // Initialize if not exists
        if (currentEditingSectionId) {
            timetableData.sectionTimeSlots[currentEditingSectionId] = [];
            targetTimeSlots = timetableData.sectionTimeSlots[currentEditingSectionId];
        } else {
            timetableData.timeSlots = [];
            targetTimeSlots = timetableData.timeSlots;
        }
    }
    
    // Check for overlapping time slots in the target array
    const isOverlapping = targetTimeSlots.some(slot => {
        // Skip checking against the slot being edited
        if (currentEditingTimeSlot && slot.id === currentEditingTimeSlot.id) {
            return false;
        }
        
        const slotStart = new Date(`2000/01/01 ${slot.start}`);
        const slotEnd = new Date(`2000/01/01 ${slot.end}`);
        
        // Check if new time slot overlaps with existing one
        return (startDate < slotEnd && endDate > slotStart);
    });
    
    if (isOverlapping) {
        showCustomAlert('This time slot overlaps with an existing one');
        return;
    }
    
    if (currentEditingTimeSlot) {
        // Update existing time slot
        currentEditingTimeSlot.start = startTime;
        currentEditingTimeSlot.end = endTime;
    } else {
        // Create new time slot
        const newSlot = {
            id: `timeslot_${timeSlotIdCounter++}`,
            start: startTime,
            end: endTime
        };
        targetTimeSlots.push(newSlot);
    }
    
    // Close dialog
    closeTimeSlotDialog();
    
    // Regenerate the timetable to update the UI
    if (document.getElementById('dailyView').classList.contains('active')) {
        generateTimetable();
    } else if (document.getElementById('weeklyView').classList.contains('active')) {
        generateWeeklyView();
    }
    
    // Enable save button since we've made changes
    document.querySelector('.save-button').disabled = false;
    hasUnsavedChanges = true;
}

// Close time slot dialog
function closeTimeSlotDialog() {
    document.getElementById('timeSlotDialog').style.display = 'none';
    currentEditingTimeSlot = null;
    currentEditingSectionId = '';
}

// Add this function to reset a section's time slots to use global ones
function resetSectionTimeSlots(sectionId) {
    if (confirm('Are you sure you want to reset this section to use global time slots? All custom schedules for this section will be lost.')) {
        // Delete section-specific time slots
        delete timetableData.sectionTimeSlots[sectionId];
        
        // Remove cells associated with this section's custom time slots
        timetableData.cells = timetableData.cells.filter(cell => 
            !(cell.sectionId === sectionId && cell.timeSlot.startsWith('timeslot_'))
        );
        
        // Regenerate weekly view
        generateWeeklyView();
        
        // Enable save button
        document.querySelector('.save-button').disabled = false;
        hasUnsavedChanges = true;
        
        showCustomAlert('Section reset to global time slots successfully.');
    }
}