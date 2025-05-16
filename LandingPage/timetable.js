// Save As dropdown
function toggleMenu() {
    const menu = document.getElementById('saveMenu');
    menu.classList.toggle('show');
    
    // Update arrow direction
    const menuIcon = document.querySelector('.menu-icon');
    menuIcon.style.transform = menu.classList.contains('show') ? 'rotate(180deg)' : '';
    
    // Close menu when clicking outside
    document.addEventListener('click', function closeMenu(e) {
        if (!e.target.closest('.geninfo-menu')) {
            menu.classList.remove('show');
            menuIcon.style.transform = '';
            document.removeEventListener('click', closeMenu);
        }
    });
}

function saveAsPDF() {
    // Lagay how to save pdf
    console.log('Saving as PDF...');
}

function saveAsExcel() {
    // Lagay how to save Excel, timetable lang ang export or use a library like SheetJS to convert the timetable to Excel format
    console.log('Saving as Excel...');
}

function saveAsImage() {
    // Lagay how to save Image, ket screenshot lang ang export
    // or use html2canvas library to convert the timetable to an image
    console.log('Saving as Image...');
}