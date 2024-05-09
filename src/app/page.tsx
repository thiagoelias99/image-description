"use client"

import { ProcessedAlt, processImage } from '@/actions/process-image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import Image from 'next/image';
import { FormEvent, useState } from 'react';

async function fileToGenerativePart(file: Blob) {
  const base64EncodedDataPromise = new Promise((resolve) => {
    const reader = new FileReader();
    if (!file) {
      return
    }

    if (!file.type.includes("image")) {
      alert("O arquivo selecionado não é uma imagem");
      return
    }

    if (!reader.result) {
      return
    }

    reader.onloadend = () => resolve((reader!.result! as string).split(",")[1]);
    reader.readAsDataURL(file);
  });
  return {
    inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
  };
}

export default function Home() {
  const [imageURL, setImageURL] = useState<string | null>(null);
  const [processing, setProcessing] = useState<boolean>(false);
  const [processedAlt, setProcessedAlt] = useState<ProcessedAlt | null>(null);

  async function handleFormSubmit(event: FormEvent<HTMLFormElement>) {
    // async function handleFormSubmit() {
    setProcessing(true)
    event.preventDefault();

    const form = document.getElementById("formUpload");

    if (!form) {
      return;
    }

    const formData = new FormData(form as HTMLFormElement);

    const arquivo = formData.get("arquivo");

    if (!imageURL) {
      alert("Selecione um arquivo de imagem");
      return;
    }

    const imageParts = await fileToGenerativePart(arquivo as Blob)

    processImage(imageParts)
      .then((json) => {
        setProcessedAlt(json);
        setProcessing(false)
      })
  }

  return (
    <main className='w-full h-full px-4 py-8 flex flex-col justify-start items-start gap-4'>
      <h1 className='w-full text-3xl text-foreground font-bold text-center'> Imagem para Texto</h1>
      <span className='w-full text-base text-muted text-center'>Envie uma imagem para gerar uma descrição alternativa dela</span>

      {/* {!imageURL && ( */}
      {true && (
        <div className='w-full max-w-sm flex flex-col justify-start items-start gap-4'>
          <form
            id="formUpload"
            onSubmit={(e) => handleFormSubmit(e)}
            className='w-full max-w-sm flex flex-col justify-start items-start gap-4'
          >
            <div className="grid w-full mt-2 max-w-sm items-center gap-1.5">
              <Label
                htmlFor="arquivo"
                className={imageURL ? "hidden" : ""}
              >Arquivo de imagem</Label>
              <Input
                id="arquivo"
                name='arquivo'
                type="file"
                accept="image/*"
                required
                onChange={(event) => {
                  const file = (event.target as HTMLInputElement)!.files![0];
                  if (file) {
                    setImageURL(URL.createObjectURL(file));
                  }
                }}
                className={imageURL ? "hidden" : ""}
              />
            </div>

            {imageURL && (
              <div className='w-full flex flex-col justify-start items-start gap-4'>
                <div className='relative w-full h-[280px]'>
                  <Image
                    src={imageURL}
                    alt="Picture of the author"
                    className='rounded-lg'
                    fill
                    objectFit='contain'
                  />
                </div>

                <Button
                  className={`w-full ${!imageURL || processedAlt || processing ? "hidden" : ""}`} type="submit">Analisar</Button>

                <Button
                  className={`w-full`}
                  onClick={() => {
                    setImageURL(null)
                    setProcessedAlt(null)
                  }}>Enviar outra imagem
                </Button>

                {processing && (
                  <div className='w-full flex flex-row justify-center items-center gap-4'>
                    <h2 className='text-xl text-foreground font-bold'>Processando imagem...</h2>
                    <Loader2 className=" animate-spin h-8 w-8" />
                  </div>
                )}

                {processedAlt && (
                  <div className='w-full flex flex-col justify-start items-start gap-4'>
                    <div>
                      <h2 className='w-full text-xl text-foreground font-bold text-justify'>Descrição curta</h2>
                      <p className='w-full text-base text-muted'>{processedAlt.alt}</p>
                    </div>
                    <div>
                      <h2 className='w-full text-xl text-foreground font-bold'>Descrição detalhada</h2>
                      <p className='w-full text-base text-muted text-justify'>{processedAlt.description}</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </form>
        </div>
      )}

      <p className='w-full mt-8 text-base text-muted text-center'>Desenvolvido por <a href="https://github.com/thiagoelias99" className="text-primary font-bold">Thiago Elias</a>
      </p>
    </main>
  );
}