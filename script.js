document.addEventListener("DOMContentLoaded", () => {
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  const nav = document.getElementById("siteNav");
  const navToggle = document.getElementById("navToggle");
  const navLinks = document.getElementById("navLinks");
  const navBackdrop = document.getElementById("navBackdrop");

  const setMenuOpen = (open) => {
    navLinks?.classList.toggle("open", open);
    navToggle?.classList.toggle("open", open);
    navBackdrop?.classList.toggle("active", open);
    nav?.classList.toggle("menu-open", open);
    navToggle?.setAttribute("aria-expanded", String(open));
    navBackdrop?.setAttribute("aria-hidden", String(!open));
    document.body.style.overflow = open ? "hidden" : "";
  };

  const handleScroll = () => {
    if (nav) nav.classList.toggle("scrolled", window.scrollY > 60);
  };
  window.addEventListener("scroll", handleScroll, { passive: true });
  handleScroll();

  if (navToggle && navLinks) {
    navToggle.addEventListener("click", () => {
      setMenuOpen(!navLinks.classList.contains("open"));
    });

    navBackdrop?.addEventListener("click", () => setMenuOpen(false));

    navLinks.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => setMenuOpen(false));
    });
  }

  const revealEls = document.querySelectorAll(".reveal");
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
  );
  revealEls.forEach((el) => revealObserver.observe(el));

  const galleryItems = document.querySelectorAll(".gallery-item");
  const lightbox = document.getElementById("lightbox");
  const lightboxImage = document.getElementById("lightboxImage");
  const lightboxClose = document.getElementById("lightboxClose");
  const lightboxPrev = document.getElementById("lightboxPrev");
  const lightboxNext = document.getElementById("lightboxNext");
  const lightboxCounter = document.getElementById("lightboxCounter");

  const images = Array.from(galleryItems).map((item) => ({
    src: item.querySelector("img").src,
    alt: item.querySelector("img").alt,
  }));

  let currentIndex = 0;

  const showLightbox = (index) => {
    if (!lightbox || !lightboxImage) return;
    currentIndex = index;
    const img = images[currentIndex];
    lightboxImage.src = img.src;
    lightboxImage.alt = img.alt;
    if (lightboxCounter) {
      lightboxCounter.textContent = `${currentIndex + 1} / ${images.length}`;
    }
    lightbox.classList.add("active");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  };

  const hideLightbox = () => {
    if (!lightbox) return;
    lightbox.classList.remove("active");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  };

  const navigateLightbox = (dir) => {
    currentIndex = (currentIndex + dir + images.length) % images.length;
    showLightbox(currentIndex);
  };

  galleryItems.forEach((item) => {
    item.addEventListener("click", () => {
      showLightbox(Number(item.dataset.index));
    });
  });

  lightboxClose?.addEventListener("click", hideLightbox);
  lightboxPrev?.addEventListener("click", () => navigateLightbox(-1));
  lightboxNext?.addEventListener("click", () => navigateLightbox(1));

  lightbox?.addEventListener("click", (e) => {
    if (e.target === lightbox) hideLightbox();
  });

  document.addEventListener("keydown", (e) => {
    if (!lightbox?.classList.contains("active")) return;
    if (e.key === "Escape") hideLightbox();
    if (e.key === "ArrowLeft") navigateLightbox(-1);
    if (e.key === "ArrowRight") navigateLightbox(1);
  });

  const form = document.getElementById("contactForm");
  if (form) {
    const successEl = document.getElementById("formSuccess");
    const errorEl = document.getElementById("formError");
    const subjectField = document.getElementById("formSubject");
    const submitBtn = form.querySelector('[type="submit"]');

    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      if (successEl) successEl.hidden = true;
      if (errorEl) errorEl.hidden = true;

      const name = document.getElementById("name").value.trim();
      if (subjectField) {
        subjectField.value = `Bridal Booking Request ${name}`;
      }

      const originalLabel = submitBtn?.textContent ?? "Send";
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Sending…";
      }

      try {
        const response = await fetch("/", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams(new FormData(form)).toString(),
        });

        if (response.ok) {
          form.reset();
          if (successEl) successEl.hidden = false;
        } else if (errorEl) {
          errorEl.hidden = false;
        }
      } catch {
        if (errorEl) errorEl.hidden = false;
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = originalLabel;
        }
      }
    });
  }
});
