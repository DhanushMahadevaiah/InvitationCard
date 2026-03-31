const revealItems = document.querySelectorAll(".reveal");
const countdownValue = document.querySelector(".countdown-value");
const soundToggle = document.querySelector(".sound-toggle");
const shareButton = document.querySelector(".share-button");

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

const eventDateRaw = countdownValue?.dataset.eventDate;
const eventDate = eventDateRaw ? new Date(eventDateRaw) : null;

const formatUnit = (value) => String(value).padStart(2, "0");

const updateCountdown = () => {
  if (!countdownValue || !eventDate) return;

  const diff = eventDate.getTime() - Date.now();

  if (diff <= 0) {
    countdownValue.textContent = "Celebration Time";
    return;
  }

  const totalMinutes = Math.floor(diff / 60000);
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;

  countdownValue.textContent = `${formatUnit(days)}d ${formatUnit(hours)}h ${formatUnit(minutes)}m`;
};

updateCountdown();
window.setInterval(updateCountdown, 60000);

let audioContext;
let ambientGain;
let ambientTimer;
let soundEnabled = false;

const notes = [523.25, 659.25, 783.99, 659.25];

const ensureAudioContext = async () => {
  if (!window.AudioContext && !window.webkitAudioContext) return null;

  if (!audioContext) {
    const AudioCtor = window.AudioContext || window.webkitAudioContext;
    audioContext = new AudioCtor();
    ambientGain = audioContext.createGain();
    ambientGain.gain.value = 0.045;
    ambientGain.connect(audioContext.destination);
  }

  if (audioContext.state === "suspended") {
    await audioContext.resume();
  }

  return audioContext;
};

const playChime = (timeOffset = 0) => {
  if (!audioContext || !ambientGain) return;

  const now = audioContext.currentTime + timeOffset;

  notes.forEach((frequency, index) => {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.type = index % 2 === 0 ? "sine" : "triangle";
    oscillator.frequency.setValueAtTime(frequency, now + index * 0.22);

    gainNode.gain.setValueAtTime(0.0001, now + index * 0.22);
    gainNode.gain.exponentialRampToValueAtTime(0.07, now + index * 0.22 + 0.03);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + index * 0.22 + 0.9);

    oscillator.connect(gainNode);
    gainNode.connect(ambientGain);

    oscillator.start(now + index * 0.22);
    oscillator.stop(now + index * 0.22 + 1);
  });
};

const startAmbientLoop = async () => {
  const context = await ensureAudioContext();
  if (!context || ambientTimer) return;

  playChime();
  ambientTimer = window.setInterval(() => {
    if (!soundEnabled) return;
    playChime();
  }, 12000);
};

const stopAmbientLoop = () => {
  if (ambientTimer) {
    window.clearInterval(ambientTimer);
    ambientTimer = null;
  }
};

const setSoundState = async (enabled) => {
  soundEnabled = enabled;
  soundToggle?.classList.toggle("is-on", enabled);
  soundToggle?.setAttribute("aria-pressed", String(enabled));
  if (soundToggle) {
    soundToggle.textContent = enabled ? "Music On" : "Music Off";
  }

  if (!enabled) {
    stopAmbientLoop();
    return;
  }

  await startAmbientLoop();
};

soundToggle?.addEventListener("click", async () => {
  await setSoundState(!soundEnabled);
});

shareButton?.addEventListener("click", async () => {
  const shareData = {
    title: document.title,
    text: "Join Bharath M and Rachana P for their wedding celebration.",
    url: window.location.href,
  };

  try {
    if (navigator.share) {
      await navigator.share(shareData);
      return;
    }

    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(window.location.href);
      shareButton.textContent = "Link Copied";
      window.setTimeout(() => {
        shareButton.textContent = "Share Invite";
      }, 1800);
    }
  } catch (error) {
    shareButton.textContent = "Share Invite";
  }
});
