let currentEditingId = null;
let currentGrade = 'all';
let currentSchoolYear = localStorage.getItem('currentSchoolYear') || '2023-2024';

// Initialize data arrays
let sections = JSON.parse(localStorage.getItem(`sections_${currentSchoolYear}`)) || [];
let subjects = JSON.parse(localStorage.getItem(`subjects_${currentSchoolYear}`)) || [];
let teachers = JSON.parse(localStorage.getItem(`teachers_${currentSchoolYear}`)) || [];

// Grade Level Switch Functions
function switchGradeLevel(level) {
    currentGrade = level;
    currentGradeLevel = level;
    
    // Update tab button styling
    document.querySelectorAll('.grade-level-tabs .tab-button').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');

    // Close any open dropdowns
    document.querySelectorAll('.dropdown-content').forEach(d => {
        d.classList.remove('show');
    });

    updateSectionsTable();
}

function switchSubjectLevel(level) {
    currentGrade = level;
    currentGradeLevel = level;
    
    // Update tab button styling for specific subject view
    const buttons = document.querySelectorAll('#subjectsView .grade-level-tabs .tab-button');
    buttons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.textContent.trim().toLowerCase() === level || 
            (level === 'junior' && btn.textContent.includes('7-10')) ||
            (level === 'senior' && btn.textContent.includes('11-12'))) {
            btn.classList.add('active');
        }
    });

    // Close dropdowns
    document.querySelectorAll('.dropdown-content').forEach(d => {
        d.classList.remove('show');
    });

    updateSubjectsTable();
}

function switchManagementView(view) {
    // Update tab buttons
    document.querySelectorAll('.management-tabs .tab-button').forEach(button => {
        button.classList.remove('active');
    });
    event.currentTarget.classList.add('active');

    // Update views
    document.querySelectorAll('.management-view').forEach(view => {
        view.classList.remove('active');
    });
    document.getElementById(`${view}View`).classList.add('active');
}

// Open teacher form
function openTeacherForm() {
    document.getElementById('teacherModal').style.display = 'block';
    document.getElementById('teacherForm').reset();
}

// Close teacher form
function closeTeacherForm() {
    const modal = document.getElementById('teacherModal');
    modal.style.display = 'none';
    document.getElementById('teacherForm').reset();
    document.getElementById('teacherId').readOnly = false;
    currentEditingId = null;
    document.querySelector('#teacherModal h2').textContent = 'Add New Teacher';
}

// Save teacher
function saveTeacher(event) {
    event.preventDefault();
    
    const teacherId = document.getElementById('teacherId').value;
    const teacherName = document.getElementById('teacherName').value;
    const specialization = Array.from(document.getElementById('specialization').selectedOptions)
        .map(option => option.value);
    
    if (currentEditingId) {
        // Update existing teacher
        const index = teachers.findIndex(t => t.id === currentEditingId);
        if (index !== -1) {
            teachers[index] = {
                ...teachers[index],
                id: teacherId,
                name: teacherName,
                specialization: specialization,
            };
        }
    } else {
        // Check for duplicate ID when adding new teacher
        if (teachers.some(t => t.id === teacherId)) {
            alert('Teacher ID already exists!');
            return;
        }
        // Add new teacher
        teachers.push({
            id: teacherId,
            name: teacherName,
            specialization: specialization,
            teachingLoad: 6
        });
    }
    
    // Save and reset
    localStorage.setItem(`teachers_${currentSchoolYear}`, JSON.stringify(teachers));
    updateTeachersTable();
    closeTeacherForm();
}

