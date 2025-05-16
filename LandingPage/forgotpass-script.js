function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
} //check email format

async function handleForgotPassword(event) {
    event.preventDefault();
    //get email input and submit button
    const emailInput = document.getElementById('email');
    const submitButton = document.querySelector('button[type="submit"]');
    const email = emailInput.value.trim();
    
    //remove previous error states
    emailInput.classList.remove('error');
    document.getElementById('error-message')?.remove();
    
    //error message if email is empty or invalid
    if (!email || !validateEmail(email)) {
        showError(emailInput, 'Please enter a valid email address');
        return;
    }
    
    try {
        //when submit button is clicked, processing button is going to show
        submitButton.disabled = true; //not clickable
        submitButton.innerHTML = '<span class="spinner"></span> Processing...';
        
        const response = await sendResetRequest(email);

        showSuccessMessage();
        //clear input field after successful submission
        emailInput.value = '';
        
    } catch (error) {
        showError(emailInput, error.message || 'An error occurred. Please try again.');
    } finally {
        //enable the submit button again
        //show the original text of the submit button
        submitButton.disabled = false;
        submitButton.innerHTML = 'Reset Password';
    }
}
//add event listener to the form
const form = document.querySelector('.forgot-password-form');

//review again for sendResetRequest function
async function sendResetRequest(email) {
//need api call for send request
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (email.includes('@')) { //check if email is valid
                resolve({ success: true });
            } else {
                reject(new Error('Invalid email address'));
            }
        }, 1500);//network delay
    });
}

function showError(element, message) {
    const errorDiv = document.createElement('div');
    errorDiv.id = 'error-message';
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    
    element.classList.add('error');
    element.parentNode.appendChild(errorDiv);
}

function showSuccessMessage() {
    const container = document.querySelector('.forgot-password-container');
    //hide the form and show success message, html here para di magulo sa html file
    container.innerHTML = `
        <div class="success-message">
            <svg class="checkmark" viewBox="0 0 52 52">
                <circle class="checkmark__circle" cx="26" cy="26" r="25" fill="none"/>
                <path class="checkmark__check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
            </svg>
            <h2>Check your email</h2>
            <p>We've sent password reset instructions to your email address.</p>
            <a href="./log-in.html" class="return-login">Return to login</a>
        </div>
    `;
}
