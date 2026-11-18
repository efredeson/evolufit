/* EvoluFit: authentication and private synchronization.
   Configuration is supplied by config.js with a publishable key only. */
(() => {
  "use strict";
  const cfg = window.EVOLUFIT_SUPABASE || {};
  if (!cfg.url || !cfg.publishableKey) return;
  const root = document.getElementById("auth-root");
  const app = window.EvoluApp;
  const api = {
    enabled: true, active: false, user: null, scheduleSave, photoOp, decorateNav, signOut
  };
  window.EvoluCloud = api;
  let client, session = null, mode = "login", busy = false;
  let pending = null, dirty = false, writing = false, saveTimer = null;
  let loadingUser = null;
  let recoveryPending = /(?:[?#&])type=recovery(?:&|$)/.test(location.href);

  const safe = x => String(x ?? "").replace(/[&<>"']/g, c => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
  })[c]);
  const setMessage = (message, kind = "info") => {
    const node = root.querySelector("#auth-message");
    if (node) { node.textContent = message; node.dataset.kind = kind; }
  };
  // The root URL is currently allow-listed in the Supabase dashboard.
  // Return to the currently deployed Beta path (GitHub Pages or Vercel).
  const redirect = () => new URL("./", window.location.href).href;
  const show = () => {
    root.hidden = false;
    document.documentElement.classList.add("cloud-pending");
  };
  function showWelcome() {
    show();
    root.innerHTML = '<div class="efm-auth-splash">'+
      '<div class="efm-splash-mark"><img src="../assets/evolufit-gatinho-hd.webp" alt="Gatinho treinador EvoluFit"></div>'+
      '<div class="efm-splash-wordmark">Evolu<span>Fit</span></div>'+
      '<p class="efm-splash-slogan">Sua evolução é a missão</p>'+
      '<div class="efm-splash-heart">⌁ ── ◆ ── ⌁</div>'+
      '<div class="efm-splash-actions">'+
      '<button class="cloud-primary" type="button" id="efm-enter">▶ ENTRAR</button>'+
      '<button class="efm-splash-register" type="button" id="efm-signup">CRIAR CONTA</button>'+
      '</div><p class="efm-splash-footnote">Treinos em casa • Caminhadas • Sua evolução</p></div>';
    root.querySelector("#efm-enter").addEventListener("click", () => showForm("login"));
    root.querySelector("#efm-signup").addEventListener("click", () => showForm("signup"));
  }
  function formMarkup() {
    const recovery = mode === "recover";
    const update = mode === "update";
    const signup = mode === "signup";
    return '<div class="cloud-auth-panel"><img class="cloud-cat" src="../assets/evolufit-marca-hd.webp?v=5" alt="Mascote EvoluFit">' +
      '<p class="cloud-slogan">Sua evolução é a missão.</p>' +
      '<h1>' + (recovery?"Recuperar senha":update?"Nova senha":signup?"Criar minha conta":"Entrar no EvoluFit") + '</h1>' +
      '<p class="cloud-subtitle">Treinos em casa, caminhadas e seus hábitos em um espaço privado.</p>' +
      '<form id="auth-form" class="cloud-auth-form">' +
      (!update ? '<label for="auth-email">E-mail</label><input id="auth-email" name="email" type="email" autocomplete="email" required maxlength="180" placeholder="voce@exemplo.com">' : '') +
      (!recovery ? '<label for="auth-password">Senha</label><input id="auth-password" name="password" type="password" autocomplete="' + (update?"new-password":signup?"new-password":"current-password") + '" minlength="8" maxlength="128" required placeholder="Mínimo de 8 caracteres">' : '') +
      '<button class="cloud-primary" type="submit">' + (recovery?"Enviar link":update?"Alterar senha":signup?"Criar conta":"Entrar") + '</button></form>' +
      '<div id="auth-message" role="status" aria-live="polite"></div>' +
      '<div class="cloud-auth-links">' +
      (mode !== "login" ? '<button type="button" data-auth-mode="login">Voltar ao login</button>' : '') +
      (mode === "login" ? '<button type="button" data-auth-mode="signup">Criar conta</button><button type="button" data-auth-mode="recover">Esqueci minha senha</button>' : '') +
      '</div><p class="cloud-privacy">🔒 Seus registros ficam vinculados à sua conta. Nunca publique fotos íntimas ou dados pessoais em páginas públicas.</p></div>';
  }
  function showForm(newMode = mode) {
    mode = newMode;
    show();
    root.innerHTML = formMarkup();
    root.scrollTop = 0; // Trocas de tela não herdam a rolagem do formulário anterior.
    root.querySelectorAll("[data-auth-mode]").forEach(button => {
      button.addEventListener("click", () => showForm(button.dataset.authMode));
    });
    root.querySelector("#auth-form").addEventListener("submit", submitAuth);
  }
  function showLoading(msg) {
    show();
    root.innerHTML = '<div class="cloud-auth-panel cloud-loading"><div class="cloud-spinner"></div><strong>' + safe(msg) + '</strong></div>';
  }
  function fail(msg) {
    show();
    root.innerHTML = '<div class="cloud-auth-panel"><h2>Não foi possível conectar</h2><p>' + safe(msg) +
      '</p><button class="cloud-primary" type="button" id="auth-retry">Tentar novamente</button></div>';
    root.querySelector("#auth-retry").addEventListener("click", () => location.reload());
  }
  async function submitAuth(event) {
    event.preventDefault();
    if (busy) return;
    const form = event.currentTarget;
    const fd = new FormData(form);
    const email = String(fd.get("email") || "").trim().toLowerCase();
    const password = String(fd.get("password") || "");
    busy = true;
    form.querySelector("button[type=submit]").disabled = true;
    setMessage("Processando...");
    try {
      let response;
      if (mode === "signup") {
        response = await client.auth.signUp({email,password,options:{emailRedirectTo:redirect()}});
        if (response.error) throw response.error;
        setMessage("Cadastro enviado! Confirme seu e-mail para entrar (confira também o spam).","success");
        if (response.data?.session) await activate(response.data.session);
      } else if (mode === "login") {
        response = await client.auth.signInWithPassword({email,password});
        if (response.error) throw response.error;
        await activate(response.data.session);
      } else if (mode === "recover") {
        response = await client.auth.resetPasswordForEmail(email,{redirectTo:redirect()});
        if (response.error) throw response.error;
        setMessage("Se o e-mail estiver cadastrado, você receberá um link de recuperação.","success");
      } else if (mode === "update") {
        response = await client.auth.updateUser({password});
        if (response.error) throw response.error;
        recoveryPending = false;
        mode = "login";
        setMessage("Senha alterada.","success");
        await activate((await client.auth.getSession()).data.session);
      }
    } catch (e) {
      setMessage(e.message || "Não foi possível completar a operação.","error");
    } finally {
      busy = false;
      const submit = root.querySelector("button[type=submit]");
      if (submit) submit.disabled = false;
    }
  }
  async function activate(nextSession) {
    if (!nextSession?.user) { deactivate(); return; }
    const uid = nextSession.user.id;
    if (api.active && api.user?.id === uid) return;
    if (loadingUser === uid) return;
    loadingUser = uid;
    api.active = false;
    session = nextSession;
    showLoading("Carregando seus registros protegidos...");
    try {
      const {data:row,error} = await client.from("ef_user_state").select("payload").eq("user_id",uid).maybeSingle();
      if (error) throw error;
      if (session?.user?.id !== uid) return;
      api.user = nextSession.user;
      app.setData(row?.payload || app.defaultData());
      api.active = true;
      root.hidden = true;
      document.documentElement.classList.remove("cloud-pending");
      app.render();
    } catch (e) {
      fail("Os dados não puderam ser carregados. Verifique a conexão e a configuração do banco de dados. " + (e.message || ""));
    } finally {
      loadingUser = null;
    }
  }
  function deactivate() {
    session = null;
    api.user = null;
    api.active = false;
    dirty = false;
    pending = null;
    clearTimeout(saveTimer);
    app.setData(app.defaultData());
    showWelcome();
  }
  function decorateNav() {
    if (!api.active) return;
    const bar = document.getElementById("topbar");
    if (!bar) return;
    const btn = document.createElement("button");
    btn.className = "cloud-account";
    btn.type = "button";
    btn.textContent = "Sair da conta";
    btn.title = api.user?.email || "Minha conta";
    btn.addEventListener("click", signOut);
    const sidebarFooter = document.querySelector("#sidebar .sidebarfoot");
    if (sidebarFooter) {btn.classList.add("efm-logout");sidebarFooter.appendChild(btn);}
    else bar.appendChild(btn);
  }
  function scheduleSave(payload) {
    if (!api.active || !api.user) return;
    pending = JSON.stringify(payload);
    dirty = true;
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => { void flush(); }, 900);
  }
  async function flush() {
    if (writing) {
      while (writing) await new Promise(resolve => setTimeout(resolve,50));
      if (dirty) return flush();
      return;
    }
    if (!dirty || !session?.user) return;
    writing = true;
    while (dirty && session?.user) {
      dirty = false;
      const snapshot = JSON.parse(pending);
      const userId = session.user.id;
      try {
        const {error} = await client.from("ef_user_state").upsert(
          {user_id:userId,payload:snapshot,updated_at:new Date().toISOString()},
          {onConflict:"user_id"}
        );
        if (error) throw error;
      } catch (e) {
        dirty = true;
        app.showToast("Não foi possível sincronizar. Confira sua internet e tente novamente.");
        break;
      }
    }
    writing = false;
  }
  async function signOut() {
    clearTimeout(saveTimer);
    await flush();
    if (dirty) { app.showToast("Há alterações não sincronizadas. Tente novamente com internet."); return; }
    const {error} = await client.auth.signOut();
    if (error) { app.showToast("Não foi possível sair. Tente novamente."); return; }
    deactivate();
  }
  async function photoOp(mode, item) {
    if (!api.active || !session?.user) throw new Error("É necessário entrar na conta.");
    const uid = session.user.id;
    const bucket = client.storage.from("evolufit-photos");
    if (mode === "get") {
      const {data:rows,error} = await client.from("ef_photos")
        .select("id,date,note,object_path").eq("user_id",uid)
        .order("date",{ascending:false}).limit(25);
      if (error) throw error;
      const result = await Promise.all((rows || []).map(async row => {
        const {data:blob,error:downloadError} = await bucket.download(row.object_path);
        if (downloadError) return null;
        return {id:row.id,date:row.date,note:row.note,blob};
      }));
      return result.filter(Boolean);
    }
    if (mode === "put") {
      const file = item.blob;
      const types = {"image/jpeg":"jpg","image/png":"png","image/webp":"webp"};
      const ext = types[file?.type];
      if (!ext || !file.size || file.size > 8*1024*1024) throw new Error("Formato ou tamanho inválido.");
      const photoId = crypto.randomUUID();
      const path = uid + "/" + photoId + "." + ext;
      const {error:uploadError} = await bucket.upload(path,file,{contentType:file.type,upsert:false});
      if (uploadError) throw uploadError;
      const {error:insertError} = await client.from("ef_photos").insert({
        id:photoId,user_id:uid,date:item.date,note:item.note || "",object_path:path
      });
      if (insertError) { await bucket.remove([path]); throw insertError; }
      return {id:photoId};
    }
    if (mode === "delete") {
      const {data:row,error:getError} = await client.from("ef_photos")
        .select("object_path").eq("user_id",uid).eq("id",item).single();
      if (getError) throw getError;
      const {error:deleteFileError} = await bucket.remove([row.object_path]);
      if (deleteFileError) throw deleteFileError;
      const {error:deleteRowError} = await client.from("ef_photos")
        .delete().eq("user_id",uid).eq("id",item);
      if (deleteRowError) throw deleteRowError;
      return true;
    }
    if (mode === "clear") throw new Error("Apague as fotos individualmente antes de encerrar a conta.");
    throw new Error("Operação não suportada.");
  }
  if (!window.supabase?.createClient) {
    fail("A biblioteca do Supabase não carregou. Verifique sua conexão.");
    return;
  }
  client = window.supabase.createClient(cfg.url,cfg.publishableKey,{
    auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}
  });
  showLoading("Verificando sua conta...");
  client.auth.onAuthStateChange((event,nextSession) => {
    if (event === "PASSWORD_RECOVERY") {
      recoveryPending = true;
      setTimeout(() => showForm("update"),0);
    } else if (event === "SIGNED_OUT") {
      setTimeout(deactivate,0);
    } else if (event === "SIGNED_IN" && nextSession && !recoveryPending) {
      setTimeout(() => { void activate(nextSession); },0);
    }
  });
  client.auth.getSession().then(({data,error})=>{
    if (error) throw error;
    if (recoveryPending) return showForm("update");
    if (data.session) return activate(data.session);
    showWelcome();
  }).catch(e=>fail(e.message || "Falha ao consultar sua sessão."));
})();