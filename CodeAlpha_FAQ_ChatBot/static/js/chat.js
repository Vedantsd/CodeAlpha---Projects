const chatWindow = document.getElementById("chatWindow");
const userInput  = document.getElementById("userInput");
const sendBtn    = document.getElementById("sendBtn");
const faqList    = document.getElementById("faqList");
const faqSearch  = document.getElementById("faqSearch");

let allFaqs = [];
let isWaiting = false;


function scrollToBottom() {
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

function autoResizeTextarea() {
  userInput.style.height = "auto";
  userInput.style.height = Math.min(userInput.scrollHeight, 120) + "px";
}

function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function formatBubbleText(text) {
  return escapeHtml(text)
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\n/g, "<br>");
}

function appendMessage(role, text, meta = null) {
  const wrap = document.createElement("div");
  wrap.className = `message ${role}-message`;

  const avatarEl = document.createElement("div");
  avatarEl.className = `avatar ${role}-avatar`;
  avatarEl.textContent = role === "bot" ? "B" : "U";

  const bubble = document.createElement("div");
  bubble.className = "bubble";
  bubble.innerHTML = `<p>${formatBubbleText(text)}</p>`;

  if (meta && meta.matched_question && meta.confidence !== "none") {
    const badge = document.createElement("div");
    badge.className = `match-badge ${meta.confidence}`;
    const icon = meta.confidence === "high" ? "✓" : meta.confidence === "medium" ? "~" : "?";
    badge.textContent = `${icon} Matched: "${meta.matched_question}"`;
    bubble.appendChild(badge);
  }

  wrap.appendChild(avatarEl);
  wrap.appendChild(bubble);
  chatWindow.appendChild(wrap);
  scrollToBottom();
  return wrap;
}

function showTyping() {
  const wrap = document.createElement("div");
  wrap.className = "message bot-message typing-indicator";
  wrap.id = "typingIndicator";
  wrap.innerHTML = `
    <div class="avatar bot-avatar">B</div>
    <div class="bubble">
      <span class="dot"></span>
      <span class="dot"></span>
      <span class="dot"></span>
    </div>`;
  chatWindow.appendChild(wrap);
  scrollToBottom();
}

function removeTyping() {
  const el = document.getElementById("typingIndicator");
  if (el) el.remove();
}

async function sendMessage(text) {
  text = text.trim();
  if (!text || isWaiting) return;

  isWaiting = true;
  sendBtn.disabled = true;
  userInput.value = "";
  autoResizeTextarea();

  appendMessage("user", text);
  showTyping();

  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text }),
    });

    if (!res.ok) throw new Error(`Server error ${res.status}`);

    const data = await res.json();
    removeTyping();
    appendMessage("bot", data.answer, data);
  } catch (err) {
    removeTyping();
    appendMessage("bot", "Sorry, something went wrong. Please try again.");
    console.error(err);
  } finally {
    isWaiting = false;
    sendBtn.disabled = false;
    userInput.focus();
  }
}

async function loadFAQs() {
  try {
    const res  = await fetch("/api/faqs");
    const data = await res.json();
    allFaqs = data.faqs;
    renderFAQList(allFaqs);
  } catch (err) {
    faqList.innerHTML = '<li class="faq-loading">Could not load FAQs.</li>';
  }
}

function renderFAQList(faqs) {
  faqList.innerHTML = "";
  if (faqs.length === 0) {
    faqList.innerHTML = '<li class="faq-loading">No matches.</li>';
    return;
  }
  faqs.forEach((faq) => {
    const li = document.createElement("li");
    li.textContent = faq.question;
    li.addEventListener("click", () => {
      // Highlight active
      document.querySelectorAll(".faq-list li").forEach(el => el.classList.remove("active"));
      li.classList.add("active");
      sendMessage(faq.question);
    });
    faqList.appendChild(li);
  });
}

faqSearch.addEventListener("input", () => {
  const q = faqSearch.value.toLowerCase();
  const filtered = allFaqs.filter(f => f.question.toLowerCase().includes(q));
  renderFAQList(filtered);
});

sendBtn.addEventListener("click", () => sendMessage(userInput.value));

userInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendMessage(userInput.value);
  }
});

userInput.addEventListener("input", autoResizeTextarea);

loadFAQs();
