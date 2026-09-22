// Lê o feed público do SoundCloud da Britox e devolve os sets em JSON.
// O site consome isso no carregamento, então um set novo publicado no
// SoundCloud aparece sozinho — sem mexer no código nem fazer deploy.
//
// O feed é o RSS que o próprio SoundCloud expõe por usuário; não precisa
// de chave de API. O id abaixo é o da conta /britoxxx.

const FEED = 'https://feeds.soundcloud.com/users/soundcloud:users:1530902260/sounds.rss';

function tag(bloco, nome) {
  const m = bloco.match(new RegExp(`<${nome}[^>]*>([\\s\\S]*?)</${nome}>`));
  if (!m) return '';
  return m[1]
    .replace(/^<!\[CDATA\[([\s\S]*?)\]\]>$/, '$1')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
}

// "00:31:47" -> "31:47" (some hora quando é zero)
function duracao(bruta) {
  const p = bruta.split(':').map((n) => parseInt(n, 10));
  if (p.some(isNaN)) return '';
  const s = p.length === 3 ? p[0] * 3600 + p[1] * 60 + p[2] : p[0] * 60 + (p[1] || 0);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const seg = s % 60;
  const dd = (n) => String(n).padStart(2, '0');
  return h ? `${h}:${dd(m)}:${dd(seg)}` : `${m}:${dd(seg)}`;
}

export default {
  async fetch() {
    try {
      const r = await fetch(FEED, {
        headers: { 'user-agent': 'britox.vercel.app' },
        signal: AbortSignal.timeout(8000),
      });
      if (!r.ok) throw new Error(`feed respondeu ${r.status}`);
      const xml = await r.text();

      const itens = (xml.match(/<item>[\s\S]*?<\/item>/g) || []).map((bloco) => {
        const capa = bloco.match(/<itunes:image[^>]*href="([^"]+)"/);
        const guid = tag(bloco, 'guid');
        return {
          id: (guid.match(/tracks\/(\d+)/) || [, guid])[1],
          titulo: tag(bloco, 'title'),
          url: tag(bloco, 'link'),
          duracao: duracao(tag(bloco, 'itunes:duration')),
          data: tag(bloco, 'pubDate'),
          // a arte vem em 3000px no feed; 500px basta para o site
          capa: capa ? capa[1].replace(/-t\d+x\d+\./, '-t500x500.') : '',
        };
      });

      // mais recente primeiro
      itens.sort((a, b) => new Date(b.data) - new Date(a.data));

      return new Response(JSON.stringify({ sets: itens }), {
        headers: {
          'content-type': 'application/json; charset=utf-8',
          // meia hora no edge, e serve o cache velho enquanto revalida
          'cache-control': 's-maxage=1800, stale-while-revalidate=86400',
        },
      });
    } catch (erro) {
      // o site tem os sets atuais no HTML, então uma falha aqui só faz
      // a página manter o que já mostra
      return new Response(JSON.stringify({ sets: [], erro: String(erro.message || erro) }), {
        status: 502,
        headers: {
          'content-type': 'application/json; charset=utf-8',
          'cache-control': 'no-store',
        },
      });
    }
  },
};