// Update teachers table
function updateTeachersTable() {
    const tbody = document.querySelector('#teachersTable tbody');
    tbody.innerHTML = '';
    
    teachers.forEach(teacher => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${teacher.id}</td>
            <td>${teacher.name}</td>
            <td>${teacher.specialization.join(', ')}</td>
            <td class="action-buttons">
                <button onclick="editTeacher('${teacher.id}')" class="edit-button">
                    <span class="material-icons">edit</span>
                </button>
                <button onclick="deleteTeacher('${teacher.id}')" class="delete-button">
                    <span class="material-icons">delete</span>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });

    if (teachers.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="empty-state">
                    No Teachers found
                </td>
            </tr>
        `;
    }
}

// Edit teacher
function editTeacher(teacherId) {
    const teacher = teachers.find(t => t.id === teacherId);
    if (!teacher) return;

    currentEditingId = teacherId;
    
    // Populate form with teacher data
    document.getElementById('teacherId').value = teacher.id;
    document.getElementById('teacherId').readOnly = true; // Prevent ID editing
    document.getElementById('teacherName').value = teacher.name;
    
    // Set specializations
    const specializationSelect = document.getElementById('specialization');
    Array.from(specializationSelect.options).forEach(option => {
        option.selected = teacher.specialization.includes(option.value);
    });
    
    // Change modal title and open
    document.querySelector('#teacherModal h2').textContent = 'Edit Teacher';
    document.getElementById('teacherModal').style.display = 'block';
}

// Delete teacher
function deleteTeacher(teacherId) {
    const teacher = teachers.find(t => t.id === teacherId);
    
    if (confirm(`Are you sure you want to delete teacher ${teacher.name}?`)) {
        teachers = teachers.filter(t => t.id !== teacherId);
        localStorage.setItem(`teachers_${currentSchoolYear}`, JSON.stringify(teachers));
        updateTeachersTable();
    }
}

// Section Management Functions
function openSectionForm() {
    const modal = document.getElementById('sectionModal');
    const adviserSelect = document.getElementById('adviser');
    
    // Populate adviser dropdown with available teachers
    adviserSelect.innerHTML = '<option value="">Select Adviser</option>' +
        teachers.map(teacher => 
            `<option value="${teacher.id}">${teacher.name}</option>`
        ).join('');
    
    modal.style.display = 'block';
}

function closeSectionForm() {
    document.getElementById('sectionModal').style.display = 'none';
    document.getElementById('sectionForm').reset();
}

function saveSection(event) {
    event.preventDefault();
    
    const sectionId = document.getElementById('sectionId').value;
    const sectionName = document.getElementById('sectionName').value;
    const gradeLevel = document.getElementById('gradeLevel').value;
    const adviserId = document.getElementById('adviser').value;
    const adviser = teachers.find(t => t.id === adviserId);
    
    if (currentEditingId) {
        // Update existing section
        const index = sections.findIndex(s => s.id === currentEditingId);
        if (index !== -1) {
            sections[index] = {
                ...sections[index],
                id: sectionId,
                name: sectionName,
                gradeLevel: parseInt(gradeLevel),
                adviserId: adviserId,
                adviserName: adviser.name
            };
        }
    } else {
        // Check for duplicate ID when adding new section
        if (sections.some(s => s.id === sectionId)) {
            showCustomAlert('Section ID already exists!');
            return;
        }
        
        // Add new section
        sections.push({
            id: sectionId,
            name: sectionName,
            gradeLevel: parseInt(gradeLevel),
            adviserId: adviserId,
            adviserName: adviser.name
        });
    }
    
    // Save and reset
    localStorage.setItem(`sections_${currentSchoolYear}`, JSON.stringify(sections));
    updateSectionsTable();
    closeSectionForm();
    
    // Show success message
    showCustomAlert(currentEditingId ? 'Section updated successfully!' : 'Section added successfully!');
    
    // Reset editing state
    currentEditingId = null;
}

function updateSectionsTable() {
    const tbody = document.querySelector('#sectionsTable tbody');
    const filteredSections = sections.filter(section => {
        if (currentGrade === 'all') return true;
        
        const grade = parseInt(section.gradeLevel);
        if (currentGrade === 'junior') {
            return grade >= 7 && grade <= 10;
        } else if (currentGrade === 'senior') {
            return grade >= 11 && grade <= 12;
        } else {
            return grade === parseInt(currentGrade);
        }
    });
    
    tbody.innerHTML = filteredSections.map(section => `
        <tr>
            <td>${section.id}</td>
            <td>${section.name}</td>
            <td>Grade ${section.gradeLevel}</td>
            <td>${section.adviserName}</td>
            <td class="action-buttons">
                <button onclick="editSection('${section.id}')" class="edit-button">
                    <span class="material-icons">edit</span>
                </button>
                <button onclick="deleteSection('${section.id}')" class="delete-button">
                    <span class="material-icons">delete</span>
                </button>
            </td>
        </tr>
    `).join('');

    if (filteredSections.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="empty-state">
                    No Sections found for the selected grade level
                </td>
            </tr>
        `;
    }
}

function editSection(sectionId) {
    const section = sections.find(s => s.id === sectionId);
    if (!section) return;

    currentEditingId = sectionId;
    
    // Populate form with section data
    document.getElementById('sectionId').value = section.id;
    document.getElementById('sectionId').readOnly = true;
    document.getElementById('sectionName').value = section.name;
    document.getElementById('gradeLevel').value = section.gradeLevel;
    
    // Populate adviser dropdown
    const adviserSelect = document.getElementById('adviser');
    adviserSelect.innerHTML = '<option value="">Select Adviser</option>' +
        teachers.map(teacher => 
            `<option value="${teacher.id}" ${teacher.id === section.adviserId ? 'selected' : ''}>
                ${teacher.name}
            </option>`
        ).join('');
    
    // Change modal title and open
    document.querySelector('#sectionModal h2').textContent = 'Edit Section';
    document.getElementById('sectionModal').style.display = 'block';
}

