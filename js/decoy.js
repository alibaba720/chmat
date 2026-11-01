// CHMAT — Decoy Screen Logic (WhatsApp Style)
(function () {
  'use strict';

  var SECRET_CODE = 'beinghuman@@';

  var input = document.getElementById('decoyInput');
  var sendBtn = document.getElementById('decoySend');
  var chatBox = document.getElementById('decoyChat');

  if (!input || !sendBtn || !chatBox) return;

  function handleSend() {
    var text = input.value.trim();
    if (text === '') return;

    // 1. Secret Code Check -> Redirect to Login Page
    if (text === SECRET_CODE) {
      input.value = '';
      input.blur();
      window.location.href = 'login.html'; 
      return;
    }

    // 2. Random Message Logic (WhatsApp Green Bubble)
    var msgRow = document.createElement('div');
    msgRow.className = 'msg-row sent';

    var msgBubble = document.createElement('div');
    msgBubble.className = 'msg-bubble';
    msgBubble.textContent = text;

    msgRow.appendChild(msgBubble);
    chatBox.appendChild(msgRow);

    input.value = '';
    chatBox.scrollTop = chatBox.scrollHeight;
  }

  sendBtn.addEventListener('click', function (e) {
    e.preventDefault();
    handleSend();
  });

  input.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSend();
    }
  });

  input.addEventListener('contextmenu', function (e) {
    e.preventDefault();
  });

})();
