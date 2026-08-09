// background.js

// Setup the side panel to open on action (icon) click
chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch(console.error);

// Helper to generate a data URL for notifications to satisfy the skill requirement
async function getIconDataUrl() {
  const canvas = new OffscreenCanvas(128, 128);
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#3b82f6';
  ctx.beginPath();
  ctx.arc(64, 64, 64, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'white';
  ctx.font = 'bold 64px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('AI', 64, 64);
  const blob = await canvas.convertToBlob();
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.readAsDataURL(blob);
  });
}

// Background polling for new emails/meetings using Alarms
chrome.alarms.create('checkInbox', { periodInMinutes: 1 });

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === 'checkInbox') {
    console.log("Checking for new emails/meetings...");
    
    // MOCK SIMULATION: Normally we would use chrome.identity.getAuthToken here
    // to call the Gmail API. For this prototype, we simulate finding a new meeting request.
    
    // Let's pretend we found an email and sent it to our FastAPI backend to draft a reply.
    try {
      const mockEmailBody = "Hi, let's schedule a sync for next Thursday at 2 PM to go over the design docs.";
      const res = await fetch('http://localhost:8000/api/meetings/draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: mockEmailBody })
      });
      
      if (res.ok) {
        const data = await res.json();
        
        // Save the draft info to storage so the side panel can show it
        const { drafts = [] } = await chrome.storage.local.get('drafts');
        drafts.push(data);
        await chrome.storage.local.set({ drafts });

        // Show a notification to the user that a draft was created!
        const iconUrl = await getIconDataUrl();
        chrome.notifications.create(`draft_${Date.now()}`, {
          type: 'basic',
          iconUrl: iconUrl,
          title: 'AI Secretary',
          message: 'I just drafted a reply to a new meeting request!',
          buttons: [{ title: 'View Draft' }]
        });
      }
    } catch (err) {
      console.error("Backend unreachable or error:", err);
    }
  }
});

// Handle notification button clicks
chrome.notifications.onButtonClicked.addListener(async (notificationId, buttonIndex) => {
  if (buttonIndex === 0) {
    // User clicked 'View Draft'. Open the side panel.
    // Note: sidePanel.open requires a windowId. We get the current window.
    const windows = await chrome.windows.getAll({ populate: false });
    if (windows.length > 0) {
      await chrome.sidePanel.open({ windowId: windows[0].id });
      chrome.notifications.clear(notificationId);
    }
  }
});
