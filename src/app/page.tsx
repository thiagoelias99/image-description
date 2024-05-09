"use client"

import { processImage } from '@/actions/process-image';

async function fileToGenerativePart(file) {
  const base64EncodedDataPromise = new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result.split(",")[1]);
    reader.readAsDataURL(file);
  });
  return {
    inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
  };
}

export default function Home() {
  async function handleFormSubmit(event: Event) {
    event.preventDefault();

    const form = document.getElementById("formUpload");
    const formData = new FormData(form);

    const arquivo = formData.get("arquivo");

    const preview = document.getElementById("preview");
    preview!.innerHTML = "";

    const img = document.createElement("img");
    img.src = URL.createObjectURL(arquivo);
    img.alt = "Imagem enviada";
    img.width = 200;
    preview!.appendChild(img);

    const imageParts = await fileToGenerativePart(arquivo)

    processImage(imageParts as FileDataPart)
      .then((json) => {
        alert(json);
      })
  }

  return (
    <main>
      <h1>Upload de Imagem</h1>

      <form id="formUpload" onSubmit={handleFormSubmit}>
        <input type="file" id="arquivo" name="arquivo" accept="image/*" required />
        <button type="submit">Enviar</button>

        <div id="preview"></div>
      </form>
    </main>
  );
}