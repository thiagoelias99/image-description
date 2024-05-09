"use client"

import { ProcessedAlt, processImage } from '@/actions/process-image';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ImageUp, Loader2, TriangleAlert } from 'lucide-react';
import Image from 'next/image';
import { FormEvent, useState } from 'react';

async function fileToGenerativePart(file: Blob) {
  const base64EncodedDataPromise = new Promise((resolve) => {
    const reader = new FileReader();
    if (!file) {
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
    setProcessing(true)
    event.preventDefault();

    const form = document.getElementById("formUpload");

    if (!form) {
      setProcessing(false)
      return;
    }

    const formData = new FormData(form as HTMLFormElement);

    const arquivo = formData.get("arquivo");

    if (!imageURL) {
      alert("Selecione um arquivo de imagem");
      return;
    }

    const imageParts = await fileToGenerativePart(arquivo as Blob)

    try {
      processImage(imageParts)
        .then((json) => {
          console.log(json)
          setProcessedAlt(json);
          setProcessing(false)
        })
    } catch (error) {
      console.error(error)
      alert("Erro ao processar imagem")
    }
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
            <div className="flex w-full mt-2 max-w-sm justify-center items-center gap-1.5">
              <Label
                htmlFor="arquivo"
                className={`w-full h-[280px] flex flex-row justify-center items-center border-[1.5px] rounded-xl ${imageURL ? "hidden" : ""}`}
              >
                <div className='flex flex-col justify-center items-center gap-4'>
                  <ImageUp className="h-20 w-20 stroke-muted stroke-1" />
                  <p className='text-base text-muted'>Toque para enviar uma imagem</p>
                </div>
              </Label>
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
                className="hidden"
              />
            </div>

            {imageURL && (
              <div className='w-full flex flex-col justify-start items-start gap-4'>
                <div className='relative w-full h-[280px]'>
                  <Image
                    src={imageURL}
                    alt="Imagem carregada pelo usuário"
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
                    <Card className='w-full p-4'>
                      <h2 className='w-full text-xl text-foreground font-bold text-justify'>Descrição curta</h2>
                      <p className='w-full text-base text-muted'>{processedAlt.alt}</p>
                    </Card>
                    <Card className='w-full p-4'>
                      <h2 className='w-full text-xl text-foreground font-bold'>Descrição detalhada</h2>
                      <p className='w-full text-base text-muted text-justify'>{processedAlt.description}</p>
                    </Card>
                    <Card className='w-full p-4 bg-[#f6f3d9]'>
                      <div className='w-full flex justify-center items-center gap-2'>
                        <TriangleAlert className='w-6 h-6 text-primary stroke-[#8d703f]' />
                        <h2 className='text-sm font-semibold text-center text-foreground text-[#8d703f]'>Conteúdo Gerado por Inteligência Artificial</h2>
                      </div>
                      <p className='w-full mt-2 text-xs text-muted text-justify text-[#8d703f]'>Este conteúdo foi gerado por um sistema de inteligência artificial (IA) e pode não ser totalmente preciso ou confiável. </p>
                      <p className='w-full mt-2 text-xs text-muted text-justify text-[#8d703f]'>É importante ser cauteloso ao consumir conteúdo gerado por este tipo de tecnologia.</p>
                    </Card>
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