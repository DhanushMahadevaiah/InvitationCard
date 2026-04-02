const revealItems = document.querySelectorAll(".reveal");
const openingScreen = document.querySelector("#opening-screen");
const invitationCard = document.querySelector("#invitation-card");
const langButtons = document.querySelectorAll("[data-lang-toggle]");
const langContent = document.querySelectorAll("[data-en][data-kn]");
const translatableNames = document.querySelectorAll("[data-name-en][data-name-kn]");

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      revealObserver.unobserve(entry.target);
    });
  },
  {
    threshold: 0.18,
    rootMargin: "0px 0px -40px 0px",
  }
);

revealItems.forEach((item, index) => {
  item.style.transitionDelay = `${index * 120}ms`;
  revealObserver.observe(item);
});

let invitationStarted = false;

const beginInvitationExperience = () => {
  if (invitationStarted) return;
  invitationStarted = true;

  openingScreen?.classList.add("is-opening");

  window.setTimeout(() => {
    invitationCard?.classList.remove("invitation-hidden");
    invitationCard?.classList.add("invitation-visible");
    revealItems.forEach((item, index) => {
      window.setTimeout(() => {
        item.classList.add("is-visible");
      }, index * 120);
    });
  }, 700);

  window.setTimeout(() => {
    openingScreen?.classList.add("is-hidden");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, 1500);

  window.setTimeout(() => {
    if (openingScreen) {
      openingScreen.setAttribute("hidden", "hidden");
    }
  }, 2800);
};

window.addEventListener(
  "load",
  () => {
    window.setTimeout(() => {
      beginInvitationExperience();
    }, 3000);
  },
  { once: true }
);

const setLanguage = (lang) => {
  document.documentElement.lang = lang === "kn" ? "kn" : "en";

  langContent.forEach((node) => {
    const text = node.dataset[lang];
    if (!text) return;
    node.textContent = text;
  });

  translatableNames.forEach((node) => {
    const text = node.dataset[`name${lang === "kn" ? "Kn" : "En"}`];
    if (!text) return;
    node.innerHTML = text;
  });

  langButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.langToggle === lang);
  });
};

langButtons.forEach((button) => {
  button.addEventListener("click", () => {
    setLanguage(button.dataset.langToggle || "en");
  });
});
