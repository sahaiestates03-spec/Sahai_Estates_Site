// src/utils/submitLeadHiddenForm.ts
// Submits a hidden form POST to the Apps Script endpoint using an iframe (avoids CORS).
export default function submitLeadHiddenForm(endpoint: string, data: Record<string, string | number | undefined>) {
  return new Promise<{ result: string; message: string }>((resolve, reject) => {
    try {
      if (!endpoint) return reject(new Error("Missing endpoint URL"));

      const iframeName = "hidden-lead-iframe";
      if (!document.getElementsByName(iframeName)[0]) {
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

      // Submit then remove the form after a short time
      form.submit();
      setTimeout(() => {
        try { document.body.removeChild(form); } catch (e) {}
        resolve({ result: "ok", message: "submitted" });
      }, 4000);
    } catch (err) {
      reject(err);
    }
  });
}