function deleteSection(sectionId) {
    const section = sections.find(s => s.id === sectionId);
    
    if (confirm(`Are you sure you want to delete section ${section.name}?`)) {
        sections = sections.filter(s => s.id !== sectionId);
        localStorage.setItem(`sections_${currentSchoolYear}`, JSON.stringify(sections));
        updateSectionsTable();
        
        // Show success message
        showCustomAlert(`Section ${section.name} has been deleted successfully.`);
    }
}

// Subject Management Functions
function openSubjectForm() {
    document.getElementById('subjectModal').style.display = 'block';
    const semesterSelect = document.getElementById('semester');
    const gradeLevelSelect = document.getElementById('subjectGradeLevel');
    
    // Show/hide semester field based on grade level
    gradeLevelSelect.addEventListener('change', function() {
        const grade = parseInt(this.value);
        semesterSelect.disabled = grade < 11;
        if (grade < 11) {
            semesterSelect.value = ''; // Reset semester if not senior high
        }
    });
}

function closeSubjectForm() {
    document.getElementById('subjectModal').style.display = 'none';
    document.getElementById('subjectForm').reset();
}

function saveSubject(event) {
    event.preventDefault();
    
    const subjectId = document.getElementById('subjectId').value;
    const subjectName = document.getElementById('subjectName').value;
    const gradeLevel = document.getElementById('subjectGradeLevel').value;
    const semester = document.getElementById('semester').value;
    
    if (currentEditingId) {
        // Update existing subject
        const index = subjects.findIndex(s => s.id === currentEditingId);
        if (index !== -1) {
            subjects[index] = {
                ...subjects[index],
                id: subjectId,
                name: subjectName,
                gradeLevel: parseInt(gradeLevel),
                semester: semester || null
            };
        }
    } else {
        // Check for duplicate ID when adding new subject
        if (subjects.some(s => s.id === subjectId)) {
            alert('Subject ID already exists!');
            return;
        }
        
        // Add new subject
        subjects.push({
            id: subjectId,
            name: subjectName,
            gradeLevel: parseInt(gradeLevel),
            semester: semester || null
        });
    }
    
    // Save and reset
    localStorage.setItem(`subjects_${currentSchoolYear}`, JSON.stringify(subjects));
    updateSubjectsTable();
    closeSubjectForm();
}

