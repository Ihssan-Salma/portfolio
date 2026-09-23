// main.js

document.addEventListener('DOMContentLoaded', () => {
    
    // --- Theme Switcher ---
    const themeToggleBtn = document.getElementById('theme-toggle');
    const body = document.body;
    
    // Check local storage for saved theme, default to dark
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        body.classList.remove('dark-theme');
        updateThemeIcon(false);
    } else {
        body.classList.add('dark-theme');
        updateThemeIcon(true);
    }
    
    themeToggleBtn.addEventListener('click', () => {
        const isDark = body.classList.contains('dark-theme');
        if (isDark) {
            body.classList.remove('dark-theme');
            localStorage.setItem('theme', 'light');
            updateThemeIcon(false);
        } else {
            body.classList.add('dark-theme');
            localStorage.setItem('theme', 'dark');
            updateThemeIcon(true);
        }
    });
    
    function updateThemeIcon(isDark) {
        if (isDark) {
            themeToggleBtn.innerHTML = "<i class='bx bx-sun'></i>";
        } else {
            themeToggleBtn.innerHTML = "<i class='bx bx-moon'></i>";
        }
    }
    
    // --- Language Switcher ---
    const langToggleBtn = document.getElementById('lang-toggle');
    
    // Check local storage for saved language, default to 'en'
    let currentLang = localStorage.getItem('language') || 'en';
    updateLanguage(currentLang);
    
    langToggleBtn.addEventListener('click', () => {
        currentLang = currentLang === 'en' ? 'fr' : 'en';
        localStorage.setItem('language', currentLang);
        updateLanguage(currentLang);
    });
    
    function updateLanguage(lang) {
        // Update button text to show the *other* language options
        langToggleBtn.textContent = lang === 'en' ? 'FR' : 'EN';
        
        // Find all elements with data-i18n attribute
        const elements = document.querySelectorAll('[data-i18n]');
        
        elements.forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (translations[lang] && translations[lang][key]) {
                // If it's an input placeholder, we handle it differently (though we don't have inputs yet)
                el.textContent = translations[lang][key];
            }
        });
    }

    // --- Navbar Scroll Effect ---
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.style.boxShadow = '0 4px 20px rgba(0,0,0,0.1)';
            navbar.style.padding = '10px 20px';
        } else {
            navbar.style.boxShadow = 'none';
            navbar.style.padding = '15px 20px';
        }
    });

    // --- Active Nav Link Update on Scroll ---
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-link');

    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (scrollY >= (sectionTop - sectionHeight / 3)) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });

    // --- Auto-scroll for All Carousels ---
    function setupAutoScroll(carouselSelector, imageSelector, intervalMs = 3000) {
        const carousels = document.querySelectorAll(carouselSelector);
        carousels.forEach(carousel => {
            let currentIndex = 0;
            const images = carousel.querySelectorAll(imageSelector);
            if (images.length <= 1) return; // Nothing to scroll

            setInterval(() => {
                currentIndex++;
                // If we reach the end, reset to the first image
                if (currentIndex >= images.length) {
                    currentIndex = 0;
                }
                
                // Get exact offset of the target image and scroll to it
                const targetImg = images[currentIndex];
                if (targetImg) {
                    carousel.scrollTo({
                        left: targetImg.offsetLeft - carousel.offsetLeft,
                        behavior: 'smooth'
                    });
                }
            }, intervalMs);
        });
    }

    setupAutoScroll('.activity-carousel', '.activity-carousel-img', 3000);
    setupAutoScroll('.project-images-carousel', '.proj-img', 3500); 
    setupAutoScroll('.exp-images-carousel', '.exp-carousel-img', 4000);

    // --- Mobile Menu Toggle ---
    const mobileBtn = document.querySelector('.mobile-menu-btn');
    const navMenu = document.getElementById('nav-menu');

    if (mobileBtn && navMenu) {
        mobileBtn.addEventListener('click', () => {
            navMenu.classList.toggle('nav-active');
            // Toggle icon between menu and x
            const icon = mobileBtn.querySelector('i');
            if (navMenu.classList.contains('nav-active')) {
                icon.classList.remove('bx-menu');
                icon.classList.add('bx-x');
            } else {
                icon.classList.remove('bx-x');
                icon.classList.add('bx-menu');
            }
        });

        // Close menu when a link is clicked
        const mobileNavLinks = navMenu.querySelectorAll('.nav-link');
        mobileNavLinks.forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('nav-active');
                const icon = mobileBtn.querySelector('i');
                icon.classList.remove('bx-x');
                icon.classList.add('bx-menu');
            });
        });
    }

});
