"use client"

import { ProcessedAlt, processImage } from '@/actions/process-image';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { GoogleGenerativeAIError, GoogleGenerativeAIResponseError } from '@google/generative-ai';
import { GitBranchPlus, Github, ImageUp, Linkedin, Loader2, Mail, TriangleAlert } from 'lucide-react';
import Image from 'next/image';
import { FormEvent, useState } from 'react';

export default function Home() {
  const [imageURL, setImageURL] = useState<string | null>(null);
  const [processing, setProcessing] = useState<boolean>(false);
  const [processedAlt, setProcessedAlt] = useState<ProcessedAlt | null>(null);

  async function handleFormSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setProcessing(true)

    const form = document.getElementById("formUpload");
    const formData = new FormData(form as HTMLFormElement);
    const imageFile = formData.get("imageFile");

    // Image Parts is a required format for the Google Generative AI API
    const imageParts = await fileToGenerativePart(imageFile as Blob)

    processImage(imageParts)
      .then((json) => {
        if (!json.alt || !json.description) {
          alert(`Erro ao processar imagem: ${JSON.stringify(json)}`)
          setProcessing(false)
          return
        }

        setProcessedAlt(json);
      })
      .catch((error) => {
        console.error(error)

        if (error instanceof GoogleGenerativeAIError || error instanceof GoogleGenerativeAIResponseError) {
          alert("Bloqueio ao processar imagem devido a politicas de conteúdo.")
        } else if (error instanceof Error) {
          if (error.message.includes("was blocked due to")) {
            alert("Bloqueio ao processar imagem devido a politicas de conteúdo.")
          } else {
            alert("Erro ao processar imagem. Tente novamente mais tarde.")
          }
        }
        setProcessing(false)
      })
      .finally(() => {
        setProcessing(false)
      })
  }

  return (
    <main className='w-full h-full mx-auto px-4 py-8 flex flex-col justify-start items-start gap-4'>
      <h1 className='w-full text-3xl text-foreground font-bold text-center'> Imagem para Texto</h1>
      <span className='w-full text-base text-muted text-center'>Envie uma imagem para gerar descrições alternativas dela</span>
      {true && (
        <div className='w-full sm:max-w-[560px] mx-auto flex flex-col justify-center items-center gap-4'>
          <form
            id="formUpload"
            onSubmit={(e) => handleFormSubmit(e)}
            className='w-full flex flex-col justify-start items-start gap-4'
          >
            {/* Image Input */}
            <div className="flex w-full mt-2 justify-center items-center gap-1.5">
              <Label
                htmlFor="imageFile"
                className={`w-full h-[280px] flex flex-row justify-center items-center border-[1.5px] rounded-xl cursor-pointer ${imageURL ? "hidden" : ""}`}
              >
                <div className='flex flex-col justify-center items-center gap-4'>
                  <ImageUp className="h-20 w-20 stroke-muted stroke-1" />
                  <p className='text-base text-muted'>Toque para enviar uma imagem</p>
                </div>
              </Label>
              <Input
                id="imageFile"
                name='imageFile'
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

              <div className={`relative rounded-lg w-full h-[280px] row-span-4 ${imageURL ? "" : "hidden"} rounded-lg`}>
                <Image
                  src={imageURL || ''}
                  alt="Imagem carregada pelo usuário"
                  className={`object-scale-down rounded-lg ${imageURL ? "" : "hidden"} rounded-lg`}
                  fill
                />
              </div>
            </div>

            {imageURL && (
              <div className={`w-full h-full flex flex-col justify-start items-start gap-4 ${imageURL ? "" : "hidden"}`}>

                {/* Submit Button */}
                <Button
                  className={`w-full ${!imageURL || processedAlt || processing ? "hidden" : ""}`} type="submit">Analisar</Button>

                {/* Restart Button */}
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

                {/* Image transcriptions */}
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

                    {/* Ai Alert */}
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

      <p className='w-full mt-8 text-base text-muted text-center'>Desenvolvido por <span className="text-primary text-lg font-bold">Thiago Elias</span>
      </p>
      <nav className='w-full'>
        <ul className='w-full flex justify-center items-center gap-2'>
          <li className='cursor-pointer'><a target='blank' href='mailto:thiagoelias99@gmail.com' className='w-8 h-8 rounded-full flex justify-center items-center'><Mail className='w-6 h-6 stroke-red-600' /></a></li>
          <li className='cursor-pointer'><a target='blank' href='https://github.com/thiagoelias99' className='w-8 h-8 rounded-full flex justify-center items-center'><Github className='w-6 h-6' /></a></li>
          <li className='cursor-pointer'><a target='blank' href='https://www.linkedin.com/in/eng-thiagoelias/' className='w-8 h-8 bg-[#4066bb] rounded flex justify-center items-center'><Linkedin className='w-6 h-6 stroke-1  stroke-white fill-white' /></a></li>
        </ul>
      </nav>
    </main>
  );
}

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