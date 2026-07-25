import React, { useState, useEffect, useRef } from 'react';
import './App.css';

export default function App() {
  const [isBottomInView, setIsBottomInView] = useState(false);
  const bottomScreenRef = useRef(null);
  const canvasRef = useRef(null);

  // --- Particle Canvas Effect ---
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    let particles = [];
    let particleCount = window.innerWidth < 768 ? 150 : 650;
    let speedMultiplier = window.innerWidth < 768 ? 0.6 : 1.5;
    let mouse = { x: null, y: null };
    let animationFrameId;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', resizeCanvas);
    const handleMouseMove = (e) => { mouse.x = e.clientX; mouse.y = e.clientY; };
    const handleMouseOut = () => { mouse.x = null; mouse.y = null; };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseout', handleMouseOut);
    resizeCanvas();

    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 1.8 + 0.5;
        this.baseSpeedX = (Math.random() - 0.5) * 3;
        this.baseSpeedY = (Math.random() - 0.5) * 3;
        this.color = Math.random() > 0.6 ? '#0ff' : '#b026ff';
      }

      update() {
        this.x += this.baseSpeedX * speedMultiplier;
        this.y += this.baseSpeedY * speedMultiplier;
        if (this.x < 0 || this.x > canvas.width) this.baseSpeedX *= -1;
        if (this.y < 0 || this.y > canvas.height) this.baseSpeedY *= -1;

        if (mouse.x && mouse.y) {
          let dx = mouse.x - this.x;
          let dy = mouse.y - this.y;
          let distance = Math.sqrt(dx * dx + dy * dy);
          let interactionRadius = window.innerWidth < 768 ? 120 : 180;
          if (distance < interactionRadius) {
            this.x -= dx / 15;
            this.y -= dy / 15;
          }
        }
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
      }
    }

    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    const animate = () => {
      if (!isBottomInView) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (let i = 0; i < particles.length; i++) {
          particles[i].update();
          particles[i].draw();
          for (let j = i; j < particles.length; j++) {
            let dx = particles[i].x - particles[j].x;
            let dy = particles[i].y - particles[j].y;
            let distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < 150) {
              ctx.beginPath();
              let opacity = 1 - (distance / 140);
              ctx.strokeStyle = particles[i].color === '#b026ff' 
                ? `rgba(176, 38, 255, ${opacity * 0.5})` 
                : `rgba(0, 255, 255, ${opacity * 0.5})`;
              ctx.lineWidth = 0.6;
              ctx.moveTo(particles[i].x, particles[i].y);
              ctx.lineTo(particles[j].x, particles[j].y);
              ctx.stroke();
            }
          }
        }
      }
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseout', handleMouseOut);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isBottomInView]);

  // --- Scroll Observer for Main Screen & Animations ---
  useEffect(() => {
    // 1. Observer for bottom-screen visibility (pauses canvas & shows return button)
    const bottomObserver = new IntersectionObserver(
      ([entry]) => {
        setIsBottomInView(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    if (bottomScreenRef.current) {
      bottomObserver.observe(bottomScreenRef.current);
    }

    // 2. Observer for stagger/scroll reveal animations (.scroll-anim elements)
    const revealElements = document.querySelectorAll('.scroll-anim');
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
        }
      });
    }, { threshold: 0.05, rootMargin: "0px 0px 50px 0px" });

    revealElements.forEach(el => revealObserver.observe(el));

    return () => {
      bottomObserver.disconnect();
      revealObserver.disconnect();
    };
  }, []);

  const scrollToBottom = () => {
    bottomScreenRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="app-container">
      {/* Canvas for Dense Particle Network */}
      <canvas ref={canvasRef} id="particle-canvas"></canvas>

      {/* Top Corner Logos */}
      <div className="corner-logo left">
        Department of <br /> Computer Application
      </div>
      
      <div className="corner-logo right">
        <img src={import.meta.env.BASE_URL + '/college_logo.jpeg'} alt="College Logo" className="college-logo-img" />
      </div>

      {/* Sticky Return To Top Button */}
      <button 
        id="return-top-btn" 
        className={`cyber-button ${isBottomInView ? 'show-btn' : ''}`} 
        onClick={scrollToTop}
      >
        Return to Top
      </button>

      {/* UI Overlay */}
      <section id="main-screen">
        <div className="glass-panel">
          
          {/* Left-Aligned Background Image (Wall-E) */}
          <img src="/1000054284.png" alt="Wall-E Hologram" className="bg-wall-e" />

          <h1 className="glitch" data-text="ALGORA">ALGORA</h1>
          
          {/* Central Panel Logo */}
          <div className="panel-logo-space">
            PANEL<br />LOGO
          </div>

          <p className="subtitle">🚨 REGISTRATION IS OPEN NOW</p>
          
          {/* Twin Oval Buttons */}
          <div className="button-group">
            <button 
              className="cyber-button" 
              id="register-now1"
              disabled={isBottomInView}
              style={{ opacity: isBottomInView ? 0.4 : 1, pointerEvents: isBottomInView ? 'none' : 'auto' }}
            >
              REGISTER NOW
            </button>
            <button 
              className="cyber-button" 
              id="learn-more-btn"
              onClick={scrollToBottom}
              disabled={isBottomInView}
              style={{ opacity: isBottomInView ? 0.4 : 1, pointerEvents: isBottomInView ? 'none' : 'auto' }}
            >
              Learn More ...
            </button>
          </div>
        </div>
        
        {/* Scroll Indicator */}
        <div className="scroll-indicator">Scroll Down ↓</div>
      </section>
      
      {/* BOTTOM SCREEN */}
      <section ref={bottomScreenRef} id="bottom-screen">
        <div className="events-container">

          {/* ABOUT Section */}
          <h2 className="section-title highlight-title scroll-anim" style={{ '--delay': '0.05s' }}>ABOUT ALGORA 2026</h2>
          
          <div className="about-box scroll-anim" style={{ '--delay': '0.1s' }}>
            <p>
              ALGORA 2026 marks the inaugural techno-cultural fest of the Department of Computer Applications.
              Created to support innovation, creativity, and collaboration, ALGORA provides a vibrant
              platform where students can showcase their technical expertise, creative talents, and problem-solving abilities through engaging competitions and
              interactive experiences. As the department's first-ever fest, ALGORA represents the beginning of a new tradition—one that inspires learning, teamwork, and excellence.
            </p>
          </div>

          {/* Stats Grid */}
          <div className="stats-wrapper">
            <div className="stat-card scroll-anim" style={{ '--delay': '0.12s' }}>
              <h4>500+</h4>
              <p>Participants</p>
            </div>
            <div className="stat-card scroll-anim" style={{ '--delay': '0.14s' }}>
              <h4>70+</h4>
              <p>Events</p>
            </div>
            <div className="stat-card scroll-anim" style={{ '--delay': '0.16s' }}>
              <h4>35+</h4>
              <p>Games</p>
            </div>
            <div className="stat-card scroll-anim" style={{ '--delay': '0.18s' }}>
              <h4>₹6L+</h4>
              <p>Prize Pool</p>
            </div>
          </div>

          {/* Events Title */}
          <h2 className="section-title scroll-anim" style={{ '--delay': '0.2s' }}>EVENTS</h2>
          
          {/* Detailed Cards Grid (Top Row) */}
          <div className="cards-wrapper">
            <div className="event-card scroll-anim" style={{ '--delay': '0.22s' }}>
              <div className="event-icon-top">🎓</div>
              <h3>College Events</h3>
              <p>Experience the thrill of the competition and excitement of discovery. Events designed exclusively for college students.</p>
              <div className="event-tags">
                <span>College students</span>
                <span>Awards</span>
                <span>Horn skill</span>
              </div>
            </div>
            <div className="event-card scroll-anim" style={{ '--delay': '0.24s' }}>
              <div className="event-icon-top">🏫</div>
              <h3>School Events</h3>
              <p>Welcoming school students across Kerala. Step into the epicenter of innovation where creativity meets talent.</p>
              <div className="event-tags">
                <span>School students</span>
                <span>All kerala</span>
                <span>Innovations</span>
              </div>
            </div>
            <div className="event-card scroll-anim" style={{ '--delay': '0.26s' }}>
              <div className="event-icon-top">🎮</div>
              <h3>Spot Event</h3>
              <p>Unwind and recharge at the fun zone, where high-energy games and casual entertainment await.</p>
              <div className="event-tags">
                <span>Open to all</span>
                <span>Entertainment</span>
                <span>Gaming</span>
              </div>
            </div>
          </div>

          {/* Detailed Wide Cards 
          <div className="wide-cards-wrapper">
            <div className="wide-event-card scroll-anim" style={{ '--delay': '0.28s' }}>
              <div className="wide-event-header">
                <div className="icon">🎓</div>
                <h3>Internal Events</h3>
              </div>
              <p>Department, Professional Society, and Club events for AJCE students. These exclusive competitions feature technical challenges and skill-building workshops.</p>
              <div className="wide-event-tags">
                <span>Technical Competitions</span>
                <span>Team Events</span>
                <span>Department Championships</span>
              </div>
            </div>

            <div className="wide-event-card scroll-anim" style={{ '--delay': '0.3s' }}>
              <div className="wide-event-header">
                <div className="icon">🌐</div>
                <h3>External Events</h3>
              </div>
              <p>Open competitions and events for all participants from colleges across Kerala and neighboring states, showcasing technical expertise on a larger stage.</p>
              <div className="wide-event-tags">
                <span>Innovation Challenges</span>
                <span>Hackathons</span>
                <span>State Level Prizes</span>
              </div>
            </div>

            <div className="wide-event-card scroll-anim" style={{ '--delay': '0.32s' }}>
              <div className="wide-event-header">
                <div className="icon">🎮</div>
                <h3>Fun Zone</h3>
              </div>
              <p>Entertainment, games, and recreational activities designed to provide a perfect break from intense competitions.</p>
              <div className="wide-event-tags">
                <span>Gaming Tournaments</span>
                <span>Photo Booths</span>
                <span>Interactive games</span>
              </div>
            </div>
          </div> */}

          {/* Prize Pool */}
          <div className="prize-pool-wrapper scroll-anim" style={{ '--delay': '0.34s' }}>
            <div className="prize-pool">
              <span className="trophy">💎</span>
              <span className="amount">₹30,000+</span>
              <span className="text">Rewards</span>
            </div>
          </div>

          {/* Event Highlights Title */}
          <h2 className="section-title highlight-title scroll-anim" style={{ '--delay': '0.36s' }}>EVENT: THE BEST BITS</h2>
          
          {/* Tags/Badges Row */}
          <div className="tags-wrapper">
            <span className="tag-pill scroll-anim" style={{ '--delay': '0.38s' }}>TREASURE HUNTS</span>
            <span className="tag-pill scroll-anim" style={{ '--delay': '0.4s' }}>HACKATHONS</span>
            <span className="tag-pill scroll-anim" style={{ '--delay': '0.42s' }}>WORKSHOPS</span>
            <span className="tag-pill scroll-anim" style={{ '--delay': '0.44s' }}>FUNZONES</span>
            <span className="tag-pill scroll-anim" style={{ '--delay': '0.46s' }}>COMPETITIONS</span>
            <span className="tag-pill scroll-anim" style={{ '--delay': '0.48s' }}>SPOT EVENTS</span>
          </div>

          {/* --- NEW 3D SLIDER SECTION --- */}
          <div className="slider-section-wrapper scroll-anim" style={{ '--delay': '0.5s' }}>
            <div id="banner">
              <div id="slider">
                <div className="slider-item" style={{ '--position': 1 }}><img src="/" alt="highlights" /></div>
                <div className="slider-item" style={{ '--position': 2 }}><img src="/" alt="highlights" /></div>
                <div className="slider-item" style={{ '--position': 3 }}><img src="/" alt="highlights" /></div>
                <div className="slider-item" style={{ '--position': 4 }}><img src="/" alt="highlights" /></div>
                <div className="slider-item" style={{ '--position': 5 }}><img src="/" alt="highlights" /></div>
                <div className="slider-item" style={{ '--position': 6 }}><img src="/" alt="highlights" /></div>
                <div className="slider-item" style={{ '--position': 7 }}><img src="/" alt="highlights" /></div>
                <div className="slider-item" style={{ '--position': 8 }}><img src="/" alt="highlights" /></div>
                <div className="slider-item" style={{ '--position': 9 }}><img src="/" alt="highlights" /></div>
                <div className="slider-item" style={{ '--position': 10 }}><img src="/" alt="highlights" /></div>
              </div>

            </div>
          </div>
          {/* --- END SLIDER SECTION --- */}
          
          {/* CTA Section */}
          <div className="cta-box scroll-anim" style={{ '--delay': '0.5s' }}>
            <h2 className="scroll-anim" style={{ '--delay': '0.52s' }}>Bring Your Innovation To The Stage</h2>
            <p className="scroll-anim" style={{ '--delay': '0.54s' }}>Get ready for a grand celebration of technology, fun, and campus spirit! The ultimate tech fest brings together thrilling fun events and exciting activities for both school and college students to showcase their talents and enjoy the excitement.</p>
            <div className="cta-buttons scroll-anim" style={{ '--delay': '0.56s' }}>
              <button className="cta-btn-primary">Register Now</button>
              <button className="cta-btn-secondary">What's New</button>
            </div>
          </div>

          {/* GET IN TOUCH Section */}
          <h2 className="section-title highlight-title scroll-anim" style={{ '--delay': '0.58s' }}>DON'T WORRY WE ARE HERE FOR YOU</h2>
          <h3 className="contact-subtitle scroll-anim" style={{ '--delay': '0.6s' }}>Contact Our Team</h3>

          <div className="contact-grid scroll-anim" style={{ '--delay': '0.62s' }}>
            <div className="contact-card">
              <div className="contact-info-row"><span className="contact-icon">👤</span> Arjun</div>
              <div className="contact-info-row phone"><span className="contact-icon" style={{ background: 'transparent' }}>📞</span> +91 72588 65785</div>
            </div>
            <div className="contact-card">
              <div className="contact-info-row"><span className="contact-icon">👤</span> Jithin T J</div>
              <div className="contact-info-row phone"><span className="contact-icon" style={{ background: 'transparent' }}>📞</span> +91 70126 65456</div>
            </div>
            <div className="contact-card">
              <div className="contact-info-row"><span className="contact-icon">👤</span> Rahan Miraz</div>
              <div className="contact-info-row phone"><span className="contact-icon" style={{ background: 'transparent' }}>📞</span> +91 85476 78421</div>
            </div>
            <div className="contact-card">
              <div className="contact-info-row"><span className="contact-icon">👤</span> Jeswin joji</div>
              <div className="contact-info-row phone"><span className="contact-icon" style={{ background: 'transparent' }}>📞</span> +91 90753 85401</div>
            </div>
          </div>

          <div className="social-grid scroll-anim" style={{ '--delay': '0.64s' }}>
            <div className="social-card">
              <div className="ig-icon">🔗</div>
              <h4>ALGORA Official</h4>
              <p>Follow our instagram socity</p>
              <a href="#" className="social-link">@algora_sgc ↗</a>
            </div>
            <div className="social-card">
              <div className="ig-icon">🔗</div>
              <h4>Technical Team</h4>
              <p>Connect with our experts.</p>
              <a href="#" className="social-link">@sgc_teach ↗</a>
            </div>
            <div className="social-card">
              <div className="ig-icon">🔗</div>
              <h4>SGC Official</h4>
              <p>Follow our college's official page</p>
              <a href="#" className="social-link">@sgc.ac.in ↗</a>
            </div>
          </div>

          {/* Footer */}
          <div className="site-footer scroll-anim" style={{ '--delay': '0.66s' }}>
            © 2025 ALGORA Tech Fest - SGC BCA Department. All rights reserved.
          </div>

        </div>
      </section>
    </div>
  );
}