function updateSubjectsTable() {
    const tbody = document.querySelector('#subjectsTable tbody');
    const filteredSubjects = subjects.filter(subject => {
        if (currentGrade === 'all') return true;
        
        const grade = parseInt(subject.gradeLevel);
        if (currentGrade === 'junior') {
            return grade >= 7 && grade <= 10;
        } else if (currentGrade === 'senior') {
            return grade >= 11 && grade <= 12;
        } else {
            return grade === parseInt(currentGrade);
        }
    });
    
    // Sort subjects by grade level and then by name
    filteredSubjects.sort((a, b) => {
        if (a.gradeLevel === b.gradeLevel) {
            return a.name.localeCompare(b.name);
        }
        return a.gradeLevel - b.gradeLevel;
    });
    
    tbody.innerHTML = filteredSubjects.map(subject => `
        <tr>
            <td>${subject.id}</td>
            <td>${subject.name}</td>
            <td>Grade ${subject.gradeLevel}</td>
            <td>${subject.semester ? `Semester ${subject.semester}` : 'N/A'}</td>
            <td class="action-buttons">
                <button onclick="editSubject('${subject.id}')" class="edit-button">
                    <span class="material-icons">edit</span>
                </button>
                <button onclick="deleteSubject('${subject.id}')" class="delete-button">
                    <span class="material-icons">delete</span>
                </button>
            </td>
        </tr>
    `).join('');
    
    // Update empty state
    if (filteredSubjects.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="empty-state">
                    No Subjects found for the selected grade level
                </td>
            </tr>
        `;
    }
}

function editSubject(subjectId) {
    const subject = subjects.find(s => s.id === subjectId);
    if (!subject) return;

    currentEditingId = subjectId;
    
    // Populate form with subject data
    document.getElementById('subjectId').value = subject.id;
    document.getElementById('subjectId').readOnly = true;
    document.getElementById('subjectName').value = subject.name;
    document.getElementById('subjectGradeLevel').value = subject.gradeLevel;
    document.getElementById('semester').value = subject.semester || '';
    
    // Update semester field state based on grade level
    const grade = parseInt(subject.gradeLevel);
    document.getElementById('semester').disabled = grade < 11;
    
    // Change modal title and open
    document.querySelector('#subjectModal h2').textContent = 'Edit Subject';
    document.getElementById('subjectModal').style.display = 'block';
}

function deleteSubject(subjectId) {
    const subject = subjects.find(s => s.id === subjectId);
    
    if (confirm(`Are you sure you want to delete subject ${subject.name}?`)) {
        subjects = subjects.filter(s => s.id !== subjectId);
        localStorage.setItem(`subjects_${currentSchoolYear}`, JSON.stringify(subjects));
        updateSubjectsTable();
    }
}

function filterSubjectByGrade(grade) {
    currentGrade = grade;
    
    // Update active states
    document.querySelectorAll('#subjectsView .tab-button').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.closest('.dropdown').querySelector('.tab-button').classList.add('active');
    
    // Close dropdown
    document.querySelectorAll('.dropdown-content').forEach(d => {
        d.classList.remove('show');
    });
    
    updateSubjectsTable();
}

function toggleDropdown(type) {
    const dropdown = document.getElementById(`${type}Dropdown`);
    const allDropdowns = document.querySelectorAll('.dropdown-content');
    
    // Close other dropdowns
    allDropdowns.forEach(d => {
        if (d.id !== `${type}Dropdown`) {
            d.classList.remove('show');
        }
    });
    
    dropdown.classList.toggle('show');
    
    // Close dropdown when clicking outside
    document.addEventListener('click', function closeDropdown(e) {
        if (!e.target.closest('.dropdown')) {
            dropdown.classList.remove('show');
            document.removeEventListener('click', closeDropdown);
        }
    });
}

function filterByGrade(grade) {
    currentGrade = grade;
    
    // Update active states
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.closest('.dropdown').querySelector('.tab-button').classList.add('active');
    
    // Close dropdown
    document.querySelectorAll('.dropdown-content').forEach(d => {
        d.classList.remove('show');
    });
    
    // Update tables based on current view
    if (document.getElementById('sectionsView').classList.contains('active')) {
        updateSectionsTable();
    } else if (document.getElementById('subjectsView').classList.contains('active')) {
        updateSubjectsTable();
    }
}

function updateEndYear() {
    const startYear = parseInt(document.getElementById('startYear').value);
    const endYear = startYear + 1;
    document.getElementById('endYear').value = endYear;
}

function saveSchoolYear() {
    const startYear = document.getElementById('startYear').value;
    const endYear = document.getElementById('endYear').value;
    const schoolYear = `${startYear}-${endYear}`;
    
    if (currentSchoolYear === schoolYear) return;
    
    if (confirm('Changing school year will load different data. Continue?')) {
        currentSchoolYear = schoolYear;
        localStorage.setItem('currentSchoolYear', schoolYear);
        
        // Load data for selected school year
        teachers = JSON.parse(localStorage.getItem(`teachers_${schoolYear}`)) || [];
        sections = JSON.parse(localStorage.getItem(`sections_${schoolYear}`)) || [];
        subjects = JSON.parse(localStorage.getItem(`subjects_${schoolYear}`)) || [];
        
        // Update all tables
        updateTeachersTable();
        updateSectionsTable();
        updateSubjectsTable();
    }
}

// Initialize tables
document.addEventListener('DOMContentLoaded', () => {
    // Set initial state to 'all'
    currentGrade = 'all';
    currentGradeLevel = 'all';
    
    // Set initial school year values
    const [startYear] = currentSchoolYear.split('-');
    document.getElementById('startYear').value = startYear;
    updateEndYear();
    
    // Load data for current school year
    teachers = JSON.parse(localStorage.getItem(`teachers_${currentSchoolYear}`)) || [];
    sections = JSON.parse(localStorage.getItem(`sections_${currentSchoolYear}`)) || [];
    subjects = JSON.parse(localStorage.getItem(`subjects_${currentSchoolYear}`)) || [];
    
    // Update tables with all records
    updateTeachersTable();
    updateSectionsTable();
    updateSubjectsTable();
    
    // Set 'All' button as active
    document.querySelector('.grade-level-tabs .tab-button').classList.add('active');
    
    // Close modal when clicking outside
    window.onclick = function(event) {
        const modal = document.getElementById('teacherModal');
        if (event.target === modal) {
            closeTeacherForm();
        }
    };
});

function toggleMenu() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    sidebar.classList.toggle('active');
    overlay.classList.toggle('active');
    
    // Prevent body scrolling when sidebar is open
    document.body.style.overflow = sidebar.classList.contains('active') ? 'hidden' : '';
}

// Close sidebar when pressing Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && document.getElementById('sidebar').classList.contains('active')) {
        toggleMenu();
    }
});

function showCustomAlert(message) {
    const alertBox = document.createElement('div');
    alertBox.className = 'custom-alert';
    alertBox.textContent = message;
    document.body.appendChild(alertBox);
    
    setTimeout(() => {
        alertBox.remove();
    }, 3000);
}