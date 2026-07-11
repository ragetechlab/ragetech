/* --------------------------------------------------------
   RAGE INTERACTIVITY ENGINE (app.js)
   Controls scroll states, micro-animations, toggles, and sliders
   -------------------------------------------------------- */

document.addEventListener("DOMContentLoaded", () => {

  // ==========================================
  // 1. STICKY HEADER & SCROLL BEHAVIOR
  // ==========================================
  const header = document.getElementById("main-header");
  
  const handleScroll = () => {
    if (window.scrollY > 50) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }
  };

  window.addEventListener("scroll", handleScroll);
  handleScroll(); // Initial check on load


  // ==========================================
  // 2. MOBILE HAMBURGER MENU
  // ==========================================
  const menuToggle = document.getElementById("menu-toggle");
  const navMenu = document.getElementById("nav-menu");
  const navLinks = document.querySelectorAll(".nav-link");
  const navBackdrop = document.getElementById("nav-backdrop");
  const menuCloseBtn = document.getElementById("menu-close-btn");

  const toggleMenu = () => {
    menuToggle.classList.toggle("open");
    navMenu.classList.toggle("open");
    if (navBackdrop) navBackdrop.classList.toggle("open");
    document.body.classList.toggle("no-scroll"); // Prevent background scroll when menu is open
  };

  const closeMenu = () => {
    menuToggle.classList.remove("open");
    navMenu.classList.remove("open");
    if (navBackdrop) navBackdrop.classList.remove("open");
    document.body.classList.remove("no-scroll");
  };

  const mobileLinks = document.querySelectorAll(".nav-link-mobile");

  if (menuToggle) menuToggle.addEventListener("click", toggleMenu);
  if (navBackdrop) navBackdrop.addEventListener("click", closeMenu);
  if (menuCloseBtn) menuCloseBtn.addEventListener("click", closeMenu);

  navLinks.forEach(link => {
    link.addEventListener("click", closeMenu);
  });

  mobileLinks.forEach(link => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const targetId = link.getAttribute("href");
      closeMenu();
      
      // Navigate to target section smoothly after closing the menu
      setTimeout(() => {
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          targetElement.scrollIntoView({ behavior: "smooth" });
        }
      }, 300); // Wait for drawer transition to start and body scroll to unlock
    });
  });


  // ==========================================
  // 3. PRODUCT SHOWCASE INTERACTIVE MOCKUP
  // ==========================================
  const showcaseTabs = document.querySelectorAll(".showcase-tab-btn");
  const mockupPanels = document.querySelectorAll(".mockup-panel");
  const floatingCards = document.querySelectorAll(".floating-card");

  const switchShowcasePane = (targetId) => {
    // Deactivate current tabs
    showcaseTabs.forEach(tab => {
      if (tab.getAttribute("data-target") === targetId) {
        tab.classList.add("active");
      } else {
        tab.classList.remove("active");
      }
    });

    // Switch visible mockup panels
    mockupPanels.forEach(panel => {
      if (panel.id === `pane-${targetId}`) {
        panel.classList.add("active");
      } else {
        panel.classList.remove("active");
      }
    });
  };

  // Bind tab buttons click
  showcaseTabs.forEach(tab => {
    tab.addEventListener("click", () => {
      const target = tab.getAttribute("data-target");
      switchShowcasePane(target);
    });
  });

  // Bind floating helper cards click
  floatingCards.forEach(card => {
    card.addEventListener("click", () => {
      const parentTarget = card.getAttribute("data-parent");
      switchShowcasePane(parentTarget);
      
      // Smooth scroll to showcase view if card is clicked
      document.getElementById("solucoes").scrollIntoView({ behavior: "smooth" });
    });
  });


  // ==========================================
  // 4. METRICS COUNT-UP ANIMATION
  // ==========================================
  const statNumbers = document.querySelectorAll(".stat-num");

  const animateCount = (element) => {
    const target = parseFloat(element.getAttribute("data-target"));
    const suffix = element.getAttribute("data-suffix") || "";
    const isDecimal = target % 1 !== 0; // Check if the target has decimal places
    const duration = 1500; // Animation duration in ms
    const startTime = performance.now();

    const updateCount = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing curve (easeOutQuad)
      const easeProgress = progress * (2 - progress);
      const currentValue = easeProgress * target;

      if (isDecimal) {
        element.textContent = currentValue.toFixed(1) + suffix;
      } else {
        element.textContent = Math.floor(currentValue) + suffix;
      }

      if (progress < 1) {
        requestAnimationFrame(updateCount);
      } else {
        // Guarantee final value matches target exactly
        element.textContent = target + suffix;
      }
    };

    requestAnimationFrame(updateCount);
  };

  // IntersectionObserver to trigger counting only when stats are visible
  if (!window.IntersectionObserver) {
    // Fallback: animate all immediately if observer is not supported
    statNumbers.forEach(num => animateCount(num));
  } else {
    const statsObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          observer.unobserve(entry.target); // Trigger only once
        }
      });
    }, {
      threshold: 0.1 // Lower threshold so it triggers reliably on mobile screens
    });

    statNumbers.forEach(num => {
      // Set to 0 on load via JS so it is ready to animate,
      // while keeping the HTML static fallback intact
      const suffix = num.getAttribute("data-suffix") || "";
      num.textContent = "0" + suffix;
      
      statsObserver.observe(num);
    });
  }


  // ==========================================
  // 5. TIMELINE JORNADA SCROLL-PROGRESS
  // ==========================================
  const timelineNodes = document.querySelectorAll(".timeline-node");
  const progressFill = document.getElementById("timeline-progress-fill");

  const updateTimelineProgress = () => {
    let activeIndex = 0;
    
    // Find the latest node that is in the top-half of the screen
    timelineNodes.forEach((node, idx) => {
      const rect = node.getBoundingClientRect();
      const triggerPoint = window.innerHeight * 0.7; // Trigger at 70% viewport height
      
      if (rect.top < triggerPoint) {
        node.classList.add("active");
        activeIndex = idx + 1;
      } else {
        node.classList.remove("active");
      }
    });

    // Update fill height percentage
    if (activeIndex > 0) {
      const percentage = ((activeIndex - 1) / (timelineNodes.length - 1)) * 100;
      progressFill.style.height = `${percentage}%`;
    } else {
      progressFill.style.height = `0%`;
    }
  };

  window.addEventListener("scroll", updateTimelineProgress);
  updateTimelineProgress(); // Run once initially


  // ==========================================
  // 6. TEAM CAROUSEL DYNAMIC SLIDER
  // ==========================================
  const carousel = document.getElementById("team-carousel");
  const prevBtn = document.getElementById("team-prev");
  const nextBtn = document.getElementById("team-next");

  if (carousel && prevBtn && nextBtn) {
    const getScrollStep = () => {
      const firstCard = carousel.querySelector(".team-card");
      return firstCard ? firstCard.clientWidth + 30 : 300; // width + gap
    };

    prevBtn.addEventListener("click", () => {
      const step = getScrollStep();
      carousel.scrollBy({
        left: -step,
        behavior: "smooth"
      });
    });

    nextBtn.addEventListener("click", () => {
      const step = getScrollStep();
      carousel.scrollBy({
        left: step,
        behavior: "smooth"
      });
    });


  }


  // ==========================================
  // 7. PRICING TOGGLE CONTROLLER
  // ==========================================
  const pricingToggleBtn = document.getElementById("pricing-toggle");
  const labelProject = document.getElementById("toggle-label-project");
  const labelRetainer = document.getElementById("toggle-label-retainer");
  
  const priceOneOff = document.getElementById("price-one-off-val");
  const priceRetainer = document.getElementById("price-retainer-val");
  
  const cardOneOff = document.getElementById("card-one-off");
  const cardRetainer = document.getElementById("card-retainer");

  const togglePricing = () => {
    if (!pricingToggleBtn) return;
    const isRetainerActive = pricingToggleBtn.classList.toggle("active");
    
    if (isRetainerActive) {
      if (labelProject) labelProject.classList.remove("active");
      if (labelRetainer) labelRetainer.classList.add("active");
      
      // Update values with special visual styles (simulating retainer discount highlight)
      if (priceOneOff) priceOneOff.textContent = "Sob Consulta";
      if (priceRetainer) priceRetainer.innerHTML = "R$ 7.225<span style='font-size:1.25rem; font-weight:normal;'>/mês</span>";
      
      // Swap card focus
      if (cardOneOff) cardOneOff.classList.remove("featured");
      if (cardRetainer) cardRetainer.classList.add("featured");
    } else {
      if (labelProject) labelProject.classList.add("active");
      if (labelRetainer) labelRetainer.classList.remove("active");
      
      // Revert values
      if (priceOneOff) priceOneOff.textContent = "R$ 15k";
      if (priceRetainer) priceRetainer.innerHTML = "R$ 8.500<span style='font-size:1.25rem; font-weight:normal;'>/mês</span>";
      
      // Focus one-off or revert
      if (cardRetainer) cardRetainer.classList.add("featured");
    }
  };

  if (pricingToggleBtn) {
    pricingToggleBtn.addEventListener("click", togglePricing);
  }
  if (labelProject && pricingToggleBtn) {
    labelProject.addEventListener("click", () => {
      pricingToggleBtn.classList.remove("active");
      togglePricing();
    });
  }
  if (labelRetainer && pricingToggleBtn) {
    labelRetainer.addEventListener("click", () => {
      pricingToggleBtn.classList.add("active");
      togglePricing();
    });
  }


  // ==========================================
  // 8. FAQ ACCORDION EXPAND-HEIGHT TRANSITION
  // ==========================================
  const faqTriggers = document.querySelectorAll(".faq-trigger");

  faqTriggers.forEach(trigger => {
    trigger.addEventListener("click", () => {
      const parent = trigger.parentElement;
      const content = parent.querySelector(".faq-content");
      const isOpen = parent.classList.contains("open");

      // Close all other open accordions
      document.querySelectorAll(".faq-item.open").forEach(item => {
        if (item !== parent) {
          item.classList.remove("open");
          item.querySelector(".faq-content").style.maxHeight = "0px";
        }
      });

      // Toggle this accordion
      if (isOpen) {
        parent.classList.remove("open");
        content.style.maxHeight = "0px";
      } else {
        parent.classList.add("open");
        // Animate to scrollHeight so height transition behaves smoothly
        content.style.maxHeight = `${content.scrollHeight}px`;
      }
    });
  });


  // ==========================================
  // 9. CLIENT-SIDE VALIDATION & NEWSLETTER FORM
  // ==========================================
  const newsletterForm = document.getElementById("newsletter-form");
  const newsletterFeedback = document.getElementById("newsletter-feedback");

  if (newsletterForm) {
    newsletterForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const emailInput = document.getElementById("newsletter-email");
      const email = emailInput.value.trim();

      // Simple email validation pattern
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      
      if (!emailPattern.test(email)) {
        showFeedback(newsletterFeedback, "Por favor, digite um e-mail válido.", "error");
        return;
      }

      // Simulate API call
      const submitBtn = newsletterForm.querySelector("button[type='submit']");
      submitBtn.disabled = true;
      submitBtn.textContent = "Inscrevendo...";

      setTimeout(() => {
        submitBtn.disabled = false;
        submitBtn.textContent = "Inscrever-se na Newsletter";
        showFeedback(newsletterFeedback, "Sucesso! Você foi cadastrado na nossa newsletter.", "success");
        newsletterForm.reset();
      }, 1000);
    });
  }

  // ==========================================
  // 10. CONTACT FORM SUBMISSION VALIDATION
  // ==========================================
  const contactForm = document.getElementById("contact-form");
  const contactFeedback = document.getElementById("contact-feedback");
  const API_URL = "https://regetech-backend-api.onrender.com/api/leads.php"; // Produção

  if (contactForm) {
    contactForm.addEventListener("submit", (e) => {
      e.preventDefault();
      
      const name = document.getElementById("contact-name").value.trim();
      const email = document.getElementById("contact-email").value.trim();
      const company = document.getElementById("contact-company").value.trim();
      const phone = document.getElementById("contact-phone").value.trim();
      const message = document.getElementById("contact-message").value.trim();

      if (!name || !email) {
        showFeedback(contactFeedback, "Por favor, preencha todos os campos obrigatórios.", "error");
        return;
      }

      // 1. Open WhatsApp IMMEDIATELY (keeps browser trust for popups, bypassing pop-up blockers)
      const introMessage = "Olá, vim pela Rage e gostaria de realizar um orçamento!";
      const whatsappUrl = `https://wa.me/5535988224017?text=${encodeURIComponent(introMessage)}`;
      window.open(whatsappUrl, '_blank');

      // 2. Show instant feedback and reset form
      showFeedback(contactFeedback, "Obrigado! Sua solicitação foi enviada com sucesso.", "success");
      contactForm.reset();

      // 3. Fire API request in the background (no blocking, no await)
      fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          nome_completo: name,
          email_corporativo: email,
          empresa: company || "",
          cnpj: "",
          whatsapp: phone || ""
        })
      })
      .then(async res => {
        const isJson = res.headers.get("content-type")?.includes("application/json");
        const data = isJson ? await res.json() : null;
        if (res.ok) {
          console.log("Lead enviado com sucesso para a API! ID:", data?.id);
        } else {
          console.warn("API de leads retornou erro:", data?.message || res.status);
        }
      })
      .catch(err => {
        console.warn("API de leads offline ou com erro de conexão:", err);
      });

      // 4. Fire FormSubmit.co email request in the background
      fetch("https://formsubmit.co/ajax/ragegroupp@gmail.com", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          _cc: "contato@ragetechlab.com",
          Mensagem: introMessage
        })
      })
      .then(res => {
        if (!res.ok) console.warn("FormSubmit retornou erro no envio do e-mail");
      })
      .catch(err => {
        console.warn("Erro de conexão com o FormSubmit:", err);
      });
    });
  }

  // Helper feedback messenger
  function showFeedback(element, message, type) {
    element.textContent = message;
    element.className = `form-feedback ${type}`;
    element.style.display = ""; // Reset inline display to let CSS classes take effect
    
    // Remove after 6 seconds
    setTimeout(() => {
      element.style.display = "none";
    }, 6000);
  }

  // ==========================================
  // 11. FLOATING DRAGGABLE NAV BAR
  // ==========================================
  const floatingNav = document.getElementById("main-header");
  let isDraggingNav = false;
  let dragStartX, dragStartY, navInitialLeft, navInitialTop;

  // We only initiate dragging when clicking on empty spaces of the header, not on links/buttons
  floatingNav.addEventListener("mousedown", (e) => {
    if (e.target.closest("a") || e.target.closest("button") || e.target.closest(".menu-toggle")) return;
    
    isDraggingNav = true;
    floatingNav.style.cursor = "grabbing";
    
    // Get mouse start position
    dragStartX = e.clientX;
    dragStartY = e.clientY;
    
    // Get current bounding rect of nav
    const rect = floatingNav.getBoundingClientRect();
    navInitialLeft = rect.left;
    navInitialTop = rect.top;
    
    // Switch from translateX(-50%) positioning to absolute positioning
    floatingNav.style.transform = "none";
    floatingNav.style.left = `${navInitialLeft}px`;
    floatingNav.style.top = `${navInitialTop}px`;
    floatingNav.style.margin = "0";
    floatingNav.style.width = `${rect.width}px`; // Lock width so it doesn't warp
    
    e.preventDefault();
  });

  document.addEventListener("mousemove", (e) => {
    if (!isDraggingNav) return;
    
    const dx = e.clientX - dragStartX;
    const dy = e.clientY - dragStartY;
    
    let newLeft = navInitialLeft + dx;
    let newTop = navInitialTop + dy;
    
    // Constrain to viewport boundaries
    const rect = floatingNav.getBoundingClientRect();
    const maxX = window.innerWidth - rect.width;
    const maxY = window.innerHeight - rect.height;
    
    newLeft = Math.max(0, Math.min(newLeft, maxX));
    newTop = Math.max(0, Math.min(newTop, maxY));
    
    floatingNav.style.left = `${newLeft}px`;
    floatingNav.style.top = `${newTop}px`;
  });

  document.addEventListener("mouseup", () => {
    if (isDraggingNav) {
      isDraggingNav = false;
      floatingNav.style.cursor = "grab";
    }
  });

  // Replicate touch support for mobile devices
  floatingNav.addEventListener("touchstart", (e) => {
    if (e.target.closest("a") || e.target.closest("button") || e.target.closest(".menu-toggle")) return;
    
    isDraggingNav = true;
    const touch = e.touches[0];
    dragStartX = touch.clientX;
    dragStartY = touch.clientY;
    
    const rect = floatingNav.getBoundingClientRect();
    navInitialLeft = rect.left;
    navInitialTop = rect.top;
    
    floatingNav.style.transform = "none";
    floatingNav.style.left = `${navInitialLeft}px`;
    floatingNav.style.top = `${navInitialTop}px`;
    floatingNav.style.margin = "0";
    floatingNav.style.width = `${rect.width}px`;
  });

  document.addEventListener("touchmove", (e) => {
    if (!isDraggingNav) return;
    const touch = e.touches[0];
    const dx = touch.clientX - dragStartX;
    const dy = touch.clientY - dragStartY;
    
    let newLeft = navInitialLeft + dx;
    let newTop = navInitialTop + dy;
    
    const rect = floatingNav.getBoundingClientRect();
    const maxX = window.innerWidth - rect.width;
    const maxY = window.innerHeight - rect.height;
    
    newLeft = Math.max(0, Math.min(newLeft, maxX));
    newTop = Math.max(0, Math.min(newTop, maxY));
    
    floatingNav.style.left = `${newLeft}px`;
    floatingNav.style.top = `${newTop}px`;
  });

  document.addEventListener("touchend", () => {
    isDraggingNav = false;
  });

  // ==========================================
  // 12. TRIPLE-DEVICE SPECIALTY HIGHLIGHT
  // ==========================================
  const specialtyBalloons = document.querySelectorAll(".specialty-balloon");
  const mockupsWrapper = document.getElementById("specialty-mockups-wrapper");
  const stackDevices = document.querySelectorAll(".stack-device");

  if (specialtyBalloons.length && mockupsWrapper && stackDevices.length) {
    specialtyBalloons.forEach(balloon => {
      balloon.addEventListener("mouseenter", () => {
        const deviceTarget = balloon.getAttribute("data-device");
        const targetElement = document.getElementById(`stack-${deviceTarget}`);
        
        if (targetElement) {
          // Add highlights
          mockupsWrapper.classList.add("has-highlight");
          targetElement.classList.add("highlighted");
        }
      });

      balloon.addEventListener("mouseleave", () => {
        // Clear all highlights
        mockupsWrapper.classList.remove("has-highlight");
        stackDevices.forEach(device => device.classList.remove("highlighted"));
      });
    });
  }

});
