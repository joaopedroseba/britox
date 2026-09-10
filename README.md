# BRITOX — DJ Press Kit & Site

Site oficial e materiais de mídia do DJ Britox (Brasilidades, Afrolatino & MEPB).

## Estrutura

```
site/                 Site estático pronto para deploy (index.html + assets)
  assets/img/         Imagens e posters dos reels
  assets/video/       Vídeos otimizados usados no site
  assets/britox-presskit-2026.pdf
```

## Rodar localmente

```bash
cd site
python3 -m http.server 8000
# abrir http://localhost:8000
```

## Deploy

O diretório `site/` é estático e pode ser publicado direto na Vercel,
Netlify ou GitHub Pages — basta apontar o root do projeto para `site/`.

## Notas

O repositório guarda só o que o site usa (`site/`, ~111 MB). O acervo bruto
fica apenas na máquina local e é ignorado pelo git:

- `Videos/` — originais (~1 GB)
- `midia/` — fotos em alta (MAJEST FOTOS), PDFs e vídeos em 540p
