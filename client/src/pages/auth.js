

const API_BASE = 'http://localhost:3000/api';

export async function renderAuth() {
  return `
    <div class="auth-page" id="auth-page">
      <!-- Animated background -->
      <div class="auth-bg">
        <div class="auth-orb auth-orb-1"></div>
        <div class="auth-orb auth-orb-2"></div>
        <div class="auth-orb auth-orb-3"></div>
        <div class="auth-orb auth-orb-4"></div>
        <div class="auth-orb auth-orb-5"></div>
        <div class="auth-grid"></div>
      </div>

      <!-- Left branding panel -->
      <div class="auth-brand">
        <div class="auth-brand-content">
          <div class="auth-brand-logo">
            <div class="auth-brand-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M10 16l4 4 8-8"/>
                <path d="M2 12l4 4"/>
              </svg>
            </div>
            <div class="auth-brand-name">
              <span class="brand-code">Code</span><span class="brand-review">Review</span> <span class="brand-ai">AI</span>
            </div>
          </div>
          <p class="auth-brand-tagline">Ship production-ready code with confidence. AI-powered reviews that catch what humans miss.</p>

          <div class="auth-features">
            <div class="auth-feature">
              <div class="auth-feature-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              </div>
              <div>
                <h4>Security Analysis</h4>
                <p>Detect vulnerabilities, injections, and auth bypass patterns</p>
              </div>
            </div>
            <div class="auth-feature">
              <div class="auth-feature-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
              </div>
              <div>
                <h4>Real-time Reviews</h4>
                <p>Instant PR feedback via GitHub & GitLab webhooks</p>
              </div>
            </div>
            <div class="auth-feature">
              <div class="auth-feature-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              </div>
              <div>
                <h4>Performance Insights</h4>
                <p>Catch O(n²) loops, N+1 queries, and blocking calls</p>
              </div>
            </div>
          </div>

          <div class="auth-stats">
            <div class="auth-stat">
              <span class="auth-stat-value">50K+</span>
              <span class="auth-stat-label">PRs Reviewed</span>
            </div>
            <div class="auth-stat-divider"></div>
            <div class="auth-stat">
              <span class="auth-stat-value">12K+</span>
              <span class="auth-stat-label">Bugs Caught</span>
            </div>
            <div class="auth-stat-divider"></div>
            <div class="auth-stat">
              <span class="auth-stat-value">99.2%</span>
              <span class="auth-stat-label">Accuracy</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Right auth panel -->
      <div class="auth-panel">
        <div class="auth-card" id="auth-card">
          <!-- Toggle -->
          <div class="auth-toggle">
            <button class="auth-toggle-btn active" id="toggle-signin" data-mode="signin">Sign In</button>
            <button class="auth-toggle-btn" id="toggle-signup" data-mode="signup">Sign Up</button>
            <div class="auth-toggle-indicator" id="toggle-indicator"></div>
          </div>

          <!-- Form -->
          <form class="auth-form" id="signin-form" novalidate>
            <h2 class="auth-title" id="auth-title">Welcome back</h2>
            <p class="auth-subtitle" id="auth-subtitle">Sign in to your account to continue</p>

            <!-- Server error banner -->
            <div class="auth-server-error" id="server-error" style="display:none;"></div>

            <!-- Name field (signup only) -->
            <div class="auth-field auth-field-name" id="field-name" style="display: none; max-height: 0; opacity: 0;">
              <label class="auth-label" for="auth-name">Full Name</label>
              <div class="auth-input-wrapper">
                <svg class="auth-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                <input type="text" id="auth-name" class="auth-input" placeholder="John Doe" autocomplete="name" />
              </div>
              <span class="auth-error" id="error-name"></span>
            </div>

            <div class="auth-field">
              <label class="auth-label" for="auth-email">Email Address</label>
              <div class="auth-input-wrapper">
                <svg class="auth-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                <input type="email" id="auth-email" class="auth-input" placeholder="name@example.com" autocomplete="email" required />
              </div>
              <span class="auth-error" id="error-email"></span>
            </div>

            <div class="auth-field">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <label class="auth-label" for="auth-password">Password</label>
                <button type="button" class="auth-forgot" id="auth-forgot">Forgot password?</button>
              </div>
              <div class="auth-input-wrapper">
                <svg class="auth-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                <input type="password" id="auth-password" class="auth-input" placeholder="••••••••" autocomplete="current-password" required minlength="8" />
                <button type="button" class="auth-eye-btn" id="toggle-password" aria-label="Toggle password visibility">
                  <svg id="eye-open" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  <svg id="eye-closed" style="display:none;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                </button>
              </div>
              <span class="auth-error" id="error-password"></span>
              <!-- Password strength (signup only) -->
              <div class="password-strength" id="password-strength" style="display: none;">
                <div class="strength-bars">
                  <div class="strength-bar" id="str-1"></div>
                  <div class="strength-bar" id="str-2"></div>
                  <div class="strength-bar" id="str-3"></div>
                  <div class="strength-bar" id="str-4"></div>
                </div>
                <span class="strength-text" id="strength-text"></span>
              </div>
            </div>

            <!-- Confirm password (signup only) -->
            <div class="auth-field auth-field-confirm" id="field-confirm" style="display: none; max-height: 0; opacity: 0;">
              <label class="auth-label" for="auth-confirm">Confirm Password</label>
              <div class="auth-input-wrapper">
                <svg class="auth-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/><circle cx="12" cy="16" r="1"/></svg>
                <input type="password" id="auth-confirm" class="auth-input" placeholder="••••••••" autocomplete="new-password" />
              </div>
              <span class="auth-error" id="error-confirm"></span>
            </div>

            <button type="submit" class="auth-submit" id="auth-submit">
              <span class="auth-submit-text" id="submit-text">Sign In</span>
              <span class="auth-submit-loader" id="submit-loader" style="display:none;">
                <svg class="spinner" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" fill="none" stroke-dasharray="31.4 31.4" stroke-linecap="round"/></svg>
              </span>
            </button>

            <!-- Divider -->
            <div class="auth-divider">
              <span>or continue with</span>
            </div>

            <!-- Social buttons -->
            <div class="auth-social">
              <button type="button" class="auth-social-btn" id="btn-github">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>
                <span>GitHub</span>
              </button>
              <button type="button" class="auth-social-btn" id="btn-google">
                <svg viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                <span>Google</span>
              </button>
              <button type="button" class="auth-social-btn" id="btn-gitlab">
                <svg viewBox="0 0 24 24" fill="currentColor" style="color: #fc6d26;"><path d="M22.65 14.39L12 22.13 1.35 14.39a.84.84 0 0 1-.3-.94l1.22-3.78 2.44-7.51A.42.42 0 0 1 4.82 2a.43.43 0 0 1 .58 0 .42.42 0 0 1 .11.18l2.44 7.49h8.1l2.44-7.51A.42.42 0 0 1 18.6 2a.43.43 0 0 1 .58 0 .42.42 0 0 1 .11.18l2.44 7.51L23 13.45a.84.84 0 0 1-.35.94z"/></svg>
                <span>GitLab</span>
              </button>
            </div>

            <p class="auth-switch" id="auth-switch">
              Don't have an account? <a href="javascript:void(0)" id="switch-mode">Sign up</a>
            </p>
          </form>
        </div>
      </div>

      <!-- Forgot Password Modal -->
      <div class="auth-modal-overlay" id="forgot-modal" style="display:none;">
        <div class="auth-modal">
          <button type="button" class="auth-modal-close" id="forgot-close" aria-label="Close">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>

          <!-- Step 1: Enter email -->
          <div id="forgot-step-email">
            <div class="auth-modal-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            </div>
            <h3>Reset your password</h3>
            <p>Enter your email address to verify your account.</p>
            <div class="auth-field" style="margin-bottom: 20px;">
              <div class="auth-input-wrapper">
                <svg class="auth-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                <input type="email" id="forgot-email" class="auth-input" placeholder="name@example.com" />
              </div>
              <span class="auth-error" id="forgot-email-error" style="display:none;"></span>
            </div>
            <button type="button" class="auth-submit" id="forgot-submit" style="margin-top: 0;">
              <span id="forgot-submit-text">Continue</span>
              <span id="forgot-loader" style="display:none;"><svg class="spinner" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" fill="none" stroke-dasharray="31.4 31.4" stroke-linecap="round"/></svg></span>
            </button>
            <div class="auth-server-error" id="forgot-server-error" style="display:none;"></div>
          </div>

          <!-- Step 2: New password -->
          <div id="forgot-step-password" style="display:none;">
            <div class="auth-modal-icon" style="background: rgba(52,211,153,0.12); color: #34d399;">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            </div>
            <h3>Set new password</h3>
            <p>Enter your new password below.</p>
            <div class="auth-field" style="margin-bottom: 12px;">
              <label class="auth-label" for="reset-new-password">New Password</label>
              <div class="auth-input-wrapper">
                <svg class="auth-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                <input type="password" id="reset-new-password" class="auth-input" placeholder="••••••••" minlength="8" />
              </div>
              <span class="auth-error" id="reset-password-error" style="display:none;"></span>
            </div>
            <div class="auth-field" style="margin-bottom: 20px;">
              <label class="auth-label" for="reset-confirm-password">Confirm Password</label>
              <div class="auth-input-wrapper">
                <svg class="auth-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/><circle cx="12" cy="16" r="1"/></svg>
                <input type="password" id="reset-confirm-password" class="auth-input" placeholder="••••••••" />
              </div>
              <span class="auth-error" id="reset-confirm-error" style="display:none;"></span>
            </div>
            <button type="button" class="auth-submit" id="reset-submit" style="margin-top: 0;">
              <span id="reset-submit-text">Reset Password</span>
              <span id="reset-loader" style="display:none;"><svg class="spinner" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" fill="none" stroke-dasharray="31.4 31.4" stroke-linecap="round"/></svg></span>
            </button>
            <div class="auth-server-error" id="reset-server-error" style="display:none;"></div>
          </div>

          <!-- Step 3: Success -->
          <div class="auth-modal-success" id="forgot-success" style="display:none;">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            <p>Password reset successfully!</p>
            <button type="button" class="auth-submit" id="forgot-back-to-signin" style="margin-top: 16px; background: linear-gradient(135deg, #34d399, #059669);">
              <span>Back to Sign In</span>
            </button>
          </div>
        </div>
      </div>
    </div>`;
}

