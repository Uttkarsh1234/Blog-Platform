// public/js/animations.js

document.addEventListener("DOMContentLoaded", () => {
  // Navbar fade in
  gsap.from(".navbar", {
    duration: 1,
    y: -60,
    opacity: 0,
    ease: "power3.out"
  });

  // Hero section text animation
  gsap.from(".hero h1, .hero p, .contact-content h1, .contact-content p, .about-hero h1, .about-hero p", {
    duration: 1.2,
    y: 50,
    opacity: 0,
    stagger: 0.2,
    ease: "power3.out"
  });

  // Blog cards animation (when they enter viewport)
  gsap.utils.toArray(".blog-card").forEach((card, i) => {
    gsap.from(card, {
      scrollTrigger: {
        trigger: card,
        start: "top 90%",
      },
      duration: 0.8,
      y: 60,
      opacity: 0,
      delay: i * 0.1,
      ease: "power3.out"
    });
  });

  // Modal animation (when opened)
  window.openModal = (id) => {
    const modal = document.getElementById(`modal-${id}`);
    modal.style.display = "flex";
    gsap.fromTo(modal.querySelector(".modal-content"), 
      { scale: 0.8, opacity: 0 }, 
      { duration: 0.5, scale: 1, opacity: 1, ease: "back.out(1.7)" }
    );
  };

  window.closeModal = (id) => {
    const modal = document.getElementById(`modal-${id}`);
    gsap.to(modal.querySelector(".modal-content"), {
      duration: 0.3,
      scale: 0.8,
      opacity: 0,
      ease: "power2.in",
      onComplete: () => modal.style.display = "none"
    });
  };

  // Footer fade-in animation
  gsap.from("footer", {
    scrollTrigger: {
      trigger: "footer",
      start: "top 90%",
    },
    duration: 1,
    opacity: 0,
    y: 40,
    ease: "power2.out"
  });
});

// Smooth page transitions
document.querySelectorAll("a").forEach(link => {
  link.addEventListener("click", (e) => {
    const target = e.currentTarget.getAttribute("href");
    if (target && target.startsWith("/") && !target.startsWith("http")) {
      e.preventDefault();
      gsap.to("body", {
        opacity: 0,
        duration: 0.4,
        onComplete: () => (window.location.href = target),
      });
    }
  });
});

window.addEventListener("pageshow", () => {
  gsap.fromTo("body", { opacity: 0 }, { opacity: 1, duration: 0.5 });
});

// Animate About Page
if (document.body.classList.contains("page-about")) {
  gsap.from(".about-hero h1, .about-hero p", {
    duration: 1.2,
    y: 50,
    opacity: 0,
    stagger: 0.3,
    ease: "power3.out"
  });

  gsap.from(".about-image img", {
    scrollTrigger: { trigger: ".about-image", start: "top 85%" },
    duration: 1,
    x: -80,
    opacity: 0,
    ease: "power3.out"
  });

  gsap.from(".about-text h2, .about-text p", {
    scrollTrigger: { trigger: ".about-text", start: "top 90%" },
    duration: 1,
    y: 60,
    opacity: 0,
    stagger: 0.2
  });
}

// Animate Contact Page
if (document.body.classList.contains("page-contact")) {
  gsap.from(".contact-content h1, .contact-content p", {
    duration: 1.2,
    y: 60,
    opacity: 0,
    stagger: 0.2
  });

  gsap.utils.toArray(".contact-card").forEach((card, i) => {
    gsap.from(card, {
      scrollTrigger: { trigger: card, start: "top 85%" },
      duration: 1,
      y: 80,
      opacity: 0,
      delay: i * 0.1,
      ease: "power3.out"
    });
  });
}

// Navbar scroll behavior
window.addEventListener("scroll", () => {
  const navbar = document.querySelector(".navbar");
  if (window.scrollY > 80) {
    navbar.classList.add("scrolled");
  } else {
    navbar.classList.remove("scrolled");
  }
});
