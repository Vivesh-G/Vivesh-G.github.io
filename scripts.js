document.addEventListener('DOMContentLoaded', function() {
    // Navigation functionality
    const navButtons = document.querySelectorAll('.nav-button');
    const sectionTitle = document.getElementById('section-title');
    const sectionContents = document.querySelectorAll('.section-content');
    
    // Add click event to each navigation button
    navButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons and sections
            navButtons.forEach(btn => btn.classList.remove('active'));
            sectionContents.forEach(section => section.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Get the section to show
            const sectionId = this.getAttribute('data-section');
            const sectionToShow = document.getElementById(`${sectionId}-content`);
            
            // Update section title
            sectionTitle.textContent = this.textContent;
            
            // Show the selected section
            if (sectionToShow) {
                sectionToShow.classList.add('active');
                
                // Apply typewriter effect
                const typewriterSections = {
                    'about': '.typewriter-text',
                    'projects': '.project-description',
                    'experience': '.experience-description'
                };

                if (typewriterSections[sectionId]) {
                    const elements = sectionToShow.querySelectorAll(typewriterSections[sectionId]);
                    elements.forEach(desc => {
                        applyTypewriterEffect(desc);
                    });
                }
            }
        });
    });
    
    // Typewriter effect function
    function applyTypewriterEffect(element) {
        const text = element.textContent;
        element.textContent = '';
        element.style.borderRight = '0.15em solid #4ade80';
        
        let i = 0;
        const speed = 10; // typing speed in milliseconds
        
        function typeWriter() {
            if (i < text.length) {
                element.textContent += text.charAt(i);
                i++;
                setTimeout(typeWriter, speed);
            } else {
                element.style.borderRight = 'none';
            }
        }
        
        typeWriter();
    }
    
    // Add parallax mouse movement effect
    const container = document.querySelector('.container');
    const header = document.querySelector('.header');
    const terminal = document.querySelector('.terminal');
    
    document.addEventListener('mousemove', function(e) {
        if (window.innerWidth > 768) { // Only on desktop
            const mouseX = e.clientX / window.innerWidth - 0.5;
            const mouseY = e.clientY / window.innerHeight - 0.5;
            
            // Subtle rotation for header elements
            if (header) {
                header.style.transform = `rotateY(${mouseX * 5}deg) rotateX(${-mouseY * 5}deg)`;
            }
            
            // Subtle movement for terminal
            if (terminal) {
                terminal.style.transform = `translateX(${mouseX * 10}px) translateY(${mouseY * 10}px)`;
            }
        }
    });
    
    // Initialize the page with the About section
    document.querySelector('.nav-button[data-section="about"]').click();
    
    // Add parallax effect to footer
    const footer = document.querySelector('.footer-content');
    if (footer) {
        document.addEventListener('mousemove', function(e) {
            if (window.innerWidth > 768) { // Only on desktop
                const mouseX = e.clientX / window.innerWidth - 0.5;
                const mouseY = e.clientY / window.innerHeight - 0.5;
                
                footer.style.transform = `translateZ(20px) rotateY(${mouseX * 3}deg) rotateX(${-mouseY * 3}deg)`;
            }
        });
    }
});