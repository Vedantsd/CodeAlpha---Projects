const sourceText = document.getElementById('sourceText');
const targetLang = document.getElementById('targetLang');
const translateBtn = document.getElementById('translateBtn');
const resultBox = document.getElementById('resultBox');
const charCount = document.getElementById('charCount');
const statusMsg = document.getElementById('statusMsg');
const clearBtn = document.getElementById('clearBtn');
const copyBtn = document.getElementById('copyBtn');

const MAX_CHARS = 2000;

sourceText.addEventListener('input', () => {
  charCount.textContent = `${sourceText.value.length} / ${MAX_CHARS}`;
});

clearBtn.addEventListener('click', () => {
  sourceText.value = '';
  charCount.textContent = `0 / ${MAX_CHARS}`;
  resultBox.innerHTML = '<span class="placeholder">Your translation will appear here.</span>';
  statusMsg.textContent = '';
  statusMsg.classList.remove('error');
  sourceText.focus();
});

copyBtn.addEventListener('click', () => {
  const text = resultBox.textContent.trim();
  if (!text || resultBox.querySelector('.placeholder')) return;
  navigator.clipboard.writeText(text).then(() => {
    statusMsg.textContent = 'Copied to clipboard';
    statusMsg.classList.remove('error');
    setTimeout(() => { statusMsg.textContent = ''; }, 1800);
  });
});

translateBtn.addEventListener('click', async () => {
  const text = sourceText.value.trim();
  const locale = targetLang.value;

  statusMsg.classList.remove('error');

  if (!text) {
    statusMsg.textContent = 'Enter some text first.';
    statusMsg.classList.add('error');
    return;
  }

  setLoading(true);
  statusMsg.textContent = 'Translating…';

  try {
    const res = await fetch('/api/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, target_locale: locale })
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || 'Translation failed.');
    }

    resultBox.textContent = data.translated_text;
    statusMsg.textContent = 'Done';
    setTimeout(() => { if (statusMsg.textContent === 'Done') statusMsg.textContent = ''; }, 1500);
  } catch (err) {
    statusMsg.textContent = err.message;
    statusMsg.classList.add('error');
  } finally {
    setLoading(false);
  }
});

function setLoading(isLoading) {
  translateBtn.disabled = isLoading;
  translateBtn.querySelector('.translate-btn-text').textContent = isLoading ? '...' : 'Translate';
}