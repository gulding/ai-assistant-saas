// sidepanel.js

async function renderDrafts() {
  const container = document.getElementById('drafts-container');
  const { drafts = [] } = await chrome.storage.local.get('drafts');
  
  if (drafts.length === 0) {
    container.innerHTML = '<div style="color: var(--text-muted); font-size: 0.9rem;">No pending drafts.</div>';
    return;
  }

  container.innerHTML = '';
  drafts.forEach((draft, index) => {
    const div = document.createElement('div');
    div.className = 'draft-card';
    div.innerHTML = `
      <strong style="display:block; margin-bottom:4px;">To: ${draft.recipient}</strong>
      <div style="color: var(--text-muted); margin-bottom: 8px;">${draft.suggested_time}</div>
      <div style="white-space: pre-wrap; font-style: italic;">"${draft.body}"</div>
      <div style="display: flex; gap: 8px;">
        <button class="approve-btn" data-index="${index}">Approve & Send</button>
        <button style="background: transparent; border: 1px solid var(--text-muted); color: var(--text-main)" class="dismiss-btn" data-index="${index}">Dismiss</button>
      </div>
    `;
    container.appendChild(div);
  });

  // Attach event listeners
  document.querySelectorAll('.approve-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const idx = e.target.getAttribute('data-index');
      drafts.splice(idx, 1);
      await chrome.storage.local.set({ drafts });
      e.target.parentElement.parentElement.innerHTML = '<span style="color: #10b981">Sent successfully! ✅</span>';
      setTimeout(renderDrafts, 1500);
    });
  });

  document.querySelectorAll('.dismiss-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const idx = e.target.getAttribute('data-index');
      drafts.splice(idx, 1);
      await chrome.storage.local.set({ drafts });
      renderDrafts();
    });
  });
}

// Initial render
renderDrafts();

// Listen for storage changes (e.g. background script adds a new draft)
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'local' && changes.drafts) {
    renderDrafts();
  }
});

// Manual test button
document.getElementById('test-btn').addEventListener('click', async () => {
  // We can't trigger an alarm directly, but we can message the background script or just fetch the backend ourselves.
  // For simplicity, let's just make the fetch here to simulate the background job.
  const btn = document.getElementById('test-btn');
  btn.textContent = 'Simulating...';
  btn.disabled = true;
  
  try {
    const mockEmailBody = "Hi, let's schedule a sync for next Thursday at 2 PM to go over the design docs.";
    const res = await fetch('http://localhost:8000/api/meetings/draft', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: mockEmailBody })
    });
    
    if (res.ok) {
      const data = await res.json();
      const { drafts = [] } = await chrome.storage.local.get('drafts');
      drafts.push(data);
      await chrome.storage.local.set({ drafts });
      
      // Simulate the notification
      const canvas = new OffscreenCanvas(128, 128);
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#3b82f6';
      ctx.beginPath(); ctx.arc(64, 64, 64, 0, Math.PI * 2); ctx.fill();
      const blob = await canvas.convertToBlob();
      const reader = new FileReader();
      reader.onloadend = () => {
        chrome.notifications.create(`draft_${Date.now()}`, {
          type: 'basic',
          iconUrl: reader.result,
          title: 'AI Secretary',
          message: 'I just drafted a reply to a new meeting request!'
        });
      };
      reader.readAsDataURL(blob);
    } else {
        alert('Backend error! Is FastAPI running?');
    }
  } catch (err) {
    alert('Failed to connect to backend. Make sure FastAPI is running on port 8000.');
  } finally {
    btn.textContent = 'Simulate Incoming Email';
    btn.disabled = false;
  }
});
