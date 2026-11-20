
const API_URL = "https://script.google.com/macros/s/AKfycbzI-c4rRJMrPWdkux4NJ5-RaFelK8qNVWeCjB9oa19o3AJHd7RwPWILIc_KfVU4OzMSKQ/exec";

const consultaForm = document.getElementById("consultaForm");
const mensaje = document.getElementById("mensaje");

let consultaEnProceso = false;

// Crear un iframe oculto para recibir la respuesta de Apps Script.
const iframe = document.createElement("iframe");
iframe.name = "respuestaConsultaINJUVE";
iframe.style.display = "none";
iframe.title = "Respuesta del servicio de consulta";
document.body.appendChild(iframe);

// Recibir la respuesta enviada por Google Apps Script.
window.addEventListener("message", (event) => {
  const data = event.data;

  if (!data || data.tipo !== "INJUVE_CONSULTA") return;

  if (!data || data.tipo !== "INJUVE_CONSULTA") return;

  consultaEnProceso = false;

  const boton = consultaForm.querySelector('[type="submit"]');
  if (boton) boton.disabled = false;

  mostrarResultado(data.resultado);
});

function mostrarMensaje(texto, color = "#293b98") {
  mensaje.textContent = texto;
  mensaje.style.color = color;
}

function mostrarResultado(resultado) {
  if (!resultado || typeof resultado !== "object") {
    mostrarMensaje("No se recibió una respuesta válida del servicio.", "#b42318");
    return;
  }

  if (!resultado.correcto) {
    mostrarMensaje(
      resultado.mensaje || "No se pudo validar la consulta. Verifica tus datos.",
      "#b42318"
    );
    return;
  }

  const fecha = resultado.ultimaActualizacion
    ? new Date(resultado.ultimaActualizacion)
    : null;

  const fechaTexto =
    fecha && !Number.isNaN(fecha.getTime())
      ? fecha.toLocaleString("es-HN", {
          dateStyle: "medium",
          timeStyle: "short"
        })
      : "No disponible";

  mensaje.textContent =
    "Estado de la denuncia: " + resultado.estado +
    " | Última actualización: " + fechaTexto;

  mensaje.style.color = "#293b98";
}

consultaForm.addEventListener("submit", (event) => {
  event.preventDefault();

  if (consultaEnProceso) return;

  const codigo = document.getElementById("codigo").value.trim();
  const clave = document.getElementById("clave").value.trim();

  if (!codigo || !clave) {
    mostrarMensaje("Ingresa el código y la clave privada.", "#b42318");
    return;
  }

  if (!/^INJ-\d{4}-[A-Z0-9]{8}$/.test(codigo)) {
    mostrarMensaje("El formato del código de seguimiento no es válido.", "#b42318");
    return;
  }

  if (!/^[a-fA-F0-9]{64}$/.test(clave)) {
    mostrarMensaje("El formato de la clave privada no es válido.", "#b42318");
    return;
  }

  consultaEnProceso = true;

  const boton = consultaForm.querySelector('[type="submit"]');
  if (boton) boton.disabled = true;

  mostrarMensaje("Consultando el estado de tu denuncia...");

  // Crear formulario temporal para enviar los datos mediante POST.
  const formularioEnvio = document.createElement("form");
  formularioEnvio.method = "POST";
  formularioEnvio.action = API_URL;
  formularioEnvio.target = iframe.name;
  formularioEnvio.style.display = "none";

  const campoCodigo = document.createElement("input");
  campoCodigo.type = "hidden";
  campoCodigo.name = "codigo";
  campoCodigo.value = codigo;

  const campoClave = document.createElement("input");
  campoClave.type = "hidden";
  campoClave.name = "clave";
  campoClave.value = clave;

  formularioEnvio.appendChild(campoCodigo);
  formularioEnvio.appendChild(campoClave);

  document.body.appendChild(formularioEnvio);
  formularioEnvio.submit();
  formularioEnvio.remove();
});
