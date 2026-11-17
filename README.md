# Nossa história ♡ — V5 (sem os cartões e sem links para álbuns)

Esta versão preserva as **24 fotos** e os quatro anos de namoro, e remove completamente a seção de cartões “É nos detalhes que mora tudo”.

## Abrir no computador

1. Extraia o ZIP antes de abrir.
2. Entre na pasta `Nossa_Historia_V5`.
3. Abra o `index.html` com duplo clique ou execute `ABRIR_SITE_NO_NAVEGADOR.bat` no Windows.

## Abrir pelo VS Code / Live Server

1. No VS Code, vá a **Arquivo → Abrir Pasta** e escolha `Nossa_Historia_V5` (a pasta extraída, não o ZIP).
2. Confira que `index.html`, `css`, `js` e `fotos` estão na mesma pasta.
3. Instale ou habilite a extensão **Live Server**, por Ritwick Dey (atalho `Ctrl + Shift + X`).
4. Se a barra inferior mostrar **Restricted Mode**, clique nela e, se você confia nos arquivos baixados, habilite a confiança na pasta (**Trust**).
5. Clique com o botão direito em `index.html` e escolha **Open with Live Server**. Se estiver ativo, o botão **Go Live** também aparece no canto inferior direito.
6. Caso o Live Server ainda não apareça, reinicie o VS Code e confira se a extensão está habilitada nesse workspace.

## Editar legendas no VS Code

Abra `js/config.js`. Dentro de `chapters → photos`, cada foto tem os campos `date` e `caption`:

```js
{ "src": "fotos/ano1-01.jpg", "date": "Novembro de 2022", "caption": "Nossa primeira lembrança ♡" }
```

Modifique somente os textos de `date` e `caption` e salve com `Ctrl + S`. O nome das imagens em `src` deve permanecer igual.

## Site no celular

O projeto mantém o layout responsivo. Para mandar um link por WhatsApp, publique **a pasta inteira** no GitHub Pages ou no Netlify, preservando `index.html`, `css`, `js` e `fotos`.

Se quiser apenas testar no seu computador sem Live Server, você pode usar também o HTML único enviado à parte: `Nossa_Historia_V5_ABRIR.html`.

## Alteração na V5
Os botões “Abrir álbum completo” foram removidos dos quatro capítulos. Todas as fotos continuam dentro do site e as legendas continuam editáveis em `js/config.js`.
