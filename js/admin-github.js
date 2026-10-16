// Админка: сохранение на GitHub. Сайт лежит на GitHub Pages, поэтому новый коммит сразу выкладывает новое меню.
// Ключ доступа (токен) хранится только в браузере устройства владельца. В коде и в хранилище его нет.

window.GH = (function () {
  const API = "https://api.github.com";
  // Хранилище сайта. На xasi88.github.io/timuri_dottax берётся из адреса.
  function repo() {
    const m = location.hostname.match(/^([\w-]+)\.github\.io$/);
    const path = location.pathname.split("/").filter(Boolean)[0];
    return m && path && !/\.html$/.test(path) ? { owner: m[1], name: path, branch: "main" } : { owner: "xasi88", name: "timuri_dottax", branch: "main" };
  }

  async function req(token, method, path, body) {
    const r = repo();
    const res = await fetch(`${API}/repos/${r.owner}/${r.name}${path}`, {
      method,
      headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28" },
      body: body ? JSON.stringify(body) : undefined,
      cache: "no-store",
    });
    if (!res.ok) {
      const why = { 401: "ключ неверный или истёк", 403: "у ключа нет права на запись", 404: "хранилище не найдено или ключ не даёт к нему доступа", 409: "хранилище занято, повторите", 422: "GitHub не принял данные" }[res.status];
      throw new Error(why ? `GitHub: ${why}` : `GitHub ответил ${res.status}`);
    }
    return res.status === 204 ? null : res.json();
  }

  // Ключ работает и даёт право записи в хранилище сайта
  async function check(token) {
    const info = await req(token, "GET", "");
    if (info.permissions && !info.permissions.push) throw new Error("GitHub: у ключа нет права на запись");
    return info.full_name;
  }

  // Свежий файл меню прямо из хранилища (без задержки GitHub Pages)
  async function readFile(token, path) {
    const r = repo();
    const f = await req(token, "GET", `/contents/${path}?ref=${r.branch}`);
    const bytes = Uint8Array.from(atob(f.content.replace(/\n/g, "")), (c) => c.charCodeAt(0));
    return new TextDecoder().decode(bytes);
  }

  // Один коммит с несколькими файлами. files: [{ path, text }] или [{ path, base64 }]
  async function commit(token, files, message) {
    const r = repo();
    const ref = await req(token, "GET", `/git/ref/heads/${r.branch}`);
    const head = await req(token, "GET", `/git/commits/${ref.object.sha}`);
    const tree = [];
    for (const f of files) {
      const blob = await req(token, "POST", "/git/blobs", f.base64 !== undefined ? { content: f.base64, encoding: "base64" } : { content: f.text, encoding: "utf-8" });
      tree.push({ path: f.path, mode: "100644", type: "blob", sha: blob.sha });
    }
    const t = await req(token, "POST", "/git/trees", { base_tree: head.tree.sha, tree });
    const c = await req(token, "POST", "/git/commits", { message, tree: t.sha, parents: [ref.object.sha] });
    await req(token, "PATCH", `/git/refs/heads/${r.branch}`, { sha: c.sha });
    return c.sha;
  }

  return { repo, check, readFile, commit };
})();
