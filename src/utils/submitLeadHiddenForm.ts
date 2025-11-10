// src/utils/submitLeadHiddenForm.ts
export default function submitLeadHiddenForm(endpoint: string, data: Record<string,string|number|undefined>) {
  // endpoint: full /exec URL from Apps Script
  // data: simple flat object: keys => strings
  try {
    const iframeName = "hidden-lead-iframe";
    const existing = document.getElementsByName(iframeName)[0];
    if (!existing) {
      const iframe = document.createElement("iframe");
      iframe.name = iframeName;
      iframe.style.display = "none";
      document.body.appendChild(iframe);
    }

    const form = document.createElement("form");
    form.method = "POST";
    form.action = endpoint;
    form.target = iframeName;
    form.enctype = "application/x-www-form-urlencoded";

    Object.keys(data).forEach((k) => {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = k;
      input.value = data[k] === undefined || data[k] === null ? "" : String(data[k]);
      form.appendChild(input);
    });

    document.body.appendChild(form);
    form.submit();

    // remove form after small delay
    setTimeout(() => {
      try { document.body.removeChild(form); } catch (e) {}
    }, 8000);

    return Promise.resolve({ result: "ok", message: "submitted" });
  } catch (err) {
    return Promise.reject(err);
  }
}
