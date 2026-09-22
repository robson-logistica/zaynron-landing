# ZAYNRON — projeto para Netlify

Esta pasta é o projeto completo. A página inicial fica em `/` e o painel em `/painel/`. A foto começa oculta e aparece quando você publicar uma no painel. O link de vídeo também pode ser atualizado por lá.

## Publicar

1. Descompacte o ZIP. Crie um repositório Git com **o conteúdo desta pasta na raiz** (inclua `package.json`, `netlify.toml`, `public` e `netlify`).
2. No Netlify, escolha **Add new project → Import an existing project** e conecte esse repositório. As configurações de compilação já estão em `netlify.toml`.
3. No projeto Netlify, abra **Project configuration → Environment variables** e crie `ZAYNRON_ADMIN_PASSWORD` com uma senha longa que só você conheça. Marque a variável para o contexto de produção e para Functions, se o painel oferecer seleção de escopo.
4. Publique novamente após adicionar a senha. Abra `https://SEU-SITE.netlify.app/painel/`, escolha a foto, digite a senha e clique em **Publicar foto**. Confira a landing no mesmo domínio.

O painel converte JPG, PNG ou WebP para JPG 1200 × 1500 px, recortando as bordas quando necessário. A imagem deve aparecer na seção “Quem está por trás da ZAYNRON”. **Remover foto do site** oculta a imagem publicada. O vídeo aceita link HTTPS público do YouTube, Vimeo ou MP4.

**Atenção:** enviar apenas `index.html` ou arrastar a pasta `public` para um site estático deixa o painel sem gravação. Publique o projeto inteiro com o processo de build do Netlify. A senha é necessária para alterar o conteúdo; o público não precisa dela para visualizar a landing.

Este projeto usa Netlify Functions e Netlify Blobs para gravar a foto e os dados de vídeo no próprio projeto; as mídias persistem depois de um novo deploy do mesmo site. Não coloque sua senha em arquivos deste ZIP ou em um repositório público.
