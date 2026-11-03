# ERASÓ · Vídeo de demonstração — Relatório de produção (Etapa 2)

> **Entrega:** [ERASO_demonstracao.mp4](ERASO_demonstracao.mp4) · MP4 H.264, 1920×1080, 30 fps, **48,7 s**, mudo, legendas em português queimadas.
> O app (`app/`) **não foi alterado** (última modificação: 01/11/2026 13:02).

## 1. Como foi feito

1. **Auditoria e capturas reais** (`capturas/`, 17 estados + `geometria.json`) — base do storyboard aprovado.
2. **Compositor** (`producao/compositor.html`): uma página 1920×1080 que carrega o **app real em dois iframes** (notebook 1280×720 e celular 375×812), aplica a câmera (pan + zoom por CSS) e desenha marca, cursor, anéis e legendas. Nenhuma tela foi redesenhada.
3. **Gravador** (`producao/gravar.mjs`): Edge sem cabeça controlado por DevTools, com o **relógio virtual** avançando em passos de 1/30 s e uma captura PNG por quadro (1.462 quadros). As interações são mouse/toque reais (hover, cliques), mais o preparo de cena por console, como o botão "Simular" do app faz (soltar arquivos = `addItems`).
4. **Linha do tempo** (`producao/roteiro-final.mjs`): câmeras, legendas, ações e cursor.
5. **Exportação**: ffmpeg 9.0.2 (instalado via winget com sua autorização), `libx264 -crf 16 -preset slow`, yuv420p, BT.709.

## 2. Diferenças em relação ao storyboard aprovado

Os **27 Motion Frames foram mantidos, na mesma ordem**. Mudou:

| Item | Aprovado | Produzido | Motivo |
|---|---|---|---|
| Duração | 62 s | **48,7 s** | O protótipo é mais rápido que o previsto: aceita o envio sozinho após 1,9 s (fixo no código) e a transferência dura ~6,7 s. Não estiquei o app para preencher tempo. |
| Tamanho dos arquivos | 132,9 MB | **252,9 MB** | Com 132,9 MB a transferência durava só 3,5 s; subi `fotos-oficina.zip` de 126 para 246 MB para os planos de progresso poderem ser lidos. É dado simulado. |
| Envio × pedido no celular | em sequência | **em paralelo** | Consequência do aceite automático: o pedido no celular e o "aguardando" no notebook acontecem juntos, num plano geral. |
| Relógio do app durante o aceite | normal | **0,55× de 24,7 s a 29,25 s** | Dá tempo de ler "Aguardando", o pedido e o toque em Aceitar. Fora dessa janela o app roda em velocidade real. |
| Assinatura (MF-04/26/27) | texto separado | **a assinatura da própria logo** | O PNG oficial já contém "De uma ponta à outra."; repeti-la seria duplicar. Revelada por máscara. |
| Folha de pedido do celular (MF-15/16) | desliza (animação do app) | **aparece de uma vez** | No Edge sem cabeça com relógio virtual, o conteúdo da folha não é pintado enquanto ela tem animações/transições. Desliguei só as da folha (`.dialog`), só na gravação. O restante da interface mantém as animações reais. |
| Tamanhos de câmera, ordem de MF-22/23 | MF-22 antes de MF-23 | MF-23 antes de MF-22 | Segue os eventos reais: o celular conclui ~0,7 s antes do notebook. |

## 3. Revisão de fidelidade

**Feito**
- Comparação lado a lado de 6 estados (descoberta, bandeja, envio aguardando, concluído no notebook, pedido e concluído no celular) entre as capturas reais e os quadros do vídeo: **mesmo layout, textos e componentes**; as diferenças são o zoom da câmera, os 252,9 MB e as legendas.
- Conferência de ~40 quadros-chave de todas as 8 cenas (contact sheets) e da amostra do MP4 exportado a cada 2 s.
- Emenda entre trechos gravados em momentos diferentes (quadros 699→700): SSIM 1,000.
- Marcos reais medidos: celular recebendo ≈ 27,7 s; notebook transferindo ≈ 29,1 s; celular concluído ≈ 34,5 s; notebook concluído ≈ 35,5 s.

**Não verificado**
- Reprodução em outros players/dispositivos (só decodificação pelo ffprobe do ffmpeg).
- Revisão quadro a quadro de **todos** os 1.462 quadros; conferi amostras.
- Contraste das legendas por ferramenta (só inspeção visual; cores do design system).
- Sincronia fina do cursor com os cliques (tolerância de ±1 quadro).

## 4. Limites que o vídeo não esconde

- Notebook e celular são **duas instâncias independentes do protótipo** (sem rede). O sincronismo é roteirizado; o aviso **"Protótipo · dados simulados"** fica na tela nas cenas do app e no fecho.
- A transferência é **simulada** pelo protótipo (barra e velocidades fictícias).
- A abertura usa o **PNG oficial** da logo (revelado por máscara); não há SVG oficial para animar o símbolo (pendência D11).
- O fecho mostra **só a logo do ERASÓ** (decisão do usuário: sem créditos institucionais nem ODS), mais a linha "Demonstração do protótipo · dados simulados".
- Escopo: só tema claro, rota local; sem Caixa, histórico, link, pareamento nem rota remota.

## 5. Arquivos

| Caminho | O que é |
|---|---|
| `docs/video/ERASO_demonstracao.mp4` | **Vídeo final** |
| `docs/video/storyboard.html`, `ROTEIRO_E_STORYBOARD.md` | Storyboard aprovado (62 s; ver diferenças acima) |
| `docs/video/capturas/` | Capturas reais e geometria |
| `docs/video/producao/` | `compositor.html`, `gravar.mjs`, `roteiro-final.mjs` |
| `docs/video/tools/` | Capturador, gerador do storyboard |

**Para regravar:** servir a raiz do projeto (`python -m http.server 8790`) e rodar `node docs/video/producao/gravar.mjs <pasta> http://127.0.0.1:8790`; depois `ffmpeg -framerate 30 -i f%05d.png -c:v libx264 -crf 16 -pix_fmt yuv420p saida.mp4`. A gravação leva ~10–15 min e retoma sozinha de onde parou se a captura travar.

## 6. Uso na landing

O vídeo substitui a demonstração interativa ("Experimente o ERASÓ aqui mesmo") em `landing/index.html`, seção `#demo`: `<video>` com controles, poster, sem áudio, legenda de texto abaixo e link para o Web App (protótipo). Toca sozinho, mudo, quando está à vista, **exceto** se a pessoa prefere menos movimento. Arquivos: `landing/assets/video/eraso-demonstracao.mp4` (1080p, CRF 22, 7,3 MB, versão para web) e `eraso-demonstracao-poster.jpg`. A versão de maior qualidade continua em `docs/video/ERASO_demonstracao.mp4`.
