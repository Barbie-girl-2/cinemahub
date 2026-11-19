(function () {
  'use strict';
  // Este login de frontend é apenas uma barreira visual em hospedagem estática.
  // Os arquivos públicos e o código JavaScript NÃO são protegidos pelo formulário.
  const KEY = 'cdg_site_login_v1';
  const HASH = '0f2cbe38263a4499a227f3a7195176d1bbdb7c49876da6df1e8ef02d8fdd945e';
  const root = document.documentElement;
  const gate = document.getElementById('cdgLoginGate');
  const form = document.getElementById('cdgLoginForm');
  const user = document.getElementById('cdgLoginUser');
  const pass = document.getElementById('cdgLoginPass');
  const feedback = document.getElementById('cdgLoginFeedback');
  const submit = document.getElementById('cdgLoginSubmit');
  const show = document.getElementById('cdgShowPassword');
  const forgot = document.getElementById('cdgForgotPassword');
  const recovery = document.getElementById('cdgRecoveryPanel');
  const recoveryForm = document.getElementById('cdgRecoveryForm');
  const recoveryEmail = document.getElementById('cdgRecoveryEmail');
  const recoveryFeedback = document.getElementById('cdgRecoveryFeedback');
  const recoveryResult = document.getElementById('cdgRecoveryResult');
  const backToLogin = document.getElementById('cdgBackToLogin');
  const loginTitle = document.getElementById('cdgLoginTitle');
  const loginIntro = document.querySelector('.cdg-login-intro');
  const content = document.querySelectorAll('.shell, .bottom-nav, .drawer, .drawer-overlay, .modal-backdrop');
  function setInert(locked) { content.forEach(el => { el.inert = locked; }); }
  function grantAccess() {
    root.classList.remove('cdg-auth-pending');
    setInert(false);
    if (gate) gate.setAttribute('aria-hidden', 'true');
    feedback.textContent = '';
  }
  function lock() {
    try { sessionStorage.removeItem(KEY); } catch (_) {}
    root.classList.add('cdg-auth-pending');
    setInert(true);
    if (gate) gate.removeAttribute('aria-hidden');
    pass.value = '';
    feedback.textContent = '';
    showLogin();
    window.scrollTo(0,0);
    user.focus({preventScroll:true});
  }
  try { if (sessionStorage.getItem(KEY) === '1') { grantAccess(); } else { setInert(true); user.focus({preventScroll:true}); } }
  catch (_) { setInert(true); user.focus({preventScroll:true}); }
  const encoder = new TextEncoder();
  async function digest(value) {
    // WebCrypto funciona em HTTPS (Vercel) e em localhost.
    const bytes = await crypto.subtle.digest('SHA-256', encoder.encode(value));
    return Array.from(new Uint8Array(bytes), b=>b.toString(16).padStart(2,'0')).join('');
  }
  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    if (!user.value.trim() || !pass.value) {feedback.textContent='Preencha seu usuário e sua senha.';return;}
    feedback.textContent='';
    submit.disabled=true;
    try {
      const normalizedUser = user.value.trim().toLocaleLowerCase('pt-BR');
      const normalizedPass = pass.value.trim().toLocaleLowerCase('pt-BR');
      const canonicalPass = normalizedPass === 'barbiegirl1524' ? 'barbie1524' : normalizedPass;
      const actual = await digest(normalizedUser + ':' + canonicalPass);
      if (actual !== HASH) { feedback.textContent='Usuário ou senha incorretos. Tente novamente.';pass.value='';pass.focus();return; }
      try {sessionStorage.setItem(KEY,'1');} catch (_) {}
      pass.value='';
      grantAccess();
    } catch (_) {
      feedback.textContent='Não foi possível verificar o login. Abra o site por HTTPS.';
    } finally {submit.disabled=false;}
  });
  show.addEventListener('click',function(){
    const reveal=pass.type==='password';
    pass.type=reveal?'text':'password';
    show.textContent=reveal?'Ocultar':'Mostrar';
    show.setAttribute('aria-pressed',String(reveal));
    show.setAttribute('aria-label',reveal?'Ocultar senha':'Mostrar senha');
  });
  function showRecovery() {
    form.hidden = true;
    loginTitle.hidden = true;
    if (loginIntro) loginIntro.hidden = true;
    if (loginIntro) loginIntro.hidden = false;
    recoveryResult.hidden = true;
    recoveryFeedback.textContent = '';
    recoveryEmail.value = '';
    recoveryEmail.focus({preventScroll:true});
  }
  function showLogin() {
    form.hidden = false;
    loginTitle.hidden = false;
    loginIntro.hidden = false;
    recovery.hidden = true;
    recoveryResult.hidden = true;
    recoveryFeedback.textContent = '';
    recoveryEmail.value = '';
  }
  forgot.addEventListener('click',showRecovery);
  backToLogin.addEventListener('click',function(){showLogin();user.focus({preventScroll:true});});
  recoveryForm.addEventListener('submit',function(e) {
    e.preventDefault();
    const email = recoveryEmail.value.trim();
    if (!email || !recoveryEmail.validity.valid) {
      recoveryResult.hidden = true;
      recoveryFeedback.textContent = 'Digite um e-mail válido para continuar.';
      recoveryEmail.focus();
      return;
    }
    // O e-mail não é guardado nem enviado a um serviço externo.
    // Por pedido do proprietário, qualquer e-mail em formato válido revela as credenciais públicas.
    recoveryFeedback.textContent = '';
    recoveryResult.hidden = false;
  });
  document.addEventListener('click',function (e) {
    if(e.target.closest('[data-cdg-logout]')){e.preventDefault();lock();}
  });
})();
