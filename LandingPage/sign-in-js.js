document.addEventListener('DOMContentLoaded', () => {
    const termsModal = document.getElementById('termsModal');
    const privacyModal = document.getElementById('privacyModal');
  
    //Open modals with animation
    document.querySelector('a[href="#terms"]').addEventListener('click', (e) => {
      e.preventDefault();
      termsModal.style.display = 'flex';
      //Trigger reflow
      termsModal.offsetHeight;
      termsModal.classList.add('show');
    });
  
    document.querySelector('a[href="#privacy"]').addEventListener('click', (e) => {
      e.preventDefault();
      privacyModal.style.display = 'flex';
      //Trigger reflow
      privacyModal.offsetHeight;
      privacyModal.classList.add('show');
    });
  
    //Close modals with animation
    function closeModal(modal) {
      modal.classList.remove('show');
      setTimeout(() => {
        modal.style.display = 'none';
      }, 300); //Match transition duration
    }
  
    //Close on X button click
    document.querySelectorAll('.close-modal').forEach(closeBtn => {
      closeBtn.addEventListener('click', () => {
        const modal = closeBtn.closest('.modal');
        closeModal(modal);
      });
    });
  
    //Close on outside click
    window.addEventListener('click', (e) => {
      if (e.target.classList.contains('modal')) {
        closeModal(e.target);
      }
    });
  
    //Close on ESC key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        document.querySelectorAll('.modal.show').forEach(modal => {
          closeModal(modal);
        });
      }
    });
  });