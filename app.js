document.addEventListener('DOMContentLoaded', () => {
  // =========================================================================
  // 1. Preloader Handler
  // =========================================================================
  const preloader = document.getElementById('preloader');
  
  // Set a backup timeout in case resource loading takes too long
  const hidePreloader = () => {
    if (preloader && !preloader.classList.contains('fade-out')) {
      preloader.classList.add('fade-out');
      // Trigger Hero text reveal animation after preloader fades
      setTimeout(initHeroReveal, 300);
    }
  }
  window.addEventListener('load', hidePreloader);
  // Backup: hide after 2.5 seconds
  setTimeout(hidePreloader, 2500);


  // =========================================================================
  // 2. Hero Text Letter-by-Letter Reveal
  // =========================================================================
  function initHeroReveal() {
    const heroTitle = document.getElementById('hero-title');
    if (!heroTitle) return;

    const text = heroTitle.textContent.trim();
    heroTitle.textContent = '';
    
    // Split text into words, then letters to preserve spacing
    const words = text.split(' ');
    words.forEach((word, wordIndex) => {
      const wordSpan = document.createElement('span');
      wordSpan.style.display = 'inline-block';
      wordSpan.style.whiteSpace = 'nowrap';
      
      const letters = word.split('');
      letters.forEach((char, charIndex) => {
        const span = document.createElement('span');
        span.textContent = char;
        span.className = 'char';
        // Stagger character animations
        span.style.animationDelay = `${(wordIndex * 3 + charIndex) * 0.05}s`;
        wordSpan.appendChild(span);
      });
      
      heroTitle.appendChild(wordSpan);
      
      // Add space between words
      if (wordIndex < words.length - 1) {
        const space = document.createTextNode(' ');
        heroTitle.appendChild(space);
      }
    });

    // Subtitle reveal
    const heroSub = document.getElementById('hero-subtitle');
    if (heroSub) {
      heroSub.style.opacity = '0';
      heroSub.style.transform = 'translateY(15px)';
      heroSub.style.transition = 'opacity 1s ease 0.8s, transform 1s ease 0.8s';
      setTimeout(() => {
        heroSub.style.opacity = '1';
        heroSub.style.transform = 'translateY(0)';
      }, 100);
    }

    // Hero Badge & Info reveal
    const heroBadge = document.getElementById('hero-badge');
    const heroMeta = document.getElementById('hero-meta');
    const heroCtas = document.getElementById('hero-ctas');
    
    const elementsToReveal = [heroBadge, heroMeta, heroCtas];
    elementsToReveal.forEach((el, index) => {
      if (el) {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = `opacity 0.8s ease ${1.0 + (index * 0.2)}s, transform 0.8s ease ${1.0 + (index * 0.2)}s`;
        setTimeout(() => {
          el.style.opacity = '1';
          el.style.transform = 'translateY(0)';
        }, 100);
      }
    });
  }


  // =========================================================================
  // 3. Canvas Neural Network / Particles Background
  // =========================================================================
  const canvas = document.getElementById('neural-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let particles = [];
    let mouse = { x: null, y: null, radius: 150 };

    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      canvas.width = parent.clientWidth;
      canvas.height = parent.clientHeight;
      initParticles();
    };

    class Particle {
      constructor(x, y) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 0.4;
        this.vy = (Math.random() - 0.5) * 0.4;
        this.radius = Math.random() * 2 + 1;
        this.color = Math.random() > 0.5 ? '#38BDF8' : '#FFD54A';
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        // Bounce back from boundaries
        if (this.x < 0 || this.x > canvas.width) this.vx = -this.vx;
        if (this.y < 0 || this.y > canvas.height) this.vy = -this.vy;

        // Mouse interaction (push away slightly)
        if (mouse.x !== null && mouse.y !== null) {
          const dx = this.x - mouse.x;
          const dy = this.y - mouse.y;
          const dist = Math.hypot(dx, dy);
          if (dist < mouse.radius) {
            const force = (mouse.radius - dist) / mouse.radius;
            this.x += (dx / dist) * force * 1.5;
            this.y += (dy / dist) * force * 1.5;
          }
        }
      }
    }

    const initParticles = () => {
      particles = [];
      const density = Math.min(65, Math.floor((canvas.width * canvas.height) / 11000));
      for (let i = 0; i < density; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        particles.push(new Particle(x, y));
      }
    };

    const drawConnections = () => {
      const maxDistance = 120;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.hypot(dx, dy);

          if (dist < maxDistance) {
            const opacity = (1 - dist / maxDistance) * 0.15;
            ctx.strokeStyle = `rgba(56, 189, 248, ${opacity})`;
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
    };

    const animateParticles = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach(p => {
        p.update();
        p.draw();
      });

      drawConnections();
      requestAnimationFrame(animateParticles);
    };

    // Track mouse coordinates on hero container
    const heroSection = document.getElementById('hero');
    if (heroSection) {
      heroSection.addEventListener('mousemove', (e) => {
        const rect = heroSection.getBoundingClientRect();
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;
      });

      heroSection.addEventListener('mouseleave', () => {
        mouse.x = null;
        mouse.y = null;
      });
    }

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    animateParticles();
  }


  // =========================================================================
  // 4. Sticky Navbar Scroll Effect
  // =========================================================================
  const navbar = document.getElementById('navbar');
  const checkNavbarScroll = () => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  };
  window.addEventListener('scroll', checkNavbarScroll);
  checkNavbarScroll();


  // =========================================================================
  // 5. Countdown Timer
  // =========================================================================
  const countdownDate = new Date('August 07, 2026 09:00:00').getTime();
  
  const dVal = document.getElementById('days');
  const hVal = document.getElementById('hours');
  const mVal = document.getElementById('minutes');
  const sVal = document.getElementById('seconds');

  const updateCountdown = () => {
    const now = new Date().getTime();
    const distance = countdownDate - now;

    if (distance < 0) {
      if (dVal) dVal.textContent = '00';
      if (hVal) hVal.textContent = '00';
      if (mVal) mVal.textContent = '00';
      if (sVal) sVal.textContent = '00';
      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    if (dVal) dVal.textContent = String(days).padStart(2, '0');
    if (hVal) hVal.textContent = String(hours).padStart(2, '0');
    if (mVal) mVal.textContent = String(minutes).padStart(2, '0');
    if (sVal) sVal.textContent = String(seconds).padStart(2, '0');
  };

  if (dVal) {
    updateCountdown();
    setInterval(updateCountdown, 1000);
  }


  // =========================================================================
  // 6. Intersection Observer (Scroll Reveal & Progress Circles)
  // =========================================================================
  const revealElements = document.querySelectorAll('.reveal');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('reveal-active');
        
        // If it's a progress card container, trigger progress bars
        if (entry.target.classList.contains('eval-card')) {
          animateProgressCircle(entry.target);
        }
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  revealElements.forEach(el => revealObserver.observe(el));

  // Circular progress animations
  function animateProgressCircle(card) {
    const progressCircle = card.querySelector('.circle-progress-bar');
    const valueEl = card.querySelector('.eval-value');
    if (!progressCircle || !valueEl) return;

    const targetProgress = parseInt(card.getAttribute('data-progress'), 10) || 0;
    
    // SVG dasharray circumference = 283
    const maxOffset = 283;
    const finalOffset = maxOffset - (maxOffset * targetProgress) / 100;
    
    // Trigger stroke fill
    progressCircle.style.strokeDashoffset = finalOffset;

    // Count up number animation
    let count = 0;
    const duration = 1200; // ms
    const stepTime = Math.max(Math.floor(duration / targetProgress), 15);
    
    const timer = setInterval(() => {
      count += 1;
      valueEl.textContent = `${count}%`;
      if (count >= targetProgress) {
        valueEl.textContent = `${targetProgress}%`;
        clearInterval(timer);
      }
    }, stepTime);
  }


  // =========================================================================
  // 7. Track Cards Mouse Glow Positioner
  // =========================================================================
  const trackCards = document.querySelectorAll('.track-card');
  trackCards.forEach(card => {
    const glow = card.querySelector('.track-card-glow');
    if (!glow) return;

    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      glow.style.left = `${x}px`;
      glow.style.top = `${y}px`;
    });
  });


  // =========================================================================
  // 8. FAQ Accordion Handler
  // =========================================================================
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const header = item.querySelector('.faq-header');
    
    header.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      
      // Close all other accordions
      faqItems.forEach(otherItem => {
        if (otherItem !== item && otherItem.classList.contains('open')) {
          otherItem.classList.remove('open');
          const otherContent = otherItem.querySelector('.faq-content');
          otherContent.style.maxHeight = null;
        }
      });

      // Toggle current accordion
      item.classList.toggle('open');
      const content = item.querySelector('.faq-content');
      if (isOpen) {
        content.style.maxHeight = null;
      } else {
        content.style.maxHeight = `${content.scrollHeight}px`;
      }
    });
  });


  // =========================================================================
  // 9. Parallax Effect (Hero Particles / Title)
  // =========================================================================
  const heroWrapper = document.getElementById('hero');
  const parallaxItems = document.querySelectorAll('.parallax-el');

  if (heroWrapper && parallaxItems.length > 0) {
    heroWrapper.addEventListener('mousemove', (e) => {
      const { width, height } = heroWrapper.getBoundingClientRect();
      const mouseX = e.clientX - width / 2;
      const mouseY = e.clientY - height / 2;

      parallaxItems.forEach(item => {
        const factor = parseFloat(item.getAttribute('data-parallax-factor')) || 0.05;
        const xOffset = mouseX * factor;
        const yOffset = mouseY * factor;
        item.style.transform = `translate3d(${xOffset}px, ${yOffset}px, 0)`;
      });
    });

    heroWrapper.addEventListener('mouseleave', () => {
      parallaxItems.forEach(item => {
        item.style.transform = 'translate3d(0, 0, 0)';
        item.style.transition = 'transform 0.5s ease';
      });
    });
  }

  // =========================================================================
  // 10. Registration Form API Handler (POST to server)
  // =========================================================================
  const regForm = document.getElementById('registration-form');
  if (regForm) {
    regForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const teamName = document.getElementById('reg-team-name').value.trim();
const teamSize = document.getElementById('reg-team-size').value;
const college = document.getElementById('reg-college').value.trim();

const member1 = document.getElementById('reg-member1').value.trim();
const phone1 = document.getElementById('reg-phone1').value.trim();
const year1 = document.getElementById('reg-year1').value;
const dept1 = document.getElementById('reg-dept1').value.trim();

const member2 = document.getElementById('reg-member2').value.trim();
const phone2 = document.getElementById('reg-phone2').value.trim();
const year2 = document.getElementById('reg-year2').value;
const dept2 = document.getElementById('reg-dept2').value.trim();

const member3 = document.getElementById('reg-member3').value.trim();
const phone3 = document.getElementById('reg-phone3').value.trim();
const year3 = document.getElementById('reg-year3').value;
const dept3 = document.getElementById('reg-dept3').value.trim();

const track = document.getElementById('reg-track').value;
    
const payload = {
    teamName,
    teamSize,
    college,

    member1,
    phone1,
    year1,
    dept1,

    member2,
    phone2,
    year2,
    dept2,

    member3,
    phone3,
    year3,
    dept3,

    track
};
      
      // Make POST call to our local PowerShell API
      fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })
      .then(response => {
        if (!response.ok) {
          throw new Error('HTTP error ' + response.status);
        }
        return response.json();
      })
      .then(data => {
    if (data.success) {
        alert("🎉 Registration Successful!");
        regForm.reset();
    } else {
        alert("Error: " + data.message);
    }
})
.catch(error => {
    console.error(error);
    alert("❌ Registration failed. Please try again.");
});
    });
  }
const teamSize = document.getElementById("reg-team-size");
const member3Section = document.getElementById("member3-section");

if (teamSize && member3Section) {
    teamSize.addEventListener("change", function () {
        if (this.value === "3") {
            member3Section.style.display = "block";
        } else {
            member3Section.style.display = "none";
        }
    });
  }
});