export function initAuth() {
  let mode = 'signin';

  const toggleSignin = document.getElementById('toggle-signin');
  const toggleSignup = document.getElementById('toggle-signup');
  const indicator = document.getElementById('toggle-indicator');
  const authTitle = document.getElementById('auth-title');
  const authSubtitle = document.getElementById('auth-subtitle');
  const submitText = document.getElementById('submit-text');
  const switchLink = document.getElementById('switch-mode');
  const authSwitch = document.getElementById('auth-switch');
  const authForgot = document.getElementById('auth-forgot');
  const fieldName = document.getElementById('field-name');
  const fieldConfirm = document.getElementById('field-confirm');
  const passwordStrength = document.getElementById('password-strength');
  const form = document.getElementById('signin-form');
  const passwordInput = document.getElementById('auth-password');
  const confirmInput = document.getElementById('auth-confirm');
  const emailInput = document.getElementById('auth-email');
  const nameInput = document.getElementById('auth-name');
  const serverError = document.getElementById('server-error');

  function setMode(newMode) {
    mode = newMode;
    const isSignup = mode === 'signup';

    toggleSignin.classList.toggle('active', !isSignup);
    toggleSignup.classList.toggle('active', isSignup);
    indicator.style.transform = isSignup ? 'translateX(100%)' : 'translateX(0)';

    authTitle.textContent = isSignup ? 'Create account' : 'Welcome back';
    authSubtitle.textContent = isSignup
      ? 'Start reviewing code with AI today'
      : 'Sign in to your account to continue';
    submitText.textContent = isSignup ? 'Create Account' : 'Sign In';
    authSwitch.innerHTML = isSignup
      ? 'Already have an account? <a href="javascript:void(0)" id="switch-mode">Sign in</a>'
      : 'Don\'t have an account? <a href="javascript:void(0)" id="switch-mode">Sign up</a>';

    authForgot.style.display = isSignup ? 'none' : 'inline-block';

    animateField(fieldName, isSignup);
    animateField(fieldConfirm, isSignup);
    passwordStrength.style.display = isSignup ? 'flex' : 'none';

    document.getElementById('switch-mode')?.addEventListener('click', (e) => {
      e.preventDefault();
      setMode(mode === 'signin' ? 'signup' : 'signin');
    });

    clearErrors();
    hideServerError();
  }

  function animateField(el, show) {
    if (show) {
      el.style.display = 'block';
      requestAnimationFrame(() => {
        el.style.maxHeight = '120px';
        el.style.opacity = '1';
        el.style.marginBottom = '0';
      });
    } else {
      el.style.maxHeight = '0';
      el.style.opacity = '0';
      setTimeout(() => { el.style.display = 'none'; }, 350);
    }
  }

  
  toggleSignin.addEventListener('click', () => setMode('signin'));
  toggleSignup.addEventListener('click', () => setMode('signup'));
  switchLink?.addEventListener('click', (e) => {
    e.preventDefault();
    setMode('signup');
  });

  
  const togglePwdBtn = document.getElementById('toggle-password');
  const eyeOpen = document.getElementById('eye-open');
  const eyeClosed = document.getElementById('eye-closed');

  togglePwdBtn?.addEventListener('click', () => {
    const isPassword = passwordInput.type === 'password';
    passwordInput.type = isPassword ? 'text' : 'password';
    eyeOpen.style.display = isPassword ? 'none' : 'block';
    eyeClosed.style.display = isPassword ? 'block' : 'none';
  });

  
  passwordInput?.addEventListener('input', () => {
    if (mode !== 'signup') return;
    const val = passwordInput.value;
    const score = calcStrength(val);
    updateStrengthUI(score);
  });

  function calcStrength(pwd) {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (pwd.length >= 12) score++;
    if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return Math.min(score, 4);
  }

  function updateStrengthUI(score) {
    const colors = ['', '#ff3b5c', '#ff8a35', '#ffc23a', '#34d399'];
    const labels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
    for (let i = 1; i <= 4; i++) {
      const bar = document.getElementById(`str-${i}`);
      bar.style.background = i <= score ? colors[score] : 'rgba(255,255,255,0.1)';
    }
    document.getElementById('strength-text').textContent = labels[score] || '';
    document.getElementById('strength-text').style.color = colors[score] || '';
  }

  
  function showServerError(msg) {
    serverError.textContent = msg;
    serverError.style.display = 'block';
    serverError.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function hideServerError() {
    serverError.style.display = 'none';
    serverError.textContent = '';
  }

  
  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function showError(id, msg) {
    const el = document.getElementById(id);
    if (el) {
      el.textContent = msg;
      el.style.display = 'block';
    }
  }

  function clearErrors() {
    document.querySelectorAll('.auth-error').forEach((el) => {
      el.textContent = '';
      el.style.display = 'none';
    });
    document.querySelectorAll('.auth-input-wrapper').forEach((w) => w.classList.remove('error'));
  }

  
  function saveSession(user) {
    localStorage.setItem('cr_authenticated', 'true');
    localStorage.setItem('cr_user', JSON.stringify(user));
  }

  
  function setLoading(loading) {
    const submitBtn = document.getElementById('auth-submit');
    const submitTextEl = document.getElementById('submit-text');
    const loader = document.getElementById('submit-loader');

    submitBtn.disabled = loading;
    submitTextEl.style.display = loading ? 'none' : 'inline';
    loader.style.display = loading ? 'flex' : 'none';
  }

  
  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearErrors();
    hideServerError();

    const email = emailInput.value.trim();
    const password = passwordInput.value;
    let valid = true;

    if (!email || !validateEmail(email)) {
      showError('error-email', 'Please enter a valid email address');
      emailInput.closest('.auth-input-wrapper').classList.add('error');
      valid = false;
    }

    if (!password || password.length < 8) {
      showError('error-password', 'Password must be at least 8 characters');
      passwordInput.closest('.auth-input-wrapper').classList.add('error');
      valid = false;
    }

    if (mode === 'signup') {
      const name = nameInput.value.trim();
      if (!name) {
        showError('error-name', 'Please enter your name');
        valid = false;
      }

      const confirm = confirmInput.value;
      if (password !== confirm) {
        showError('error-confirm', 'Passwords do not match');
        confirmInput.closest('.auth-input-wrapper').classList.add('error');
        valid = false;
      }
    }

    if (!valid) return;

    setLoading(true);

    try {
      const endpoint = mode === 'signup' ? '/auth/register' : '/auth/login';
      const body = mode === 'signup'
        ? { name: nameInput.value.trim(), email, password }
        : { email, password };

      const response = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        setLoading(false);
        showServerError(data.error || 'Something went wrong. Please try again.');
        return;
      }

      
      saveSession(data.user);

      setLoading(false);
      showSuccessAnimation(() => {
        window.location.hash = '/';
      });
    } catch (err) {
      setLoading(false);
      showServerError('Unable to connect to server. Please check if the server is running.');
    }
  });

  
  document.querySelectorAll('.auth-social-btn').forEach((btn) => {
    btn.addEventListener('click', async (e) => {
      
      const rect = btn.getBoundingClientRect();
      const ripple = document.createElement('span');
      ripple.className = 'social-ripple';
      ripple.style.left = `${e.clientX - rect.left}px`;
      ripple.style.top = `${e.clientY - rect.top}px`;
      btn.appendChild(ripple);
      setTimeout(() => ripple.remove(), 600);

      btn.classList.add('pressed');

      const provider = btn.id.replace('btn-', '');
      const demoEmail = `user@${provider}.demo`;
      const demoName = `${provider.charAt(0).toUpperCase() + provider.slice(1)} User`;

      try {
        const response = await fetch(`${API_BASE}/auth/social`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ provider, email: demoEmail, name: demoName }),
        });

        const data = await response.json();

        if (response.ok) {
          saveSession(data.user);
          setTimeout(() => {
            btn.classList.remove('pressed');
            showSuccessAnimation(() => { window.location.hash = '/'; });
          }, 600);
        } else {
          btn.classList.remove('pressed');
          showServerError(data.error || 'Social login failed.');
        }
      } catch (err) {
        btn.classList.remove('pressed');
        showServerError('Unable to connect to server.');
      }
    });
  });

  
  const forgotModal = document.getElementById('forgot-modal');
  const forgotClose = document.getElementById('forgot-close');
  const forgotSubmit = document.getElementById('forgot-submit');
  const forgotEmail = document.getElementById('forgot-email');
  const forgotSuccess = document.getElementById('forgot-success');
  const forgotStepEmail = document.getElementById('forgot-step-email');
  const forgotStepPassword = document.getElementById('forgot-step-password');
  const resetSubmit = document.getElementById('reset-submit');
  const backToSignin = document.getElementById('forgot-back-to-signin');

  let resetToken = null;

  function resetForgotModal() {
    
    forgotStepEmail.style.display = 'block';
    forgotStepPassword.style.display = 'none';
    forgotSuccess.style.display = 'none';
    forgotSubmit.style.display = 'flex';
    document.getElementById('forgot-submit-text').style.display = 'inline';
    document.getElementById('forgot-loader').style.display = 'none';
    document.getElementById('forgot-server-error').style.display = 'none';
    document.getElementById('forgot-email-error').style.display = 'none';
    resetToken = null;
  }

  authForgot?.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    resetForgotModal();
    forgotEmail.value = emailInput.value || '';
    forgotModal.style.display = 'flex';
    setTimeout(() => forgotModal.classList.add('active'), 10);
    forgotEmail.focus();
  });

  function closeForgotModal() {
    forgotModal.classList.remove('active');
    setTimeout(() => { forgotModal.style.display = 'none'; }, 300);
  }

  forgotClose?.addEventListener('click', closeForgotModal);
  forgotModal?.addEventListener('click', (e) => {
    if (e.target === forgotModal) closeForgotModal();
  });

  
  forgotSubmit?.addEventListener('click', async () => {
    const email = forgotEmail.value.trim();
    const emailError = document.getElementById('forgot-email-error');
    const serverError = document.getElementById('forgot-server-error');

    emailError.style.display = 'none';
    serverError.style.display = 'none';

    if (!email || !validateEmail(email)) {
      emailError.textContent = 'Please enter a valid email address';
      emailError.style.display = 'block';
      forgotEmail.closest('.auth-input-wrapper').classList.add('error');
      return;
    }
    forgotEmail.closest('.auth-input-wrapper').classList.remove('error');

    
    document.getElementById('forgot-submit-text').style.display = 'none';
    document.getElementById('forgot-loader').style.display = 'flex';
    forgotSubmit.disabled = true;

    try {
      const response = await fetch(`${API_BASE}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      document.getElementById('forgot-submit-text').style.display = 'inline';
      document.getElementById('forgot-loader').style.display = 'none';
      forgotSubmit.disabled = false;

      if (data.token) {
        
        resetToken = data.token;
        forgotStepEmail.style.display = 'none';
        forgotStepPassword.style.display = 'block';
        document.getElementById('reset-new-password').focus();
      } else {
        
        serverError.textContent = 'No account found with this email address.';
        serverError.style.display = 'block';
      }
    } catch (err) {
      document.getElementById('forgot-submit-text').style.display = 'inline';
      document.getElementById('forgot-loader').style.display = 'none';
      forgotSubmit.disabled = false;
      serverError.textContent = 'Unable to connect to server. Please try again.';
      serverError.style.display = 'block';
    }
  });

  
  resetSubmit?.addEventListener('click', async () => {
    const newPwd = document.getElementById('reset-new-password').value;
    const confirmPwd = document.getElementById('reset-confirm-password').value;
    const pwdError = document.getElementById('reset-password-error');
    const confirmError = document.getElementById('reset-confirm-error');
    const serverError = document.getElementById('reset-server-error');

    pwdError.style.display = 'none';
    confirmError.style.display = 'none';
    serverError.style.display = 'none';

    let valid = true;

    if (!newPwd || newPwd.length < 8) {
      pwdError.textContent = 'Password must be at least 8 characters';
      pwdError.style.display = 'block';
      valid = false;
    }

    if (newPwd !== confirmPwd) {
      confirmError.textContent = 'Passwords do not match';
      confirmError.style.display = 'block';
      valid = false;
    }

    if (!valid) return;

    
    document.getElementById('reset-submit-text').style.display = 'none';
    document.getElementById('reset-loader').style.display = 'flex';
    resetSubmit.disabled = true;

    try {
      const response = await fetch(`${API_BASE}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: resetToken, newPassword: newPwd }),
      });

      const data = await response.json();

      document.getElementById('reset-submit-text').style.display = 'inline';
      document.getElementById('reset-loader').style.display = 'none';
      resetSubmit.disabled = false;

      if (response.ok) {
        
        forgotStepPassword.style.display = 'none';
        forgotSuccess.style.display = 'flex';
      } else {
        serverError.textContent = data.error || 'Password reset failed. Please try again.';
        serverError.style.display = 'block';
      }
    } catch (err) {
      document.getElementById('reset-submit-text').style.display = 'inline';
      document.getElementById('reset-loader').style.display = 'none';
      resetSubmit.disabled = false;
      serverError.textContent = 'Unable to connect to server. Please try again.';
      serverError.style.display = 'block';
    }
  });

  
  backToSignin?.addEventListener('click', () => {
    closeForgotModal();
    setMode('signin');
  });

  
  document.querySelectorAll('.auth-input').forEach((input) => {
    input.addEventListener('focus', () => {
      input.closest('.auth-input-wrapper')?.classList.add('focused');
    });
    input.addEventListener('blur', () => {
      input.closest('.auth-input-wrapper')?.classList.remove('focused');
    });
  });

  function showSuccessAnimation(callback) {
    const card = document.getElementById('auth-card');
    card.classList.add('auth-success');
    setTimeout(callback, 800);
  }
}
