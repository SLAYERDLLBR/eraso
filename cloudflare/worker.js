// Ponto de entrada do Worker da Cloudflare. A lógica fica em sala.mjs (testada em Node).
import { DurableObject } from 'cloudflare:workers';
import { criarClasseSala, tratar } from './sala.mjs';

export const Sala = criarClasseSala(DurableObject, WebSocketPair, (cliente) => new Response(null, { status: 101, webSocket: cliente }));

export default {
  fetch: (request, env) => tratar(request, env),
};
